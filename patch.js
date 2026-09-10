(function () {
  const eras = window.EARTH_ERAS || [];
  const slider = document.getElementById("time-slider");
  if (!slider || !window.I18N) return;
  let lang = "fa";
  const photosEl = document.getElementById("photos");
  const photoHead = document.getElementById("photo-heading");
  function t(k) { return (window.I18N[lang] && window.I18N[lang][k]) || k; }
  function field(era, name) {
    if (lang === "fa" && era[name + "Fa"]) return era[name + "Fa"];
    return era[name] || "";
  }
  function applyChrome() {
    document.documentElement.lang = lang === "fa" ? "fa" : "en";
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i"));
    });
    var fa = document.getElementById("lang-fa");
    var en = document.getElementById("lang-en");
    if (fa) fa.classList.toggle("on", lang === "fa");
    if (en) en.classList.toggle("on", lang === "en");
    document.title = t("title");
  }
  function currentEra() {
    var i = Number(slider.value) || 0;
    return eras[i] || eras[0];
  }
  function paint() {
    var era = currentEra();
    if (!era) return;
    var whenEl = document.getElementById("era-when");
    var nameEl = document.getElementById("era-name");
    var badgeEl = document.getElementById("era-badge");
    var titleEl = document.getElementById("card-title");
    var bodyEl = document.getElementById("card-body");
    var noteEl = document.getElementById("card-note");
    var caption = document.getElementById("map-caption");
    if (whenEl) whenEl.textContent = field(era, "yearLabel");
    if (nameEl) nameEl.textContent = field(era, "title");
    if (badgeEl) badgeEl.textContent = field(era, "epoch");
    if (caption) caption.textContent = field(era, "epoch") + " · " + t("mapNote");
    var selected = document.querySelector('.tabs button[aria-selected="true"]');
    var tab = (selected && selected.dataset.tab) || "earth";
    if (titleEl) {
      titleEl.textContent = ({ earth: t("earthHead"), life: t("lifeHead"), humans: t("humansHead"), science: t("scienceHead") })[tab];
    }
    if (bodyEl) {
      if (tab === "earth") bodyEl.textContent = field(era, "geology") + " " + field(era, "climate");
      else if (tab === "life") bodyEl.textContent = t("plantsLabel") + field(era, "plants") + "\n\n" + t("animalsLabel") + field(era, "animals");
      else if (tab === "humans") bodyEl.textContent = field(era, "humans");
      else bodyEl.textContent = field(era, "scienceThen");
    }
    if (noteEl) {
      var future = era.category === "future";
      noteEl.className = "note" + (future ? " future-warn" : "");
      noteEl.textContent = (future ? t("projection") : t("uncertainty")) + field(era, "uncertainty") + t("sources") + (era.sources || "");
    }
    if (photoHead) photoHead.textContent = t("photos");
    if (photosEl) {
      photosEl.innerHTML = (era.images || []).map(function (img) {
        var cap = lang === "fa" ? (img.capFa || img.cap) : img.cap;
        return "<figure><img src=\"" + img.src + "\" alt=\"" + cap + "\" loading=\"lazy\" referrerpolicy=\"no-referrer\" onerror=\"this.parentNode.style.display='none'\"><figcaption>" + cap + "</figcaption></figure>";
      }).join("");
    }
  }
  ["input", "change"].forEach(function (ev) { slider.addEventListener(ev, function () { setTimeout(paint, 0); }); });
  document.querySelectorAll(".tabs button").forEach(function (btn) { btn.addEventListener("click", function () { setTimeout(paint, 0); }); });
  ["prev", "next", "play"].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener("click", function () { setTimeout(paint, 80); });
  });
  var faBtn = document.getElementById("lang-fa");
  var enBtn = document.getElementById("lang-en");
  if (faBtn) faBtn.addEventListener("click", function () { lang = "fa"; applyChrome(); paint(); });
  if (enBtn) enBtn.addEventListener("click", function () { lang = "en"; applyChrome(); paint(); });
  applyChrome();
  setTimeout(paint, 0);
})();
