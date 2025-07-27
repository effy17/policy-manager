import express from "express";
import cors from "cors";
import ruleRoutes from "./routes/ruleRoutes";

const app = express();
app.use(cors(), express.json());
app.use("/api", ruleRoutes);
export default app;