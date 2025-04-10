const express = require("express");
const ReviewByAI = require("../controller/aiController");
const router = express.Router();

router.post("/get-review", ReviewByAI);

module.exports = router; 