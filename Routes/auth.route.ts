import express from "express";
import {
  LoginController,
  RegisterController,
} from "../Controllers/auth.controller";

const router = express.Router();

router.post("/register", RegisterController);
router.post("/login", LoginController);

export default router;
