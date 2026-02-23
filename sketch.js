let player = { x: 300, y: 300, w: 40, h: 40, vx: 0, vy: 0 }; // player in WORLD coords
let cam = { x: 0, y: 0 }; // camera top-left in WORLD coords

// World size (we draw a world rectangle + features, but we do NOT clamp camera)
const WORLD_W = 5200;
const WORLD_H = 3400;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textSize(14);
  noStroke();
}

function draw() {
  // ---------- 1) UPDATE GAME STATE (WORLD) ----------
  // Input becomes a direction vector (dx, dy)
  const dx =
    (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) -
    (keyIsDown(LEFT_ARROW) || keyIsDown(65));

  const dy =
    (keyIsDown(DOWN_ARROW) || keyIsDown(83)) -
    (keyIsDown(UP_ARROW) || keyIsDown(87));

  // --- Meditative motion tuning ---
  const ACCEL = 0.35; // how quickly velocity changes
  const FRICTION = 0.9; // closer to 1 = floatier, slower to stop
  const MAX_SPEED = 4.2;

  // Cheap diagonal normalization so diagonals aren’t faster
  const len = max(1, abs(dx) + abs(dy));

  // Acceleration in direction of input
  const ax = (dx / len) * ACCEL;
  const ay = (dy / len) * ACCEL;

  // Apply acceleration
  player.vx += ax;
  player.vy += ay;

  // Apply friction
  player.vx *= FRICTION;
  player.vy *= FRICTION;

  // Cap speed
  player.vx = constrain(player.vx, -MAX_SPEED, MAX_SPEED);
  player.vy = constrain(player.vy, -MAX_SPEED, MAX_SPEED);

  // Move
  player.x += player.vx;
  player.y += player.vy;

  // Keep player inside the world
  player.x = constrain(player.x, 0, WORLD_W);
  player.y = constrain(player.y, 0, WORLD_H);

  // ---------- 2) UPDATE VIEW STATE (CAMERA) ----------
  // Center camera on player (NO constrain / bounds here)
  // Desired camera position
  const targetCamX = player.x - width / 2;
  const targetCamY = player.y - height / 2;

  // Ease toward target
  const CAM_EASE = 0.06;

  cam.x = lerp(cam.x, targetCamX, CAM_EASE);
  cam.y = lerp(cam.y, targetCamY, CAM_EASE);

  // ---------- 3) DRAW ----------
  background(220);

  // Draw the WORLD (scrolling layer) in world space
  push();
  translate(-cam.x, -cam.y);

  drawMeditativeBackground();

  // Obstacles (static world features)
  noStroke();
  fill(170, 190, 210);
  for (let i = 0; i < 30; i++) {
    const x = (i * 280) % WORLD_W;
    const y = (i * 180) % WORLD_H;
    rect(x + 40, y + 40, 80, 80, 10);
  }

  // Player (in world space)
  fill(50, 110, 255);
  rect(player.x - 12, player.y - 12, 24, 24, 5);

  pop();

  // HUD (screen space): drawn AFTER pop(), so it does not move with camera
  noStroke();
  fill(20);
  text("Week 5 — Centered camera (no bounds). WASD/Arrows to move.", 12, 20);
  text(
    "Player(world): " +
      (player.x | 0) +
      ", " +
      (player.y | 0) +
      "   Cam(world): " +
      (cam.x | 0) +
      ", " +
      (cam.y | 0),
    12,
    40,
  );
}

function drawMeditativeBackground() {
  // ground illustration
  noStroke();
  for (let y = 0; y < WORLD_H; y += 18) {
    const n = y / WORLD_H;
    fill(14 + 18 * (1 - n), 16 + 18 * (1 - n), 22 + 30 * (1 - n));
    rect(0, y, WORLD_W, 18);
  }

  // sparse stones to create gentle points of reference
  for (let i = 0; i < 140; i++) {
    const x = (i * 137) % WORLD_W; // deterministic placement
    const y = (i * 251) % WORLD_H;
    const r = 10 + (i % 7) * 3;

    fill(180, 190, 210, 35);
    ellipse(x, y, r * 1.8, r);

    fill(220, 230, 255, 16);
    ellipse(x - r * 0.2, y - r * 0.15, r * 0.6, r * 0.35);
  }
}
