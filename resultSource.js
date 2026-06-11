const puppeteer = require("puppeteer");

async function checkResultFromSource() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  let finalResult = null;

  page.on("response", async (response) => {
    try {
      const url = response.url();

      if (
        url.includes("result") ||
        url.includes("game") ||
        url.includes("match") ||
        url.includes("state")
      ) {
        const data = await response.json().catch(() => null);

        if (data) {
          if (data.result) finalResult = data.result;
          if (data.color) finalResult = data.color;
        }
      }
    } catch (e) {}
  });

  await page.goto("https://winwin.bet", {
    waitUntil: "networkidle2"
  });

  await new Promise(r => setTimeout(r, 5000));

  await browser.close();

  if (!finalResult) return null;

  finalResult = finalResult.toLowerCase();

  if (finalResult.includes("blue")) return "blue";
  if (finalResult.includes("red")) return "red";

  return null;
}

module.exports = { checkResultFromSource };