let lastPrices = {};
let charts = {};
let priceHistory = {};

// ================= UTILITY =================
function createChart(id) {
    const ctx = document.getElementById(id + "Chart").getContext("2d");
    priceHistory[id] = [];
    charts[id] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: id.toUpperCase(),
                data: [],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                tension: 0.25
            }]
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                x: { display: false },
                y: { beginAtZero: false }
            }
        }
    });
}

// ================= UPDATE PRICE =================
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

    // update chart
    if (charts[id]) {
        priceHistory[id].push(price);
        if (priceHistory[id].length > 30) priceHistory[id].shift(); // max 30 punti
        charts[id].data.labels = priceHistory[id].map((_, i) => i+1);
        charts[id].data.datasets[0].data = priceHistory[id];
        charts[id].update();
    }
}

// ================= BINANCE WS =================
const binancePairs = [
    "btcusdt@trade",
    "ethusdt@trade",
    "bnbusdt@trade",
    "solusdt@trade",
    "rayusdt@trade"
];

const binanceWS = new WebSocket(
    "wss://stream.binance.com:9443/stream?streams=" + binancePairs.join("/")
);

binanceWS.onmessage = (msg) => {
    const data = JSON.parse(msg.data).data;
    const symbol = data.s.toLowerCase();
    const price = parseFloat(data.p);
    updatePrice(symbol, price);
};

// ================= JUPITER API POLLING ORE =================
const ORE_MINT = "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp";

async function fetchORE() {
    try {
        const res = await fetch(`https://lite-api.jup.ag/price/v3?ids=${ORE_MINT}`);
        const json = await res.json();
        const data = json.data?.[ORE_MINT];
        if (data && data.price) updatePrice("oreusdt", parseFloat(data.price));
    } catch(e) {
        console.error("Errore caricamento prezzo ORE:", e);
    }
}

// Polling ORE ogni 2s
fetchORE();
setInterval(fetchORE, 2000);

// ================= INIT CHARTS =================
["btcusdt","ethusdt","bnbusdt","solusdt","rayusdt","oreusdt"].forEach(id => createChart(id));
