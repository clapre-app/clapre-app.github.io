// 탭(해시로 전환, 새로 고침 없음), 문의 메일 작성, 스크롤 나타나기.
(function () {
  var TABS = ["clapre", "ingtype", "support", "privacy"];

  function show(tab, targetId) {
    if (TABS.indexOf(tab) < 0) tab = "clapre";
    TABS.forEach(function (t) {
      var p = document.getElementById("tab-" + t);
      if (p) p.hidden = t !== tab;
    });
    document.querySelectorAll("[data-tab]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-tab") === tab);
    });
    document.title = tab === "clapre" ? "Clapre" : ({ ingtype: "ingtype", support: "Support", privacy: "Privacy Policy" })[tab] + " — Clapre";
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
    route();
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
