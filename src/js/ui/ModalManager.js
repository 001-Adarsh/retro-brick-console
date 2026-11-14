/**
 * Retro Brick Game Console - Modal Manager
 * Manages modal visibility, modal stack, focus trapping, ARIA accessibility,
 * and keyboard Escape dismissal.
 */

export class ModalManager {
  /**
   * @param {Object} [options={}] Configuration options
   */
  constructor(options = {}) {
    const hasDoc = typeof document !== 'undefined';
    this.container = options.container || (hasDoc ? document.getElementById('lcd-screen-window') : null);
    this.announcer = options.announcer || (hasDoc ? document.getElementById('aria-live-announcer') : null);

    // Registered modals map: id -> HTMLElement
    this.modals = new Map();

    // Modal navigation stack
    this.modalStack = [];

    // Cached element that had focus before modal was opened
    this.previouslyFocusedElement = null;

    // Event listeners
    this.listeners = {
      open: new Set(),
      close: new Set(),
    };

    this._onKeyDown = this._handleKeyDown.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._onKeyDown);
    }

    this.registerExistingModals();
  }

  /**
   * Auto-registers all modals found in the DOM with class .lcd-modal-overlay.
   */
  registerExistingModals() {
    if (typeof document === 'undefined') return;
    try {
      const elements = document.querySelectorAll('.lcd-modal-overlay');
      elements.forEach((el) => {
        const id = el.id.replace(/^modal-/, '');
        this.register(id, el);
      });
    } catch {
      // Ignore in mock environment
    }
  }

  /**
   * Register a modal element with an ID.
   * @param {string} id 
   * @param {HTMLElement|string} elementOrSelector 
   */
  register(id, elementOrSelector) {
    const el = typeof elementOrSelector === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(elementOrSelector) : null)
      : elementOrSelector;

    if (!el) return;
    this.modals.set(id, el);
  }

  /**
   * Open a registered modal.
   * @param {string} id Modal identifier
   * @param {Object} [data] Optional payload passed to open listeners
   */
  open(id, data = null) {
    const modal = this.modals.get(id);
    if (!modal) {
      console.warn(`[ModalManager] Modal with id "${id}" not found.`);
      return;
    }

    // Save current active element if not already inside a modal
    if (this.modalStack.length === 0 && typeof document !== 'undefined') {
      this.previouslyFocusedElement = document.activeElement;
    }

    // If modal is already active at top of stack, ignore
    if (this.getCurrentModalId() === id) return;

    // Hide current top modal visually if opening another on top
    const currentTop = this.getCurrentModal();
    if (currentTop && typeof currentTop.setAttribute === 'function') {
      currentTop.setAttribute('aria-hidden', 'true');
    }

    if (modal.classList && typeof modal.classList.remove === 'function') {
      modal.classList.remove('hidden');
    }
    if (typeof modal.removeAttribute === 'function') {
      modal.removeAttribute('aria-hidden');
    }
    if (typeof modal.setAttribute === 'function') {
      modal.setAttribute('aria-modal', 'true');
    }

    this.modalStack.push(id);

    // Focus the first focusable element inside the modal or the modal container itself
    this._focusFirstElement(modal);

    // Announce to screen reader
    const title = typeof modal.querySelector === 'function' ? modal.querySelector('.lcd-modal-title') : null;
    const titleText = title && title.textContent ? title.textContent.trim() : id;
    this.announce(`Opened ${titleText}`);

    // Trigger listeners
    this.listeners.open.forEach((fn) => fn(id, data));
  }

  /**
   * Close a specific modal or the top of the stack.
   * @param {string} [id] If omitted, closes the topmost active modal
   */
  close(id) {
    const targetId = id || this.getCurrentModalId();
    if (!targetId) return;

    const modal = this.modals.get(targetId);
    if (!modal) return;

    if (modal.classList && typeof modal.classList.add === 'function') {
      modal.classList.add('hidden');
    }
    if (typeof modal.setAttribute === 'function') {
      modal.setAttribute('aria-hidden', 'true');
    }

    // Remove from stack
    const index = this.modalStack.lastIndexOf(targetId);
    if (index !== -1) {
      this.modalStack.splice(index, 1);
    }

    // If there is still a modal on top of stack, restore its visibility and focus
    const newTop = this.getCurrentModal();
    if (newTop) {
      if (typeof newTop.removeAttribute === 'function') {
        newTop.removeAttribute('aria-hidden');
      }
      this._focusFirstElement(newTop);
    } else {
      // Restore previously focused element
      if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
    }

    // Trigger listeners
    this.listeners.close.forEach((fn) => fn(targetId));
  }

  /**
   * Close all active modals.
   */
  closeAll() {
    while (this.modalStack.length > 0) {
      this.close();
    }
  }

  /**
   * Get ID of currently open modal on top of stack.
   * @returns {string|null}
   */
  getCurrentModalId() {
    return this.modalStack.length > 0 ? this.modalStack[this.modalStack.length - 1] : null;
  }

  /**
   * Get HTMLElement of currently open modal on top of stack.
   * @returns {HTMLElement|null}
   */
  getCurrentModal() {
    const id = this.getCurrentModalId();
    return id ? this.modals.get(id) : null;
  }

  /**
   * Check if any modal is currently open.
   * @param {string} [id] 
   * @returns {boolean}
   */
  isOpen(id) {
    if (id) {
      return this.modalStack.includes(id);
    }
    return this.modalStack.length > 0;
  }

  /**
   * Register event listener.
   * @param {'open'|'close'} event 
   * @param {Function} callback 
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].add(callback);
    }
  }

  /**
   * Remove event listener.
   * @param {'open'|'close'} event 
   * @param {Function} callback 
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
  }

  /**
   * Broadcast an accessible message to screen readers.
   * @param {string} message 
   */
  announce(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  /**
   * Internal keydown handler for Escape dismiss and Focus Trapping.
   * @param {KeyboardEvent} e 
   */
  _handleKeyDown(e) {
    if (!this.isOpen()) return;

    const currentModal = this.getCurrentModal();
    if (!currentModal) return;

    // ESC handling: dismiss the current topmost modal
    if (e.key === 'Escape') {
      const modalId = this.getCurrentModalId();
      // Boot screen cannot be closed with ESC
      if (modalId !== 'boot') {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        this.close(modalId);
      }
      return;
    }

    // Focus Trap: keep Tab navigation within the open modal
    if (e.key === 'Tab' && typeof currentModal.querySelectorAll === 'function') {
      const focusables = currentModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !currentModal.contains(document.activeElement)) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !currentModal.contains(document.activeElement)) {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  /**
   * Focuses the first interactive element inside a modal.
   * @param {HTMLElement} modal 
   */
  _focusFirstElement(modal) {
    if (!modal) return;
    const focusable = typeof modal.querySelector === 'function' ? modal.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) : null;

    if (focusable && typeof focusable.focus === 'function') {
      focusable.focus();
    } else if (typeof modal.setAttribute === 'function' && typeof modal.focus === 'function') {
      modal.setAttribute('tabindex', '-1');
      modal.focus();
    }
  }

  /**
   * Destroy and clean up listeners.
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._onKeyDown);
    }
    this.closeAll();
    this.modals.clear();
    this.listeners.open.clear();
    this.listeners.close.clear();
  }
}
