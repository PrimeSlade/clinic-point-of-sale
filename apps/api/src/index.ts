import express from "express";
import mainRouter from "./routes/index.route";
import { PrismaClient } from "./generated/prisma";

const app = express();
const port = process.env.PORT;
export const prisma = new PrismaClient();

app.use(express.json());

app.use("/api", mainRouter);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
