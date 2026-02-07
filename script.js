const game = {
  players: [],
  deck: [],
  discard: [],
  turn: 0,
  round: 1,
  lastRound: false,
  lastCaller: null
};

function createDeck() {
  const deck = [];
  for (let v = 1; v <= 12; v++) {
    for (let i = 0; i < 4; i++) {
      deck.push({ value: v, known: false });
    }
  }
  return shuffle(deck);
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function createPlayers() {
  game.players = [];
  for (let i = 0; i < 4; i++) {
    game.players.push({
      hand: [],
      score: 0,
      eliminated: false
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
  game.turn = game.turn % 4;
  deal();
  game.discard.push(game.deck.pop());
  log(`Ronda ${game.round}`);
  updateUI();
}

function drawDeck() {
  const card = game.deck.pop();
  handleCard(card, true);
}

function drawDiscard() {
  const card = game.discard.pop();
  handleCard(card, false);
}

function handleCard(card, fromDeck) {
  const p = game.players[game.turn];

  let index = prompt(
    `Jugador ${game.turn + 1}: ¿qué carta cambiar? (0-${p.hand.length - 1})`
  );

  if (index === null) return;

  index = Number(index);
  const old = p.hand[index];

  // habilidades especiales
  if (fromDeck && [7,8,9].includes(card.value)) {
    if (confirm("¿Usar habilidad especial?")) {
      useAbility(card.value);
      game.discard.push(card);
      nextTurn();
      return;
    }
  }

  p.hand[index] = card;
  card.known = true;

  // riesgo
  if (!old.known) {
    old.known = true;
    if (old.value < card.value) {
      log("💥 Mala jugada");
    } else {
      log("🔥 Jugada maestra");
    }
  }

  game.discard.push(old);

  // descarte de pares
  checkPairs(p);

  if (p.hand.length === 0) {
    endRound();
    return;
  }

  nextTurn();
}

function checkPairs(player) {
  const counts = {};
  player.hand.forEach(c => {
    counts[c.value] = (counts[c.value] || 0) + 1;
  });

  for (let v in counts) {
    if (counts[v] >= 2) {
      if (confirm(`¿Descartar par de ${v}?`)) {
        player.hand = player.hand.filter(c => c.value != v);
        break;
      }
    }
  }
}

function useAbility(v) {
  if (v === 7) {
    const p = game.players[game.turn];
    const i = prompt("Ver carta propia: índice");
    if (p.hand[i]) p.hand[i].known = true;
  }
  if (v === 8) {
    const t = prompt("Jugador a espiar (1-4)") - 1;
    const i = prompt("Carta índice");
    if (game.players[t]?.hand[i])
      game.players[t].hand[i].known = true;
  }
  if (v === 9) {
    const t = prompt("Jugador objetivo (1-4)") - 1;
    const my = prompt("Tu carta índice");
    const his = prompt("Carta rival índice");
    const p = game.players[game.turn];
    [p.hand[my], game.players[t].hand[his]] =
      [game.players[t].hand[his], p.hand[my]];
  }
}

function callLastRound() {
  if (game.round < 3) return alert("Todavía no");
  game.lastRound = true;
  game.lastCaller = game.turn;
  log("📣 ÚLTIMA RONDA");
}

function nextTurn() {
  game.turn = (game.turn + 1) % 4;

  if (game.lastRound && game.turn === game.lastCaller) {
    endRound();
    return;
  }

  updateUI();
}

function endRound() {
  log("🏁 Fin de ronda");
  scoreRound();
  game.round++;
  game.lastRound = false;
  startRound();
}

function scoreRound() {
  game.players.forEach((p, i) => {
    let sum = 0;
    let twelves = 0;
    p.hand.forEach(c => {
      sum += c.value;
      if (c.value === 12) twelves++;
    });
    sum -= Math.min(4, twelves);
    p.score += sum;
    p.hand = [];
    log(`Jugador ${i+1} suma ${sum} (total ${p.score})`);
  });
}

function updateUI() {
  document.getElementById("info").innerText =
    `Ronda ${game.round} — Turno Jugador ${game.turn + 1}`;

  game.players.forEach((p, i) => {
    document.getElementById(`p${i}`).innerText =
      `Jugador ${i+1}\nPuntos: ${p.score}\n` +
      p.hand.map(c => c.known ? c.value : "🂠").join(" ");
  });

  document.getElementById("discard").innerText =
    game.discard.at(-1)?.value ?? "🂠";
}

function log(msg) {
  document.getElementById("log").innerText = msg;
}

// ▶️ START
createPlayers();
startRound();

