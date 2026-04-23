import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const programmes = [
  { name: "Big Data Analytics", code: "BDA" },
  { name: "Ship Design and Construction", code: "SDC" },
  { name: "Automation, Instrumentation, and Control", code: "AIC" },
  { name: "Optimization of Oil Well", code: "OOW" },
  { name: "Welding, Fabrication and Qualification", code: "WFQ" },
  { name: "Transformer Repair and Maintenance", code: "EPT" },
  { name: "Process Piping and Piping System Design", code: "PIP" },
];

const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const educationBackgrounds = [
  "Accountancy",
  "Accounting",
  "Agricultural & Environmental Engineering",
  "Agroprocessing Farming Training",
  "Architecture",
  "Auto Mechanic Training",
  "Banking & Finance",
  "Biochemistry",
  "Biology",
  "Biomedical Engineering",
  "Business Administration",
  "Business Management",
  "Catering",
  "Catering & Baking",
  "Chemical Engineering",
  "Chemical/Petrochemical Engineering",
  "Chemistry",
  "Chemistry/Biochemistry",
  "Civil Engineering",
  "Computer Operation",
  "Computer Science",
  "Drone Operations Training",
  "Economics",
  "Educational Management",
  "Electrical Training",
  "Electrical/Electronics Engineering",
  "English & Communication Studies",
  "Fashion Design",
  "Food Science & Technology",
  "FSLC",
  "Geology",
  "Industrial Chemical/Petrochemicals Technology",
  "Information Systems & Software Engineering",
  "Information Technology",
  "Marine Engineering",
  "Marketing",
  "Mathematics",
  "Mathematics & Computer Science",
  "Mechanical & Metal Work Technology",
  "Mechanical Engineering",
  "Microbiology",
  "Microsoft Office Expert",
  "Nursing",
  "Oil & Gas Operation & Maintenance",
  "Petroleum Engineering",
  "Plumbing",
  "Psychology",
  "Religious & Cultural Studies",
  "Shoe Making",
  "Soap Making",
  "Solar Panel Installation",
  "Statistics",
  "Structural Welder",
  "Surveying & Geomatics",
  "Suspended Ceiling/POP Installation",
  "Theater & Media Art",
  "Welding & Fabrication",
];

async function main() {
  console.log("Seeding programmes...");
  for (const programme of programmes) {
    await prisma.programme.upsert({
      where: { code: programme.code },
      update: { name: programme.name },
      create: programme,
    });
  }

  console.log("Seeding states...");
  for (const state of states) {
    await prisma.state.upsert({
      where: { name: state },
      update: {},
      create: { name: state },
    });
  }

  console.log("Seeding education backgrounds...");
  for (const name of educationBackgrounds) {
    await prisma.educationBackground.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seeding first super admin...");
  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@cmotd.local" },
    update: {
      firstName: "System",
      lastName: "Administrator",
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      firstName: "System",
      lastName: "Administrator",
      email: "admin@cmotd.local",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });