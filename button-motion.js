(function () {
  const motionSelector = [
    "button",
    ".link-underline",
    ".hero-cta",
    ".view-all",
    ".pay-option span"
  ].join(",");
  const linkSelector = "a.link-underline, a.hero-cta, a.view-all";
  const holdTime = 680;
  const navigationDelay = 260;

  function startClickMotion(node) {
    if (!node || node.dataset.motionLocked === "true") return;
    node.classList.remove("is-clicking");
    window.requestAnimationFrame(() => {
      node.classList.add("is-clicking");
      window.clearTimeout(Number(node.dataset.motionTimer || 0));
      node.dataset.motionTimer = String(window.setTimeout(() => {
        node.classList.remove("is-clicking");
        delete node.dataset.motionTimer;
      }, holdTime));
    });
  }

  document.addEventListener("pointerdown", event => {
    const target = event.target.closest(motionSelector);
    if (target) startClickMotion(target);
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target.closest(motionSelector);
    if (target) startClickMotion(target);
  }, true);

  document.addEventListener("click", event => {
    const link = event.target.closest(linkSelector);
    if (!link || link.dataset.motionLocked === "true") return;

    const href = link.getAttribute("href");
    const isLocalPage = href && !href.startsWith("#") && !href.startsWith("http") && !href.startsWith("mailto:") && !href.startsWith("tel:");
    if (!isLocalPage || link.target || link.hasAttribute("download")) return;

    event.preventDefault();
    startClickMotion(link);
    link.dataset.motionLocked = "true";
    window.setTimeout(() => {
      window.location.href = href;
    }, navigationDelay);
  }, true);
})();
