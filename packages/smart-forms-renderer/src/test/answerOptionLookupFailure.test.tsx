/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import React from 'react';

// react-markdown, react-dnd and react-dnd-html5-backend are ESM-only and cannot be transformed by ts-jest
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: (props: { children?: React.ReactNode }) => <>{props.children}</>
}));
jest.mock('react-dnd', () => ({
  __esModule: true,
  useDrop: () => [{ isOver: false, canDrop: false }, jest.fn()]
}));
jest.mock('react-dnd-html5-backend', () => ({
  __esModule: true,
  NativeTypes: { FILE: '__NATIVE_FILE__' }
}));

import ChoiceSelectAnswerOptionFields from '../components/FormComponents/ChoiceItems/ChoiceSelectAnswerOptionFields';
import OpenChoiceSelectAnswerOptionField from '../components/FormComponents/OpenChoiceItems/OpenChoiceSelectAnswerOptionField';
import type { RenderingExtensions } from '../hooks/useRenderingExtensions';

const qItem: QuestionnaireItem = {
  linkId: 'carer-type',
  text: 'Carer type',
  type: 'choice'
};

// No display - addDisplayToAnswerOptions attempted a $lookup for this coding and it failed
const failedOption: QuestionnaireItemAnswerOption = {
  valueCoding: { system: 'http://snomed.info/sct', code: '133932002' }
};

// Has a display - unaffected by the lookup failure
const resolvedOption: QuestionnaireItemAnswerOption = {
  valueCoding: { system: 'http://snomed.info/sct', code: '72705000', display: 'Mother' }
};

const options = [failedOption, resolvedOption];

const renderingExtensions: RenderingExtensions = {
  displayUnit: '',
  displayPrompt: '',
  displayInstructions: '',
  displayFlyover: '',
  readOnly: false,
  entryFormat: '',
  required: false,
  quantityUnit: null,
  isRepopulatable: false
};

const warningText = 'Some items in this list were not able to be displayed';

describe('answerOption terminology lookup failure', () => {
  test('ChoiceSelectAnswerOptionFields hides the failed option and shows the warning', () => {
    render(
      <ChoiceSelectAnswerOptionFields
        qItem={qItem}
        options={options}
        valueSelect={null}
        feedback=""
        readOnly={false}
        expressionUpdated={false}
        answerOptionsToggleExpressionsMap={new Map()}
        instructionsId={undefined}
        onSelectChange={jest.fn()}
        isTabled={false}
        renderingExtensions={renderingExtensions}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));

    expect(screen.getByText('Mother')).toBeTruthy();
    expect(screen.queryByText('133932002')).toBeNull();
    expect(screen.getByText(warningText)).toBeTruthy();
  });

  test('ChoiceSelectAnswerOptionFields shows no warning when all options resolved', () => {
    render(
      <ChoiceSelectAnswerOptionFields
        qItem={qItem}
        options={[resolvedOption]}
        valueSelect={null}
        feedback=""
        readOnly={false}
        expressionUpdated={false}
        answerOptionsToggleExpressionsMap={new Map()}
        instructionsId={undefined}
        onSelectChange={jest.fn()}
        isTabled={false}
        renderingExtensions={renderingExtensions}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));

    expect(screen.getByText('Mother')).toBeTruthy();
    expect(screen.queryByText(warningText)).toBeNull();
  });

  test('OpenChoiceSelectAnswerOptionField hides the failed option and shows the warning', () => {
    render(
      <OpenChoiceSelectAnswerOptionField
        qItem={qItem}
        options={options}
        valueSelect={null}
        feedback=""
        readOnly={false}
        calcExpUpdated={false}
        instructionsId={undefined}
        onValueChange={jest.fn()}
        isTabled={false}
        renderingExtensions={renderingExtensions}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));

    expect(screen.getByText('Mother')).toBeTruthy();
    expect(screen.queryByText('133932002')).toBeNull();
    expect(screen.getByText(warningText)).toBeTruthy();
  });
});
