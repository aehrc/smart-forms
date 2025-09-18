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
import PrePopWrapperForStorybook from '../storybookWrappers/PrePopWrapperForStorybook';
import { qCqfExpressionBasic, qCqfExpressionAdvanced, qCqfExpressionSimple } from '../assets/questionnaires';
import { mockFhirClient } from '../assets/fhirClient/mockFhirClient';
import { patSmartForm } from '../assets/patients/PatSmartForm';
import { pracPrimaryPeter } from '../assets/practitioners/PracPrimaryPeter';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/CQF Expression Extension',
  component: PrePopWrapperForStorybook,
  parameters: {
    docs: {
      description: {
        component: `
This story demonstrates the CQF Expression extension that allows dynamic text content within questionnaires using FHIRPath expressions.

**Extension URL:** \`http://hl7.org/fhir/StructureDefinition/cqf-expression\`

**Usage:**
- Place the extension in the \`_text.extension\` property of questionnaire items
- Use FHIRPath expressions to access patient data, form responses, and system variables
- Supports conditional logic, calculations, and dynamic content generation

**Key Features:**
- **Patient Data Access**: Use \`%patient\` to access patient information
- **Form Data Access**: Use \`%resource\` to access current form responses
- **System Variables**: Use \`now()\` for current timestamp, etc.
- **Conditional Logic**: Use \`iif()\` for conditional expressions
- **String Operations**: Concatenation, substring, and other string functions

**Examples:**
1. **Simple CQF Expression** - Basic functionality testing
2. **Basic CQF Expression** - Patient greeting, age calculation, BMI categories
3. **Advanced CQF Expression** - Complex conditional logic with form data integration

**Note:** This extension requires a FHIR client and patient context to function properly, so it uses the PrePopWrapperForStorybook component.
        `
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof PrePopWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleCqfExpression: Story = {
  args: {
    questionnaire: qCqfExpressionSimple,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  },
  parameters: {
    docs: {
      description: {
        story: `
This is a simple test to verify CQF Expression functionality:

- **Static Text**: Should always appear
- **Simple Expression**: Tests basic FHIRPath expression with current time
- **Patient Name**: Tests patient data access
- **Input Echo**: Tests form input access - type something in the text field above

**Note**: CQF expressions must be placed in the _text.extension property, not the extension property of the questionnaire item.

**Expected behavior**: 
- Static text should always show
- Dynamic text should show "Hello from CQF Expression! Current time: [timestamp]"
- Patient name should show "Patient: [patient's first name]"
- Input echo should show "You entered: [whatever you type]"
        `
      }
    }
  }
};

export const BasicCqfExpression: Story = {
  args: {
    questionnaire: qCqfExpressionBasic,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  },
  parameters: {
    docs: {
      description: {
        story: `
This demonstrates basic CQF Expression functionality with patient data:

- **Patient Greeting**: Personalized welcome message using patient name
- **Age Information**: Calculated age from patient birth date
- **BMI Input**: Enter a BMI value to see dynamic category recommendations
- **BMI Category**: Dynamic text showing weight category and BMI value
- **Gender-based Instructions**: Conditional instructions based on patient gender

**Try this:**
1. Enter a BMI value in the BMI field
2. Notice how the category updates dynamically
3. See how the instructions change based on patient gender
        `
      }
    }
  }
};

export const AdvancedCqfExpression: Story = {
  args: {
    questionnaire: qCqfExpressionAdvanced,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  },
  parameters: {
    docs: {
      description: {
        story: `
This demonstrates advanced CQF Expression functionality with complex conditional logic:

- **Patient Information Form**: Fill out the name, age, and gender fields
- **Dynamic Summary**: Shows patient data from FHIR resources
- **Form Data Summary**: Shows data entered in the form fields
- **Complex Logic**: Nested conditional expressions for personalized content

**Try this:**
1. Fill out the patient information form fields
2. Notice how the summaries update dynamically
3. See how the form data summary shows your entered values
4. Observe the complex conditional logic in action
        `
      }
    }
  }
};