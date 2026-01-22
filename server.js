import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import productRoutes from "./routes/productRoutes.js";
import connectDB from "./config/db.js";
import { aj } from "./lib/arcjet.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
); // helmet is a security middleware that helps you protect your app by setting various HTTP headers
app.use(morgan("dev")); // log the requests

// apply arcjet rate-limit to all routes (only if arcjet is configured)
if (aj) {
  app.use(async (req, res, next) => {
    try {
      const decision = await aj.protect(req, {
        requested: 1, // specifies that each request consumes 1 token
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          res.status(429).json({ error: "Too Many Requests" });
        } else if (decision.reason.isBot()) {
          res.status(403).json({ error: "Bot access denied" });
        } else {
          res.status(403).json({ error: "Forbidden" });
        }
        return;
      }

      // check for spoofed bots
      if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
        res.status(403).json({ error: "Spoofed bot detected" });
        return;
      }

      next();
    } catch (error) {
      console.log("Arcjet error", error);
      next(error);
    }
  });
} else {
  console.log("Arcjet not configured - running without rate limiting");
}

app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
  // server our react app
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});
