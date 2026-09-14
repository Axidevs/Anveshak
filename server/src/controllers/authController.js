const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      post,
      department,
      specialization,
      jurisdiction,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "CITIZEN",
      post: post || null,
      department: department || null,
      specialization: specialization || null,
      jurisdiction: jurisdiction || null,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        post: user.post,
        department: user.department,
        specialization: user.specialization,
        jurisdiction: user.jurisdiction,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        post: user.post,
        department: user.department,
        specialization: user.specialization,
        jurisdiction: user.jurisdiction,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};


const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};


const demoIdentityLogin = async (req, res) => {
  try {
    const { role } = req.body;

    const roleMap = {
      citizen: "CITIZEN",
      police: "POLICE",
      agency: "INVESTIGATING_AGENCY",
      court: "COURT",
    };

    const dbRole = roleMap[role];

    if (!dbRole) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const user = await User.findOne({ role: dbRole });

    if (!user) {
      return res.status(404).json({
        message: `No demo ${dbRole} user found`,
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Identity verification successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        post: user.post,
        department: user.department,
        specialization: user.specialization,
        jurisdiction: user.jurisdiction,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Identity verification failed",
      error: error.message,
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getMe,
  demoIdentityLogin,
};