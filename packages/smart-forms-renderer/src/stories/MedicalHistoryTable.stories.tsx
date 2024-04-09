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

import ThemeProvider from '../theme/Theme';
import type { Meta, StoryObj } from '@storybook/react';
import { GroupTable } from '../components';
import GTableMedicalHistoryItemJson from './assets/QItems-and-QRItems/Q_GTableMedicalHistory.json';
import GTableMedicalHistoryAnswersJson from './assets/QItems-and-QRItems/QR_GTableMedicalHistory.json';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/GroupTable',
  component: GroupTable,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: [],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <QueryClientProvider client={new QueryClient()}>{Story()}</QueryClientProvider>
      </ThemeProvider>
    )
  ]
} satisfies Meta<typeof GroupTable>;

const GTableMedicalHistoryItem = GTableMedicalHistoryItemJson as QuestionnaireItem;
const GTableMedicalHistoryAnswers = GTableMedicalHistoryAnswersJson as QuestionnaireResponseItem[];

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const MedicalHistoryTable: Story = {
  args: {
    qItem: GTableMedicalHistoryItem,
    qrItems: GTableMedicalHistoryAnswers,
    groupCardElevation: 1,
    parentIsReadOnly: false,
    onQrRepeatGroupChange: () => {}
  }
};
