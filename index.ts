import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { formatSchema } from "@prisma/sdk";
import { ConvertSchemaToObject } from "@paljs/schema";
import { jsonToPrismaSchema } from "./prisma";
import { v4 as uuid } from "uuid";
import fs from "fs";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.port ?? 1337;

app.post("/generate", async (req, res) => {
  const formattedSchema = await formatSchema({
    schema: jsonToPrismaSchema(req.body.schema),
  });
  res.send(formattedSchema);
});

app.post("/parse", async (req, res) => {
  const path = `tmp/${uuid()}.prisma`;
  const formattedSchema = await formatSchema({ schema: req.body.schema });
  fs.writeFileSync(path, formattedSchema, "utf8");
  const schemaObject = new ConvertSchemaToObject(path).run();
  res.json(schemaObject);
  fs.rmSync(path);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
