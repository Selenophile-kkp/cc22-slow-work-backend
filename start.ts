import "dotenv/config";
import express from "express";
import router from "./Routes/auth.route";
import passport from "passport";
import "@/Config/passport";
import userRouter from "./Routes/user.route";
import { freelancerRouter } from "./Routes/freelancer.route";
import { categoryRouter } from "./Routes/category.route";
import { serviceRouter } from "./Routes/service.route";

const app = express();
const PORT = process.env.PORT! as string;

app.use(express.json());
app.use(passport.initialize());

app.use(router);
app.use("/api", userRouter, freelancerRouter, categoryRouter, serviceRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
