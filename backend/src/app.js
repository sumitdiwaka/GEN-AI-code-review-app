const express = require("express")
const aiRoute = require("./routes/aiRoute")
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/ai", aiRoute);


module.exports = app