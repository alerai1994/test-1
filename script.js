// ================= BINANCE (BTC, ETH, BNB, SOL, RAY) =================
const binanceStreams = [
    "btcusdt@trade",
    "ethusdt@trade",
    "bnbusdt@trade",
    "solusdt@trade",
    "rayusdt@trade"
];

const binanceWS = new WebSocket(
    "wss://stream.binance.com:9443/stream?streams=" +
    binanceStreams.join("/")
);

binanceWS.onmessage = (msg) => {
    const data = JSON.parse(msg.data).data;
    const symbol = data.s.toLowerCase();
    const price = parseFloat(data.p).toFixed(6);
    document.getElementById(symbol).textContent = `$${price}`;
};

// ================= GATE.IO (ORE) =================
const gateWS = new WebSocket("wss://api.gateio.ws/ws/v4/");

gateWS.onopen = () => {
    gateWS.send(JSON.stringify({
        time: Date.now(),
        channel: "spot.trades",
        event: "subscribe",
        payload: ["ORE_USDT"]
    }));
};

gateWS.onmessage = (msg) => {
    const res = JSON.parse(msg.data);
    if (!res.result) return;

    const trade = res.result[0];
    const price = parseFloat(trade.price).toFixed(6);
    document.getElementById("oreusdt").textContent = `$${price}`;
};
