const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./server/src/models/User");
require("dotenv").config({ path: "./server/.env" });

async function checkAndSeedPolice() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const email = "police@anveshak.com";
  let user = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash("TestPolice@123", 10);

  if (user) {
    user.password = hashedPassword;
    user.role = "POLICE";
    user.isAvailable = true;
    await user.save();
    console.log("Updated existing police@anveshak.com account");
  } else {
    user = await User.create({
      name: "Test Police Officer",
      email: email,
      password: hashedPassword,
      role: "POLICE",
      isAvailable: true,
      workload: 0
    });
    console.log("Created police@anveshak.com account");
  }
  
  process.exit(0);
}

checkAndSeedPolice().catch(console.error);
