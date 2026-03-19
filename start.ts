import "dotenv/config";
import express, { type Request, type Response } from "express";
import router from "./Routes/auth.route";

const app = express();
const PORT = process.env.PORT! as string;

app.use(express.json());

app.use(router);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
