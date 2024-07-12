const jwt = require("jsonwebtoken");
const JWT_SECRET = "ala123"; // Replace with your actual JWT secret key

// Middleware to extract and verify JWT token from cookies
const authMiddleware = (req, res, next) => {
  // Check for token in cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded user information to request object
    req.user = decoded.user;
    next(); // Move to next middleware
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
