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

// ================= JUPITER API (ORE) =================
const ORE_MINT = "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp"; // mint reale ORE

async function fetchORE() {
    try {
        const res = await fetch(
            `https://lite-api.jup.ag/price/v3?ids=${ORE_MINT}`
        );
        const json = await res.json();
        const data = json.data?.[ORE_MINT];
        if (data && data.price) {
            updatePrice("oreusdt", parseFloat(data.price));
        }
    } catch (e) {
        console.error("Errore caricamento prezzo ORE:", e);
    }
}

// Primo caricamento + polling ogni 2 secondi
fetchORE();
setInterval(fetchORE, 2000);

// ================= UI Update + Colore =================
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
