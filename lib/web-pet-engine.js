
export const DEFAULT_PET_BEHAVIOR = {
  speed: 4.5,
  idleDist: 48,
  followDist: 128,
  wallZone: -1,
  hoverAction: "swipe",
  hoverDist: 50,
  idlePauseMs: { min: 1500, max: 2200 },
  actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"],
  idleActions: [
    { name: "idle", baseDuration: 2500, extraDuration: 2000 },
    { name: "swipe", baseDuration: 1200, extraDuration: 800 },
  ],
  movementActions: [
    { name: "walk", speedMultiplier: 1.0 },
    { name: "walk_fast", speedMultiplier: 1.35 },
    { name: "run", speedMultiplier: 1.8 },
  ],
};

export function resolveAction(behavior, action) {
  if (behavior.actions.includes(action)) return action;
  return behavior.actions[0] ?? action;
}

export function defaultIdleAction(behavior) {
  return resolveAction(behavior, behavior.idleActions[0]?.name ?? "idle");
}

export function createPetState(behavior) {
  const idle = defaultIdleAction(behavior);
  return {
    x: null,
    y: null,
    facing: 1,
    mode: "idle",
    action: idle,
    idleAction: idle,
    idleActionUntil: 0,
    idleCooldownUntil: 0,
    movementAction: behavior.movementActions[0]?.name ?? "walk",
    movementSpeedMultiplier: behavior.movementActions[0]?.speedMultiplier ?? 1,
    targetX: null,
    pauseUntil: 0,
  };
}

function clampX(x, boundsWidth) {
  const max = Math.max(16, boundsWidth - 16);
  return Math.min(max, Math.max(16, x));
}

function pickWanderTarget(x, boundsWidth, random) {
  const maxX = Math.max(16, boundsWidth - 16);
  const roomLeft = Math.max(0, x - 16);
  const roomRight = Math.max(0, maxX - x);
  const minDist = boundsWidth * 0.2;
  const maxDist = boundsWidth * 0.55;
  const dist = minDist + random() * Math.max(0, maxDist - minDist);
  const canLeft = roomLeft >= dist;
  const canRight = roomRight >= dist;
  let dir;
  if (canLeft && canRight) dir = random() < 0.5 ? -1 : 1;
  else if (canLeft) dir = -1;
  else if (canRight) dir = 1;
  else dir = roomLeft > roomRight ? -1 : 1;
  return clampX(x + dir * dist, boundsWidth);
}

function pickMovement(behavior, random) {
  const options = behavior.movementActions;
  const choice = options[Math.floor(random() * options.length)];
  return {
    movementAction: choice?.name ?? "walk",
    movementSpeedMultiplier: choice?.speedMultiplier ?? 1,
  };
}

function pickIdle(behavior, ts, random) {
  const options = behavior.idleActions;
  const choice = options[Math.floor(random() * options.length)];
  if (!choice) return null;
  const until = ts + choice.baseDuration + random() * choice.extraDuration;
  return {
    idleAction: choice.name,
    idleActionUntil: until,
    idleCooldownUntil: until + behavior.idlePauseMs.min / 8,
  };
}

function schedulePause(behavior, ts, random) {
  const { min, max } = behavior.idlePauseMs;
  return ts + min + random() * Math.max(0, max - min);
}

function isHovered(state, input, behavior) {
  if (!input.mouse) return false;

  const { boundingBox } = input.sprite;
  if (!boundingBox) {
    // Fallback to simple bounding box check if detailed info not available
    const petHalfWidth = input.sprite.width / 2;
    const petLeft = state.x - petHalfWidth;
    const petRight = state.x + petHalfWidth;
    const petTop = state.y - input.sprite.height;
    const petBottom = state.y;

    return (
      input.mouse.x >= petLeft &&
      input.mouse.x <= petRight &&
      input.mouse.y >= petTop &&
      input.mouse.y <= petBottom
    );
  }

  // Precise bounding box check
  const scale = input.sprite.width / boundingBox.canvasWidth;
  const petLeft = state.x - (input.sprite.width / 2) + (boundingBox.x * scale);
  const petRight = petLeft + (boundingBox.width * scale);
  const petTop = state.y - input.sprite.height + (boundingBox.y * scale);
  const petBottom = petTop + (boundingBox.height * scale);

  return (
    input.mouse.x >= petLeft &&
    input.mouse.x <= petRight &&
    input.mouse.y >= petTop &&
    input.mouse.y <= petBottom
  );
}

export function stepPet(state, input, behavior, random = Math.random) {
  const { ts, boundsWidth, boundsHeight } = input;
  const next = { ...state };

  if (next.x === null) {
    next.x = boundsWidth / 2;
  }
  if (next.y === null) {
    next.y = boundsHeight;
  }

  const isMouseNear = input.mouse && Math.hypot(input.mouse.x - next.x, input.mouse.y - next.y) < behavior.followDist;
  const isWall = input.mouse && input.mouse.y < behavior.wallZone;

  if (input.isHovering) {
    next.mode = "hover";
    next.action = resolveAction(behavior, behavior.hoverAction);
    // When hovering, we pause other actions
    next.targetX = null;
    next.idleActionUntil = ts + 200; // Brief pause after hover
    return next;
  }

  if (isWall) {
    next.mode = "wallclimb";
    next.action = resolveAction(behavior, "wallclimb");
    const targetX = input.mouse.x;
    const diffX = targetX - next.x;
    const distX = Math.abs(diffX);
    if (distX > 0.5) next.facing = diffX < 0 ? -1 : 1;
    const step = behavior.speed * (behavior.movementActions.find(a => a.name === 'walk')?.speedMultiplier ?? 1);
    next.x = clampX(next.x + Math.sign(diffX) * Math.min(step, distX), boundsWidth);
    next.idleAction = defaultIdleAction(behavior);
    next.idleActionUntil = 0;
    next.idleCooldownUntil = 0;
    next.targetX = null;
    return next;
  }

  let targetX;
  if (isMouseNear) {
    targetX = input.mouse.x;
    next.targetX = null;
  } else if (ts < next.pauseUntil) {
    targetX = next.x;
  } else {
    if (next.targetX === null) {
      next.targetX = pickWanderTarget(next.x, boundsWidth, random);
    }
    targetX = next.targetX;
  }

  const diffX = targetX - next.x;
  const distX = Math.abs(diffX);
  if (distX > 0.5) next.facing = diffX < 0 ? -1 : 1;
  const arrived = distX < behavior.idleDist;

  if (arrived) {
    next.mode = "idle";
    if (ts > next.idleCooldownUntil && ts > next.idleActionUntil) {
      Object.assign(next, pickIdle(behavior, ts, random) ?? {});
    }
    next.action = resolveAction(behavior, next.idleAction);
    if (next.targetX !== null) {
      next.targetX = null;
      next.pauseUntil = schedulePause(behavior, ts, random);
    }
    return next;
  }

  next.mode = "walking";
  if (state.mode !== "walking") {
    Object.assign(next, pickMovement(behavior, random));
  }
  const step = behavior.speed * next.movementSpeedMultiplier;
  next.x = clampX(next.x + Math.sign(diffX) * Math.min(step, distX), boundsWidth);
  next.idleAction = defaultIdleAction(behavior);
  next.idleActionUntil = 0;
  next.idleCooldownUntil = 0;
  next.action = resolveAction(behavior, next.movementAction);
  return next;
}