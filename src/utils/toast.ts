// Simple toast notification utility
// This is a lightweight implementation - can be replaced with a library like react-hot-toast later

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

class ToastManager {
  private container: HTMLDivElement | null = null;
  private stylesAdded = false;

  private ensureStyles() {
    if (this.stylesAdded || typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      #toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    this.stylesAdded = true;
  }

  private getContainer(): HTMLDivElement {
    if (!this.container) {
      this.ensureStyles();
      
      // Check if container already exists
      let existing = document.getElementById('toast-container') as HTMLDivElement;
      if (existing) {
        this.container = existing;
      } else {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  private show(message: string, type: ToastType, options: ToastOptions = {}) {
    if (typeof document === 'undefined') return;

    const { duration = 3000 } = options;
    const container = this.getContainer();

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.style.cssText = `
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 300px;
      max-width: 500px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    `;

    // Set colors based on type
    const colors = {
      success: { bg: '#10B981', text: '#FFFFFF', icon: '✓' },
      error: { bg: '#EF4444', text: '#FFFFFF', icon: '✕' },
      warning: { bg: '#F59E0B', text: '#FFFFFF', icon: '⚠' },
      info: { bg: '#3B82F6', text: '#FFFFFF', icon: 'ℹ' },
    };

    const color = colors[type];
    toast.style.backgroundColor = color.bg;
    toast.style.color = color.text;

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0;
      opacity: 0.7;
      transition: opacity 0.2s;
      margin-left: auto;
    `;
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
    closeBtn.onclick = () => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    };

    // Create content
    const icon = document.createElement('span');
    icon.textContent = color.icon;
    icon.style.cssText = 'font-size: 1.25rem; font-weight: bold;';

    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = 'flex: 1;';

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    // Auto remove after duration
    const timeoutId = setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, duration);

    // Clear timeout if manually closed
    closeBtn.addEventListener('click', () => clearTimeout(timeoutId), { once: true });
  }

  success(message: string, options?: ToastOptions) {
    this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    this.show(message, 'error', options);
  }

  warning(message: string, options?: ToastOptions) {
    this.show(message, 'warning', options);
  }

  info(message: string, options?: ToastOptions) {
    this.show(message, 'info', options);
  }
}

export const toast = new ToastManager();

