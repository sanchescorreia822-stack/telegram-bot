const puppeteer = require("puppeteer");

async function checkResultFromSource() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  let finalResult = null;

  // 🔥 CAPTURAR RESPOSTAS DA REDE
  page.on("response", async (response) => {
    try {
      const url = response.url();

      // 🔴 aqui vamos apanhar API do jogo
      if (
        url.includes("result") ||
        url.includes("game") ||
        url.includes("match") ||
        url.includes("state")
      ) {
        const data = await response.json().catch(() => null);

        if (data) {
          // 🔥 AJUSTA ISTO DEPOIS DE VER O JSON REAL
          if (data.result) finalResult = data.result;
          if (data.color) finalResult = data.color;
        }
      }
    } catch (e) {}
  });

  await page.goto("https://winwin.bet", {
    waitUntil: "networkidle2"
  });

  // ⏳ esperar dados carregarem
  await new Promise(r => setTimeout(r, 5000));

  await browser.close();

  if (!finalResult) return null;

  if (finalResult.toLowerCase().includes("blue")) return "blue";
  if (finalResult.toLowerCase().includes("red")) return "red";

  return null;
}

module.exports = { checkResultFromSource };