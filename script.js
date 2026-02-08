// === BINANCE REALTIME (WebSocket) ===
const socket = new WebSocket(
    "wss://stream.binance.com:9443/ws/" +
    "btcusdt@trade/" +
    "ethusdt@trade/" +
    "bnbusdt@trade/" +
    "solusdt@trade/" +
    "rayusdt@trade"
);

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const symbol = data.s.toLowerCase();
    const price = parseFloat(data.p).toFixed(4);

    const el = document.getElementById(symbol);
    if (el) el.textContent = `$${price}`;
};

// === ORE (CoinGecko fallback) ===
async function getORE() {
    try {
        const res = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ore-network&vs_currencies=usd"
        );
        const data = await res.json();
        document.getElementById("ore").textContent =
            `$${data["ore-network"].usd}`;
    } catch (e) {
        document.getElementById("ore").textContent = "N/A";
    }
}

getORE();
setInterval(getORE, 15000);
