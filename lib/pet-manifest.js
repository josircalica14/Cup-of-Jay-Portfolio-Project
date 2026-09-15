export const PET_MANIFEST = {
  dog: {
    speed: 5,
    colors: ["brown", "black", "white", "akita"],
    actions: ["walk", "run", "idle", "lie", "swipe", "walk_fast", "with_ball"],
    hoverAction: "swipe",
    idleActions: [
      { name: "idle", baseDuration: 2500, extraDuration: 2000 },
      { name: "lie", baseDuration: 2500, extraDuration: 2000 },
      { name: "swipe", baseDuration: 2500, extraDuration: 2000 },
    ],
    movementActions: [
      { name: "walk", speedMultiplier: 1.0 },
      { name: "walk_fast", speedMultiplier: 1.35 },
      { name: "run", speedMultiplier: 1.8 },
    ],
  },
  cat: {
    speed: 4,
    colors: ["black", "white", "orange"],
    actions: ["walk", "run", "idle"],
  },
  totoro: {
    speed: 3.5,
    colors: ["gray"],
    actions: [
      "fall_from_grab",
      "idle",
      "jump",
      "land",
      "lie",
      "swipe",
      "walk",
      "wallclimb",
      "wallgrab",
      "with_ball",
      "run",
    ],
    idleActions: [
      { name: "idle", baseDuration: 2500, extraDuration: 2000 },
      { name: "lie", baseDuration: 2500, extraDuration: 2000 },
      { name: "wallclimb", baseDuration: 2500, extraDuration: 2000 },
    ],
    movementActions: [
      { name: "walk", speedMultiplier: 1.0 },
    ],
    hoverAction: "with_ball",
  },
};