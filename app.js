const express = require("express");
const cors = require("cors");

const directoryRoutes = require("./routes/directoryRoutes");

const dotenv = require("dotenv").config();

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());

app.use("/api", directoryRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
