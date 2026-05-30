const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

// 🔑 CONFIG
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

// 🔥 CONTROLO
let ativo = true;

// 📦 HISTÓRICO
const FILE = "historico.json";

function guardarHistorico(sinal, jogo) {
  let data = [];

  if (fs.existsSync(FILE)) {
    data = JSON.parse(fs.readFileSync(FILE));
  }

  data.push({
    sinal,
    jogo,
    hora: new Date()
  });

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// 🧠 IA MELHORADA
function escolherSinal(oddHome, oddAway) {
  const home = 1 / oddHome;
  const away = 1 / oddAway;

  const diferenca = Math.abs(home - away);

  if (diferenca < 0.03) {
    return "📊 SEM SINAL (RISCO ALTO)";
  }

  return home > away
    ? "📊 IA FORTE: CASA"
    : "📊 IA FORTE: FORA";
}

// 🚫 ANTI-SPAM
let ultimoSinal = "";

function enviar(msg) {
  if (msg === ultimoSinal) return;

  ultimoSinal = msg;
  bot.sendMessage(chatId, msg);
}

// 🌐 API ODDS
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

        const msg = `${sinal}\n⚽ ${home} vs ${away}`;

        enviar(msg);
        guardarHistorico(sinal, `${home} vs ${away}`);

      } catch (err) {
        console.log("Erro jogo:", err.message);
      }
    });

  } catch (err) {
    console.log("Erro API:", err.message);
  }
}

// ⏰ LOOP
setInterval(() => {
  if (!ativo) return;
  buscarOdds().catch(err => console.log(err.message));
}, 300000);

// 🤖 BOTÕES TELEGRAM
const menu = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🟢 LIGAR BOT", callback_data: "start" },
        { text: "🔴 DESLIGAR BOT", callback_data: "stop" }
      ]
    ]
  }
};

bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(chatId, "⚙️ CONTROLO DO BOT", menu);
});

bot.on("callback_query", (query) => {
  const action = query.data;

  if (action === "start") {
    ativo = true;
    bot.sendMessage(chatId, "🟢 BOT LIGADO");
  }

  if (action === "stop") {
    ativo = false;
    bot.sendMessage(chatId, "🔴 BOT DESLIGADO");
  }
});

// 🌐 WEB
app.get("/", (req, res) => {
  res.send("Football Bot Online ✅");
});

// 📊 PAINEL
app.get("/panel", (req, res) => {
  let data = [];

  if (fs.existsSync(FILE)) {
    data = JSON.parse(fs.readFileSync(FILE));
  }

  res.send(`
    <h1>📊 PAINEL PRO</h1>
    <p>Status: ${ativo ? "ON 🟢" : "OFF 🔴"}</p>
    <p>Total sinais: ${data.length}</p>
    <p>Último: ${data[data.length - 1]?.sinal || "nenhum"}</p>
  `);
});

// 🚀 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Bot online na porta " + PORT);
});