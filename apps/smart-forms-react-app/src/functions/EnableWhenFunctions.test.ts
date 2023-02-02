import { EnableWhenItems } from '../interfaces/Interfaces';
import enableWhenItemsSample from '../data/test-data/enable-when-items-sample.json';
import linkedQuestionsMapSample from '../data/test-data/linked-questions-map.json';
import questionnaireResponseSample from '../data/test-data/questionnaire-response-sample.json';
import initialAnswersSample from '../data/test-data/initial-answers-sample.json';
import {
  createLinkedQuestionsMap,
  readInitialAnswers,
  setInitialAnswers
} from './EnableWhenFunctions';
import { QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r5';

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

describe('verify correctness of initial answers created from linked questions map', () => {
  const linkedQuestionsMap = linkedQuestionsMapSample as Record<string, string[]>;
  const questionnaireResponse = questionnaireResponseSample as QuestionnaireResponse;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const qrForm = questionnaireResponse.item![0];

  const initialAnswers = readInitialAnswers(qrForm, linkedQuestionsMap);

  test('specifying age as key in initial answers should return valueInteger of 87', () => {
    const initialAnswer = initialAnswers['age'];
    expect(initialAnswer[0].valueInteger).toBe(87);
  });

  test('specifying b639a3a8-f476-4cc8-b5c7-f5d2abb23511 as key in initial answers should return valueCoding with code 8517006', () => {
    const initialAnswer = initialAnswers['b639a3a8-f476-4cc8-b5c7-f5d2abb23511'];
    expect(initialAnswer[0].valueCoding?.code).toEqual('8517006');
  });

  test('specifying b639a3a8-f476-4cc8-b5c7-f5d2abb23511 as key in initial answers should return valueCoding with display Former smoker', () => {
    const initialAnswer = initialAnswers['b639a3a8-f476-4cc8-b5c7-f5d2abb23511'];
    expect(initialAnswer[0].valueCoding?.display).toEqual('Former smoker');
  });
});

describe('update enable when items by setting initial answers', () => {
  const enableWhenItems = enableWhenItemsSample as EnableWhenItems;
  const linkedQuestionsMap = linkedQuestionsMapSample as Record<string, string[]>;
  const initialAnswers = initialAnswersSample as Record<string, QuestionnaireResponseItemAnswer[]>;

  test('passing an empty initial answers object should cause updated answers to be equal to enable when items', () => {
    const updatedAnswers = setInitialAnswers({}, enableWhenItems, linkedQuestionsMap);
    expect(updatedAnswers).toEqual(enableWhenItems);
  });

  test('passing an non-empty initial answers object should cause updated answers to be from enable when items', () => {
    const updatedAnswers = setInitialAnswers(initialAnswers, enableWhenItems, linkedQuestionsMap);
    expect(updatedAnswers).not.toEqual(enableWhenItems);
  });

  test('passing an initial answers object with age - valueInteger of 87 should result in a corresponding linked answer in object with linkId b7a9e23c-b875-4536-b72d-81d361c18e2c', () => {
    const initialAnswers: Record<string, QuestionnaireResponseItemAnswer[]> = {
      age: [
        {
          valueInteger: 87
        }
      ]
    };

    const updatedAnswers = setInitialAnswers(initialAnswers, enableWhenItems, linkedQuestionsMap);
    const objectWithLinkedAge = updatedAnswers['b7a9e23c-b875-4536-b72d-81d361c18e2c'];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const answer = objectWithLinkedAge.linked![0].answer!;

    expect(answer[0].valueInteger).toBe(87);
  });
});
