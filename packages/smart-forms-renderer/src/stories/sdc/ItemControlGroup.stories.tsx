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
  qItemControlDisplayTabContainer,
  qItemControlGroupGridMultiRow,
  qItemControlGroupGridSingleRow,
  qItemControlGroupGTableRepeats,
  qItemControlGroupGTableSingle,
  qItemControlGroupPage,
  qItemControlGroupPageContainer,
  qItemControlGroupPageNonTopLevelPageContainer
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';
import {
  clickAddRow,
  clickNextPage,
  clickNextTab,
  clickPreviousPage,
  clickPreviousTab,
  findByLinkIdOrLabel,
  getNthRow,
  getGroupAnswers,
  inputDate,
  inputDecimal,
  inputInteger
} from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.2 Rendering > Control Appearance - itemControl Group',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const GTableRepeats: Story = createStory({
  args: {
    questionnaire: qItemControlGroupGTableRepeats
  },
  play: async ({ canvasElement }) => {
    const groupContainer = await findByLinkIdOrLabel(canvasElement, 'medical-history');
    const firstRow = await getNthRow(groupContainer, 0);
    await inputDate(firstRow, 'medical-history-onset', '01/04/2026');

    await clickAddRow(canvasElement, 'medical-history');

    const secondRow = await getNthRow(groupContainer, 1);
    await inputDate(secondRow, 'medical-history-onset', '02/04/2026');

    const onsetAnswers = await getGroupAnswers('medical-history', 'medical-history-onset');
    expect(onsetAnswers).toEqual([
      expect.objectContaining({ valueDate: '2026-04-01' }),
      expect.objectContaining({ valueDate: '2026-04-02' })
    ]);
  }
}) as Story;

export const GTableSingle: Story = createStory({
  args: {
    questionnaire: qItemControlGroupGTableSingle
  },
  play: async ({ canvasElement }) => {
    await inputDate(canvasElement, 'medical-history-onset', '15/03/2026');
    await inputDate(canvasElement, 'medical-history-recorded', '20/03/2026');

    const onsetAnswers = await getGroupAnswers('medical-history', 'medical-history-onset');
    const recordedAnswers = await getGroupAnswers('medical-history', 'medical-history-recorded');
    expect(onsetAnswers).toEqual([expect.objectContaining({ valueDate: '2026-03-15' })]);
    expect(recordedAnswers).toEqual([expect.objectContaining({ valueDate: '2026-03-20' })]);
  }
}) as Story;

export const GridSingleRow: Story = createStory({
  args: {
    questionnaire: qItemControlGroupGridSingleRow
  },
  play: async ({ canvasElement }) => {
    await inputInteger(canvasElement, 'blood-pressure-systolic', 118);
    await inputInteger(canvasElement, 'blood-pressure-diastolic', 76);
    await inputDate(canvasElement, 'blood-pressure-date', '10/04/2026');

    const systolicAnswers = await getGroupAnswers(
      'blood-pressure-group',
      'blood-pressure-systolic'
    );
    const diastolicAnswers = await getGroupAnswers(
      'blood-pressure-group',
      'blood-pressure-diastolic'
    );
    const dateAnswers = await getGroupAnswers('blood-pressure-group', 'blood-pressure-date');
    expect(systolicAnswers).toEqual([expect.objectContaining({ valueInteger: 118 })]);
    expect(diastolicAnswers).toEqual([expect.objectContaining({ valueInteger: 76 })]);
    expect(dateAnswers).toEqual([expect.objectContaining({ valueDate: '2026-04-10' })]);
  }
}) as Story;

export const GridMultiRow: Story = createStory({
  args: {
    questionnaire: qItemControlGroupGridMultiRow
  },
  play: async ({ canvasElement }) => {
    await inputDecimal(canvasElement, 'height-value', 180.5);
    await inputDate(canvasElement, 'height-date-performed', '11/04/2026');
    await inputDecimal(canvasElement, 'weight-value', 81.2);

    const heightAnswers = await getGroupAnswers('height-row', 'height-value');
    const heightDateAnswers = await getGroupAnswers('height-row', 'height-date-performed');
    const weightAnswers = await getGroupAnswers('weight-row', 'weight-value');
    expect(heightAnswers).toEqual([expect.objectContaining({ valueDecimal: 180.5 })]);
    expect(heightDateAnswers).toEqual([expect.objectContaining({ valueDate: '2026-04-11' })]);
    expect(weightAnswers).toEqual([expect.objectContaining({ valueDecimal: 81.2 })]);
  }
}) as Story;

