import type { Meta, StoryObj } from '@storybook/react-vite';

import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  calculatedExpressionExtFactory,
  getAnswers,
  getGroupAnswers,
  itemControlExtFactory,
  questionnaireFactory,
  variableExtFactory
} from '../testUtils';
import {
  chooseSelectOption,
  inputInteger,
  inputQuantity,
  inputDecimal,
  inputText
} from '@aehrc/testing-toolkit';
import { expect, waitFor } from 'storybook/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/CalculationScenario',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

const booleanTargetCoding = {
  system: 'http://hl7.org/fhir/administrative-gender',
  code: 'female',
  display: 'Female'
};
const booleanTargetlinkId = 'gender-controller';
const booleanTargetlinkIdCalc = 'gender-is-female';
const qBooleanCalculation = questionnaireFactory(
  [
    {
      linkId: booleanTargetlinkId,
      text: 'Gender',
      type: 'choice',
      repeats: false,
      answerOption: [
        { valueCoding: booleanTargetCoding },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          }
        }
      ]
    },
    {
      extension: [calculatedExpressionExtFactory("%gender = 'female'")],
      linkId: booleanTargetlinkIdCalc,
      text: 'Gender is female?',
      type: 'boolean',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory(
        'gender',
        `item.where(linkId = '${booleanTargetlinkId}').answer.valueCoding.code`
      )
    ]
  }
);

export const BooleanCalculation: Story = {
  args: {
    questionnaire: qBooleanCalculation
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, booleanTargetlinkId, booleanTargetCoding.display);

    await waitFor(async () => {
      const result = await getAnswers(booleanTargetlinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueBoolean).toBe(true);
    });
  }
};

const choiceTargetLinkId = 'pain-level';
const targetChoiceCoding = {
  system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
  code: 'Y',
  display: 'Yes'
};
const choiceTargetLinkIdCalc = 'pain-low';
const qChoiceAnswerOptionCalculation = questionnaireFactory(
  [
    {
      linkId: choiceTargetLinkId,
      type: 'integer'
    },
    {
      extension: [
        itemControlExtFactory('radio-button'),
        calculatedExpressionExtFactory(
          "iif(%painLevel.empty(), 'Y', iif(%painLevel < 5, 'Y', 'N'))"
        )
      ],
      linkId: choiceTargetLinkIdCalc,
      text: 'Low pain (Level < 5)',
      type: 'choice',
      readOnly: true,
      answerOption: [
        {
          valueCoding: targetChoiceCoding
        },
        {
          valueCoding: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'N',
            display: 'No'
          }
        }
      ]
    }
  ],
  {
    extension: [
      variableExtFactory('painLevel', `item.where(linkId = '${choiceTargetLinkId}').answer.value`)
    ]
  }
);
const choiceTargetNumber = 3;

export const ChoiceAnswerOptionCalculation: Story = {
  args: {
    questionnaire: qChoiceAnswerOptionCalculation
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, choiceTargetLinkId, choiceTargetNumber);

    await waitFor(async () => {
      const result = await getAnswers(choiceTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueCoding).toEqual(expect.objectContaining(targetChoiceCoding));
    });
  }
};

const choiceValueSetTargetLinkId = 'gender-string';
const choiceValueSetTargetLinkIdCalc = 'gender-choice';

const choiceValueSetTargetCoding = {
  system: 'http://hl7.org/fhir/administrative-gender',
  code: 'male',
  display: 'Male'
};

const qChoiceAnswerValueSetCalculation = questionnaireFactory(
  [
    {
      linkId: choiceValueSetTargetLinkId,
      type: 'string',
      text: 'Enter gender code'
    },
    {
      extension: [calculatedExpressionExtFactory('%gender')],
      linkId: choiceValueSetTargetLinkIdCalc,
      type: 'choice',
      readOnly: true,
      answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
    }
  ],
  {
    extension: [
      variableExtFactory(
        'gender',
        `item.where((linkId = '${choiceValueSetTargetLinkId}')).answer.value`
      )
    ]
  }
);

export const ChoiceAnswerValueSetCalculation: Story = {
  args: {
    questionnaire: qChoiceAnswerValueSetCalculation
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, choiceValueSetTargetLinkId, choiceValueSetTargetCoding.code);

    await waitFor(async () => {
      const result = await getAnswers(choiceValueSetTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueCoding).toEqual(expect.objectContaining(choiceValueSetTargetCoding));
    });
  }
};

const integerLinkId = 'length-controller';
const integerLinkIdCalc = 'length-squared';
const qIntegerCalculation = questionnaireFactory(
  [
    {
      linkId: integerLinkId,
      type: 'integer'
    },
    {
      extension: [calculatedExpressionExtFactory('%length.power(2)')],
      linkId: integerLinkIdCalc,
      type: 'integer',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory('length', `item.where(linkId = '${integerLinkId}').answer.value`)
    ]
  }
);
const integerTargetNumber = 2;
const integerTargetNumberCalc = 4;

