(function () {
  const accountKey = "gaisenAccount";
  const discountCode = "GAISEN10";
  const savedAccount = JSON.parse(localStorage.getItem(accountKey) || "null");

  const root = document.createElement("div");
  root.className = "account-promo";
  root.innerHTML = `
    <button class="account-promo-bubble" type="button" aria-label="Open account discount menu">
      <span><strong>10%</strong><small>${savedAccount ? "saved" : "join"}</small></span>
    </button>
    <section class="account-panel" aria-hidden="true">
      <div class="account-backdrop" data-close-account></div>
      <div class="account-sheet" role="dialog" aria-modal="true" aria-labelledby="accountTitle">
        <div class="account-head">
          <p class="account-label">Gaisen account</p>
          <h2 class="account-title" id="accountTitle">Join for 10%</h2>
          <button class="account-close" type="button" data-close-account aria-label="Close account menu">x</button>
        </div>
        <div class="account-body">
          <p class="account-copy">Create your Gaisen account and unlock the private first-order code.</p>
          <div class="account-code"><span>Unlocked code</span><strong>${discountCode}</strong></div>
          <form class="account-form" id="accountForm">
            <label for="accountName">Name</label>
            <input id="accountName" autocomplete="name" required>
            <label for="accountEmail">Email</label>
            <input id="accountEmail" type="email" autocomplete="email" required>
            <label for="accountPassword">Password</label>
            <input id="accountPassword" type="password" autocomplete="new-password" required minlength="6">
            <button class="account-submit" type="submit">${savedAccount ? "Update account" : "Create account"}</button>
            <p class="account-note" id="accountNote"></p>
          </form>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector(".account-panel");
  const bubble = root.querySelector(".account-promo-bubble");
  const form = root.querySelector("#accountForm");
  const note = root.querySelector("#accountNote");
  const nameInput = root.querySelector("#accountName");
  const emailInput = root.querySelector("#accountEmail");

  if (savedAccount) {
    nameInput.value = savedAccount.name || "";
    emailInput.value = savedAccount.email || "";
    note.textContent = `Welcome back${savedAccount.name ? `, ${savedAccount.name}` : ""}. ${discountCode} is ready.`;
  }

  function openAccount() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("account-lock");
    window.setTimeout(() => nameInput.focus(), 50);
  }

  function closeAccount() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("account-lock");
  }

  function addNavButton() {
    const navRight = document.querySelector(".nav-right");
    if (!navRight || navRight.querySelector("[data-open-account]")) return;
    const button = document.createElement("button");
    button.className = "account-nav-link";
    button.type = "button";
    button.dataset.openAccount = "true";
    button.textContent = savedAccount ? "Account" : "Join";
    const cartButton = navRight.querySelector(".cart-link");
    navRight.insertBefore(button, cartButton || navRight.lastElementChild);
  }

  addNavButton();

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-account]") || event.target.closest(".account-promo-bubble")) {
      openAccount();
    }
    if (event.target.closest("[data-close-account]")) {
      closeAccount();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) closeAccount();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const account = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      discount: discountCode,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(accountKey, JSON.stringify(account));
    note.textContent = `Account created. Use ${discountCode} for 10% off.`;
    bubble.querySelector("small").textContent = "saved";
    document.querySelectorAll("[data-open-account]").forEach(button => {
      button.textContent = "Account";
    });
    form.querySelector("#accountPassword").value = "";
  });
})();
