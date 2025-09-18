// Set a default SQLite database URL if none is provided
if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL found, using SQLite for local development");
  process.env.DATABASE_URL = "sqlite:./database.sqlite";
}

const bcrypt = require("bcryptjs");
const { Admin, initializeDatabase } = require("../lib/sequelize");

async function createDefaultAdmin() {
  try {
    console.log("Initializing database...");
    
    await initializeDatabase();

    console.log("Checking for existing admin...");
    const existingAdmin = await Admin.findOne({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    console.log("Creating default admin user...");
    
    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await Admin.create({
      username: "admin",
      password: hashedPassword,
      nama: "Administrator",
      email: "admin@bogor.go.id",
      role: "SUPER_ADMIN",
      is_active: true,
    });

    console.log("✅ Default admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run if called directly
if (require.main === module) {
  createDefaultAdmin().then(() => {
    console.log("Admin initialization completed");
    process.exit(0);
  });
}

module.exports = { createDefaultAdmin };
