// Mobile & Tablet Touch Controller Handler
import { InputManager } from '../input/InputManager';

export class TouchControls {
  constructor(private input: InputManager) {
    this.setupTouchEvents();
  }

  private setupTouchEvents() {
    const dpadButtons = document.querySelectorAll<HTMLElement>('.dpad-btn');
    const actionButtons = document.querySelectorAll<HTMLElement>('.touch-btn.action-btn');

    const bindButton = (el: HTMLElement, code: string) => {
      const handleDown = (e: Event) => {
        e.preventDefault();
        el.classList.add('active');
        this.input.setVirtualKey(code, true);
      };

      const handleUp = (e: Event) => {
        e.preventDefault();
        el.classList.remove('active');
        this.input.setVirtualKey(code, false);
      };

      el.addEventListener('touchstart', handleDown, { passive: false });
      el.addEventListener('touchend', handleUp, { passive: false });
      el.addEventListener('touchcancel', handleUp, { passive: false });
      el.addEventListener('mousedown', handleDown);
      el.addEventListener('mouseup', handleUp);
      el.addEventListener('mouseleave', handleUp);
    };

    dpadButtons.forEach(btn => {
      const key = btn.getAttribute('data-key');
      if (key) bindButton(btn, key);
    });

    actionButtons.forEach(btn => {
      const key = btn.getAttribute('data-key');
      if (key) bindButton(btn, key);
    });
  }
}
