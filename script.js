let config;
let priceHistory = {};

async function loadConfig() {
    const response = await fetch("config.json");
    config = await response.json();
    initCoins();
    updateData();
    setInterval(updateData, config.refreshInterval);
}

function initCoins() {
    const container = document.getElementById("coins");
    config.coins.forEach(coin => {
        priceHistory[coin.id] = [];
        container.innerHTML += `
            <div class="coin" id="${coin.id}">
                <div class="symbol">${coin.symbol}</div>
                <div class="price">Loading...</div>
                <div class="chart">
                    <canvas></canvas>
                    <div class="blink"></div>
                </div>
            </div>
        `;
    });
}

async function updateData() {
    if (!navigator.onLine) return;

    const ids = config.coins.map(c => c.id).join(",");
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`;
    const response = await fetch(url);
    const data = await response.json();

    let tickerText = "";

    data.forEach(coin => {
        const el = document.getElementById(coin.id);
        const priceEl = el.querySelector(".price");
        const blink = el.querySelector(".blink");

        const lastPrice = priceHistory[coin.id].slice(-1)[0];
        const currentPrice = coin.current_price;

        priceHistory[coin.id].push(currentPrice);
        if (priceHistory[coin.id].length > 20) {
            priceHistory[coin.id].shift();
        }

        priceEl.textContent = "$" + currentPrice.toLocaleString();

        if (lastPrice) {
            if (currentPrice > lastPrice) {
                priceEl.className = "price positive";
                blink.style.background = "#00ff00";
            } else if (currentPrice < lastPrice) {
                priceEl.className = "price negative";
                blink.style.background = "red";
            }
        }

        drawChart(el.querySelector("canvas"), priceHistory[coin.id]);

        tickerText += `
            MarketCap: $${coin.market_cap.toLocaleString()} | 
            Vol 24h: $${coin.total_volume.toLocaleString()} | 
            Max Supply: ${coin.max_supply ?? "N/A"} | 
            Total Supply: ${coin.total_supply ?? "N/A"} | 
            Circulating: ${coin.circulating_supply.toLocaleString()} —
        `;
    });

    document.getElementById("ticker").innerHTML = tickerText;
}

function drawChart(canvas, data) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const max = Math.max(...data);
    const min = Math.min(...data);

    ctx.beginPath();
    ctx.strokeStyle = "#00c6ff";
    ctx.lineWidth = 2;

    data.forEach((value, index) => {
        const x = (index / (data.length - 1)) * canvas.width;
        const y = canvas.height - ((value - min) / (max - min)) * canvas.height;

        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

function updateStatus() {
    const status = document.getElementById("status");
    if (navigator.onLine) {
        status.textContent = "ONLINE";
        status.className = "online";
    } else {
        status.textContent = "OFFLINE";
        status.className = "offline";
    }
}

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);

updateStatus();
loadConfig();