export const IntegerCalculation: Story = {
  args: {
    questionnaire: qIntegerCalculation
  },
  play: async ({ canvasElement }) => {
    await inputInteger(canvasElement, integerLinkId, integerTargetNumber);

    await waitFor(async () => {
      const result = await getAnswers(integerLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueInteger).toBe(integerTargetNumberCalc);
    });
  }
};

const quantityDaysLinkId = 'duration-in-days';
const quantityHoursLinkId = 'duration-in-hours';
const quantityTargetDays = 1;
const quantityTargetHours = 24;
const qQuantityCalculation = questionnaireFactory(
  [
    {
      linkId: quantityDaysLinkId,
      type: 'quantity'
    },
    {
      extension: [calculatedExpressionExtFactory('%durationInDays.value * 24')],
      linkId: quantityHoursLinkId,
      type: 'quantity'
    }
  ],
  {
    extension: [
      variableExtFactory(
        'durationInDays',
        `item.where(linkId='${quantityDaysLinkId}').answer.value`
      )
    ]
  }
);
const quantityTarget = {
  unit: undefined,
  value: quantityTargetHours,
  code: undefined,
  system: undefined
};

export const QuantityCalculation: Story = {
  args: {
    questionnaire: qQuantityCalculation
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(canvasElement, quantityDaysLinkId, quantityTargetDays);

    await waitFor(async () => {
      const result = await getAnswers(quantityHoursLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(expect.objectContaining(quantityTarget));
    });
  }
};
const heightLinkId = 'patient-height';
const weightLinkId = 'patient-weight';
const bmiLinkIdCalc = 'bmi-result';
const bmiGroupLinkId = 'bmi-calculation';

const qCalculatedExpressionBMICalculator = questionnaireFactory([
  {
    linkId: bmiGroupLinkId,
    type: 'group',
    extension: [
      variableExtFactory('height', `item.where(linkId='${heightLinkId}').answer.value`),
      variableExtFactory('weight', `item.where(linkId='${weightLinkId}').answer.value`)
    ],
    item: [
      {
        linkId: heightLinkId,
        text: 'Height',
        type: 'decimal',
        readOnly: false
      },
      {
        linkId: weightLinkId,
        text: 'Weight',
        type: 'decimal',
        readOnly: false
      },
      {
        extension: [calculatedExpressionExtFactory('(%weight/((%height/100).power(2))).round(1)')],
        linkId: bmiLinkIdCalc,
        text: 'Value',
        type: 'decimal',
        readOnly: true
      }
    ]
  }
]);
const heightTarget = 100;
const weightTarget = 10;
const bmiResultCalc = 10;

export const DecimalCalculation: Story = {
  args: {
    questionnaire: qCalculatedExpressionBMICalculator
  },
  play: async ({ canvasElement }) => {
    await inputDecimal(canvasElement, heightLinkId, heightTarget);
    await inputDecimal(canvasElement, weightLinkId, weightTarget);

    await waitFor(async () => {
      const result = await getGroupAnswers(bmiGroupLinkId, bmiLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDecimal).toBe(bmiResultCalc);
    });
  }
};

const stringCalculationLinkId = 'gender-controller';
const stringCalcCalculationLinkId = 'gender-string';
const stringTargetCoding = {
  system: 'http://hl7.org/fhir/administrative-gender',
  code: 'Male',
  display: 'Male'
};
const qStringCalculation = questionnaireFactory(
  [
    {
      linkId: stringCalculationLinkId,
      type: 'choice',
      answerOption: [
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'Female',
            display: 'Female'
          }
        },
        {
          valueCoding: stringTargetCoding
        }
      ]
    },
    {
      extension: [calculatedExpressionExtFactory('%gender')],
      linkId: stringCalcCalculationLinkId,
      type: 'string',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory(
        'gender',
        `item.where(linkId = '${stringCalculationLinkId}').answer.valueCoding.code`
      )
    ]
  }
);

export const StringCalculation: Story = {
  args: {
    questionnaire: qStringCalculation
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, stringCalculationLinkId, stringTargetCoding.display);

    await waitFor(async () => {
      const result = await getAnswers(stringCalcCalculationLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueString).toBe(stringTargetCoding.display);
    });
  }
};

const detailsLinkId = 'medications-details';
const detailsCalcLinkId = 'medication-summary';
const textTargetText = 'Hello world';

const qTextCalculation = questionnaireFactory(
  [
    {
      linkId: detailsLinkId,
      type: 'text',
      readOnly: false
    },
    {
      extension: [calculatedExpressionExtFactory('%medicationDetails')],
      linkId: detailsCalcLinkId,
      type: 'text',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory(
        'medicationDetails',
        `item.where((linkId = '${detailsLinkId}')).answer.value`
      )
    ]
  }
);

export const TextCalculation: Story = {
  args: {
    questionnaire: qTextCalculation
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, detailsLinkId, textTargetText);

    await waitFor(async () => {
      const result = await getAnswers(detailsCalcLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueString).toBe(textTargetText);
    });
  }
};
