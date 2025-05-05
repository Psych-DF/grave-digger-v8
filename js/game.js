import { createGrid, getTile } from './grid.js';
import { player } from './player.js';
import { mineTile } from './mining.js';

let mineTimeout = null;

export function initGame() {
  const gameContainer = document.getElementById("game");
  const oreDisplay = document.getElementById("ore-count");

  gameContainer.innerHTML = "";
  createGrid(gameContainer);

  oreDisplay.textContent = player.ore;
  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function updatePlayerPosition() {
  document.querySelectorAll(".player").forEach((el) => el.classList.remove("player"));
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) tile.classList.add("player");
}

function centerCameraOnPlayer() {
  const tile = document.querySelector(`.tile[data-x="${player.x}"][data-y="${player.y}"]`);
  if (tile) {
    tile.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  }
}

let moveInterval = null;
let heldDirection = null;
let lastMoveTime = 0;
const moveCooldown = 200;

function movePlayer(key) {
  const now = Date.now();
  if (now - lastMoveTime < moveCooldown) return;
  if (player.stepsLeft <= 0) return;

  let newX = player.x;
  let newY = player.y;

  switch (key) {
    case "arrowup":
    case "w":
      newY--;
      break;
    case "arrowdown":
    case "s":
      newY++;
      break;
    case "arrowleft":
    case "a":
      newX--;
      break;
    case "arrowright":
    case "d":
      newX++;
      break;
    default:
      return;
  }

  const nextTile = getTile(newX, newY);
  if (!nextTile || nextTile.dataset.type === "rock") return;

  player.x = newX;
  player.y = newY;
  player.stepsLeft--;
  updateStepDisplay();
  playMoveSound();

  if (player.stepsLeft <= 0) {
    showDayEndOverlay();
    return;
  }

  lastMoveTime = now;
  updatePlayerPosition();
  centerCameraOnPlayer();
}

function handleKeyDown(e) {
  const key = e.key.toLowerCase();
  if (e.repeat || moveInterval) return;

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    heldDirection = key;
    movePlayer(heldDirection);
    moveInterval = setInterval(() => movePlayer(heldDirection), 250);
  }

  if (key === " ") {
    if (!mineTimeout) {
      mineTimeout = setTimeout(() => {
        mineTile(player.x, player.y);
        mineTimeout = null;
      }, 1000);
    }
  }
}

function handleKeyUp(e) {
  if (e.key.toLowerCase() === heldDirection) {
    clearInterval(moveInterval);
    moveInterval = null;
    heldDirection = null;
  }

  if (e.key === " " && mineTimeout) {
    clearTimeout(mineTimeout);
    mineTimeout = null;
  }
}

export function updateStepDisplay() {
  const el = document.getElementById("step-count");
  if (el) el.textContent = player.stepsLeft;
}

function showDayEndOverlay() {
  const overlay = document.getElementById("day-end-overlay");
  if (overlay) {
    document.getElementById("stat-digs").textContent = player.digs || 0;
    overlay.classList.add("active");
  }
}

window.startNewDay = function () {
  const overlay = document.getElementById("day-end-overlay");
  if (overlay) overlay.classList.remove("active");

  player.stepsLeft = player.maxSteps;
  player.x = player.spawnX;
  player.y = player.spawnY;

  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();
};

// 🎮 Start game on page load
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});

// ⌨️ Reveal start screen on Enter
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const startOverlay = document.getElementById("start-screen-overlay");
    if (startOverlay && startOverlay.classList.contains("active")) {
      startOverlay.classList.remove("active");
      startMusic();
    }
  }
});

/*  SFX */

/* MUSIC */
// 🎵 Background Music
function startMusic() {
  const bgMusic = new Audio("music/theme.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;
  bgMusic.play().catch(() => {
    console.log("User interaction required to start music");
  });
}

function playMoveSound() {
  const moveSound = new Audio("music/move.wav");
  moveSound.volume = 0.3; // optional
  moveSound.play();
}
