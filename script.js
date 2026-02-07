// =====================
// ESTADO DEL JUEGO
// =====================
const game = {
  players: [],
  deck: [],
  discard: [],
  turn: 0,
  round: 1,
  phase: "peek",          // peek | draw | choose | discardPair
  drawnCard: null,
  lastRound: false,
  lastCaller: null,
  peekCount: 0,
  selectedCards: []
};

// =====================
// SETUP
// =====================
function createDeck() {
  const deck = [];
  for (let v = 1; v <= 12; v++) {
    for (let i = 0; i < 4; i++) {
      deck.push({
        value: v,
        known: false,
        peeked: false
      });
    }
  }
  return shuffle(deck);
}

const shuffle = arr => arr.sort(() => Math.random() - 0.5);

function createPlayers() {
  game.players = [];
  for (let i = 0; i < 4; i++) {
    game.players.push({
      hand: [],
      score: 0
    });
  }
}

function deal() {
  for (let i = 0; i < 4; i++) {
    game.players.forEach(p => p.hand.push(game.deck.pop()));
  }
}

function startRound() {
  game.deck = createDeck();
  game.discard = [];
  game.turn = 0;
  game.phase = "peek";
  game.peekCount = 0;

  game.players.forEach(p => p.hand = []);
  deal();

  game.discard.push(game.deck.pop());
  updateUI();
}

// =====================
// TURNOS
// =====================
function drawFromDeck() {
  if (game.phase !== "draw") return;
  game.drawnCard = game.deck.pop();
  game.phase = "choose";
  updateUI();
}

function drawFromDiscard() {
  if (game.phase !== "draw") return;
  game.drawnCard = game.discard.pop();
  game.phase = "choose";
  updateUI();
}

function selectCard(index) {
  const p = game.players[game.turn];
  const card = p.hand[index];

  // 👁️ FASE VER CARTAS
  if (game.phase === "peek") {
    if (game.peekCount >= 2 || card.peeked) return;

    card.known = true;
    card.peeked = true;
    game.peekCount++;
    updateUI();
    return;
  }

  // ♻️ DESCARTE MANUAL DE PARES
  if (game.phase === "discardPair") {
    if (game.selectedCards.includes(index)) return;

    game.selectedCards.push(index);
    card.known = true;

    if (game.selectedCards.length === 2) {
      resolveDiscardPair();
    }
    updateUI();
    return;
  }

  // 🔁 CAMBIO NORMAL DE CARTA
  if (game.phase !== "choose") return;

  const old = p.hand[index];
  const newCard = game.drawnCard;

  p.hand[index] = newCard;
  newCard.known = true;

  if (!old.known) {
    old.known = true;
  }

  game.discard.push(old);
  game.drawnCard = null;
  game.phase = "draw";

  nextTurn();
}

// =====================
// CONFIRMAR CARTAS INICIALES
// =====================
function confirmPeek() {
  const p = game.players[game.turn];
  p.hand.forEach(c => c.known = false);

  game.phase = "draw";
  game.peekCount = 0;
  updateUI();
}

// =====================
// DESCARTE MANUAL DE PAR
// =====================
function startDiscardPair() {
  if (game.phase !== "draw") return;
  game.phase = "discardPair";
  game.selectedCards = [];
  updateUI();
}

function resolveDiscardPair() {
  const p = game.players[game.turn];
  const [a, b] = game.selectedCards;

  const A = p.hand[a];
  const B = p.hand[b];

  if (A.value === B.value) {
    p.hand = p.hand.filter((_, i) => i !== a && i !== b);
  } else {
    // ❌ penalización
    p.hand.splice(a, 1);
    p.hand.push(game.deck.pop());
  }

  p.hand.forEach(c => c.known = false);
  game.phase = "draw";
  game.selectedCards = [];
  updateUI();
}

// =====================
// TURNOS / RONDAS
// =====================
function nextTurn() {
  game.turn = (game.turn + 1) % game.players.length;

  if (game.lastRound && game.turn === game.lastCaller) {
    endRound();
    return;
  }

  game.phase = "draw";
  updateUI();
}

function callLastRound() {
  if (game.round < 3 || game.lastRound) return;
  game.lastRound = true;
  game.lastCaller = game.turn;
  updateUI();
}

function endRound() {
  game.players.forEach(p => {
    let sum = 0;
    let twelves = 0;

    p.hand.forEach(c => {
      sum += c.value;
      if (c.value === 12) twelves++;
    });

    sum -= Math.min(4, twelves);
    p.score += sum;
    p.hand = [];
  });

  game.round++;
  game.lastRound = false;
  startRound();
}

// =====================
// UI
// =====================
function updateUI() {
  document.getElementById("info").innerText =
    `Ronda ${game.round} — Turno Jugador ${game.turn + 1}`;

  game.players.forEach((p, i) => {
    const el = document.getElementById(`p${i}`);
    el.className = "player" + (i === game.turn ? " active" : "");

    el.innerHTML = `
      <div>Jugador ${i + 1}</div>
      <div>Puntos: ${p.score}</div>
      <div class="hand">
        ${p.hand.map((c, idx) =>
          `<div class="card ${c.known ? "face" : "back"}"
                onclick="selectCard(${idx})">
            ${c.known ? c.value : ""}
          </div>`
        ).join("")}
      </div>
    `;
  });

  document.getElementById("discard").innerText =
    game.discard.at(-1)?.value ?? "🂠";

  document.getElementById("confirmPeekBtn").style.display =
    game.phase === "peek" && game.peekCount === 2 ? "inline-block" : "none";
}

// =====================
// BOTONES
// =====================
document.getElementById("deckBtn").onclick = drawFromDeck;
document.getElementById("discardBtn").onclick = drawFromDiscard;
document.getElementById("lastBtn").onclick = callLastRound;
document.getElementById("confirmPeekBtn").onclick = confirmPeek;
document.getElementById("pairBtn").onclick = startDiscardPair;

// =====================
// START
// =====================
createPlayers();
startRound();

