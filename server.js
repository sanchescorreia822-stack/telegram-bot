const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const { getSignals } = require("./engine");
const { save, read, stats } = require("./storage");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
const chatId = process.env.CHAT_ID;

let ativo = true;

// enviar telegram
async function send(msg) {
  try {
    await bot.sendMessage(chatId, msg);
  } catch (e) {
    console.log(e.message);
  }
}

// LOOP
setInterval(async () => {
  try {
    if (!ativo) return;

    const sinais = await getSignals();

    for (const s of sinais) {
      await send(s.msg);

      save({
        id: s.id,
        msg: s.msg,
        result: "PENDENTE"
      });
    }

  } catch (e) {
    console.log("Erro no loop:", e.message);
  }
}, 180000);
// API
app.get("/api/stats", (req, res) => {
  res.json(stats());
});

app.get("/api/history", (req, res) => {
  res.json(read().slice(-50));
});

// HOME
app.get("/", (req, res) => {
  res.send("APP FOOTBALL STUDIO PRO ONLINE ⚽");
});


// START
app.listen(process.env.PORT || 3000, () => {
  console.log("APP FOOTBALL STUDIO PRO ONLINE");
});