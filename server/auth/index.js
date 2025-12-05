import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("[auth] JWT_SECRET is not set in env");
}

const verify = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({
        loggedIn: false,
        user: null,
        errorMessage: "Unauthorized",
      });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    req.userId = verified.userId;

    next();
  } catch (err) {
    console.error("[auth.verify] Error verifying token:", err);
    return res.status(401).json({
      loggedIn: false,
      user: null,
      errorMessage: "Unauthorized",
    });
  }
};

const verifyUser = (req) => {
  try {
    const token = req.cookies?.token;
    if (!token) return null;

    const decodedToken = jwt.verify(token, JWT_SECRET);
    return decodedToken.userId;
  } catch (err) {
    return null;
  }
};

const signToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET);
};

const auth = {
  verify,
  verifyUser,
  signToken,
};

export default auth;
