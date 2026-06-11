const express = require("express");
const { startBot } = require("./bot");
const { startResultChecker } = require("./resultChecker");

const app = express();

app.get("/", (req, res) => {
  res.send("Bot automático ativo");
});

startBot();
startResultChecker();

app.listen(process.env.PORT || 3000);