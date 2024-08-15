export class AppCache {
  private static _instance: AppCache;
  public static get instance(): AppCache {
    if (!AppCache._instance) {
      AppCache._instance = new AppCache();
    }
    return AppCache._instance;
  }
  private constructor() {}

  public parseBehavior: string | HTMLElement | Document = document;
}
