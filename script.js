let lastPrices = {};
let charts = {};
let priceHistory = {};

// ================= INIT CHARTS =================
["btcusdt","ethusdt","bnbusdt","solusdt","rayusdt","oreusdt"].forEach(id => {
    const ctx = document.getElementById(id + "Chart").getContext("2d");
    priceHistory[id] = [];
    charts[id] = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: id.toUpperCase(), data: [], borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)', tension: 0.25 }]},
        options: { animation: false, responsive: true, scales: {x:{display:false},y:{beginAtZero:false}}}
    });
});

// ================= UPDATE PRICE =================
function updatePrice(id, price) {
    const el = document.getElementById(id);
    if (!el) return;

    if (lastPrices[id] !== undefined) {
        if (price > lastPrices[id]) {
            el.classList.remove("red"); el.classList.add("green");
        } else if (price < lastPrices[id]) {
            el.classList.remove("green"); el.classList.add("red");
        }
    }

    el.textContent = `$${price.toFixed(6)}`;
    lastPrices[id] = price;

    if (charts[id]) {
        priceHistory[id].push(price);
        if (priceHistory[id].length > 30) priceHistory[id].shift();
        charts[id].data.labels = priceHistory[id].map((_, i) => i+1);
        charts[id].data.datasets[0].data = priceHistory[id];
        charts[id].update();
    }
}

// ================= BINANCE WS =================
const binancePairs = ["btcusdt@trade","ethusdt@trade","bnbusdt@trade","solusdt@trade","rayusdt@trade"];
const binanceWS = new WebSocket("wss://stream.binance.com:9443/stream?streams="+binancePairs.join("/"));
binanceWS.onmessage = (msg)=>{
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
    } catch(e){ console.error("Errore prezzo ORE:", e); }
}
fetchORE(); setInterval(fetchORE, 2000);

// ================= SHOW INFO MODAL =================
async function showInfo(id){
    const modal = document.getElementById("infoModal");
    const title = document.getElementById("modalTitle");
    const list = document.getElementById("modalList");
    const cmcLink = document.getElementById("cmcLink");
    
    title.textContent = id.toUpperCase()+" Info";
    list.innerHTML = "<li>Caricamento...</li>";
    cmcLink.href="#";
    
    modal.style.display = "block";

    try{
        const symbolMap = {btcusdt:"bitcoin",ethusdt:"ethereum",bnbusdt:"binancecoin",solusdt:"solana",rayusdt:"raydium",oreusdt:"ore"};
        const symbol = symbolMap[id];
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbol}`;
        const res = await fetch(url);
        const data = await res.json();
        if(data[0]){
            const coin = data[0];
            const changeClass = coin.price_change_percentage_24h>=0?"green":"red";
            list.innerHTML = `
                <li>Prezzo: $${coin.current_price}</li>
                <li>Variazione 24h: <span class="${changeClass}">${coin.price_change_percentage_24h.toFixed(2)}%</span></li>
                <li>Min 24h: $${coin.low_24h}</li>
                <li>Max 24h: $${coin.high_24h}</li>
                <li>Volume 24h: $${coin.total_volume.toLocaleString()}</li>
                <li>Total Supply: ${coin.total_supply?.toLocaleString() || 'N/A'}</li>
            `;
            cmcLink.href = `https://coinmarketcap.com/currencies/${symbol}/`;
        } else list.innerHTML="<li>Dati non disponibili</li>";
    }catch(e){ list.innerHTML="<li>Errore caricamento info</li>"; console.error(e);}
}

// ================= CLOSE MODAL =================
function closeModal(){
    document.getElementById("infoModal").style.display="none";
}
window.onclick = function(event){
    const modal = document.getElementById("infoModal");
    if(event.target == modal) modal.style.display="none";
}
