/* ===== SETTINGS (edit these) ===== */
const MUSIC_FILE = "music/anniversary-song.mp3"; // your song
const TOGETHER_SINCE = "2022-10-20";             // CHANGE: the date you got together (YYYY-MM-DD)
const SPARKLES = ["✦", "✧", "❤", "⋆"];
const PAGES = [ // menu order
  ["index.html", "Welcome"], ["story.html", "Story"], ["reasons.html", "Reasons"],
  ["letter.html", "Letter"], ["wishes.html", "Wishes"], ["final.html", "Finale"]
];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ===== STARRY SKY (twinkling stars + shooting stars) ===== */
const sky = document.createElement("canvas");
sky.id = "sky";
document.body.prepend(sky);
const cx = sky.getContext("2d");
let stars = [], shoot = null;
function sizeSky() {
  sky.width = innerWidth; sky.height = innerHeight;
  stars = Array.from({ length: Math.min(140, Math.floor(innerWidth / 8)) }, () => ({
    x: Math.random() * sky.width, y: Math.random() * sky.height,
    r: Math.random() * 1.4 + .3, p: Math.random() * 6.28, s: Math.random() * .02 + .005
  }));
}
sizeSky();
addEventListener("resize", sizeSky);
(function drawSky() {
  cx.clearRect(0, 0, sky.width, sky.height);
  for (const s of stars) {
    s.p += s.s;
    cx.globalAlpha = .35 + .65 * Math.abs(Math.sin(s.p));
    cx.fillStyle = "#fff6dc";
    cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.28); cx.fill();
  }
  if (!shoot && Math.random() < .004) shoot = { x: Math.random() * sky.width, y: 0, l: 0 };
  if (shoot) {
    cx.globalAlpha = 1 - shoot.l / 60;
    cx.strokeStyle = "#f2c879"; cx.lineWidth = 2;
    cx.beginPath(); cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x - 70, shoot.y - 40); cx.stroke();
    shoot.x += 9; shoot.y += 5; shoot.l++;
    if (shoot.l > 60) shoot = null;
  }
  requestAnimationFrame(drawSky);
})();

/* ===== MENU ===== */
const nav = document.createElement("nav");
nav.className = "menu";
nav.innerHTML = PAGES.map(([h, n]) => `<a href="${h}">${n}</a>`).join("");
document.body.prepend(nav);

/* ===== MUSIC: one audio player that is never reloaded while you move between pages ===== */
const audio = new Audio(MUSIC_FILE);
audio.loop = true;
audio.preload = "auto";
const btn = document.createElement("button");
btn.className = "music";
document.body.append(btn);
let musicMissing = false;
const wanted = () => sessionStorage.getItem("musicWanted");

function renderMusic() {
  const on = !audio.paused;
  btn.classList.toggle("playing", on);
  btn.classList.toggle("tap", !on && wanted() !== "off");
  btn.innerHTML = on ? '<span class="note">🎵</span> Pause'
    : (wanted() === "off" ? "🔇 Play music" : "🎵 Tap to Play Music 🎵");
  if (musicMissing) btn.textContent = "🎵 Add music/anniversary-song.mp3";
}
function saveMusicState() { try { sessionStorage.setItem("musicTime", audio.currentTime); } catch (e) {} }
audio.addEventListener("error", () => { musicMissing = true; renderMusic(); });
audio.addEventListener("play", renderMusic);
audio.addEventListener("pause", renderMusic);
addEventListener("pagehide", saveMusicState);
btn.addEventListener("click", e => {
  e.stopPropagation();
  if (audio.paused) { sessionStorage.setItem("musicWanted", "on"); audio.play().catch(() => {}); }
  else { sessionStorage.setItem("musicWanted", "off"); audio.pause(); }
});
audio.addEventListener("loadedmetadata", () => {
  const t = parseFloat(sessionStorage.getItem("musicTime"));
  if (t && t < audio.duration) audio.currentTime = t;
}, { once: true });

/* Autoplay: browsers block sound until the visitor taps once. We try autoplay first;
   if blocked, a full-screen "Open our gift" screen appears - that one tap starts the music. */
