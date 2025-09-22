const game = document.getElementById('game');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const nextLevelBtn = document.getElementById('next-level-btn');
const discoverRecipesBtn = document.getElementById('discover-recipes-btn');
const shareBtn = document.getElementById('share-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const restartBtn = document.getElementById('restart-btn');
const pauseBtn = document.getElementById('pause-btn');

const levelDisplay = document.getElementById('level-display');
const totalTimeDisplay = document.getElementById('total-time-display');

// 🔹 nuova modale ricomincia
const restartModal = document.getElementById('restart-modal');
const confirmRestart = document.getElementById('confirm-restart');
const cancelRestart = document.getElementById('cancel-restart');

const translations = {
  it: {
    title: "Light&Free: Memory 🧠",
    subtitle: "Sfida la tua memoria: trova le coppie e condividi il risultato! 🔥🚀",
    restart: "🔄 Ricomincia da capo",
    pause: "⏸️ Pausa",
    nextLevel: "Prossimo livello",
    advanced: "Modalità avanzata",
    share: "Condividi su Instagram",
    close: "Chiudi",
    discover: "Scopri le nostre ricette",
    screenshotMsg: `
      📸 Fai uno screenshot del tuo risultato!<br>
      Poi condividilo su Instagram e tagga <b>@light3free</b> 🚀<br>
      <a href="https://instagram.com/light3free" target="_blank">Vai al profilo Instagram</a>
    `,
    levelComplete: (level, timeElapsed, totalTime) =>
      `🎉 Complimenti, hai completato il livello ${level} in ${timeElapsed}!<br>
       ⏱️ Tempo totale: ${totalTime}.`,
    restartConfirm: "Vuoi ricominciare da capo?",
    yes: "Sì",
    no: "No"
  },
  en: {
    title: "Light&Free: Memory 🧠",
    subtitle: "Challenge your memory: find the pairs and share your score! 🔥🚀",
    restart: "🔄 Restart from beginning",
    pause: "⏸️ Pause",
    nextLevel: "Next level",
    advanced: "Advanced mode",
    share: "Share on Instagram",
    close: "Close",
    discover: "Discover our recipes",
    screenshotMsg: `
      📸 Take a screenshot of your result!<br>
      Then share it on Instagram and tag <b>@light3free</b> 🚀<br>
      <a href="https://instagram.com/light3free" target="_blank">Go to Instagram profile</a>
    `,
    levelComplete: (level, timeElapsed, totalTime) =>
      `🎉 Congratulations, you completed level ${level} in ${timeElapsed}!<br>
       ⏱️ Total time: ${totalTime}.`,
    restartConfirm: "Do you want to restart from the beginning?",
    yes: "Yes",
    no: "No"
  }
};

let currentLang = "it";
function setLanguage(lang) {
  currentLang = lang;
  document.querySelector("h1").textContent = translations[lang].title;
  document.querySelector(".subtitle").textContent = translations[lang].subtitle;
  restartBtn.textContent = translations[lang].restart;
  pauseBtn.textContent = translations[lang].pause;
  nextLevelBtn.textContent = translations[lang].nextLevel;
  shareBtn.textContent = translations[lang].share;
  closeModalBtn.textContent = translations[lang].close;
  discoverRecipesBtn.textContent = translations[lang].discover;

  if (restartModal) {
    restartModal.querySelector("p").textContent = translations[lang].restartConfirm;
    confirmRestart.textContent = translations[lang].yes;
    cancelRestart.textContent = translations[lang].no;
  }
}

document.getElementById("lang-it").addEventListener("click", () => setLanguage("it"));
document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));

const emojis = ['🍎','🍌','🥭','🥥','🍍','🍑','🥝','🍉','🍓','🍒','🍇','🍋','🍐','🍊','🍈','🍏','🍅','🥑','🥕','🌽'];

let currentLevel = 1;
const maxLevel = 7;
let totalTime = 0;
let advancedMode = false;

let cards = [];
let firstCard = null;
let secondCard = null;
let matchedPairs = 0;
let clickable = true;
let startTime, timeElapsed;
let timerInterval;
let paused = false;

