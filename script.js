const game = {
  players: [],
  deck: [],
  discard: [],
  turn: 0,
  round: 1
};

// 🔹 Crear mazo español (1 a 12, 4 palos)
function createDeck() {
  const deck = [];
  for (let value = 1; value <= 12; value++) {
    for (let i = 0; i < 4; i++) {
      deck.push({ value, known: false });
    }
  }
  return shuffle(deck);
}

// 🔹 Mezclar
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 🔹 Inicializar jugadores
function createPlayers() {
  game.players = [];
  for (let i = 0; i < 4; i++) {
    game.players.push({
      hand: [],
      score: 0
    });
  }
}

// 🔹 Repartir 4 cartas
function dealCards() {
  for (let i = 0; i < 4; i++) {
    game.players.forEach(player => {
      player.hand.push(game.deck.pop());
    });
  }

  // cada jugador ve 2 cartas
  game.players.forEach(player => {
    player.hand[0].known = true;
    player.hand[1].known = true;
  });
}

// 🔹 Iniciar ronda
function startRound() {
  game.deck = createDeck();
  createPlayers();
  dealCards();
  game.discard = [game.deck.pop()];
  game.turn = 0;
  updateUI();
}

// 🔹 UI básica
function updateUI() {
  game.players.forEach((player, i) => {
    const el = document.getElementById(`player-${i}`);
    const cards = player.hand.map(c =>
      c.known ? c.value : "🂠"
    ).join(" ");
    el.innerText = `Jugador ${i + 1}\n${cards}`;
  });

  document.getElementById("discard").innerText =
    game.discard.at(-1).value;
  
  document.getElementById("log").innerText =
    `Turno del Jugador ${game.turn + 1}`;
}

// 🔹 Robar del mazo
document.getElementById("drawDeck").onclick = () => {
  const card = game.deck.pop();
  handleDraw(card);
};

// 🔹 Levantar descarte
document.getElementById("drawDiscard").onclick = () => {
  const card = game.discard.pop();
  handleDraw(card);
};

// 🔹 Manejo simple de carta robada
function handleDraw(card) {
  const player = game.players[game.turn];
  player.hand[0] = card; // por ahora reemplaza la primera
  card.known = true;
  game.discard.push(player.hand.pop());
  nextTurn();
}

// 🔹 Siguiente turno
function nextTurn() {
  game.turn = (game.turn + 1) % 4;
  updateUI();
}

// ▶️ Arranque
startRound();
