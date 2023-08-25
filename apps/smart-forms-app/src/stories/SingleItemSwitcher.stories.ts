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

import type { Meta, StoryObj } from '@storybook/react';
import SingleItemSwitcher from '../features/renderer/components/FormPage/QFormComponents/SingleItem/SingleItemSwitcher.tsx';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/SingleItemSwitcher',
  component: SingleItemSwitcher,
  argTypes: {
    onQrItemChange: { action: 'change' }
  },

  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs']
} satisfies Meta<typeof SingleItemSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const TextItemWithAnswer: Story = {
  args: {
    qItem: {
      linkId: '17596726-34cf-4133-9960-7081e1d63558',
      text: 'Name',
      type: 'string',
      repeats: false
    },
    qrItem: {
      linkId: '17596726-34cf-4133-9960-7081e1d63558',
      text: 'Name',
      answer: [
        {
          valueString: 'John'
        }
      ]
    },
    isRepeated: false,
    isTabled: false
  }
};

export const IntegerItemWithAnswer: Story = {
  args: {
    qItem: {
      linkId: '17596726-34cf-4133-9960-7081e1d63558',
      text: 'Age',
      type: 'integer',
      repeats: false
    },
    qrItem: {
      linkId: '17596726-34cf-4133-9960-7081e1d63558',
      text: 'Age',
      answer: [
        {
          valueInteger: 1
        }
      ]
    },
    isRepeated: false,
    isTabled: false
  }
};

export const ChoiceRadioItemWithAnswer: Story = {
  args: {
    qItem: {
      linkId: 'c1cf9c00-15ef-4b98-bab0-20a5f01b4932',
      text: 'Cervical screening status',
      type: 'choice',
      repeats: false,
      answerOption: [
        {
          valueString: 'Up to date'
        },
        {
          valueString: 'Discussed today'
        },
        {
          valueString: 'Not required'
        },
        {
          valueString: 'Declined'
        },
        {
          valueString: 'Next due'
        }
      ]
    },
    qrItem: {
      linkId: '17596726-34cf-4133-9960-7081e1d63558',
      text: 'Name',
      answer: [
        {
          valueString: 'Up to date'
        }
      ]
    },
    isRepeated: false,
    isTabled: false
  }
};
