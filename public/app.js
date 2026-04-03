async function fetchConfessions() {
  const res = await fetch("/api/confessions");
  if (!res.ok) throw new Error("Failed to load confessions");
  return res.json();
}

function buildConfessionCard({ text, created_at }) {
  const card = document.createElement("div");
  card.className = "confession-card";
  const body = document.createElement("div");
  body.textContent = text;
  const meta = document.createElement("div");
  meta.className = "confession-meta";
  meta.textContent = new Date(created_at).toLocaleString();
  card.appendChild(body);
  card.appendChild(meta);
  return card;
}

async function renderConfessions() {
  try {
    const confessions = await fetchConfessions();
    const container = document.getElementById("confessions");
    container.innerHTML = "";
    if (confessions.length === 0) {
      container.textContent = "No confessions yet. Be the first!";
      return;
    }
    confessions.forEach((c) => container.appendChild(buildConfessionCard(c)));
  } catch (error) {
    console.error(error);
    document.getElementById("confessions").textContent =
      "Unable to load confessions at the moment.";
  }
}

async function postConfession(text) {
  const res = await fetch("/api/confessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to post confession");
  }
  return res.json();
}

function showAlert(message) {
  const existing = document.querySelector(".alert-box");
  if (existing) existing.remove();

  const container = document.querySelector(".form-section");
  const box = document.createElement("div");
  box.className = "alert-box";
  box.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => box.remove());

  box.appendChild(closeBtn);
  container.insertBefore(box, container.firstChild);
}

async function trySubmitConfession() {
  const textArea = document.getElementById("confessionText");
  const text = textArea.value.trim();

  if (!text) {
    showAlert(
      "You can't post confession right now. Please write something first.",
    );
    return;
  }

  try {
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    await postConfession(text);
    textArea.value = "";
    await renderConfessions();
  } catch (error) {
    showAlert(error.message);
  } finally {
    document.getElementById("submitBtn").disabled = false;
  }
}

document
  .getElementById("submitBtn")
  .addEventListener("click", trySubmitConfession);

document
  .getElementById("confessionText")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      trySubmitConfession();
    }
  });

renderConfessions();
