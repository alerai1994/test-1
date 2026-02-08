// ================= BINANCE WebSocket (BTC, ETH, BNB, SOL, RAY) =================
const binanceStreams = [
    "btcusdt@trade",
    "ethusdt@trade",
    "bnbusdt@trade",
    "solusdt@trade",
    "rayusdt@trade"
];

let previousPrices = {};

// WebSocket per Binance
const binanceWS = new WebSocket(
    "wss://stream.binance.com:9443/stream?streams=" +
    binanceStreams.join("/")
);

binanceWS.onmessage = (msg) => {
    const data = JSON.parse(msg.data).data;
    const symbol = data.s.toLowerCase();    // esempio: "btcusdt"
    const price = parseFloat(data.p).toFixed(6);

    const priceElement = document.getElementById(symbol);
    if (!previousPrices[symbol]) {
        previousPrices[symbol] = price; // Prima volta, non possiamo confrontare
    }

    // Confronta il prezzo attuale con quello precedente per determinare il colore
    if (price > previousPrices[symbol]) {
        priceElement.classList.remove("red");
        priceElement.classList.add("green");
    } else if (price < previousPrices[symbol]) {
        priceElement.classList.remove("green");
        priceElement.classList.add("red");
    }

    // Aggiorna il prezzo precedente
    previousPrices[symbol] = price;

    // Mostra il prezzo aggiornato
    priceElement.textContent = `$${price}`;
};

// ================= BINGX WebSocket (ORE) =================
const bingxWS = new WebSocket("wss://ws.bingx.com/sapi/v1/websocket");

bingxWS.onopen = () => {
    bingxWS.send(JSON.stringify({
        "method": "SUBSCRIBE",
        "params": ["ORE_USDT"]
    }));
};

let previousOREPrice = null;

bingxWS.onmessage = (msg) => {
    const res = JSON.parse(msg.data);
    if (res.event === "trade" && res.data) {
        const price = parseFloat(res.data.price).toFixed(6);

        const priceElement = document.getElementById("oreusdt");

        if (previousOREPrice !== null) {
            // Confronta il prezzo attuale con quello precedente per determinare il colore
            if (price > previousOREPrice) {
                priceElement.classList.remove("red");
                priceElement.classList.add("green");
            } else if (price < previousOREPrice) {
                priceElement.classList.remove("green");
                priceElement.classList.add("red");
            }
        }

        // Aggiorna il prezzo precedente
        previousOREPrice = price;

        // Mostra il prezzo aggiornato
        priceElement.textContent = `$${price}`;
    }
};

// ================= Aggiornamento ogni 2 secondi per TUTTI i simboli =================
setInterval(() => {
    binanceStreams.forEach(symbol => {
        const el = document.getElementById(symbol);
        if (el && el.textContent === "--") {
            el.textContent = `--`; // Aggiungi un placeholder in caso di errori
        }
    });
}, 2000);
