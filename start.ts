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

const app = express();
const PORT = process.env.PORT! as string;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

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
  reviewRouter
);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
