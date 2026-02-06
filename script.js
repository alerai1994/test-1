const prices = {
  BTC: document.querySelector("#BTC .price"),
  ETH: document.querySelector("#ETH .price"),
  XRP: document.querySelector("#XRP .price"),
  SOL: document.querySelector("#SOL .price"),
  RAY: document.querySelector("#RAY .price")
};

// WebSocket Binance → REAL TIME
const socket = new WebSocket(
  "wss://stream.binance.com:9443/stream?streams=" +
  "btcusdt@trade/ethusdt@trade/xrpusdt@trade/solusdt@trade/rayusdt@trade"
);

socket.onmessage = (event) => {
  const data = JSON.parse(event.data).data;
  const symbol = data.s.replace("USDT", "");
  const price = parseFloat(data.p);

  if (prices[symbol]) {
    prices[symbol].textContent = "$ " + price.toFixed(4);
  }
};

socket.onerror = () => {
  console.error("Errore WebSocket");
};
const cards = document.querySelectorAll(".card");

async function updatePrices() {
  const ids = [
    "bitcoin",
    "ethereum",
    "ripple",
    "solana",
    "ore-network",
    "raydium"
  ].join(",");

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;

  const res = await fetch(url);
  const data = await res.json();

  cards.forEach(card => {
    const id = card.dataset.id;
    const priceEl = card.querySelector(".price");

    if (data[id]) {
      priceEl.textContent = `$ ${data[id].usd.toLocaleString()}`;
    }
  });
}

// primo caricamento
updatePrices();

// aggiorna ogni 10 secondi
setInterval(updatePrices, 10000);
