import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { format } from "@prisma/sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.port ?? 1337;

app.post("/format", (req, res) => {
  const formattedSchema = format(req.body.schema);
  res.send(formattedSchema);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
