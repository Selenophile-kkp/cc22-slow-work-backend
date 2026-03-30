import "dotenv/config";
import express from "express";
import router from "./Routes/auth.route";
import passport from "passport";
import "@/Config/passport";
import userRouter from "./Routes/user.route";
import cors from "cors";
import { freelancerRouter } from "./Routes/freelancer.route";
import { categoryRouter } from "./Routes/category.route";
import { serviceRouter } from "./Routes/service.route";
import { orderRouter } from "./Routes/order.route";
import { reviewRouter } from "./Routes/review.route";
import cookieParser from "cookie-parser";
import { uploadRouter } from "./Routes/upload.route";
import { openApiSpec } from "./Config/openApi";
import { apiReference } from "@scalar/express-api-reference";

const app = express();
const PORT = process.env.PORT! as string;

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

app.use(express.json());
app.use(passport.initialize());

app.use(router);
app.use(
  "/api",
  userRouter,
  freelancerRouter,
  categoryRouter,
  serviceRouter,
  orderRouter,
  reviewRouter,
  uploadRouter
);

app.use(
  "/docs",
  apiReference({
    theme: "default",
    layout: "modern",
    spec: {
      url: "/openapi.json",
    },
    defaultHttpClient: {
      targetKey: "js",
      clientKey: "fetch",
    },
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
