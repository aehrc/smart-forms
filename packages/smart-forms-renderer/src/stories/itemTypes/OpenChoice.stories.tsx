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

import type { Meta, StoryObj } from '@storybook/react-vite';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  qOpenChoiceAnswerAutoCompleteFromValueSet,

  qOpenChoiceAnswerValueSetBasic,
  qrOpenChoiceAnswerValueSetBasicResponse
} from '../assets/questionnaires';
import { getAnswers, qrFactory, questionnaireFactory } from '../testUtils';
import { chooseRadioOption, getInput } from '@aehrc/testing-toolkit';
import { expect, fireEvent, waitFor, screen } from 'storybook/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/OpenChoice',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const clinicCoding = {
  system: 'http://snomed.info/sct',
  code: '257585005',
  display: 'Clinic'
}
const targetText = 'Pharmacy'
const qOpenChoiceAnswerOptionBasic = questionnaireFactory([{
  linkId: 'health-check-location',
  text: 'Location of health check',
  type: 'open-choice',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://hl7.org/fhir/questionnaire-item-control',
            code: 'radio-button'
          }
        ]
      }
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
      valueString: 'Other, please specify'
    }
  ],
  answerOption: [
    {
      valueCoding: clinicCoding
    }
  ]
}])
const qrOpenChoiceAnswerOptionBasicResponse = qrFactory([{
  linkId: 'health-check-location',
  text: 'Location of health check',
  answer: [
    {
      valueString: targetText
    }
  ]
}])
const targetlinkId = 'health-check-location'

export const OpenChoiceAnswerOptionBasic: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic
  },
  play: async ({ canvasElement }) => {
    await chooseRadioOption(canvasElement, targetlinkId)

    const result = await getAnswers(targetlinkId);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ valueCoding: clinicCoding }));

    // Clear
    const button = canvasElement.querySelector('button#clear');
    fireEvent.click(button as HTMLElement);
    const input = await getInput(canvasElement, targetlinkId);
    await waitFor(() =>
      expect(input[0]).not.toBeChecked()
    );
  }
};

export const OpenChoiceAnswerOptionBasicResponse: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerOptionBasic,
    questionnaireResponse: qrOpenChoiceAnswerOptionBasicResponse
  },
  play: async () => {
    expect(screen.getByText(targetText)).toBeDefined()
  }
};

export const OpenChoiceAnswerValueSetBasic: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerValueSetBasic
  }
};

export const OpenChoiceAnswerValueSetBasicResponse: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerValueSetBasic,
    questionnaireResponse: qrOpenChoiceAnswerValueSetBasicResponse
  }
};

//Story for OpenChoiceAutoCompleteItem in Tabbed environment
export const OpenChoiceAutoCompleteFromValueSetsWithTabs: Story = {
  args: {
    questionnaire: qOpenChoiceAnswerAutoCompleteFromValueSet,
    // questionnaireResponse: qrOpenChoiceAnswerValueSetBasicResponse
  }
};
