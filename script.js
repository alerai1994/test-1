let progress = 0;
const bar = document.getElementById("bar");
const percent = document.getElementById("percent");
const modal = document.getElementById("modal");
const continuaBtn = document.getElementById("continua");

// 10 secondi → 100% (aggiorna ogni 100ms)
const interval = setInterval(() => {
  progress++;
  bar.style.width = progress + "%";
  percent.textContent = progress + "%";

  if (progress >= 100) {
    clearInterval(interval);
    setTimeout(() => {
      modal.classList.remove("hidden");
    }, 300);
  }
}, 100);

// Click su continua → apre finestra
continuaBtn.addEventListener("click", () => {
  const win = window.open("", "_blank", "width=400,height=200");
  win.document.write("<h1>porco dio</h1>");
});
