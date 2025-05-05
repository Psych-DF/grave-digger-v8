/* IMPORTS */
import { createGrid, gridWidth, gridHeight } from './grid.js';
import { player } from './player.js';
import { mineTile } from './mining.js';
import { getTile } from './grid.js';
import { loadScene } from './scene-loader.js';
/* IMPORTS */

let mineTimeout = null;

export function initGame() {
  const gameContainer = document.getElementById("game");
  const oreDisplay = document.getElementById("ore-count");

  if (window.savedGridHTML) {
    // We're resuming — don't reset stats or clear progress
    gameContainer.innerHTML = window.savedGridHTML;
  } else {
    // Fresh game init
    player.ore = 0;
    gameContainer.innerHTML = "";
    createGrid(gameContainer);
  }

  oreDisplay.textContent = player.ore;
  updatePlayerPosition();
  centerCameraOnPlayer();
  updateStepDisplay();

  // Reattach controls
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

/* PLAYER MOVEMENT CONTROLS */

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
    case "arrowup": case "w": newY--; break;
    case "arrowdown": case "s": newY++; break;
    case "arrowleft": case "a": newX--; break;
    case "arrowright": case "d": newX++; break;
    default: return;
  }

  const nextTile = getTile(newX, newY);
  if (!nextTile || nextTile.dataset.type === "rock") return;

  player.x = newX;
  player.y = newY;
  player.stepsLeft--;
  updateStepDisplay();

  if (player.stepsLeft <= 0) {
    showDayEndScreen();
    return;
  }

  lastMoveTime = now;
  updatePlayerPosition();
  centerCameraOnPlayer();
}

/* PLAYER HOLD BUTTON MOVEMENT CONTROLS */

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

/* DAY END TRANSITION */
function showDayEndScreen() {
  const gameEl = document.getElementById("game");
  if (gameEl) window.savedGridHTML = gameEl.innerHTML;

  player.stepsLeft = player.maxSteps;
  player.x = player.spawnX;
  player.y = player.spawnY;
  updatePlayerPosition();
  centerCameraOnPlayer();

  loadScene("day-end-screen");
}
