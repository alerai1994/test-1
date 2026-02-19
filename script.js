let config;
let priceHistory = {};
let animationFrames = {};

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
                    <canvas width="220" height="100"></canvas>
                    <div class="blink"></div>
                </div>
            </div>
        `;
    });
}

async function updateData() {
    if (!navigator.onLine) return;

    const ids = config.coins.map(c => c.id).join(",");
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`;
    const response = await fetch(url);
    const data = await response.json();

    let tickerText = "";

    data.forEach(coin => {
        const el = document.getElementById(coin.id);
        const priceEl = el.querySelector(".price");
        const canvas = el.querySelector("canvas");
        const blink = el.querySelector(".blink");

        const price = coin.current_price;
        const change24 = coin.price_change_percentage_24h;

        priceHistory[coin.id].push(price);
        if (priceHistory[coin.id].length > 60) {
            priceHistory[coin.id].shift();
        }

        const color = change24 >= 0 ? "#00ff00" : "red";
        priceEl.textContent = "$" + price.toLocaleString();
        priceEl.className = change24 >= 0 ? "price positive" : "price negative";
        blink.style.background = color;

        animateChart(canvas, priceHistory[coin.id], color, blink);

        tickerText += `${coin.symbol} $${price.toLocaleString()} — `;
    });

    document.getElementById("ticker").innerHTML = tickerText;
}

function animateChart(canvas, data, color, blink) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    let progress = 0;
    const duration = 300;

    function draw() {
        progress += 16;
        const percent = Math.min(progress / duration, 1);

        ctx.clearRect(0, 0, width, height);

        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * width * percent;
            const y = height - ((value - min) / range) * height;

            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            if (index === data.length - 1) {
                blink.style.left = x + "px";
                blink.style.top = y + "px";
            }
        });

        ctx.stroke();

        if (percent < 1) {
            requestAnimationFrame(draw);
        }
    }

    requestAnimationFrame(draw);
}

function updateStatus() {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");

    if (navigator.onLine) {
        dot.style.background = "#00ff00";
        text.textContent = "ONLINE";
    } else {
        dot.style.background = "red";
        text.textContent = "OFFLINE";
    }
}

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);

updateStatus();
loadConfig();
