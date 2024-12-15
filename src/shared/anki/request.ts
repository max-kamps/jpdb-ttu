import { getConfiguration } from '@shared/configuration/get-configuration';

export type AnkiRequestOptions = {
  ankiConnectUrl?: string;
};

export const request = async <TResult, TParams = Record<string, never>>(
  action: string,
  params: TParams | undefined,
  options?: AnkiRequestOptions,
): Promise<TResult> => {
  const ankiUrl = options?.ankiConnectUrl || (await getConfiguration('ankiUrl'));

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

  const responseObject = (await response.json()) as
    | {
        error: string;
      }
    | {
        result: TResult;
      };

  if ('error' in responseObject) {
    throw new Error(responseObject.error);
  }

  return responseObject.result;
};
