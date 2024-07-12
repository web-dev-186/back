const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const crypto = require("crypto");
const JWT_SECRET = "ala123"; // Replace with your actual JWT secret key
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "785ec7002@smtp-brevo.com",
    pass: "7thrLzXMcY5PQyaS",
  },
});
// User signup
exports.signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with role 'utilisateur' by default
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error("Server error during signup:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        console.error("JWT signing error:", err);
        throw err;
      }

      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 3600000, // 1 hour
      });

      res.json({ fullName: user.name, role: user.role, id: user.id });
    });
  } catch (err) {
    console.error("Server error during login:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// User logout
exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out successfully" });
};

exports.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Google callback
exports.googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "http://localhost:5173/login" },
    async (err, user) => {
      if (err) return res.status(500).json({ msg: "Server error" });
      if (!user) return res.status(400).json({ msg: "User not found" });

      // Assign a default role if not already set
      if (!user.role) {
        user.role = "defaultRole"; // Replace 'defaultRole' with your desired default role
        await user.save();
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
        if (err) throw err;

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600000, // 1 hour
        });

        // Send token and user information as JSON response
        res.json({ token, name: user.name, role: user.role });
        res.redirect("http://localhost:5173/");
      });
    }
  )(req, res, next);
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set token expiration time (1 hour)
    const resetTokenExpires = Date.now() + 3600000;

    // Save token and expiration to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send email with reset link
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: "785ec7002@smtp-brevo.com",
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             ${resetUrl}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "Password reset email sent" });
  } catch (err) {
    console.error("Error during password reset request:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user by token and check if token has not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ msg: "Password has been reset" });
  } catch (err) {
    console.error("Error during password reset:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
// Get user profile

exports.getCurrentUser = async (req, res) => {
  try {
    console.log("Cookies:", req.cookies); // Log cookies for debugging

    // Ensure req.cookies is defined and contains 'token'
    if (!req.cookies || !req.cookies.token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = req.cookies.token;
    const decoded = jwt.verify(token, "ala123"); // Verify the token
    req.user = decoded.user;

    const user = await User.findById(req.user.id).select("-password"); // Fetch user based on decoded user id
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user); // Return the user object
  } catch (err) {
    console.error("Error in getCurrentUser:", err.message); // Log detailed error message
    res.status(500).json({ msg: "Server error" }); // Return generic server error message
  }
};

// Update current user profile
exports.updateCurrentUserProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;

    const { fullName, email, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
