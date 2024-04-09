/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { Meta, StoryObj } from '@storybook/react';
import { SmartFormsRenderer } from '../components';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import Q715Json from './assets/Qs-and-QRs/Q715.json';
import R715Json from './assets/Qs-and-QRs/R715.json';
import QTestGridJson from './assets/Qs-and-QRs/QTestGrid.json';
import RTestGridJson from './assets/Qs-and-QRs/RTestGrid.json';
import QDev715Json from './assets/Qs-and-QRs/QDev715.json';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/SmartFormsRenderer',
  component: SmartFormsRenderer,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof SmartFormsRenderer>;

const Q715 = Q715Json as Questionnaire;
const R715 = R715Json as QuestionnaireResponse;

const QTestGrid = QTestGridJson as Questionnaire;
const RTestGrid = RTestGridJson as QuestionnaireResponse;

const QDev715 = QDev715Json as Questionnaire;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Form715: Story = {
  args: {
    questionnaire: Q715
  }
};

export const Form715WithResponse: Story = {
  args: {
    questionnaire: Q715,
    questionnaireResponse: R715
  }
};

export const FormDev715: Story = {
  args: {
    questionnaire: QDev715
  }
};

export const FormTestGrid: Story = {
  args: {
    questionnaire: QTestGrid
  }
};

export const FormTestGridWithResponse: Story = {
  args: {
    questionnaire: QTestGrid,
    questionnaireResponse: RTestGrid,
    additionalVariables: {}
  }
};

export const QTestGridWithResponseAddFhirPath: Story = {
  args: {
    questionnaire: QTestGrid,
    questionnaireResponse: RTestGrid,
    additionalVariables: {
      addVar1: {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          name: 'addVar1',
          language: 'text/fhirpath',
          expression:
            "%resource.item.where(linkId='grid').item.where(linkId='1').item.where(linkId='1.1').item.where(linkId='1.1.1').answer.value"
        }
      }
    }
  }
};

export const QTestGridWithResponseAddXFhirQuery: Story = {
  args: {
    questionnaire: QTestGrid,
    questionnaireResponse: RTestGrid,
    additionalVariables: {
      addVar1: {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          name: 'addVar1',
          language: 'text/fhirpath',
          expression:
            "%resource.item.where(linkId='grid').item.where(linkId='1').item.where(linkId='1.1').item.where(linkId='1.1.1').answer.value"
        }
      },
      addVar2: {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          name: 'addVar2',
          language: 'application/x-fhir-query',
          expression: 'Condition?patient={{%patient.id}}'
        }
      }
    }
  }
};

export const QTestGridWithResponseReadOnly: Story = {
  args: {
    questionnaire: QTestGrid,
    questionnaireResponse: RTestGrid,
    readOnly: true
  }
};

export const Form715WithResponseReadOnly: Story = {
  args: {
    questionnaire: Q715,
    questionnaireResponse: R715,
    readOnly: true
  }
};
