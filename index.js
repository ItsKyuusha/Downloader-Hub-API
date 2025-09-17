const express = require("express");
require("dotenv").config();
const downloaderRoutes = require("./src/routes/downloaderRoutes");

const app = express();

app.use("/api", downloaderRoutes);
app.get("/", (req, res) => {
  res.json({
    status: true,
    data: {
      message: "make rest-api with nodejs | express",
    },
    endpoints: [
      "/api/tiktokdl",
      "/api/igdl",
      "/api/igstory",
      "/api/fbdl",
      "/api/ytdl",
      "/api/twtdl",
      "/api/v2tiktokdl",
      "/api/twtv2",
      "/api/igphotodl",
    ],
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
