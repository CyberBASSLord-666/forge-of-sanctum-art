
export class ResourceManager {
  private static instance: ResourceManager;
  private resources = new Set<string>();
  private cleanupCallbacks = new Map<string, () => void>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  constructor() {
    this.startPeriodicCleanup();
    this.setupPageUnloadCleanup();
  }

  registerResource(id: string, cleanupCallback?: () => void) {
    this.resources.add(id);
    if (cleanupCallback) {
      this.cleanupCallbacks.set(id, cleanupCallback);
    }
  }

  unregisterResource(id: string) {
    this.resources.delete(id);
    const callback = this.cleanupCallbacks.get(id);
    if (callback) {
      callback();
      this.cleanupCallbacks.delete(id);
    }
  }

  registerBlobUrl(url: string) {
    this.registerResource(url, () => URL.revokeObjectURL(url));
  }

  registerAnimationFrame(id: number) {
    this.registerResource(`animation-${id}`, () => cancelAnimationFrame(id));
  }

  registerTimeout(id: NodeJS.Timeout) {
    this.registerResource(`timeout-${id}`, () => clearTimeout(id));
  }

  registerInterval(id: NodeJS.Timeout) {
    this.registerResource(`interval-${id}`, () => clearInterval(id));
  }

  registerEventListener(element: EventTarget, event: string, listener: EventListener) {
    const id = `listener-${Math.random()}`;
    this.registerResource(id, () => element.removeEventListener(event, listener));
    return id;
  }

  private startPeriodicCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000); // Clean up every minute
  }

  private setupPageUnloadCleanup() {
    const cleanup = () => this.cleanupAll();
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
  }

  private performCleanup() {
    // Clean up resources that haven't been accessed recently
    const now = Date.now();
    const oldResources = Array.from(this.resources).filter(id => {
      // Simple heuristic: clean up blob URLs older than 10 minutes
      if (id.startsWith('blob:')) {
        return now - parseInt(id.split('-').pop() || '0') > 600000;
      }
      return false;
    });

    oldResources.forEach(id => this.unregisterResource(id));
  }

  cleanupAll() {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    });

    this.resources.clear();
    this.cleanupCallbacks.clear();

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  getResourceCount(): number {
    return this.resources.size;
  }
}

export const resourceManager = ResourceManager.getInstance();
