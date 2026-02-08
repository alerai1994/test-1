let lastPrices = {};

// ================= BINANCE WebSocket (BTC, ETH, BNB, SOL, RAY) =================
const binancePairs = [
    "btcusdt@trade",
    "ethusdt@trade",
    "bnbusdt@trade",
    "solusdt@trade",
    "rayusdt@trade"
];

const binanceWS = new WebSocket(
    "wss://stream.binance.com:9443/stream?streams=" +
    binancePairs.join("/")
);

binanceWS.onmessage = (msg) => {
    const data = JSON.parse(msg.data).data;
    const symbol = data.s.toLowerCase();
    const price = parseFloat(data.p);

    updatePrice(symbol, price);
};

// ================= JUPITER API (ORE price polling) =================
// Indirizzo mint reale ORE su Solana (da Explorer Solana / Jupiter) :contentReference[oaicite:1]{index=1}
const ORE_MINT = "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp";

async function fetchORE() {
    try {
        // Usa l’API Jupiter Price API (lite-api.jup.ag)
        const res = await fetch(
            `https://lite-api.jup.ag/v1/price?id=${ORE_MINT}`
        );
        const json = await res.json();
        const price = parseFloat(json.data.price).toFixed(6);
        updatePrice("oreusdt", parseFloat(price));
    } catch (e) {
        console.error("Errore Jupiter ORE:", e);
    }
}

// Prima chiamata e polling ogni 2 secondi
fetchORE();
setInterval(fetchORE, 2000);

// ================= Helper UI =================
function updatePrice(id, price) {
    const el = document.getElementById(id);
    if (!el) return;

    if (lastPrices[id] !== undefined) {
        if (price > lastPrices[id]) {
            el.classList.remove("red");
            el.classList.add("green");
        } else if (price < lastPrices[id]) {
            el.classList.remove("green");
            el.classList.add("red");
        }
    }

    el.textContent = `$${price.toFixed(6)}`;
    lastPrices[id] = price;
}
