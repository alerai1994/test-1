let lastPrices = {};
let charts = {};

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

    // Update Chart Data
    if (charts[id]) {
        const currentData = charts[id].data.datasets[0].data;
        currentData.push(price);
        if (currentData.length > 30) currentData.shift();  // Keep the last 30 data points
        charts[id].update();
    }
}

// ================= BINANCE WS =================
const binancePairs = ["btcusdt@trade", "ethusdt@trade", "bnbusdt@trade", "solusdt@trade", "rayusdt@trade"];
const binanceWS = new WebSocket("wss://stream.binance.com:9443/stream?streams=" + binancePairs.join("/"));
binanceWS.onmessage = (msg) => {
    const data = JSON.parse(msg.data).data;
    const symbol = data.s.toLowerCase();
    updatePrice(symbol, parseFloat(data.p));
};

// ================= JUPITER API POLLING ORE =================
const ORE_MINT = "oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp";
async function fetchORE() {
    try {
        const res = await fetch(`https://lite-api.jup.ag/price/v3?ids=${ORE_MINT}`);
        const json = await res.json();
        const data = json.data?.[ORE_MINT];
        if (data && data.price) updatePrice("oreusdt", parseFloat(data.price));
    } catch (e) { console.error("Errore prezzo ORE:", e); }
}
fetchORE();
setInterval(fetchORE, 2000);

// ================= SHOW INFO MODAL =================
async function showInfo(id) {
    const modal = document.getElementById("infoModal");
    const title = document.getElementById("modalTitle");
    const list = document.getElementById("modalList");
    const cmcLink = document.getElementById("cmcLink");
    const modalChart = document.getElementById("modalChart");

    title.textContent = id.toUpperCase() + " Info";
    list.innerHTML = "<li>Caricamento...</li>";
    cmcLink.href = `https://www.coinmarketcap.com/currencies/${id}`;
    
    // Get additional information from CoinGecko API
    const symbolMap = {
        btcusdt: "bitcoin", 
        ethusdt: "ethereum",
        bnbusdt: "binancecoin",
        solusdt: "solana",
        rayusdt: "raydium",
        oreusdt: "ore"
    };

    const symbol = symbolMap[id];
    const url = `https://api.coingecko.com/api/v3/coins/${symbol}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const volume = data.market_data.total_volumes[0][1].toFixed(2);
        const minPrice = data.market_data.low_24h.usd.toFixed(2);
        const maxPrice = data.market_data.high_24h.usd.toFixed(2);
        const totalSupply = data.market_data.total_supply ? data.market_data.total_supply.toFixed(0) : "N/A";
        const percentChange = data.market_data.price_change_percentage_24h.toFixed(2);

        list.innerHTML = `
            <li>Volume (24h): $${volume}</li>
            <li>Min Prezzo (24h): $${minPrice}</li
