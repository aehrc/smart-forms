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
import { expect } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  qPreferredTerminologyServer,
  qReadOnly,
  qRepeatsAutocomplete,
  qRepeatsCheckbox,
  qRepeatsGroup,
  qRepeatsGroupNested,
  qRequired
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';
import {
  checkCheckboxOption,
  chooseSelectOption,
  clickAddItem,
  findAllByLinkIdOrLabel,
  getAnswers,
  getGroupAnswers,
  inputText
} from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.4 Rendering > Other',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Required: Story = createStory({
  args: {
    questionnaire: qRequired
  }
}) as Story;

export const RepeatsAutocomplete: Story = createStory({
  args: {
    questionnaire: qRepeatsAutocomplete
  },
  play: async ({ canvasElement, step }) => {
    await step('Select first repeated value', async () => {
      await chooseSelectOption(canvasElement, 'medical-history-repeat', 'Asthma');
    });

    await step('Add repeated item and select second value', async () => {
      await clickAddItem(canvasElement, 'medical-history-repeat');
      const questions = await findAllByLinkIdOrLabel(canvasElement, 'medical-history-repeat');
      await chooseSelectOption(questions[1], 'medical-history-repeat', 'Hypertension');
    });

    const answers = await getAnswers('medical-history-repeat');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'http://snomed.info/sct',
          code: '195967001',
          display: 'Asthma'
        })
      }),
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'http://snomed.info/sct',
          code: '38341003',
          display: 'Hypertension'
        })
      })
    ]);
  }
}) as Story;

export const RepeatsCheckbox: Story = createStory({
  args: {
    questionnaire: qRepeatsCheckbox
  },
  play: async ({ canvasElement }) => {
    await checkCheckboxOption(canvasElement, 'primary-carers-repeat', 'Mother');
    await checkCheckboxOption(canvasElement, 'primary-carers-repeat', 'Father');

    const answers = await getAnswers('primary-carers-repeat');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
          code: 'MTH',
          display: 'Mother'
        })
      }),
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
          code: 'FTH',
          display: 'Father'
        })
      })
    ]);
  }
}) as Story;

export const RepeatsGroup: Story = createStory({
  args: {
    questionnaire: qRepeatsGroup
  },
  play: async ({ canvasElement, step }) => {
    await step('Fill first home address street', async () => {
      await inputText(canvasElement, 'home-address-street', '123 First St');
    });

    await step('Add second group and fill street', async () => {
      await clickAddItem(canvasElement, 'home-address-group');
      const addressGroups = await findAllByLinkIdOrLabel(canvasElement, 'home-address-group');
      await inputText(addressGroups[1], 'home-address-street', '456 Second St');
    });

    const streetAnswers = await getGroupAnswers('home-address-group', 'home-address-street');
    expect(streetAnswers).toEqual([
      expect.objectContaining({ valueString: '123 First St' }),
      expect.objectContaining({ valueString: '456 Second St' })
    ]);
  }
}) as Story;

export const RepeatsGroupNested: Story = createStory({
  args: {
    questionnaire: qRepeatsGroupNested
  },
  play: async ({ canvasElement, step }) => {
    await step('Fill first intervention status and notes g1/g2', async () => {
      const interventions = await findAllByLinkIdOrLabel(
        canvasElement,
        'restrictive-practice-intervention'
      );
      const firstIntervention = interventions[0];

      await chooseSelectOption(
        firstIntervention,
        'restrictive-practice-intervention-status',
        'In Progress'
      );

      await inputText(firstIntervention, 'restrictive-practice-intervention-note-text', 'g1');
      await clickAddItem(firstIntervention, 'restrictive-practice-intervention-note');
      const firstInterventionNotes = await findAllByLinkIdOrLabel(
        firstIntervention,
        'restrictive-practice-intervention-note'
      );
      await inputText(
        firstInterventionNotes[1],
        'restrictive-practice-intervention-note-text',
        'g2'
      );
    });

    await step('Add second intervention globally and fill notes g3/g4', async () => {
      await clickAddItem(canvasElement, 'restrictive-practice-intervention');
      const interventions = await findAllByLinkIdOrLabel(
        canvasElement,
        'restrictive-practice-intervention'
      );
      const secondIntervention = interventions[1];

      await chooseSelectOption(
        secondIntervention,
        'restrictive-practice-intervention-status',
        'On Hold'
      );
      await inputText(secondIntervention, 'restrictive-practice-intervention-note-text', 'g3');
      await clickAddItem(secondIntervention, 'restrictive-practice-intervention-note');
      const secondInterventionNotes = await findAllByLinkIdOrLabel(
        secondIntervention,
        'restrictive-practice-intervention-note'
      );
      await inputText(
        secondInterventionNotes[1],
        'restrictive-practice-intervention-note-text',
        'g4'
      );
    });

    const statusAnswers = await getGroupAnswers(
      'restrictive-practice-intervention',
      'restrictive-practice-intervention-status'
    );
    const noteTextAnswers = await getGroupAnswers(
      'restrictive-practice-intervention-note',
      'restrictive-practice-intervention-note-text'
    );

    expect(statusAnswers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'http://hl7.org/fhir/event-status',
          code: 'in-progress',
          display: 'In Progress'
        })
      }),
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'http://hl7.org/fhir/event-status',
          code: 'on-hold',
          display: 'On Hold'
        })
      })
    ]);
    expect(noteTextAnswers).toEqual([
      expect.objectContaining({ valueString: 'g1' }),
      expect.objectContaining({ valueString: 'g2' }),
      expect.objectContaining({ valueString: 'g3' }),
      expect.objectContaining({ valueString: 'g4' })
    ]);
  }
}) as Story;

export const ReadOnly: Story = createStory({
  args: {
    questionnaire: qReadOnly
  }
}) as Story;

export const PreferredTerminologyServer: Story = createStory({
  args: {
    questionnaire: qPreferredTerminologyServer
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, 'languages', 'English');

    const answers = await getAnswers('languages');
    expect(answers).toEqual([
      expect.objectContaining({
        valueCoding: expect.objectContaining({
          system: 'urn:ietf:bcp:47',
          code: 'en',
          display: 'English'
        })
      })
    ]);
  }
}) as Story;
