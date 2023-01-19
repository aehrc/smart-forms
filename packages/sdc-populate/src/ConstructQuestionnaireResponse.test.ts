import { checkIsDate } from './ConstructQuestionnaireResponse';

describe('check if a value is a date', () => {
  test('string value of 2021-01-04 should return true', () => {
    expect(checkIsDate('2021-01-04')).toEqual(true);
  });

  test('string value of 2021/01/04 should return false', () => {
    expect(checkIsDate('2021/01/04')).toEqual(false);
  });

  test('string value of 0 should return false', () => {
    expect(checkIsDate('0')).toEqual(false);
  });
});