function showGate() {
  if (sessionStorage.getItem("entered") || musicMissing) return;
  const g = document.createElement("div");
  g.className = "gate";
  g.innerHTML = '<div class="orb"><span>❤</span></div><h1>A gift for you my love</h1><button class="btn">Open Your Gift ✦</button>';
  document.body.append(g);
  $("button", g).addEventListener("click", () => {
    sessionStorage.setItem("entered", "1");
    sessionStorage.setItem("musicWanted", "on");
    audio.play().catch(() => {});
    g.classList.add("gone");
    setTimeout(() => g.remove(), 800);
  });
}
if (wanted() !== "off") {
  audio.play().catch(showGate);
  document.addEventListener("click", e => {
    if (e.target.closest(".music")) return;
    if (audio.paused && wanted() !== "off") { sessionStorage.setItem("musicWanted", "on"); audio.play().catch(() => {}); }
  }, { once: true });
}
renderMusic();

/* ===== FLOATING SPARKLES + CLICK SPARKLES ===== */
function floatSpark() {
  const h = document.createElement("span");
  h.className = "float";
  h.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 12 + Math.random() * 22 + "px";
  h.style.opacity = .3 + Math.random() * .5;
  h.style.animationDuration = 7 + Math.random() * 6 + "s";
  document.body.append(h);
  setTimeout(() => h.remove(), 13500);
}
(function loop() { floatSpark(); setTimeout(loop, document.body.dataset.page === "final" ? 300 : 1000); })();
document.addEventListener("pointerdown", e => {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = SPARKLES[i % SPARKLES.length];
    s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
    s.style.setProperty("--dx", (Math.random() - .5) * 120 + "px");
    s.style.setProperty("--dy", (Math.random() - .5) * 120 + "px");
    document.body.append(s);
    setTimeout(() => s.remove(), 850);
  }
});

/* ===== PAGE SETUP: runs on first load AND every time a new page is shown ===== */
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("show")), { threshold: .2 });

function initPage() {
  const page = document.body.dataset.page;
  $$(".menu a").forEach(a => {
    const on = a.getAttribute("href").startsWith(page);
    a.classList.toggle("active", on);
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
  // days together counter
  const tg = $("#together");
  if (tg) {
    const days = Math.floor((Date.now() - new Date(TOGETHER_SINCE)) / 864e5);
    if (days > 0) tg.textContent = `${days.toLocaleString()} days of loving you ✦`;
  }
  // timeline cards appear one by one
  $$(".timeline article").forEach(a => io.observe(a));
  // flip cards
  $$(".reason").forEach(r => r.addEventListener("click", () => r.classList.toggle("flipped")));
  // wax seal -> letter + typing animation
  const seal = $("#seal");
  if (seal) seal.addEventListener("click", () => {
    if (seal.classList.contains("broken")) return;
    seal.classList.add("broken");
    const paper = $("#paper"), out = $("#typed");
    const text = $$("#letterSource p").map(p => p.textContent.trim()).join("\n\n");
    setTimeout(() => {
      seal.hidden = true; paper.hidden = false;
      let n = 0;
      (function type() {
        out.textContent = text.slice(0, ++n);
        if (n < text.length) setTimeout(type, 35);
      })();
    }, 600);
  });
  // wishes
  $$(".wish").forEach(w => w.addEventListener("click", () => {
    w.classList.add("seen");
    $("#wishText").textContent = w.dataset.wish;
    for (let k = 0; k < 6; k++) setTimeout(floatSpark, k * 80);
  }));
}

/* ===== PAGE CHANGES WITHOUT RELOADING (keeps the music playing) =====
   Each page is still its own .html file. We fetch it and swap the content.
   If that fails (e.g. opened from a local file), we fall back to a normal page load. */
async function go(url, push = true) {
  document.body.classList.add("leaving");
  try {
    const [res] = await Promise.all([fetch(url), new Promise(r => setTimeout(r, 300))]);
    if (!res.ok) throw new Error("not found");
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    $("main.page").innerHTML = doc.querySelector("main.page").innerHTML;
    document.body.dataset.page = doc.body.dataset.page;
    document.title = doc.title;
    if (push) history.pushState({}, "", url);
    scrollTo(0, 0);
    initPage();
    document.body.classList.remove("leaving");
  } catch (err) {
    saveMusicState();
    location.href = url;
  }
}
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (!a || a.target || e.metaKey || e.ctrlKey || !a.getAttribute("href").endsWith(".html")) return;
  e.preventDefault();
  go(a.href);
});
addEventListener("popstate", () => go(location.href, false));

initPage();
