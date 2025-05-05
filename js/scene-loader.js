/*
import { initGame } from './game.js';

let currentScene = "start-screen";

export async function loadScene(sceneName) {
  try {
    const res = await fetch(`scenes/${sceneName}.html`);
    if (!res.ok) throw new Error(`Scene ${sceneName} not found`);
    const html = await res.text();
    document.getElementById("app").innerHTML = html;
    currentScene = sceneName;
    console.log(`Loaded scene: ${sceneName}`);

    // ✅ Only re-init if returning to gameplay with an existing grid
    if (sceneName === "game-play-screen" && window.savedGridHTML) {
      initGame();
    }
  } catch (err) {
    console.error(err);
    document.getElementById("app").innerHTML = `<p style="color:red;">Failed to load scene: ${sceneName}</p>`;
  }
}

async function handleKeyPress(e) {
  if (e.key === "Enter") {
    if (currentScene === "start-screen") {
      await loadScene("game-play-screen");
      initGame(); // Fresh start
    } else if (currentScene === "game-over-screen") {
      await loadScene("start-screen");
    }
  }
}

async function init() {
  await loadScene("start-screen");
  document.addEventListener("keydown", handleKeyPress);
}

init();
window.loadScene = loadScene;
