import { JPDBRequestOptions, request } from './request';

export const getCardState = async (
  vid: number,
  sid: number,
  options?: JPDBRequestOptions,
): Promise<JPDBCardState[]> => {
  const result = await request<{
    vocabulary_info: [[JPDBCardState]];
  }>(
    'lookup-vocabulary',
    {
      list: [[vid, sid]],
      fields: ['card_state'],
    },
    options,
  );

  return [result.vocabulary_info[0][0] ?? 'notInDeck'];
};
