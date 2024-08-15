declare global {
  interface Window {
    'ajb-app-cache': Record<string, unknown>;
  }
}

/**
 * The AppCache provides a shared space for all apps to store and retrieve data.
 */
export class AppCache {
  private static _instance: AppCache;
  public static get instance(): AppCache {
    if (!AppCache._instance) {
      AppCache._instance = new AppCache();
    }
    return AppCache._instance;
  }
  private constructor() {
    if (!window['ajb-app-cache']) {
      window['ajb-app-cache'] = {};
    }

    this.set('localListeners', {});
    this.set('remoteListeners', {});
  }

  public get localListeners(): Partial<Record<keyof LocalEvents, Function[]>> {
    return this.get('localListeners') || {};
  }

  public get remoteListeners(): Partial<Record<keyof TabEvents, Function[]>> {
    return this.get('remoteListeners') || {};
  }

  public get parseBehavior(): string | HTMLElement | Document {
    return this.get('parseBehavior') || document;
  }
  public set parseBehavior(value: string | HTMLElement | Document) {
    this.set('parseBehavior', value);
  }

  private set<T>(key: string, value: T): void {
    window['ajb-app-cache'][key] = value;
  }
  private get<T>(key: string): T | undefined {
    return window['ajb-app-cache'][key] as T;
  }
}
