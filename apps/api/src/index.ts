import express from "express";
import mainRouter from "./routes/index.route";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());

app.use("/api", mainRouter);

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});

app.use(errorHandler);

export default app;
