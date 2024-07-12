const express = require("express");
const passport = require("passport");
const userController = require("../controllers/user.controller");
const router = express.Router();
router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept",
    "set-cookie"
  );
  next();
});
const auth = require("../middleware/verifyToken");

// Public routes
router.post("/register", userController.signupUser);
router.post("/login", userController.loginUser);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      const { id, name } = req.user; // Assuming user object has _id and name fields

      res.redirect(`http://localhost:5173/login?id=${id}&name=${name}`);
      return { id, name };
    } catch (error) {
      console.error("Error processing Google callback:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/reset-password/:token", userController.resetPassword);

router.put("/profile", userController.updateCurrentUserProfile);
router.get("/profile", userController.getCurrentUser);

module.exports = router;
