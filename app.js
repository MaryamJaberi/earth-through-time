(function () {
  const eras = window.EARTH_ERAS;
  const slider = document.getElementById("time-slider");
  const ticks = document.getElementById("ticks");
  const mapRoot = document.getElementById("map-root");
  const caption = document.getElementById("map-caption");
  const whenEl = document.getElementById("era-when");
  const nameEl = document.getElementById("era-name");
  const badgeEl = document.getElementById("era-badge");
  const titleEl = document.getElementById("card-title");
  const bodyEl = document.getElementById("card-body");
  const noteEl = document.getElementById("card-note");
  const tabs = document.querySelectorAll(".tabs button");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const playBtn = document.getElementById("play");
  const aboutBtn = document.getElementById("about-btn");
  const aboutDlg = document.getElementById("about");

  let index = eras.findIndex((e) => e.id === "present");
  if (index < 0) index = 0;
  let tab = "earth";
  let playing = false;
  let playTimer = null;

  slider.max = String(eras.length - 1);
  slider.value = String(index);

  function placeTicks() {
    ticks.innerHTML = "";
    const showEvery = window.innerWidth < 800 ? 2 : 1;
    eras.forEach((era, i) => {
      if (i % showEvery && i !== index && i !== 0 && i !== eras.length - 1) return;
      const el = document.createElement("button");
      el.className = "tick" + (i === index ? " active" : "");
      el.style.left = (i / (eras.length - 1)) * 100 + "%";
      el.type = "button";
      el.innerHTML = `<div class="dot"></div><span>${era.shortLabel}</span>`;
      el.addEventListener("click", () => setIndex(i));
      ticks.appendChild(el);
    });
  }

  const MAPS = {
    cosmos() {
      return `
        <circle cx="200" cy="200" r="3" fill="#fff"/>
        <circle cx="320" cy="140" r="2" fill="#fff"/>
        <circle cx="520" cy="220" r="2.4" fill="#fff"/>
        <circle cx="610" cy="90" r="1.6" fill="#fff"/>
        <circle cx="140" cy="80" r="1.8" fill="#fff"/>
        <ellipse cx="400" cy="210" rx="70" ry="28" fill="none" stroke="#8bb4d6" stroke-opacity=".45"/>
        <ellipse cx="400" cy="210" rx="120" ry="48" fill="none" stroke="#8bb4d6" stroke-opacity=".25"/>
        <circle cx="400" cy="210" r="10" fill="#f0d9b0"/>
        <text x="400" y="255" text-anchor="middle" fill="#9aa3b2" font-size="12">No Earth yet — expanding space</text>`;
    },
    molten() {
      return ocean() + `
        <ellipse cx="400" cy="220" rx="210" ry="200" fill="#6a2a1e"/>
        <ellipse cx="380" cy="200" rx="160" ry="150" fill="#a43b22"/>
        <ellipse cx="360" cy="190" rx="70" ry="50" fill="#e07a3a"/>
        <text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Magma ocean after accretion and the Moon-forming impact</text>`;
    },
    archean() {
      return ocean() + blob(300, 210, 70, 40, 12) + blob(470, 250, 55, 32, -20) + blob(520, 160, 40, 24, 30) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Small protocontinents in a global ocean — schematic</text>`;
    },
    kenorland() {
      return ocean() + blob(360, 200, 140, 80, -15) + blob(500, 260, 70, 40, 20) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Kenorland-style clustering — schematic, not a survey map</text>`;
    },
    columbia() {
      return ocean() + blob(390, 210, 170, 95, -8) + blob(250, 280, 50, 30, 10) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Columbia / Nuna assembled — schematic</text>`;
    },
    rodinia() {
      return ocean() + blob(410, 200, 160, 110, 18) + blob(300, 160, 55, 35, -30) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Rodinia clustered — schematic reconstruction</text>`;
    },
    pannotia() {
      return ocean() + blob(420, 260, 150, 100, -25) + blob(280, 160, 60, 40, 10) + blob(560, 150, 45, 30, 0) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Pannotia / Greater Gondwana gathering — schematic</text>`;
    },
    cambrian() {
      return ocean() +
        blob(430, 300, 180, 90, -20) +
        blob(280, 170, 70, 45, 15) +
        blob(520, 150, 50, 32, -10) +
        blob(610, 200, 36, 24, 25) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Gondwana south; Laurentia, Baltica, Siberia separate — schematic</text>`;
    },
    devonian() {
      return ocean() +
        blob(440, 300, 175, 95, -18) +
        blob(300, 180, 100, 50, 8) +
        blob(560, 160, 40, 28, 0) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Gondwana + Euramerica approaching — schematic</text>`;
    },
    "pangaea-early": function () {
      return ocean() + blob(390, 220, 150, 160, -8) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Pangaea assembling — schematic C-shape beginning</text>`;
    },
    pangaea() {
      return ocean() + `
        <path d="${pangaeaPath()}" fill="#c4a074" stroke="#8a6a45" stroke-width="1.2"/>
        <text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Pangaea and Tethys (east notch) — schematic</text>`;
    },
    jurassic() {
      return ocean() +
        blob(300, 180, 90, 70, -10) +
        blob(430, 210, 70, 80, 8) +
        blob(520, 300, 120, 80, -20) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Central Atlantic opening; Gondwana still largely joined — schematic</text>`;
    },
    cretaceous() {
      return modernish(0.55) +
        `<rect x="220" y="150" width="18" height="90" fill="#16344f" opacity=".85"/>
         <text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Near-modern outlines, different positions; high seas — schematic</text>`;
    },
    paleocene() {
      return modernish(0.72) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">India still crossing the Indian Ocean — schematic</text>`;
    },
    eocene() {
      return modernish(0.85) +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Almost modern; Himalayan collision beginning — schematic</text>`;
    },
    iceage() {
      return ocean() + modernLand() +
        `<path d="M210 80 L390 70 L420 150 L300 170 L200 140 Z" fill="#d7e6f5" opacity=".88"/>
         <path d="M430 70 L560 90 L540 160 L450 140 Z" fill="#d7e6f5" opacity=".75"/>
         <path d="M480 360 L560 370 L540 410 L470 400 Z" fill="#d7e6f5" opacity=".7"/>
         <text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Last Glacial Maximum ice sheets — schematic; sea level ~120 m lower</text>`;
    },
    modern() {
      return ocean() + modernLand() +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Modern continents — simplified teaching map</text>`;
    },
    "future-near": function () {
      return ocean() + modernLand() +
        `<text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Same map. Change is climate and living systems, not continents.</text>`;
    },
    "future-century": function () {
      return ocean() + modernLand() +
        `<path d="M180 200 Q260 210 250 250 Q200 240 180 200" fill="#1a4a6e" opacity=".55"/>
         <text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Coasts under higher seas — illustrative, not a forecast shoreline</text>`;
    },
    "future-far": function () {
      return ocean() + modernLand() +
        `<path d="M180 200 Q270 215 255 260 Q190 245 180 200" fill="#1a4a6e" opacity=".7"/>
         <path d="M560 240 Q620 250 610 290 Q560 270 560 240" fill="#1a4a6e" opacity=".55"/>
         <text x="400" y="430" text-anchor="middle" fill="#9aa3b2" font-size="12">Possible long-term flooded coasts — speculative sketch</text>`;
    }
  };

  function ocean() {
    return `<rect x="0" y="0" width="800" height="440" fill="#0b1c2c"/>
            <rect x="0" y="0" width="800" height="440" fill="#16344f" opacity=".55"/>`;
  }
  function blob(cx, cy, rx, ry, rot) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#c4a074" stroke="#8a6a45" stroke-width="1"/>`;
  }
  function pangaeaPath() {
    return "M330 80 C380 70 430 90 450 140 C500 150 530 190 520 240 C560 270 540 330 500 360 C470 410 390 420 340 390 C280 400 240 350 250 300 C200 260 220 190 260 160 C270 120 300 90 330 80 Z";
  }
  function modernLand() {
    return `
      <path d="M180 140 C230 120 260 150 250 190 C240 230 200 240 170 220 C150 190 155 155 180 140 Z" fill="#c4a074"/>
      <path d="M250 250 C290 240 300 300 280 350 C250 370 220 330 230 290 C235 270 240 255 250 250 Z" fill="#c4a074"/>
      <path d="M430 120 C500 100 560 130 580 170 C600 200 560 210 530 190 C500 210 470 190 450 170 C430 155 420 135 430 120 Z" fill="#c4a074"/>
      <path d="M500 220 C540 215 555 250 545 280 C520 300 490 270 500 220 Z" fill="#c4a074"/>
      <path d="M560 300 C620 290 650 330 640 370 C600 400 540 360 560 300 Z" fill="#c4a074"/>
      <path d="M300 360 C360 350 390 390 370 410 C330 420 290 390 300 360 Z" fill="#c4a074"/>
      <path d="M200 90 C250 80 280 95 270 115 C240 125 190 110 200 90 Z" fill="#d7e6f5" opacity=".8"/>
      <path d="M560 390 C600 385 610 410 590 420 C560 422 545 400 560 390 Z" fill="#d7e6f5" opacity=".75"/>`;
  }
  function modernish(spread) {
    const dx = (1 - spread) * 40;
    return ocean() + `
      <g transform="translate(${-dx},0)">${modernLand()}</g>`;
  }

  function renderMap(era) {
    const draw = MAPS[era.map] || MAPS.modern;
    mapRoot.innerHTML = `
      <svg viewBox="0 0 800 440" role="img" aria-label="${era.title}">
        ${draw()}
      </svg>`;
    caption.textContent = era.epoch + " · teaching reconstruction, not a surveyed paleomap";
  }

  const TAB_COPY = {
    earth: (e) => ({ heading: "Earth, climate, and the map", text: e.geology + " " + e.climate }),
    life: (e) => ({ heading: "Plants and animals", text: "Plants and other producers: " + e.plants + "\n\nAnimals: " + e.animals }),
    humans: (e) => ({ heading: "Humans and societies", text: e.humans }),
    science: (e) => ({ heading: "What was known — or knowable", text: e.scienceThen })
  };

  function renderCard(era) {
    const pack = TAB_COPY[tab](era);
    titleEl.textContent = pack.heading;
    bodyEl.textContent = pack.text;
    const future = era.category === "future";
    noteEl.className = "note" + (future ? " future-warn" : "");
    noteEl.textContent = (future ? "Projection. " : "Uncertainty. ") + era.uncertainty + "  Working sources: " + era.sources;
  }

  function setIndex(i) {
    index = Math.max(0, Math.min(eras.length - 1, i));
    slider.value = String(index);
    const era = eras[index];
    whenEl.textContent = era.yearLabel;
    nameEl.textContent = era.title;
    badgeEl.textContent = era.epoch;
    renderMap(era);
    renderCard(era);
    placeTicks();
  }

  slider.addEventListener("input", () => setIndex(Number(slider.value)));
  prevBtn.addEventListener("click", () => setIndex(index - 1));
  nextBtn.addEventListener("click", () => setIndex(index + 1));

  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "Pause" : "Play";
    if (playing) {
      playTimer = setInterval(() => {
        if (index >= eras.length - 1) {
          playing = false;
          playBtn.textContent = "Play";
          clearInterval(playTimer);
          return;
        }
        setIndex(index + 1);
      }, 1600);
    } else if (playTimer) {
      clearInterval(playTimer);
    }
  });

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tab = btn.dataset.tab;
      tabs.forEach((b) => b.setAttribute("aria-selected", b === btn ? "true" : "false"));
      renderCard(eras[index]);
    });
  });

  aboutBtn.addEventListener("click", () => aboutDlg.showModal());
  document.getElementById("about-close").addEventListener("click", () => aboutDlg.close());
  window.addEventListener("resize", placeTicks);

  setIndex(index);
})();
