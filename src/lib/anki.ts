import { configuration } from './configuration';

type AnkiRequestOptions = {
  ankiConnectUrl?: string;
};

class Anki {
  public getApiVersion(options?: AnkiRequestOptions): Promise<number> {
    return this.request('version', {}, options);
  }

  public getDecks(options?: AnkiRequestOptions): Promise<string[]> {
    return this.request('deckNames', {}, options);
  }

  public getFields(modelName: string, options?: AnkiRequestOptions): Promise<string[]> {
    return this.request('modelFieldNames', { modelName }, options);
  }

  public getModels(options?: AnkiRequestOptions): Promise<string[]> {
    return this.request('modelNames', {}, options);
  }

  private async request<TResult>(
    action: string,
    params: any,
    options?: AnkiRequestOptions,
  ): Promise<TResult> {
    const ankiUrl = options?.ankiConnectUrl || (await configuration.get('ankiUrl'));

    if (!ankiUrl) {
      throw new Error('Anki URL is not set');
    }

    const usedUrl = new URL(ankiUrl.replace(/127\.0\.0\.1/, 'http://localhost'));
    const response = await fetch(usedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        version: 6,
        params,
      }),
    });

    const responseObject = (await response.json()) as {
      error?: string;
      result?: TResult;
    };

    if (responseObject.error) {
      throw new Error(responseObject.error);
    }

    return responseObject.result;
  }
}

export const anki = new Anki();
