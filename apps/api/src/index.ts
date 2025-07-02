import express from "express";
import mainRouter from "./routes/index.route";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", mainRouter);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