export const TabContainer: Story = createStory({
  args: {
    questionnaire: qItemControlDisplayTabContainer
  },
  play: async ({ canvasElement, step }) => {
    await step('Initial tab state is first tab', async () => {
      expect(await findByLinkIdOrLabel(canvasElement, 'health-check-eligible')).toBeTruthy();
    });

    await step('Navigate to next tab', async () => {
      await clickNextTab(canvasElement);
      expect(
        await findByLinkIdOrLabel(canvasElement, 'current-priorities-important-things')
      ).toBeTruthy();
    });

    await step('Navigate back to previous tab', async () => {
      await clickPreviousTab(canvasElement);
      expect(await findByLinkIdOrLabel(canvasElement, 'health-check-eligible')).toBeTruthy();
    });
  }
}) as Story;

export const Page: Story = createStory({
  args: {
    questionnaire: qItemControlGroupPage
  },
  play: async ({ canvasElement, step }) => {
    await step('Initial page state is page 1', async () => {
      expect(await findByLinkIdOrLabel(canvasElement, '1.1')).toBeTruthy();
    });

    await step('Navigate to page 2', async () => {
      await clickNextPage(canvasElement);
      expect(await findByLinkIdOrLabel(canvasElement, '2.1')).toBeTruthy();
    });

    await step('Navigate back to page 1', async () => {
      await clickPreviousPage(canvasElement);
      expect(await findByLinkIdOrLabel(canvasElement, '1.1')).toBeTruthy();
    });
  }
}) as Story;

export const PageContainer: Story = createStory({
  args: {
    questionnaire: qItemControlGroupPageContainer
  },
  play: async ({ canvasElement, step }) => {
    await step('Initial page-container state is first page', async () => {
      expect(await findByLinkIdOrLabel(canvasElement, 'page1')).toBeTruthy();
      expect(await findByLinkIdOrLabel(canvasElement, 'faux-header')).toBeTruthy();
      expect(await findByLinkIdOrLabel(canvasElement, 'faux-footer')).toBeTruthy();
    });

    await step('Navigate to second page in page-container', async () => {
      await clickNextPage(canvasElement);
      expect(await findByLinkIdOrLabel(canvasElement, 'page2')).toBeTruthy();
      expect(await findByLinkIdOrLabel(canvasElement, 'faux-header')).toBeTruthy();
      expect(await findByLinkIdOrLabel(canvasElement, 'faux-footer')).toBeTruthy();
    });

    await step('Navigate to third page in page-container', async () => {
      await clickNextPage(canvasElement);
      expect(await findByLinkIdOrLabel(canvasElement, 'page3')).toBeTruthy();
      expect(await findByLinkIdOrLabel(canvasElement, 'faux-header')).toBeTruthy();
      expect(await findByLinkIdOrLabel(canvasElement, 'faux-footer')).toBeTruthy();
    });

    await step('Navigate back to second page in page-container', async () => {
      await clickPreviousPage(canvasElement);
      expect(await findByLinkIdOrLabel(canvasElement, 'page2')).toBeTruthy();
    });
  }
}) as Story;

export const PageContainerNonSingleTopLevel: Story = createStory({
  args: {
    questionnaire: qItemControlGroupPageNonTopLevelPageContainer
  },
  play: async ({ canvasElement, step }) => {
    await step('Initial non-top-level page-container state', async () => {
      expect(await findByLinkIdOrLabel(canvasElement, 'group-basic1')).toBeTruthy();
    });

    await step('Navigate from group-basic1 to group-basic2', async () => {
      const groupBasic1 = await findByLinkIdOrLabel(canvasElement, 'group-basic1');
      await clickNextPage(groupBasic1);
      expect(await findByLinkIdOrLabel(canvasElement, 'group-basic2')).toBeTruthy();
    });

    await step('Navigate back from group-basic2 to group-basic1', async () => {
      const groupBasic2 = await findByLinkIdOrLabel(canvasElement, 'group-basic2');
      await clickPreviousPage(groupBasic2);
      expect(await findByLinkIdOrLabel(canvasElement, 'group-basic1')).toBeTruthy();
    });
  }
}) as Story;
