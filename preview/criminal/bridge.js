(function () {
  "use strict";
  const home = document.getElementById("home");
  document.getElementById("homeBtn").addEventListener("click", () => {
    home.hidden = false;
    document.getElementById("criminalEntry").focus({preventScroll:true});
    window.scrollTo(0,0);
  });
  document.getElementById("storyStart").addEventListener("click", () => {
    home.hidden = false;
    const p = document.createElement("p");
    p.className = "cr-preview-note";
    p.setAttribute("role","status");
    p.textContent = "Общий архив доступен в основной кампании; это отдельная бета криминального режима.";
    home.append(p);
  });
})();
