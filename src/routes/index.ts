import express from "express";
import tradfriRouter from "./tradfri";

const router = express.Router();

router.use("/tradfri", tradfriRouter)

export default router;
