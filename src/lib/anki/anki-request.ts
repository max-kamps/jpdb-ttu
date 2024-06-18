import { getConfigurationValue } from '@lib/configuration';
import { AnkiRequestOptions } from './anki.types';

export const ankiRequest = async <TResult>(
  action: string,
  params: any,
  options?: AnkiRequestOptions,
): Promise<TResult> => {
  const ankiUrl = options?.ankiConnectUrl || (await getConfigurationValue('ankiUrl'));

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
};
