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
    this.gifCache = {};
    this.boundingBoxes = {};

    this.init();
    this.loadGifs();
  }

  async loadGifs() {
    const { behavior } = this.config;
    for (const action of behavior.actions) {
      const gifUrl = this.config.gifUrl(action);
      if (!this.gifCache[gifUrl]) {
        const img = document.createElement('img');
        // libgif-js needs the image to be in the DOM to load it.
        // We can hide it so it doesn't affect the layout.
        img.style.position = 'absolute';
        img.style.left = '-9999px';
        img.style.top = '-9999px';
        document.body.appendChild(img);

        this.gifCache[gifUrl] = new Promise(resolve => {
            const superGif = new SuperGif({ gif: img, auto_play: false });
            superGif.load_url(gifUrl, () => {
                const frames = superGif.get_frames();
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

                for (const frame of frames) {
                    const imageData = frame.data;
                    const { width, height, data } = imageData;
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            const alpha = data[(y * width + x) * 4 + 3];
                            if (alpha > 0) {
                                if (x < minX) minX = x;
                                if (y < minY) minY = y;
                                if (x > maxX) maxX = x;
                                if (y > maxY) maxY = y;
                            }
                        }
                    }
                }
                const canvas = superGif.get_canvas();
                if (canvas && canvas.parentNode) {
                    canvas.parentNode.remove();
                }
                const boundingBox = {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY,
                    canvasWidth: superGif.get_canvas().width,
                    canvasHeight: superGif.get_canvas().height,
                };
                this.boundingBoxes[action] = boundingBox;
                resolve(superGif);
            });
        });
      }
    }
  }

  resolveConfig(props) {
    const manifest = PET_MANIFEST[props.animal];
    const overrides = props.behavior ?? {};
    const colors = manifest?.colors ?? [];
    const color =
      props.color && (colors.length === 0 || colors.includes(props.color))
        ? props.color
        : colors[0] ?? null;
    const base = (props.base ?? "./webpet/sprites").replace(/\/*$/, "");
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
    this.wrapper.style.position = this.options.position || "absolute";
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
      if (
        e.clientX >= bounds.left &&
        e.clientX <= bounds.right &&
        e.clientY >= bounds.top &&
        e.clientY <= bounds.bottom
      ) {
        this.mouse = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
      } else {
        this.mouse = null;
      }
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
    // Get the specific scale for the current animation, or default to 1.0
    const animationScale = this.config.behavior.animationScales?.[this.state.action] ?? 1.0;
    const width = 100 * this.config.scale * animationScale;

    const boundingBox = this.boundingBoxes[this.state.action];
    if (boundingBox) {
        const scaledCanvasWidth = boundingBox.canvasWidth * this.config.scale * animationScale;
        const scaledCanvasHeight = boundingBox.canvasHeight * this.config.scale * animationScale;
        const scaledBoundingBoxWidth = boundingBox.width * this.config.scale * animationScale;
        const scaledBoundingBoxHeight = boundingBox.height * this.config.scale * animationScale;
        const scaledBoundingBoxX = boundingBox.x * this.config.scale * animationScale;
        const scaledBoundingBoxY = boundingBox.y * this.config.scale * animationScale;

        this.wrapper.style.width = `${scaledBoundingBoxWidth}px`;
        this.wrapper.style.height = `${scaledBoundingBoxHeight}px`;
        this.wrapper.style.left = `${this.state.x - scaledBoundingBoxWidth / 2}px`;
        
        this.sprite.style.backgroundSize = `${scaledCanvasWidth}px ${scaledCanvasHeight}px`;
        this.sprite.style.backgroundPosition = `-${scaledBoundingBoxX}px -${scaledBoundingBoxY}px`;
    } else {
        this.wrapper.style.width = `${width}px`;
        this.wrapper.style.height = `${width}px`;
        this.wrapper.style.left = `${this.state.x - width / 2}px`;
    }

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
    
    // Responsive scaling
    const baseWidth = 1440; // The width at which the pet is at its max scale
    const responsiveScale = Math.min(1, bounds.width / baseWidth);
    const finalScale = this.config.scale * responsiveScale;
    const size = 100 * finalScale;

    const boundingBox = this.boundingBoxes[this.state.action];

    this.state = stepPet(
      this.state,
      {
        ts,
        boundsWidth: bounds.width,
        boundsHeight: bounds.height,
        mouse: this.mouse,
        sprite: { width: size, height: size, boundingBox },
        isHovering: this.isHovering,
      },
      this.config.behavior
    );

    this.paint();
  }
}

window.WebPet = WebPet;