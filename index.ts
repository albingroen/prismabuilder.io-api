import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { ConvertSchemaToObject } from "@paljs/schema";
import { Octokit } from "octokit";
import { formatSchema } from "@prisma/sdk";
import { jsonToPrismaSchema } from "./prisma";
import { v4 as uuid } from "uuid";

dotenv.config();

const app = express();

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

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
  const path = `${__dirname}/../${uuid()}.prisma`;
  const formattedSchema = await formatSchema({ schema: req.body.schema });
  fs.writeFileSync(path, formattedSchema, "utf8");
  const schemaObject = new ConvertSchemaToObject(path).run();
  res.json(schemaObject);
  fs.rmSync(path);
});

app.get("/releases/:target/:version", async (req, res) => {
  const release = await octokit.request(
    "GET /repos/{owner}/{repo}/releases/latest",
    {
      owner: "albingroen",
      repo: "prismabuilder.io",
    }
  );

  const assets = await octokit.request(
    `GET /repos/{owner}/{repo}/releases/${release.data.id}/assets`,
    {
      owner: "albingroen",
      repo: "prismabuilder.io",
    }
  );

  const [{ browser_download_url: tar_url }, { browser_download_url: sig_url }] =
    assets.data[0];

  res.json({
    version: release.data.tag_name,
    signature: sig_url,
    url: tar_url,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
