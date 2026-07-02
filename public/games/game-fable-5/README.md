# 🌸 Open World Adventure

A fully playable **2D anime-style open-world RPG** built with **pure HTML, CSS, and vanilla JavaScript** — no libraries, no frameworks, no build step. Just open `index.html` in a browser and play.

![Made with Vanilla JS](https://img.shields.io/badge/vanilla-JS-yellow) ![Canvas](https://img.shields.io/badge/HTML5-Canvas-orange) ![No dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

## ▶ How to Play

1. Clone or download this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox).
3. Adventure!

| Key | Action |
|---|---|
| `W A S D` / Arrow keys | Move |
| `Shift` | Sprint (drains stamina) |
| `E` / `Enter` / `Space` | Interact · advance dialogue · fishing strike |
| `I` | Inventory |
| `Esc` | Pause menu |

## 🗺 The World

One seamless 200×150-tile scrollable map with a camera that follows the player:

- **🏡 Sunhaven Village** — houses, shrine, shop, plaza, and most of the townsfolk
- **🌲 Whispering Forest** — trees, wood to gather, thorn bushes, hidden folk
- **🌊 Crystal Lake** — animated water, a pier, and 3 fishing spots (timing minigame)
- **🏔 Frostpeak Mountain** — rough terrain that slows you and drains stamina, boulders, a miners' chest
- **✨ Secret Grove** — a hidden pocket in the peaks with the legendary treasure (an NPC drops hints...)

## 💗 Characters & Friendship

**20 NPCs** — including **12 unique heroines** (cheerful village girl, elegant merchant, shrine maiden, librarian, flower girl, princess, forest guardian, adventurer, mage, fisher girl, warrior, snow herbalist) — every one drawn **procedurally on canvas** with a unique hairstyle, outfit, accessory, and expression.

- Talk to characters to raise **friendship** (5 heart levels: Stranger → Beloved)
- Higher friendship unlocks **new dialogue tiers** and **special side quests**
- Dialogue UI shows an **anime-style portrait**, name, role, and heart meter

## 📜 Quests (12)

Collect wood, catch fish, deliver packages, gather stone & flowers, find the lost treasure, and unlock friendship quests. Rewards: coins, items, and permanent stamina boosts — all tracked live in the quest HUD.

## ⚙ Features

- 60 FPS canvas rendering with y-sorted sprites, shadows, and walk animation
- Day/night cycle with dynamic lighting (lamps, glowing windows, player light)
- Ambient particles: falling leaves, fireflies at night, water ripples, sparkles, confetti
- Minimap with live NPC/quest markers and viewport indicator
- Shop (buy potions, sell resources), inventory, usable items
- Health / stamina system, environmental hazards, fainting & respawn
- **Auto-save + manual save** via `localStorage`

## 📁 Files

```
index.html   — page & UI layout
style.css    — HUD, dialogue, menus (glassmorphism UI)
script.js    — the entire game engine (~2,200 lines, zero dependencies)
```

---

🤖 Built with [Claude Code](https://claude.com/claude-code)
