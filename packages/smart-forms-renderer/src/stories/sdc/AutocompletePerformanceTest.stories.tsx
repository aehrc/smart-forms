import type { Meta, StoryObj } from '@storybook/react';
import { qAutocompletePerformanceTest } from '../assets/questionnaires';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';

const meta: Meta<typeof BuildFormWrapperForStorybook> = {
  title: 'SDC/Performance Issues',
  component: BuildFormWrapperForStorybook,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'This story demonstrates the autocomplete performance issue where QuestionnaireResponse updates on every keystroke, causing performance problems. Compare the behavior between autocomplete fields and regular string/text fields.'
      }
    }
  },
  argTypes: {
    questionnaire: {
      control: false,
      description: 'The questionnaire resource containing autocomplete performance test examples'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AutocompletePerformanceIssue: Story = {
  name: 'Autocomplete Performance Issue Demo',
  args: {
    questionnaire: qAutocompletePerformanceTest
  },
  parameters: {
    docs: {
      description: {
        story: '**How to reproduce the bug:**\n\n1. Open browser developer tools (F12)\n2. Go to Console tab\n3. Type in the "Open Choice Autocomplete" field\n4. Observe: Console shows QR updates on every keystroke\n5. Type in the "String Field" below\n6. Observe: Console shows QR updates only after 300ms pause\n\n**Expected behavior:** Autocomplete fields should debounce QR updates like string/text fields do.\n\n**Current behavior:** Autocomplete fields update QR immediately on every keystroke, causing performance issues.'
      }
    }
  }
};
