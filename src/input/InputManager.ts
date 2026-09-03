// Unified Input Manager for Keyboard & Touch Controls

export class InputManager {
  private keys: Record<string, boolean> = {};
  private prevKeys: Record<string, boolean> = {};

  // Standard NES button mappings
  public left = false;
  public right = false;
  public up = false;
  public down = false;
  public jump = false;       // A button (Z / K / Space)
  public run = false;        // B button (X / J / Shift)
  public start = false;      // Start button (Enter)

  // Edge detection
  public jumpPressed = false;
  public runPressed = false;
  public startPressed = false;

  private onFirstInteractionCallback: (() => void) | null = null;
  private hasInteracted = false;

  constructor() {
    this.setupKeyboard();
  }

  public setFirstInteractionCallback(cb: () => void) {
    this.onFirstInteractionCallback = cb;
  }

  private triggerInteraction() {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      if (this.onFirstInteractionCallback) {
        this.onFirstInteractionCallback();
      }
    }
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.triggerInteraction();
      this.keys[e.code] = true;
      // Prevent scrolling for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keys = {};
    });

    // Touch / Click unlock audio
    window.addEventListener('pointerdown', () => {
      this.triggerInteraction();
    });
  }

  // Set virtual button state from touch controls
  public setVirtualKey(code: string, isDown: boolean) {
    this.triggerInteraction();
    this.keys[code] = isDown;
  }

  // Call at the start of each fixed game tick (60 FPS)
  public update() {
    const isDown = (codes: string[]) => codes.some(code => !!this.keys[code]);

    this.left = isDown(['ArrowLeft', 'KeyA']);
    this.right = isDown(['ArrowRight', 'KeyD']);
    this.up = isDown(['ArrowUp', 'KeyW']);
    this.down = isDown(['ArrowDown', 'KeyS']);

    const currentJump = isDown(['KeyZ', 'KeyK', 'Space']);
    const currentRun = isDown(['KeyX', 'KeyJ', 'ShiftLeft', 'ShiftRight']);
    const currentStart = isDown(['Enter']);

    const prevJump = this.prevKeys['jump'] || false;
    const prevRun = this.prevKeys['run'] || false;
    const prevStart = this.prevKeys['start'] || false;

    this.jumpPressed = currentJump && !prevJump;
    this.runPressed = currentRun && !prevRun;
    this.startPressed = currentStart && !prevStart;

    this.jump = currentJump;
    this.run = currentRun;
    this.start = currentStart;

    this.prevKeys['jump'] = currentJump;
    this.prevKeys['run'] = currentRun;
    this.prevKeys['start'] = currentStart;
  }
}
