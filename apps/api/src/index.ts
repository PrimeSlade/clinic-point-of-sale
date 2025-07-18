import express from "express";
import mainRouter from "./routes/index.route";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";
import helmet from "helmet";

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(helmet());

app.get("/api", (req, res) => {
  res.json({
    success: true,
    version: "v1",
    message: "Hello from API v1 🧪",
  });
});

app.use("/api", mainRouter);

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});

app.use(errorHandler);

export default app;
