const express = require("express");
const router = express.Router();
const directoryController = require("../controllers/directoryController");

router.get("/get-directory-listing/:path?", directoryController);

module.exports = router;
