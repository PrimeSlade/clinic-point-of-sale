import express from "express";
import mainRouter from "./routes/index.route";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const port = process.env.PORT;
const frontEndOrigin = process.env.FRONT_END_ORIGIN;

const app = express();

app.use(
  cors({
    origin: frontEndOrigin,
    credentials: true, //for cookies
  }),
);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
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
