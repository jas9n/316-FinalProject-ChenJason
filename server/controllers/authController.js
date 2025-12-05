import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// GET /api/auth/loggedIn
export const getLoggedIn = async (req, res) => {
  try {
    const userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(200).json({
        loggedIn: false,
        user: null,
        errorMessage: null,
      });
    }

    const loggedInUser = await User.findById(userId).lean();
    if (!loggedInUser) {
      return res.status(200).json({
        loggedIn: false,
        user: null,
        errorMessage: null,
      });
    }

    return res.status(200).json({
      loggedIn: true,
      user: {
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        email: loggedInUser.email,
      },
    });
  } catch (err) {
    console.error("[authController.getLoggedIn] err:", err);
    res.status(500).json({
      loggedIn: false,
      user: null,
      errorMessage: "Server error checking login state.",
    });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(401)
        .json({ errorMessage: "Wrong email or password provided." });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ errorMessage: "Wrong email or password provided." });
    }

    const token = auth.signToken(existingUser._id.toString());

    // for local dev:
    //   secure: false, sameSite: "lax"
    // for production:
    //   secure: true, sameSite: "none"
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json({
        success: true,
        user: {
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          userName: existingUser.userName,
          avatarImage: existingUser.avatarImage,
        },
      });
  } catch (err) {
    console.error("[authController.loginUser] err:", err);
    res.status(500).send();
  }
};

// POST /api/auth/logout
export const logoutUser = async (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json({ success: true });
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordVerify, avatar } =
      req.body;

    if (!firstName || !lastName || !email || !password || !passwordVerify) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    if (password.length < 8) {
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 8 characters.",
      });
    }

    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter the same password twice.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorMessage: "An account with this email address already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const savedUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      avatar,
    });

    return res.status(200).json({
      success: true,
      user: {
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        userName: savedUser.userName,
        email: savedUser.email,
        avatar: savedUser.avatar,
      },
    });
  } catch (err) {
    console.error("[authController.registerUser] err:", err);
    res.status(500).send();
  }
};

export default {
  getLoggedIn,
  loginUser,
  logoutUser,
  registerUser,
};
