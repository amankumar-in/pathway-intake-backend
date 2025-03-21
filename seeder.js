const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ username: "admin" });

    if (adminExists) {
      console.log("Admin user already exists");
      process.exit();
    }

    await User.create({
      username: "admin",
      password: "admin123",
      name: "Administrator",
      role: "admin",
    });

    console.log("Admin user created successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Run the function
createAdminUser();