let lastLevelMessage = ""; // 🔹 per ricordare il messaggio di completamento livello

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function startTimer() {
  startTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!paused) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      totalTimeDisplay.textContent = `⏱️ ${formatTime(totalTime + elapsed)}`;
    }
  }, 1000);
}

function stopTimer() {
  const now = Date.now();
  timeElapsed = Math.floor((now - startTime) / 1000);
  clearInterval(timerInterval);
}

function updateDisplays() {
  if (advancedMode) {
    levelDisplay.textContent = `Advanced Lv: ${currentLevel}`;
  } else {
    levelDisplay.textContent = `Lv: ${currentLevel}`;
  }
  totalTimeDisplay.textContent = `⏱️ ${formatTime(totalTime)}`;
}

function setupGame() {
  game.innerHTML = '';
  cards = [];
  firstCard = null;
  secondCard = null;
  matchedPairs = 0;
  clickable = true;
  paused = false;

  const pairs = currentLevel + 3;
  let selectedEmojis = emojis.slice(0, pairs);
  const cardEmojis = shuffle([...selectedEmojis, ...selectedEmojis]);

  cardEmojis.forEach((emoji) => {
    const card = document.createElement('div');
    card.classList.add('card', 'covered');
    card.dataset.emoji = emoji;
    card.textContent = '';
    card.addEventListener('click', onCardClick);
    game.appendChild(card);
    cards.push(card);
  });

  updateDisplays();
  startTimer();
  setLanguage(currentLang);
}

function onCardClick(e) {
  if (!clickable || paused) return;
  const card = e.currentTarget;
  if (card === firstCard || card.textContent !== '') return;

  card.textContent = card.dataset.emoji;
  card.classList.remove('covered');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  clickable = false;

  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    matchedPairs++;
    firstCard = null;
    secondCard = null;
    clickable = true;

    if (matchedPairs === currentLevel + 3) {
      onLevelComplete();
    }
  } else {
    setTimeout(() => {
      firstCard.textContent = '';
      secondCard.textContent = '';
      firstCard.classList.add('covered');
      secondCard.classList.add('covered');
      firstCard = null;
      secondCard = null;
      clickable = true;
    }, 1000);
  }
}

function onLevelComplete() {
  stopTimer();
  totalTime += timeElapsed;

  lastLevelMessage = translations[currentLang].levelComplete(
    currentLevel,
    formatTime(timeElapsed),
    formatTime(totalTime)
  );

  modalMessage.innerHTML = lastLevelMessage;

  if (!advancedMode && currentLevel >= maxLevel) {
    nextLevelBtn.textContent = translations[currentLang].advanced;
    nextLevelBtn.disabled = false;
  } else if (advancedMode && currentLevel >= maxLevel) {
    nextLevelBtn.disabled = true;
  } else {
    nextLevelBtn.textContent = translations[currentLang].nextLevel;
    nextLevelBtn.disabled = false;
  }

  modal.classList.remove("hidden");
}

// 🔹 gestione bottoni
nextLevelBtn.addEventListener('click', () => {
  if (!advancedMode && currentLevel >= maxLevel) {
    advancedMode = true;
    currentLevel = 1;
  } else if (currentLevel < maxLevel) {
    currentLevel++;
  }
  modal.classList.add('hidden');
  setTimeout(setupGame, 300);
});

discoverRecipesBtn.addEventListener('click', () => {
  window.open("https://lightfree6.wordpress.com/", "_blank");
});

shareBtn.addEventListener('click', () => {
  modalMessage.innerHTML = translations[currentLang].screenshotMsg;
});

closeModalBtn.addEventListener('click', () => {
  modalMessage.innerHTML = lastLevelMessage;
});

// 🔹 restart
restartBtn.addEventListener('click', () => {
  restartModal.classList.remove('hidden');
});

confirmRestart.addEventListener('click', () => {
  currentLevel = 1;
  totalTime = 0;
  advancedMode = false;
  setupGame();
  restartModal.classList.add('hidden');
  modal.classList.add('hidden');
});

cancelRestart.addEventListener('click', () => {
  restartModal.classList.add('hidden');
});

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused
    ? (currentLang === "it" ? "▶️ Riprendi" : "▶️ Resume")
    : translations[currentLang].pause;

  if (!paused) {
    startTime = Date.now();
    startTimer();
  } else {
    stopTimer();
  }
});

setupGame();
