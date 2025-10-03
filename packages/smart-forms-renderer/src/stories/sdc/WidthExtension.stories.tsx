import type { Meta, StoryObj } from '@storybook/react';
import { qWidthExtensionBasic, qWidthExtensionPercentage, qWidthExtensionGrid } from '../assets/questionnaires';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';

const meta: Meta<typeof BuildFormWrapperForStorybook> = {
  title: 'SDC/Width Extension',
  component: BuildFormWrapperForStorybook,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'SDC Width Extension allows controlling the width of table columns using percentage values. This extension is specifically designed for table and grid layouts, not regular form fields. Note: The width extension implementation exists in the codebase but may not be fully functional in all contexts. These examples demonstrate the correct structure and syntax for applying width extensions.'
      }
    }
  },
  argTypes: {
    questionnaire: {
      control: false,
      description: 'The questionnaire resource containing width extension examples'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicExample: Story = {
  name: 'Basic Width Example',
  args: {
    questionnaire: qWidthExtensionBasic
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic example showing different width percentages for form fields. Notice how each field label shows the percentage and how the width extension is applied to control field widths.'
      }
    }
  }
};

export const PercentageExample: Story = {
  name: 'Percentage Width Example',
  args: {
    questionnaire: qWidthExtensionPercentage
  },
  parameters: {
    docs: {
      description: {
        story: 'Table example demonstrating various percentage widths (25%, 50%, 75%, 100%) to show the range of column width control available in table layouts.'
      }
    }
  }
};

export const GridLayoutExample: Story = {
  name: 'Grid Layout Example',
  args: {
    questionnaire: qWidthExtensionGrid
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid layout example showing how width extensions work within a grid structure. This demonstrates the combination of grid itemControl with width extensions for column width control.'
      }
    }
  }
};
