import { configuration } from './configuration';

type JPDBRequestOptions = {
  apiToken?: string;
};

export class JPDB {
  //#region Singleton
  private static _instance: JPDB;
  public static getInstance(): JPDB {
    if (!JPDB._instance) {
      JPDB._instance = new JPDB();
    }

    return JPDB._instance;
  }
  private constructor() {}
  //#endregion

  public async ping(options?: JPDBRequestOptions): Promise<boolean> {
    await this.request('ping', undefined, options);

    return true;
  }

  private async request<TResult extends object>(
    action: string,
    params: any,
    options?: JPDBRequestOptions,
  ): Promise<TResult> {
    const apiToken = options?.apiToken || (await configuration.get('jpdbApiToken'));

    if (!apiToken) {
      throw new Error('API Token is not set');
    }

    const usedUrl = new URL(`https://jpdb.io/api/v1/${action}`);
    const response = await fetch(usedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
      },
      body: params ? JSON.stringify(params) : undefined,
    });

    const responseObject = (await response.json()) as
      | {
          error_message: string;
        }
      | TResult;

    if ('error_message' in responseObject) {
      throw new Error(responseObject.error_message);
    }

    return responseObject;
  }
}
