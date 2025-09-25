import type { Meta, StoryObj } from '@storybook/react-vite';
import PrePopWrapperForStorybook from '../storybookWrappers/PrePopWrapperForStorybook';
import { qRepopulatableExtension } from '../assets/questionnaires';
import { mockFhirClient } from '../assets/fhirClient/mockFhirClient';
import { patSmartForm } from '../assets/patients/PatSmartForm';
import { pracPrimaryPeter } from '../assets/practitioners/PracPrimaryPeter';

const meta: Meta<typeof PrePopWrapperForStorybook> = {
  title: 'SDC/Questionnaire Initial Expression Repopulatable Extension',
  component: PrePopWrapperForStorybook
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RepopulatableExtensionDemo: Story = {
  args: {
    questionnaire: qRepopulatableExtension,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};
