const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

require("./config/passport"); // Import passport configuration

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Ensure cookie-parser is used early

app.use(
  session({
    secret: "ala123",
    resave: false,
    saveUninitialized: false,
  })
);

const corsOptions = {
  origin: "https://joyful-douhua-1b7a4e.netlify.app", // Allow requests from this origin
  credentials: true, // Allow sending cookies with requests
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
};

app.use(cors(corsOptions)); // Apply CORS middleware with options

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://joyful-douhua-1b7a4e.netlify.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  next();
});

const MONGODB_URI = "mongodb+srv://ala:ala123@cluster0.tojwjkt.mongodb.net/ala";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.use(passport.initialize());
app.use(passport.session());

const userRoutes = require("./routes/user.routes"); // Adjust the path as necessary
app.use("/", userRoutes);
const cardRoutes = require("./routes/card.routes");
const paymentRoutes = require("./routes/payement.routes");
const planRoutes = require("./routes/plan.routes");
const hospitalRoutes = require("./routes/hospital.routes");
app.use("/api", cardRoutes);
app.use("/api", paymentRoutes);
app.use("/api", hospitalRoutes);
app.use("/api", planRoutes);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://js.stripe.com"],
        "object-src": ["'self'"],
      },
    },
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
