let lastPrices = {};

// ================= BINANCE WebSocket =================
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
// Ore mint su Solana (da Jupiter API)
const ORE_MINT = "OREv2TokenMintAddressPlaceholder"; // sostituisci con mint reale ORE su Jupiter

async function fetchORE() {
    try {
        const res = await fetch(
            `https://price.jup.ag/v4/price?ids=${ORE_MINT}`
        );
        const json = await res.json();
        if(json.data && json.data[ORE_MINT]) {
            const price = json.data[ORE_MINT].price;
            updatePrice("oreusdt", price);
        }
    } catch (e) {
        console.error("Errore Jupiter ORE", e);
    }
}

// Polling ultra-rapido ogni 2 secondi
fetchORE();
setInterval(fetchORE, 2000);

// ================= UPDATE UI + COLOR =================
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
