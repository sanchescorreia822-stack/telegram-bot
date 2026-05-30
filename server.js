const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 CONFIGURAÇÃO
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

// 🔥 CONTROLO DO BOT
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

// 🚫 EVITAR SPAM
let ultimoSinal = "";

function enviarMensagem(msg) {
  if (msg === ultimoSinal) return;

  ultimoSinal = msg;
  bot.sendMessage(chatId, msg);
}

// 🌐 API DE ODDS
async function buscarOdds() {
  try {
    const res = await axios.get(
      "https://api.the-odds-api.com/v4/sports/soccer/odds",
      {
        params: {
          apiKey: process.env.ODDS_API_KEY,
          regions: "eu",
          markets: "h2h"
        },
        timeout: 10000
      }
    );

    const jogos = res.data;

    if (!Array.isArray(jogos)) return;

    jogos.forEach(jogo => {
      try {
        const home = jogo.home_team;
        const away = jogo.away_team;

        const book = jogo.bookmakers?.[0];
        const market = book?.markets?.[0];
        const odds = market?.outcomes;

        if (!odds || odds.length < 2) return;

        const oddHome = odds[0].price;
        const oddAway = odds[1].price;

        const sinal = escolherSinal(oddHome, oddAway);

        enviarMensagem(`${sinal}\n⚽ ${home} vs ${away}`);

      } catch (err) {
        console.log("Erro jogo:", err.message);
      }
    });

  } catch (err) {
    console.log("Erro API:", err.message);
  }
}

// ⏰ LOOP AUTOMÁTICO
setInterval(() => {
  if (!ativo) return;

  buscarOdds().catch(err => {
    console.log("Retry erro:", err.message);
  });

}, 300000); // 5 minutos

// 🤖 TELEGRAM CONTROLO
bot.onText(/\/startbot/, () => {
  ativo = true;
  bot.sendMessage(chatId, "🟢 Bot LIGADO");
});

bot.onText(/\/stopbot/, () => {
  ativo = false;
  bot.sendMessage(chatId, "🔴 Bot DESLIGADO");
});

// 🌐 ROTAS
app.get("/", (req, res) => {
  res.send("Football Bot Online ✅");
});

// 📊 PAINEL
app.get("/panel", (req, res) => {
  res.send(`
    <h1>📊 PAINEL DO BOT</h1>
    <p>Status: ${ativo ? "ON 🟢" : "OFF 🔴"}</p>
  `);
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Bot a correr na porta " + PORT);
});