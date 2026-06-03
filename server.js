
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

// ⚙️ CONTROLO
let ativo = true;

// 📦 HISTÓRICO
const FILE = "historico.json";

// 🧠 Anti-repetição avançado
const jogosEnviados = new Map();

// ===============================
// 📊 SCORE DE QUALIDADE
// ===============================
function calcularScore(oddHome, oddAway) {
  const probHome = 1 / oddHome;
  const probAway = 1 / oddAway;

  const total = probHome + probAway;

  const homeNorm = probHome / total;
  const awayNorm = probAway / total;

  const diferenca = Math.abs(homeNorm - awayNorm);

  const score = Math.round(diferenca * 100);

  return { homeNorm, awayNorm, score };
}

// ===============================
// 📊 GERAR SINAL
// ===============================
function gerarSinal(home, away, scoreData) {
  if (scoreData.score < 10) return null;

  if (scoreData.homeNorm > scoreData.awayNorm) {
    return `📊 SINAL FORTE CASA\n🔥 Score: ${scoreData.score}/100`;
  }

  return `📊 SINAL FORTE FORA\n🔥 Score: ${scoreData.score}/100`;
}

// ===============================
// 🚫 ANTI-SPAM
// ===============================
function podeEnviar(jogoId) {
  const agora = Date.now();

  if (jogosEnviados.has(jogoId)) {
    const ultimo = jogosEnviados.get(jogoId);

    if (agora - ultimo < 30 * 60 * 1000) {
      return false;
    }
  }

  jogosEnviados.set(jogoId, agora);
  return true;
}

// ===============================
// 💾 HISTÓRICO
// ===============================
function guardarHistorico(sinal, jogo) {
  let data = [];

  if (fs.existsSync(FILE)) {
    data = JSON.parse(fs.readFileSync(FILE));
  }

  data.push({
    sinal,
    jogo,
    hora: new Date().toISOString()
  });

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ===============================
// 📩 ENVIAR TELEGRAM
// ===============================
async function enviar(msg) {
  try {
    await bot.sendMessage(chatId, msg);
    console.log("📩 Enviado:", msg);
  } catch (err) {
    console.log("Erro Telegram:", err.message);
  }
}

// ===============================
// 🌐 API ODDS
// ===============================
async function buscarOdds() {
  try {
    console.log("🔍 Scan iniciado:", new Date().toLocaleTimeString());

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

    for (const jogo of jogos) {
      try {
        const home = jogo.home_team;
        const away = jogo.away_team;

        const book = jogo.bookmakers?.[0];
        const market = book?.markets?.[0];
        const odds = market?.outcomes;

        if (!odds || odds.length < 2) continue;

        const oddHome = odds[0].price;
        const oddAway = odds[1].price;

        const jogoId = `${home} vs ${away}`;

        // 🚫 anti repetição
        if (!podeEnviar(jogoId)) continue;

        const scoreData = calcularScore(oddHome, oddAway);
        const sinal = gerarSinal(home, away, scoreData);

        if (!sinal) continue;

        const msg = `${sinal}\n⚽ ${home} vs ${away}`;

        await enviar(msg);
        guardarHistorico(sinal, jogoId);

      } catch (err) {
        console.log("Erro jogo:", err.message);
      }
    }

  } catch (err) {
    console.log("Erro API:", err.message);
  }
}

// ===============================
// ⏰ LOOP INTELIGENTE
// ===============================
setInterval(() => {
  if (!ativo) return;
  buscarOdds().catch(console.log);
}, 120000); // 2 minutos ideal

// ===============================
// 🤖 TELEGRAM CONTROLO
// ===============================
const menu = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🟢 LIGAR", callback_data: "start" },
        { text: "🔴 DESLIGAR", callback_data: "stop" }
      ]
    ]
  }
};

bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(chatId, "⚙️ FOOTBALL STUDIO BOT", menu);
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

// ===============================
// 🌐 WEB SERVER
// ===============================
app.get("/", (req, res) => {
  res.send("Football Studio Bot Online ✅");
});

// ===============================
// 📊 PAINEL
// ===============================
app.get("/panel", (req, res) => {
  let data = [];

  if (fs.existsSync(FILE)) {
    data = JSON.parse(fs.readFileSync(FILE));
  }

  res.send(`
    <h1>📊 FOOTBALL STUDIO PANEL</h1>
    <p>Status: ${ativo ? "ON 🟢" : "OFF 🔴"}</p>
    <p>Total sinais: ${data.length}</p>
    <p>Último sinal: ${data[data.length - 1]?.sinal || "nenhum"}</p>
  `);
});

// ===============================
// 🚀 START
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Football Studio Bot online na porta " + PORT);
});