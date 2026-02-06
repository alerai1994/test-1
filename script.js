function loadChart(symbol) {
  document.getElementById("chart").innerHTML = `
    <iframe
      src="https://www.tradingview.com/widgetembed/?symbol=${symbol}&interval=1&theme=dark&style=1&locale=it"
      style="width:100%; height:100%;"
      frameborder="0"
      allowfullscreen>
    </iframe>
  `;
}

// Carica BTC di default
loadChart("BINANCE:BTCUSDT");
