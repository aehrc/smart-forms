import { EnableWhenItems } from '../interfaces/Interfaces';
import enableWhenItemsSample from '../data/test-data/enable-when-items-sample.json';
import { createLinkedQuestionsMap } from './EnableWhenFunctions';

describe('verify correctness of linked questions map created from enable when items', () => {
  const enableWhenItems = enableWhenItemsSample as EnableWhenItems;

  const linkedQuestionsMap = createLinkedQuestionsMap(enableWhenItems);

  test('specifying age as key in linked questions map should return three linkIds', () => {
    expect(linkedQuestionsMap['age'].length).toEqual(3);
  });

  test('specifying age as key in linked questions map should return b7a9e23c-b875-4536-b72d-81d361c18e2c as the first value', () => {
    expect(linkedQuestionsMap['age'][0]).toEqual('b7a9e23c-b875-4536-b72d-81d361c18e2c');
  });

  test('specifying age as key in linked questions map should return 650e63e1-3b06-46e6-b2c9-41f67717cacd as the last value', () => {
    expect(linkedQuestionsMap['age'][2]).toEqual('650e63e1-3b06-46e6-b2c9-41f67717cacd');
  });

  test('specifying ee2589d5-e1b0-400d-a2ae-48356e2d011d as key in linked questions map should return f9aaa187-ef4d-4aff-a805-9ad2ebe56fe5 as the only value', () => {
    const joinedLinkIds = linkedQuestionsMap['ee2589d5-e1b0-400d-a2ae-48356e2d011d'].join();
    expect(joinedLinkIds).toEqual('f9aaa187-ef4d-4aff-a805-9ad2ebe56fe5');
  });
});
