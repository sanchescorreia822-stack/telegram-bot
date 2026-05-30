const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 CONFIGURAÇÃO
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const apiKey = process.env.ODDS_API_KEY;

const bot = new TelegramBot(token, { polling: false });

// 🔥 LIGA/DESLIGA BOT
let ativo = true;

// 📊 IA SIMPLES
function escolherSinal(oddHome, oddAway) {
  const home = 1 / oddHome;
  const away = 1 / oddAway;

  if (Math.abs(home - away) < 0.05) {
    return "📊 SEM SINAL (RISCO ALTO)";
  }

  return home > away
    ? "📊 SINAL: CASA FORTE"
    : "📊 SINAL: FORA FORTE";
}

// 🌐 API ODDS
async function buscarOdds() {
  try {
    const res = await axios.get(
      "https://api.the-odds-api.com/v4/sports/soccer/odds",
      {
        params: {
          apiKey: apiKey,
          regions: "eu",
          markets: "h2h"
        }
      }
    );

    const jogos = res.data;

    jogos.forEach(jogo => {
      const home = jogo.home_team;
      const away = jogo.away_team;

      const book = jogo.bookmakers?.[0];
      if (!book) return;

      const market = book.markets?.[0];
      if (!market) return;

      const odds = market.outcomes;
      if (!odds) return;

      const oddHome = odds[0].price;
      const oddAway = odds[1].price;

      const sinal = escolherSinal(oddHome, oddAway);

      bot.sendMessage(chatId, `${sinal}\n⚽ ${home} vs ${away}`);
    });

  } catch (err) {
    console.log("Erro API:", err.message);
  }
}

// 🔁 AUTOMÁTICO
setInterval(() => {
  if (!ativo) return;
  buscarOdds();
}, 300000); // 5 min

// 🤖 COMANDOS TELEGRAM
bot.onText(/\/startbot/, () => {
  ativo = true;
  bot.sendMessage(chatId, "🟢 Bot LIGADO");
});

bot.onText(/\/stopbot/, () => {
  ativo = false;
  bot.sendMessage(chatId, "🔴 Bot DESLIGADO");
});

// 🌐 WEB
app.get("/", (req, res) => {
  res.send("Football Bot Online ✅");
});

// 📊 PAINEL
app.get("/panel", (req, res) => {
  res.send(`
    <h1>📊 BOT PAINEL</h1>
    <p>Status: ${ativo ? "ON" : "OFF"}</p>
  `);
});

// 🚀 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot a correr na porta " + PORT);
});