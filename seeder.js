const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    await User.create({
      username: "admin",
      password: "admin123",
      name: "Admin",
      role: "admin",
    });

    console.log("Admin user created successfully");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("IMPORTANT: Change the default password after first login!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();
