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
import {
  qAttachmentItem,
  qBooleanItem,
  qDateItem,
  qDateTimeItem,
  qDecimalItem,
  qIntegerItem,
  qQuantityItem,
  qReferenceItem,
  QSingleItems,
  qTextItem,
  qTimeItem,
  qUrlItem
} from '../assets/questionnaires';
import BuildFormWrapper from '../BuildFormWrapper'; // More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/SDC/Single Components',
  component: BuildFormWrapper,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Boolean: Story = {
  args: {
    questionnaire: qBooleanItem
  }
};

export const Decimal: Story = {
  args: {
    questionnaire: qDecimalItem
  }
};

export const Integer: Story = {
  args: {
    questionnaire: qIntegerItem
  }
};

export const Date: Story = {
  args: {
    questionnaire: qDateItem
  }
};

export const DateTime: Story = {
  args: {
    questionnaire: qDateTimeItem
  }
};

export const Time: Story = {
  args: {
    questionnaire: qTimeItem
  }
};

export const String: Story = {
  args: {
    questionnaire: QSingleItems
  }
};

export const Text: Story = {
  args: {
    questionnaire: qTextItem
  }
};

export const Url: Story = {
  args: {
    questionnaire: qUrlItem
  }
};

export const Attachment: Story = {
  args: {
    questionnaire: qAttachmentItem
  }
};

export const Reference: Story = {
  args: {
    questionnaire: qReferenceItem
  }
};

export const Quantity: Story = {
  args: {
    questionnaire: qQuantityItem
  }
};
