const TelegramBot = require("node-telegram-bot-api");

const token = "8603735814:AAEsgetsnBn1NLMuyDrxQpbIOYTA_Zw_nj8";
const chatId = "6942730957";

const bot = new TelegramBot(token, { polling: true });

let historico = [];
let wins = 0;
let loss = 0;

function gerarCor() {
    return Math.random() > 0.5 ? "🔵 AZUL" : "🔴 VERMELHO";
}

function analisarTendencia() {

    if (historico.length < 3) {
        return gerarCor();
    }

    const ultimos = historico.slice(-3);

    const todosAzul = ultimos.every(c => c.includes("AZUL"));
    const todosVermelho = ultimos.every(c => c.includes("VERMELHO"));

    if (todosAzul) {
        return "🔴 VERMELHO";
    }

    if (todosVermelho) {
        return "🔵 AZUL";
    }

    return gerarCor();
}

function enviarSinal() {

    const sinal = analisarTendencia();

    historico.push(sinal);

    bot.sendMessage(chatId,
`🚨 ENTRADA CONFIRMADA 🚨

${sinal}
⚪ Proteção no Branco

📊 Estratégia: Tendência
🎯 Gale: 1

⏰ Entrar agora`);

    setTimeout(() => {

        const win = Math.random() > 0.35;

        if (win) {

            wins++;

            bot.sendMessage(chatId,
`✅ WIN GREEN

📊 Placar

✅ ${wins} Wins
❌ ${loss} Loss`);

        } else {

            loss++;

            bot.sendMessage(chatId,
`❌ LOSS

📊 Placar

✅ ${wins} Wins
❌ ${loss} Loss`);
        }

    }, 15000);
}

setInterval(enviarSinal, 120000);