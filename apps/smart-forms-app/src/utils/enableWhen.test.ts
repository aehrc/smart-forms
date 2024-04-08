/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import enableWhenItemsSample from '../data/test-data/enable-when-items-sample.json';
import linkedQuestionsMapSample from '../data/test-data/linked-questions-map.json';
import questionnaireResponseSample from '../data/test-data/questionnaire-response-sample.json';
import initialAnswersSample from '../data/test-data/initial-answers-sample.json';
import type { QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { describe, expect, test } from '@jest/globals';
import type { EnableWhenItems } from '@aehrc/smart-forms-renderer';
import {
  createEnableWhenLinkedQuestions,
  readInitialAnswers,
  setInitialAnswers
} from '@aehrc/smart-forms-renderer';

describe('verify correctness of linked questions map created from enable when items', () => {
  const enableWhenItems = enableWhenItemsSample as unknown as EnableWhenItems;

  const linkedQuestionsMap = createEnableWhenLinkedQuestions(enableWhenItems);
  const linkedQuestionsOfAge = linkedQuestionsMap['e2a16e4d-2765-4b61-b286-82cfc6356b30'];

  test('linked questions of Age question should return 147 linkIds', () => {
    expect(linkedQuestionsOfAge.length).toEqual(147);
  });

  test('specifying age as key in linked questions map should return 2e82032a-dc28-45f2-916e-862303d39fe5 as the first value', () => {
    expect(linkedQuestionsOfAge[0]).toEqual('2e82032a-dc28-45f2-916e-862303d39fe5');
  });

  test('specifying age as key in linked questions map should return 16971bd2-5494-483d-9713-eda182c47f02 as the last value', () => {
    expect(linkedQuestionsOfAge[linkedQuestionsOfAge.length - 1]).toEqual(
      '16971bd2-5494-483d-9713-eda182c47f02'
    );
  });

  test('specifying c72933c7-349f-4fef-94ff-c424c69da6f3 as key in linked questions map should return b7d116f9-0425-4cf1-8cde-fbf4dfaee550 as the only value', () => {
    const joinedLinkIds = linkedQuestionsMap['c72933c7-349f-4fef-94ff-c424c69da6f3'].join();
    expect(joinedLinkIds).toEqual('b7d116f9-0425-4cf1-8cde-fbf4dfaee550');
  });
});

describe('verify correctness of initial answers created from linked questions map', () => {
  const linkedQuestionsMap = linkedQuestionsMapSample as Record<string, string[]>;
  const questionnaireResponse = questionnaireResponseSample as QuestionnaireResponse;

  const initialAnswers = readInitialAnswers(questionnaireResponse, linkedQuestionsMap);
  const ageKey = 'e2a16e4d-2765-4b61-b286-82cfc6356b30';

  test('specifying age as key in initial answers should return valueInteger of 86', () => {
    const initialAnswer = initialAnswers[ageKey];
    expect(initialAnswer[0].valueInteger).toBe(86);
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
  const enableWhenItems = enableWhenItemsSample as unknown as EnableWhenItems;
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
      'e2a16e4d-2765-4b61-b286-82cfc6356b30': [
        {
          valueInteger: 87
        }
      ]
    };

    const updatedAnswers = setInitialAnswers(initialAnswers, enableWhenItems, linkedQuestionsMap);
    const objectWithLinkedAge = updatedAnswers.singleItems['c587e3b6-b91a-40dc-9a16-179342d001e9'];

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const answer = objectWithLinkedAge.linked![0].answer!;

    expect(answer[0].valueInteger).toBe(87);
  });
});
