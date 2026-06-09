const express = require("express");
const { startBot } = require("./bot");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware básico
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🤖 Bot ativo");
});

// inicia lógica do bot separada
startBot();

app.listen(PORT, () => {
  console.log("🚀 Server a correr na porta", PORT);
});