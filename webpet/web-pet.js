import { PET_MANIFEST } from "../lib/pet-manifest.js";
import {
  createPetState,
  DEFAULT_PET_BEHAVIOR,
  resolveAction,
  stepPet,
} from "../lib/web-pet-engine.js";

export class WebPet {
  constructor(options) {
    this.options = options;
    this.config = this.resolveConfig(options);
    this.wrapper = document.createElement("div");
    this.sprite = document.createElement("div");
    this.state = createPetState(this.config.behavior);
    this.painted = { src: null, facing: null };
    this.lastTick = 0;
    this.frame = null;
    this.mouse = null;
    this.isHovering = false;
    this.container = options.container || document.body;

    this.init();
  }

  resolveConfig(props) {
    const manifest = PET_MANIFEST[props.animal];
    const overrides = props.behavior ?? {};
    const colors = manifest?.colors ?? [];
    const color =
      props.color && (colors.length === 0 || colors.includes(props.color))
        ? props.color
        : colors[0] ?? null;
    const base = (props.mediaBaseUrl ?? "/webpet/sprites").replace(/\/*$/, "");
    const behavior = {
      ...DEFAULT_PET_BEHAVIOR,
      ...manifest,
      ...overrides,
      actions: overrides.actions ?? manifest?.actions ?? DEFAULT_PET_BEHAVIOR.actions,
      speed: props.speed ?? manifest?.speed ?? DEFAULT_PET_BEHAVIOR.speed,
      followMouse: props.followMouse ?? DEFAULT_PET_BEHAVIOR.followMouse,
    };

    return {
      behavior,
      scale: props.scale ?? 0.5,
      paused: props.paused ?? false,
      message: props.message,
      gifUrl: (action) => {
        const resolved = resolveAction(behavior, action);
        const file = color ? `${color}_${resolved}_8fps.gif` : `${resolved}_8fps.gif`;
        return `${base}/${props.animal}/${file}`;
      },
    };
  }

  init() {
    this.wrapper.style.position = "absolute";
    this.wrapper.style.bottom = "0";
    this.wrapper.style.left = "0";
    this.wrapper.style.width = `${100 * this.config.scale}px`;
    this.wrapper.style.height = `${100 * this.config.scale}px`;
    this.wrapper.style.zIndex = "9999";

    this.sprite.style.width = "100%";
    this.sprite.style.height = "100%";
    this.sprite.style.backgroundImage = `url("${this.config.gifUrl("idle")}")`;
    this.sprite.style.backgroundRepeat = "no-repeat";
    this.sprite.style.backgroundPosition = "bottom center";
    this.sprite.style.backgroundSize = "contain";
    this.sprite.style.imageRendering = "pixelated";

    this.wrapper.appendChild(this.sprite);
    this.container.appendChild(this.wrapper);

    // Add styles for the pet and message bubble.
    const style = document.createElement("style");
    style.textContent = `
      .pet-wrapper {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .pet {
        position: absolute;
        bottom: 0;
        left: 0;
        pointer-events: auto;
        cursor: pointer;
      }
      .pet-message {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 12px;
        background: #2a2a2e;
        border-radius: 8px;
        color: #e3e3e3;
        font-family: sans-serif;
        font-size: 14px;
        white-space: nowrap;
        border: 1px solid #4a4a4e;
      }
      .pet-message::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 8px solid transparent;
        border-top-color: #2a2a2e;
      }
    `;
    document.head.appendChild(style);

    this.wrapper.addEventListener("mouseover", () => {
      this.isHovering = true;
      if (this.config.message) {
        this.showMessage(this.config.message, { duration: 0 });
      }
    });
    this.wrapper.addEventListener("mouseout", () => {
      this.isHovering = false;
      if (this.message) {
        this.wrapper.removeChild(this.message);
        this.message = null;
      }
    });

    this.tick = this.tick.bind(this);
    this.frame = requestAnimationFrame(this.tick);

    this.onMouseMove = (e) => {
      const bounds = this.container.getBoundingClientRect();
      this.mouse = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    };
    window.addEventListener("mousemove", this.onMouseMove);
  }

  showMessage(message, options) {
    if (this.message) {
      this.wrapper.removeChild(this.message);
      this.message = null;
    }

    this.message = document.createElement("div");
    this.message.className = "pet-message";
    this.message.textContent = message;
    this.wrapper.appendChild(this.message);

    const duration = options?.duration ?? 2000;
    if (duration > 0) {
      setTimeout(() => {
        if (this.message) {
          this.wrapper.removeChild(this.message);
          this.message = null;
        }
      }, duration);
    }
  }

  destroy() {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
    }
    window.removeEventListener("mousemove", this.onMouseMove);
    this.wrapper.remove();
  }

  paint() {
    const width = 100 * this.config.scale;
    this.wrapper.style.left = `${this.state.x - width / 2}px`;
    const src = this.config.gifUrl(this.state.action);

    if (this.painted.src !== src) {
      this.painted.src = src;
      this.sprite.style.backgroundImage = `url("${src}")`;
    }

    if (this.painted.facing !== this.state.facing) {
      this.painted.facing = this.state.facing;
      this.sprite.style.transform = `scaleX(${this.state.facing})`;
    }
  }

  tick(ts) {
    this.frame = requestAnimationFrame(this.tick);
    if (ts - this.lastTick < 125) return;
    this.lastTick = ts;

    if (this.config.paused) return;

    const bounds = this.container.getBoundingClientRect();
    const size = 100 * this.config.scale;

    this.state = stepPet(
      this.state,
      {
        ts,
        boundsWidth: bounds.width,
        boundsHeight: bounds.height,
        mouse: this.mouse,
        sprite: { width: size, height: size },
        isHovering: this.isHovering,
      },
      this.config.behavior
    );

    this.paint();
  }
}

window.WebPet = WebPet;