import { PrismaClient, ExamType } from "@prisma/client";

const prisma = new PrismaClient();

const CITIES: [string, string][] = [
  ["Mumbai", "Maharashtra"],
  ["Delhi", "Delhi"],
  ["Bengaluru", "Karnataka"],
  ["Chennai", "Tamil Nadu"],
  ["Pune", "Maharashtra"],
  ["Hyderabad", "Telangana"],
  ["Kolkata", "West Bengal"],
  ["Ahmedabad", "Gujarat"],
  ["Jaipur", "Rajasthan"],
  ["Lucknow", "Uttar Pradesh"],
  ["Kanpur", "Uttar Pradesh"],
  ["Roorkee", "Uttarakhand"],
  ["Guwahati", "Assam"],
  ["Bhopal", "Madhya Pradesh"],
  ["Nagpur", "Maharashtra"],
];

const NAME_PREFIXES = [
  "National Institute of Technology",
  "Indian Institute of Technology",
  "Birla Institute of Technology",
  "Vellore Institute of Technology",
  "SRM Institute of Science and Technology",
  "Manipal Institute of Technology",
  "PES University",
  "Thapar Institute of Engineering",
  "Amity University",
  "Chandigarh University",
  "Lovely Professional University",
  "KIIT University",
  "Jadavpur University",
  "Delhi Technological University",
  "Netaji Subhas University of Technology",
  "College of Engineering",
];

const COLLEGE_TYPES = ["Government", "Private", "Deemed"];

const BRANCHES = [
  "Computer Science",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Chemical Engineering",
];

const RECRUITERS = [
  "TCS, Infosys, Wipro",
  "Google, Microsoft, Amazon",
  "Deloitte, EY, KPMG",
  "L&T, Tata Motors, Mahindra",
  "Goldman Sachs, JP Morgan",
  "Flipkart, Zomato, Swiggy",
  "Bosch, Siemens, Schneider Electric",
];

function pick<T>(arr: T[], seedIndex: number, salt = 0): T {
  return arr[(seedIndex + salt) % arr.length];
}

function slugify(name: string, idx: number) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${idx}`
  );
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.cutoff.deleteMany();
  await prisma.review.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.course.deleteMany();
  await prisma.college.deleteMany();

  console.log("Seeding colleges...");

  const TOTAL_COLLEGES = 48;

  for (let i = 0; i < TOTAL_COLLEGES; i++) {
    const [city, state] = pick(CITIES, i);
    const prefix = pick(NAME_PREFIXES, i, 3);
    const name = `${prefix} ${city}`;
    const type = pick(COLLEGE_TYPES, i, 1);
    const establishedYear = 1950 + ((i * 7) % 70);
    const avgFeesPerYear = 60000 + ((i * 37) % 20) * 15000; // spread 60k - 3.6L
    const rating = Math.round((3 + ((i * 13) % 20) / 10) * 10) / 10; // 3.0 - 5.0

    const college = await prisma.college.create({
      data: {
        name,
        slug: slugify(name, i),
        city,
        state,
        type,
        establishedYear,
        avgFeesPerYear,
        rating,
        overview: `${name} is a ${type.toLowerCase()} institution established in ${establishedYear}, located in ${city}, ${state}. It is known for its engineering programs, active placement cell, and campus infrastructure spanning multiple departments.`,
        logoColor: pick(
          ["#1D4E4B", "#E8A33D", "#101828", "#7C5C3E", "#3B5B92"],
          i
        ),
      },
    });

    // Courses (2-3 per college)
    const numCourses = 2 + (i % 2);
    for (let c = 0; c < numCourses; c++) {
      const branch = pick(BRANCHES, i, c);
      await prisma.course.create({
        data: {
          collegeId: college.id,
          name: `B.Tech in ${branch}`,
          degree: "B.Tech",
          durationYears: 4,
          feesTotal: avgFeesPerYear * 4,
        },
      });
    }

    // Placements (last 3 years)
    for (let y = 0; y < 3; y++) {
      const year = 2023 + y;
      const base = 4 + ((i * 3) % 15); // base LPA
      await prisma.placement.create({
        data: {
          collegeId: college.id,
          year,
          avgPackageLPA: base + y * 0.5,
          medianPackageLPA: Math.max(base - 1.5, 2) + y * 0.4,
          highestPackageLPA: base * 3 + y,
          placementRate: Math.min(60 + ((i * 5) % 40) + y * 2, 99),
          topRecruiters: pick(RECRUITERS, i, y),
        },
      });
    }

    // Reviews (2 per college)
    for (let r = 0; r < 2; r++) {
      await prisma.review.create({
        data: {
          collegeId: college.id,
          authorName: `Student${i}${r}`,
          rating: Math.max(2, Math.min(5, rating + (r === 0 ? 0.3 : -0.4))),
          title: r === 0 ? "Good academic exposure" : "Decent campus life",
          body:
            r === 0
              ? `The faculty at ${name} is knowledgeable and the curriculum is updated regularly. Labs are well equipped for core branches.`
              : `Hostel and campus facilities are average but improving. Placement support could be more proactive for non-CS branches.`,
        },
      });
    }

    // Cutoffs — power the predictor tool
    const exams: ExamType[] = i % 3 === 0 ? ["JEE_ADVANCED", "JEE_MAIN"] : ["JEE_MAIN"];
    for (const exam of exams) {
      for (const branch of BRANCHES.slice(0, 4)) {
        const baseRank = 500 + i * 800 + BRANCHES.indexOf(branch) * 3000;
        for (const category of ["General", "OBC", "EWS"]) {
          const catMultiplier =
            category === "General" ? 1 : category === "OBC" ? 1.4 : 1.2;
          await prisma.cutoff.create({
            data: {
              collegeId: college.id,
              exam,
              category,
              branch,
              closingRank: Math.round(baseRank * catMultiplier),
            },
          });
        }
      }
    }
  }

  console.log(`Seeded ${TOTAL_COLLEGES} colleges with courses, placements, reviews, and cutoffs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
