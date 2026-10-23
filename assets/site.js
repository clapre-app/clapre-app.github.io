// 탭(해시로 전환, 새로 고침 없음), 언어(7개), 문의 메일 작성, 스크롤 나타나기.
(function () {
  var TABS = ["clapre", "ingtype", "support", "privacy"];
  var LANGS = ["en", "ko", "ja", "de", "zh-Hans", "es", "fr"];
  var lang = "en";

  // ?lang=xx > 저장한 선택 > 기기 언어 > 영어
  function pickLang() {
    var q = (location.search.match(/[?&]lang=([\w-]+)/) || [])[1];
    var saved = null;
    try { saved = localStorage.getItem("lang"); } catch (e) {}
    var cands = [q, saved].concat(navigator.languages || [navigator.language]);
    for (var i = 0; i < cands.length; i++) {
      var c = (cands[i] || "").toLowerCase();
      if (!c) continue;
      if (c.indexOf("zh") === 0) return "zh-Hans";
      for (var j = 0; j < LANGS.length; j++) if (c === LANGS[j].toLowerCase() || c.split("-")[0] === LANGS[j]) return LANGS[j];
    }
    return "en";
  }

  function t(key, fallback) { var d = window.I18N && I18N[lang]; return (d && d[key]) || fallback; }

  // 한국어는 한국어 UI 캡처, 그 밖은 영어 UI 캡처(앱 화면이 영어·한국어 두 가지).
  function imgName(n) { return "assets/img/" + n + "-" + (lang === "ko" ? "ko" : "en") + ".webp"; }

  function applyLang(l) {
    lang = l;
    var root = document.documentElement;
    root.lang = l; root.setAttribute("data-lang", l);
    var d = (window.I18N && I18N[l]) || {};
    var en = (window.I18N && I18N.en) || {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n"); var v = d[k] || en[k];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph"); el.placeholder = d[k] || en[k] || el.placeholder;
    });
    document.querySelectorAll("img[data-l10n-img]").forEach(function (el) { el.src = imgName(el.getAttribute("data-l10n-img")); });
    document.querySelectorAll(".theme-pill[data-l10n-img]").forEach(function (el) { el.setAttribute("data-img", imgName(el.getAttribute("data-l10n-img"))); });
    document.querySelectorAll("img[data-l10n-banner]").forEach(function (el) { el.src = "assets/img/featured-banner-" + l + ".webp"; });
    document.querySelectorAll("img[data-poster]").forEach(function (el) { el.src = "assets/img/posters/" + l + "/" + el.getAttribute("data-poster") + ".webp"; });
    var sel = document.querySelector(".lang-select"); if (sel) sel.value = l;
    var cur = TABS.filter(function (x) { var p = document.getElementById("tab-" + x); return p && !p.hidden; })[0];
    if (cur) setTitle(cur);
  }

  function setTitle(tab) {
    document.title = tab === "clapre" ? "Clapre" : ({ ingtype: "ingtype", support: t("t089", "Support"), privacy: t("t198", "Privacy Policy") })[tab] + " — Clapre";
  }

  function show(tab, targetId) {
    if (TABS.indexOf(tab) < 0) tab = "clapre";
    TABS.forEach(function (t) {
      var p = document.getElementById("tab-" + t);
      if (p) p.hidden = t !== tab;
    });
    document.querySelectorAll("[data-tab]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-tab") === tab);
    });
    setTitle(tab);
    reveal(document.getElementById("tab-" + tab));
    var el = targetId && document.getElementById(targetId);
    if (el) el.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }

  function route() {
    var h = location.hash.replace("#", "");
    // 탭 안의 항목(#start, #contact, #price)으로 바로 들어와도 그 탭을 연다.
    var el = h && document.getElementById(h);
    var panel = el && el.closest(".panel");
    if (panel && TABS.indexOf(h) < 0) show(panel.id.replace("tab-", ""), h);
    else show(h || "clapre");
  }

  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;
  function reveal(root) {
    if (!root) return;
    root.querySelectorAll(".reveal:not(.in)").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-tab], [data-goto]");
    if (!a) return;
    e.preventDefault();
    var goto = a.getAttribute("data-goto");
    var tab = a.getAttribute("data-tab");
    if (goto) {
      var el = document.getElementById(goto);
      tab = el ? el.closest(".panel").id.replace("tab-", "") : tab;
    }
    history.pushState(null, "", tab === "clapre" ? location.pathname : "#" + (goto || tab));
    show(tab, goto);
  });
  window.addEventListener("popstate", route);
  window.addEventListener("hashchange", route);

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(pickLang());
    var sel = document.querySelector(".lang-select");
    if (sel) sel.addEventListener("change", function () {
      try { localStorage.setItem("lang", sel.value); } catch (e) {}
      applyLang(sel.value);
    });
    route();
    // 테마 알약: 누르면 아이패드 화면을 그 테마로 바꾼다
    var shot = document.querySelector(".theme-shot img");
    document.querySelectorAll(".theme-pill").forEach(function (b) {
      var pre = new Image(); pre.src = b.getAttribute("data-img");
      b.addEventListener("click", function () {
        document.querySelectorAll(".theme-pill").forEach(function (o) { o.classList.toggle("on", o === b); o.setAttribute("aria-pressed", o === b); });
        if (!shot) return;
        shot.parentNode.classList.toggle("is-picture", b.textContent === "Picture Custom");
        shot.classList.add("fading");
        // 언어를 바꿔도 고른 테마가 유지되게, 화면 이미지의 언어별 이름도 같이 바꾼다.
        var ln = b.getAttribute("data-l10n-img");
        if (ln) shot.setAttribute("data-l10n-img", ln); else shot.removeAttribute("data-l10n-img");
        setTimeout(function () { shot.src = b.getAttribute("data-img"); shot.classList.remove("fading"); }, 180);
      });
    });
    var form = document.getElementById("contact-form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var subject = "[ingtype] " + f.topic.value;
      var body = f.message.value + "\n\n—\nDevices: " + (f.devices.value || "-");
      location.href = "mailto:clapre.app@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  });
})();
