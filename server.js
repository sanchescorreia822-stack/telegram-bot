const express = require("express");
// const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

// app.use(cors());
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
const chatId = process.env.CHAT_ID;

app.get("/", (req, res) => {
  res.send("Football Studio Bot Online ✅");
});

app.post("/signal", (req, res) => {
  console.log("SIGNAL RECEBIDO:", req.body);

  res.status(200).json({
    ok: true,
    message: "Signal recebido"
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online na porta ${PORT}`));