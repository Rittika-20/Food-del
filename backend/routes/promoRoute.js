import express from "express";
import { applyPromo } from "../controllers/promoController.js";

const promoRouter = express.Router();
promoRouter.post("/apply", applyPromo);

export default promoRouter;