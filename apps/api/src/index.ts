import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(healthRouter);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
