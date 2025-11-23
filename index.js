import express from "express";
import multer from "multer";
import sharp from "sharp";
import AWS from "aws-sdk";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

// AWS S3 config (later moved to env variables)
const s3 = new AWS.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const compressedImage = await sharp(req.file.path)
      .resize(600)
      .jpeg({ quality: 80 })
      .toBuffer();

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: `img_${Date.now()}.jpg`,
      Body: compressedImage,
      ContentType: "image/jpeg",
    };

    const uploadRes = await s3.upload(params).promise();
    fs.unlinkSync(req.file.path); // delete temp file

    res.json({ url: uploadRes.Location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
