(function () {
  const AI_ENDPOINT = "";
  const replies = [
    {
      keys: ["size", "sizing", "fit", "xs", "small", "medium", "large", "xl"],
      text: "Most Gaisen jerseys are oversized. If you want the relaxed house fit, take your normal size. If you want it cleaner and shorter, size down. Cropped jerseys are true to size. Glasses are one size."
    },
    {
      keys: ["ship", "shipping", "delivery", "deliver", "germany", "eu", "country"],
      text: "Delivery is planned for Germany and EU first. At checkout, leave your country and email so the order request can be confirmed with the right delivery option."
    },
    {
      keys: ["pay", "payment", "card", "paypal", "apple", "bank", "checkout"],
      text: "The checkout menu lets you choose Card, PayPal, Apple Pay, or bank transfer. Real automatic charging needs a Stripe or PayPal checkout link connected; right now the button creates an order request so no card data is stored on the website."
    },
    {
      keys: ["return", "refund", "exchange", "wrong"],
      text: "For returns or exchanges, keep the piece unworn with tags. Send the order email and the issue, and support can confirm the next step. A full return policy page can be added before launch."
    },
    {
      keys: ["product", "jersey", "football", "rugby", "tee", "pants", "glasses", "sunglasses"],
      text: "The current shop focus is Jersey Blanc, Football Jersey Noir, rugby polos, cropped jerseys, classic tee, eyewear, track pant, and jogger. Basketball and new football designs are being rebuilt from scratch."
    },
    {
      keys: ["contact", "human", "email", "help", "support"],
      text: "You can ask me quick questions here. For a real person, use the Contact page or send an order request through checkout."
    },
    {
      keys: ["care", "wash", "clean"],
      text: "Wash garments cold, inside out, and avoid tumble drying. For glasses, use a soft cloth and avoid rough surfaces on the lenses."
    },
    {
      keys: ["hello", "hi", "hey", "yo"],
      text: "Hey. I am Gaisen Support. Ask me about sizing, delivery, payment, returns, or products."
    }
  ];

  const fallback = "I can help with sizing, delivery, payment, returns, product questions, and contact. Try asking: 'How does sizing fit?' or 'Can I pay with PayPal?'";

  function buildBot() {
    const root = document.createElement("aside");
    root.className = "support-bot";
    root.innerHTML = `
      <div class="support-panel" role="dialog" aria-label="Gaisen support chat">
        <div class="support-head">
          <p class="support-label">Instant support</p>
          <h2 class="support-title">Gaisen Assistant</h2>
          <button class="support-close" type="button" aria-label="Close support">x</button>
        </div>
        <div class="support-messages" aria-live="polite"></div>
        <div class="support-chips">
          <button class="support-chip" type="button">Sizing</button>
          <button class="support-chip" type="button">Payment</button>
          <button class="support-chip" type="button">Delivery</button>
          <button class="support-chip" type="button">Returns</button>
        </div>
        <form class="support-form">
          <input type="text" name="message" autocomplete="off" placeholder="Ask for help" aria-label="Ask support">
          <button type="submit">Send</button>
        </form>
      </div>
      <button class="support-toggle" type="button" aria-label="Open support chat">
        <span class="support-dot"></span>
        Support
      </button>
    `;
    document.body.appendChild(root);
    return root;
  }

  function addMessage(root, text, type) {
    const messages = root.querySelector(".support-messages");
    const bubble = document.createElement("p");
    bubble.className = `support-message ${type}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function localReply(message) {
    const normalized = message.toLowerCase();
    const found = replies.find(reply => reply.keys.some(key => normalized.includes(key)));
    return found ? found.text : fallback;
  }

  async function answer(root, message) {
    addMessage(root, message, "user");

    if (AI_ENDPOINT) {
      try {
        const response = await fetch(AI_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
        });
        if (response.ok) {
          const data = await response.json();
          addMessage(root, data.reply || fallback, "bot");
          return;
        }
      } catch (error) {
        // Fall back to the local support brain if the real AI endpoint is unavailable.
      }
    }

    window.setTimeout(() => addMessage(root, localReply(message), "bot"), 180);
  }

  function init() {
    const root = buildBot();
    const form = root.querySelector(".support-form");
    const input = form.querySelector("input");

    root.querySelector(".support-toggle").addEventListener("click", () => {
      root.classList.add("is-open");
      if (!root.dataset.started) {
        addMessage(root, "Hey. I am Gaisen Support. Ask me about sizing, payment, delivery, returns, or products.", "bot");
        root.dataset.started = "true";
      }
      input.focus();
    });

    root.querySelector(".support-close").addEventListener("click", () => {
      root.classList.remove("is-open");
    });

    root.querySelectorAll(".support-chip").forEach(chip => {
      chip.addEventListener("click", () => answer(root, chip.textContent));
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      const message = input.value.trim();
      if (!message) return;
      input.value = "";
      answer(root, message);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
