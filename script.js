const game = {
  players: [],
  deck: [],
  discard: [],
  turn: 0,
  round: 1,
  phase: "draw",
  drawnCard: null,
  lastRound: false,
  lastCaller: null
};

// ===== SETUP =====

function createDeck() {
  const deck = [];
  for (let v = 1; v <= 12; v++) {
    for (let i = 0; i < 4; i++) {
      deck.push({ value: v, known: false });
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
  game.players.forEach(p => {
    p.hand[0].known = true;
    p.hand[1].known = true;
  });
}

function startRound() {
  game.deck = createDeck();
  game.discard = [];
  deal();
  game.discard.push(game.deck.pop());
  game.phase = "draw";
  log(`Ronda ${game.round}`);
  updateUI();
}

// ===== TURNO =====

function drawFromDeck() {
  if (game.phase !== "draw") return;
  game.drawnCard = game.deck.pop();
  game.phase = "choose";
  log("Elegí una carta para cambiar");
  updateUI();
}

function drawFromDiscard() {
  if (game.phase !== "draw") return;
  game.drawnCard = game.discard.pop();
  game.phase = "choose";
  log("Elegí una carta para cambiar");
  updateUI();
}

function selectCard(index) {
  if (game.phase !== "choose") return;

  const p = game.players[game.turn];
  const old = p.hand[index];
  const card = game.drawnCard;

  p.hand[index] = card;
  card.known = true;

  if (!old.known) {
    old.known = true;
    log(old.value < card.value ? "💥 Mala jugada" : "🔥 Jugada maestra");
  }

  game.discard.push(old);

  handlePairs(p);

  if (p.hand.length === 0) {
    endRound();
    return;
  }

  game.drawnCard = null;
  game.phase = "end";
  nextTurn();
}

function handlePairs(player) {
  const count = {};
  player.hand.forEach(c => count[c.value] = (count[c.value] || 0) + 1);

  for (let v in count) {
    if (count[v] >= 2) {
      const toRemove = player.hand.filter(c => c.value == v).slice(0,2);
      player.hand = player.hand.filter(c => !toRemove.includes(c));
      log(`♻️ Par de ${v} descartado`);
      break;
    }
  }
}

function nextTurn() {
  game.turn = (game.turn + 1) % 4;

  if (game.lastRound && game.turn === game.lastCaller) {
    endRound();
    return;
  }

  game.phase = "draw";
  updateUI();
}

// ===== ÚLTIMA RONDA =====

function callLastRound() {
  if (game.round < 3 || game.lastRound) return;
  game.lastRound = true;
  game.lastCaller = game.turn;
  log("📣 ÚLTIMA RONDA");
}

// ===== RONDA =====

function endRound() {
  log("🏁 Fin de ronda");

  game.players.forEach((p,i) => {
    let sum = 0;
    let tw = 0;
    p.hand.forEach(c => {
      sum += c.value;
      if (c.value === 12) tw++;
    });
    sum -= Math.min(4, tw);
    p.score += sum;
    p.hand = [];
    log(`Jugador ${i+1} suma ${sum} (total ${p.score})`);
  });

  game.round++;
  game.lastRound = false;
  startRound();
}

// ===== UI =====

function updateUI() {
  document.getElementById("info").innerText =
    `Ronda ${game.round} — Turno Jugador ${game.turn + 1}`;

  game.players.forEach((p,i) => {
    const el = document.getElementById(`p${i}`);
    el.className = "player" + (i === game.turn ? " active" : "");

    el.innerHTML = `
      <div>Jugador ${i+1}</div>
      <div>Puntos: ${p.score}</div>
      <div class="hand">
        ${p.hand.map((c,idx) =>
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
}

// ===== BOTONES =====

document.getElementById("deckBtn").onclick = drawFromDeck;
document.getElementById("discardBtn").onclick = drawFromDiscard;
document.getElementById("lastBtn").onclick = callLastRound;

// ===== START =====

createPlayers();
startRound();

