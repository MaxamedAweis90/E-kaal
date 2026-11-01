import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { apiV1Router } from "./routes";

// Load root .env (resolves correctly whether running from root or /server)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ekaal_dev";

// Middleware
app.use(cors());
app.use(express.json());

// Base health check route
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API v1 Routes
app.use("/api/v1", apiV1Router);

// Standard 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Resource not found",
    },
  });
});

// Central error-handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode =
    typeof err.statusCode === "number"
      ? err.statusCode
      : typeof err.status === "number"
      ? err.status
      : 500;

  const code =
    err.code ||
    (err instanceof SyntaxError && "body" in err ? "MALFORMED_JSON" : "INTERNAL_SERVER_ERROR");
  const message = err.message || "An unexpected error occurred";

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
});

export const connectDB = async (uri = MONGODB_URI) => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

export default app;
