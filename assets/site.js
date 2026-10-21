// 언어(기기 언어 기본, 버튼으로 전환·기억)와 스크롤 나타나기.
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  var lang = saved || ((navigator.language || "en").toLowerCase().indexOf("ko") === 0 ? "ko" : "en");
  function apply(l) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    var t = document.querySelector("title[data-ko]");
    if (t) document.title = t.getAttribute("data-" + l);
  }
  apply(lang);
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".lang-toggle");
    if (btn) btn.addEventListener("click", function () {
      lang = lang === "ko" ? "en" : "ko";
      apply(lang);
      try { localStorage.setItem("lang", lang); } catch (e) {}
    });
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  });
})();
