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
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  calculatedExpressionExtFactory,
  chooseSelectOption,
  getAnswers,
  getGroupAnswers,
  inputDecimal,
  inputInteger,
  inputQuantity,
  inputText,
  itemControlExtFactory,
  questionnaireFactory,
  unitExtFactory,
  variableExtFactory
} from '../testUtils';
import { createStory } from '../storybookWrappers/createStory';
import { expect, waitFor } from 'storybook/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/10.1.3 Behavior > Calculations/Item Type Calculations',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

// Boolean
const booleanTargetCoding = {
  system: 'http://hl7.org/fhir/administrative-gender',
  code: 'female',
  display: 'Female'
};
const booleanTargetLinkId = 'gender-controller';
const booleanTargetLinkIdCalc = 'gender-is-female';
const qBooleanCalculation = questionnaireFactory(
  [
    {
      linkId: booleanTargetLinkId,
      text: 'Gender',
      type: 'choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'other',
            display: 'Other'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'unknown',
            display: 'Unknown'
          }
        }
      ]
    },
    {
      extension: [calculatedExpressionExtFactory("%gender = 'female'")],
      linkId: booleanTargetLinkIdCalc,
      text: 'Gender is female?',
      type: 'boolean',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory(
        'gender',
        `item.where(linkId = '${booleanTargetLinkId}').answer.valueCoding.code`
      )
    ]
  }
);

export const BooleanCalculation: Story = createStory({
  args: {
    questionnaire: qBooleanCalculation
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, booleanTargetLinkId, booleanTargetCoding.display);

    await waitFor(async () => {
      const result = await getAnswers(booleanTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueBoolean).toBe(true);
    });
  }
}) as Story;

/* Choice AnswerOption */
const choiceAoTargetLinkId = 'pain-level';
const choiceAoTargetCoding = {
  system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
  code: 'Y',
  display: 'Yes'
};
const choiceAoTargetLinkIdCalc = 'pain-low';
const choiceAoTargetNumber = 3;
const qChoiceAnswerOptionCalculation = questionnaireFactory(
  [
    {
      extension: [
        itemControlExtFactory('slider'),
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue',
          valueInteger: 1
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 0
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10
        }
      ],
      linkId: choiceAoTargetLinkId,
      type: 'integer',
      text: 'Pain level',
      item: [
        {
          extension: [itemControlExtFactory('lower')],
          linkId: 'pain-level-lower',
          text: 'No pain',
          type: 'display'
        },
        {
          extension: [itemControlExtFactory('upper')],
          linkId: 'pain-level-upper',
          text: 'Unbearable pain',
          type: 'display'
        }
      ]
    },
    {
      extension: [
        itemControlExtFactory('radio-button'),
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
          valueCode: 'horizontal'
        },
        calculatedExpressionExtFactory("iif(%painLevel < 5, 'Y', 'N')")
      ],
      linkId: choiceAoTargetLinkIdCalc,
      text: 'Low pain (Level < 5)',
      type: 'choice',
      readOnly: true,
      answerOption: [
        {
          valueCoding: choiceAoTargetCoding
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
      variableExtFactory('painLevel', `item.where(linkId = '${choiceAoTargetLinkId}').answer.value`)
    ]
  }
);

export const ChoiceAnswerOptionCalculation: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerOptionCalculation
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, choiceAoTargetLinkId, choiceAoTargetNumber);

    await waitFor(async () => {
      const result = await getAnswers(choiceAoTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueCoding).toEqual(expect.objectContaining(choiceAoTargetCoding));
    });
  }
}) as Story;

/* Choice AnswerValueSet */
const choiceAvsTargetLinkId = 'state-controller';
const choiceAvsTargetLinkIdCalc = 'state-choice';

const choiceAvsTargetCoding = {
  system: 'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
  code: 'VIC',
  display: 'Victoria'
};

const qChoiceAnswerValueSetCalculation = questionnaireFactory(
  [
    {
      linkId: 'state-controller-instructions',
      text: 'Feel free to play around with the following state codes: ACT, NSW, NT, OTHER, QLD, SA, TAS, VIC, WA',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <div style="font-size:0.875em">Feel free to play around with the following state codes:</div>\r\n    <ul style="font-size:0.875em">\r\n      <li>ACT</li>\r\n      <li>NSW</li>\r\n      <li>NT</li>\r\n      <li>OTHER</li>\r\n      <li>QLD</li>\r\n      <li>SA</li>\r\n      <li>TAS</li>\r\n      <li>VIC</li>\r\n      <li>WA</li>\r\n    </ul>\r\n    </div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: choiceAvsTargetLinkId,
      text: 'State (string)',
      type: 'string'
    },
    {
      extension: [calculatedExpressionExtFactory('%stateCode')],
      linkId: choiceAvsTargetLinkIdCalc,
      text: 'State (choice)',
      type: 'choice',
      readOnly: true,
      answerValueSet: '#australian-states-territories-2'
    }
  ],
  {
    contained: [
      {
        resourceType: 'ValueSet',
        id: 'australian-states-territories-2',
        meta: {
          profile: [
            'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
            'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
          ]
        },
        url: 'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2',
        identifier: [
          {
            system: 'urn:ietf:rfc:3986',
            value: 'urn:oid:1.2.36.1.2001.1004.201.10026'
          }
        ],
        version: '2.0.2',
        name: 'AustralianStatesAndTerritories',
        title: 'Australian States and Territories',
        status: 'active',
        experimental: false,
        date: '2020-05-31',
        publisher: 'Australian Digital Health Agency',
        contact: [
          {
            telecom: [
              {
                system: 'email',
                value: 'help@digitalhealth.gov.au'
              }
            ]
          }
        ],
        description:
          'The Australian States and Territories value set includes values that represent the Australian states and territories.',
        copyright:
          'Copyright © 2018 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis resource includes material that is based on Australian Institute of Health and Welfare material. \n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
        compose: {
          include: [
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              concept: [
                {
                  code: 'ACT'
                },
                {
                  code: 'NSW'
                },
                {
                  code: 'NT'
                },
                {
                  code: 'OTHER'
                },
                {
                  code: 'QLD'
                },
                {
                  code: 'SA'
                },
                {
                  code: 'TAS'
                },
                {
                  code: 'VIC'
                },
                {
                  code: 'WA'
                }
              ]
            }
          ]
        },
        expansion: {
          identifier: 'e9439195-c1d8-4069-a349-98c1d552a351',
          timestamp: '2023-06-20T04:20:58+00:00',
          total: 9,
          offset: 0,
          parameter: [
            {
              name: 'version',
              valueUri:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1|1.1.3'
            },
            {
              name: 'count',
              valueInteger: 2147483647
            },
            {
              name: 'offset',
              valueInteger: 0
            }
          ],
          contains: [
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'ACT',
              display: 'Australian Capital Territory'
            },
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'NSW',
              display: 'New South Wales'
            },
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'NT',
              display: 'Northern Territory'
            },
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'OTHER',
              display: 'Other territories'
            },
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'QLD',
              display: 'Queensland'
            },
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'SA',
              display: 'South Australia'
            },
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'TAS',
              display: 'Tasmania'
            },
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'VIC',
              display: 'Victoria'
            },
            {
              system:
                'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
              code: 'WA',
              display: 'Western Australia'
            }
          ]
        }
      }
    ],
    extension: [
      variableExtFactory(
        'stateCode',
        `item.where(linkId = '${choiceAvsTargetLinkId}').answer.value`
      )
    ]
  }
);

export const ChoiceAnswerValueSetCalculation: Story = createStory({
  args: {
    questionnaire: qChoiceAnswerValueSetCalculation
  },
  play: async ({ canvasElement }) => {
    await inputText(canvasElement, choiceAvsTargetLinkId, choiceAvsTargetCoding.code);

    await waitFor(async () => {
      const result = await getAnswers(choiceAvsTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueCoding).toEqual(expect.objectContaining(choiceAvsTargetCoding));
    });
  }
}) as Story;

/* Date */
const dateTargetLinkId = 'date-controller';
const dateTargetLinkIdCalc = 'calculated-date';

const qDateCalculation = questionnaireFactory(
  [
    {
      linkId: 'date-instruction',
      text: 'Enter a date in one of the supported formats:',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n  <div>\r\n    <table style="border-collapse: collapse; empty-cells: hide;">\r\n      <thead style="background-color: #f3f4f6; font-weight: 600;">\r\n        <tr>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Supported Date Formats  <a href="https://www.hl7.org/fhir/datatypes.html#date" target="_blank" rel="noreferrer">https://www.hl7.org/fhir/datatypes.html#date</a></th>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Example</th>\r\n        </tr>\r\n      </thead>\r\n      <tbody>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025</td></tr>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY-MM</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025-09</td></tr>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY-MM-DD</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025-09-19</td></tr>\r\n</tbody>\r\n    </table>\r\n  </div>\r\n</div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: dateTargetLinkId,
      text: 'Date (String)',
      type: 'string'
    },
    {
      extension: [calculatedExpressionExtFactory('%date')],
      linkId: dateTargetLinkIdCalc,
      text: 'Calculated Date (Date)',
      type: 'date',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory('date', `item.where(linkId = '${dateTargetLinkId}').answer.value`)
    ]
  }
);

export const DateCalculation: Story = createStory({
  args: {
    questionnaire: qDateCalculation
  },
  play: async ({ canvasElement }) => {
    // YYYY
    await inputText(canvasElement, dateTargetLinkId, '2025');

    await waitFor(async () => {
      const result = await getAnswers(dateTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDate).toEqual('2025');
    });

    // YYYY-MM
    await inputText(canvasElement, dateTargetLinkId, '2025-12');

    await waitFor(async () => {
      const result = await getAnswers(dateTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDate).toEqual('2025-12');
    });

    // YYYY-MM-DD
    await inputText(canvasElement, dateTargetLinkId, '2025-12-25');

    await waitFor(async () => {
      const result = await getAnswers(dateTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDate).toEqual('2025-12-25');
    });
  }
}) as Story;

/* DateTime */
const dateTimeTargetLinkId = 'datetime-controller';
const dateTimeTargetLinkIdCalc = 'calculated-datetime';

const qDateTimeCalculation = questionnaireFactory(
  [
    {
      linkId: 'datetime-instruction',
      text: 'Enter a date/datetime in one of the supported formats:',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n  <div>\r\n    <table style="border-collapse: collapse; empty-cells: hide;">\r\n      <thead style="background-color: #f3f4f6; font-weight: 600;">\r\n        <tr>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Supported DateTime Formats <a href="https://www.hl7.org/fhir/datatypes.html#dateTime" target="_blank" rel="noreferrer">https://www.hl7.org/fhir/datatypes.html#dateTime</a></th>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Example</th>\r\n        </tr>\r\n      </thead>\r\n      <tbody>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025</td></tr>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY-MM</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025-09</td></tr>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY-MM-DD</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025-09-19</td></tr>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">YYYY-MM-DDTHH:mm:ssZ</td><td style="padding: 8px; border: 1px solid #e5e7eb;">2025-09-19T14:30:00 (without TZ)<br>2025-09-19T14:30:00+1000 (with TZ)</td></tr>\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n</div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: dateTimeTargetLinkId,
      text: 'DateTime (String)',
      type: 'string'
    },
    {
      extension: [calculatedExpressionExtFactory('%date')],
      linkId: dateTimeTargetLinkIdCalc,
      text: 'Calculated DateTime (Date)',
      type: 'dateTime',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory('date', `item.where(linkId = '${dateTimeTargetLinkId}').answer.value`)
    ]
  }
);

export const DateTimeCalculation: Story = createStory({
  args: {
    questionnaire: qDateTimeCalculation
  },
  play: async ({ canvasElement }) => {
    // YYYY
    await inputText(canvasElement, dateTimeTargetLinkId, '2025');

    await waitFor(async () => {
      const result = await getAnswers(dateTimeTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDateTime).toEqual('2025');
    });

    // YYYY-MM
    await inputText(canvasElement, dateTimeTargetLinkId, '2025-12');

    await waitFor(async () => {
      const result = await getAnswers(dateTimeTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDateTime).toEqual('2025-12');
    });

    // YYYY-MM-DD
    await inputText(canvasElement, dateTimeTargetLinkId, '2025-12-25');

    await waitFor(async () => {
      const result = await getAnswers(dateTimeTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDateTime).toEqual('2025-12-25');
    });

    // YYYY-MM-DDTHH:mm:ssZ (no TZ)
    await inputText(canvasElement, dateTimeTargetLinkId, '2025-09-19T14:30:00');

    await waitFor(async () => {
      const result = await getAnswers(dateTimeTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDateTime).toEqual('2025-09-19T14:30:00');
    });

    // YYYY-MM-DDTHH:mm:ssZ (with TZ)
    await inputText(canvasElement, dateTimeTargetLinkId, '2025-09-19T14:30:00+1100');

    await waitFor(async () => {
      const result = await getAnswers(dateTimeTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDateTime).toContain('2025-09-19T14:30:00+1100');
    });
  }
}) as Story;

/* Decimal */
const decimalHeightTargetLinkId = 'patient-height';
const decimalWeightTargetLinkId = 'patient-weight';
const decimalBmiTargetLinkIdCalc = 'bmi-result';
const decimalBmiGroupTargetLinkId = 'bmi-calculation';

const qCalculatedExpressionBMICalculator = questionnaireFactory([
  {
    linkId: decimalBmiGroupTargetLinkId,
    type: 'group',
    text: 'BMI Calculation',
    extension: [
      variableExtFactory(
        'height',
        `item.where(linkId='${decimalHeightTargetLinkId}').answer.value`
      ),
      variableExtFactory('weight', `item.where(linkId='${decimalWeightTargetLinkId}').answer.value`)
    ],
    item: [
      {
        linkId: decimalHeightTargetLinkId,
        text: 'Height',
        type: 'decimal',
        readOnly: false
      },
      {
        linkId: decimalWeightTargetLinkId,
        text: 'Weight',
        type: 'decimal',
        readOnly: false
      },
      {
        extension: [calculatedExpressionExtFactory('(%weight/((%height/100).power(2))).round(1)')],
        linkId: decimalBmiTargetLinkIdCalc,
        text: 'Value',
        type: 'decimal',
        readOnly: true
      }
    ]
  }
]);

export const DecimalCalculation: Story = createStory({
  args: {
    questionnaire: qCalculatedExpressionBMICalculator
  },
  play: async ({ canvasElement }) => {
    await inputDecimal(canvasElement, decimalHeightTargetLinkId, 180);
    await inputDecimal(canvasElement, decimalWeightTargetLinkId, 70);

    await waitFor(async () => {
      const result = await getGroupAnswers(decimalBmiGroupTargetLinkId, decimalBmiTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueDecimal).toBe(21.6);
    });
  }
}) as Story;

/* Integer */
const integerTargetLinkId = 'length-controller';
const integerTargetLinkIdCalc = 'length-squared';
const qIntegerCalculation = questionnaireFactory(
  [
    {
      linkId: integerTargetLinkId,
      type: 'integer',
      text: 'Length (cm)'
    },
    {
      extension: [calculatedExpressionExtFactory('%length.power(2)')],
      linkId: integerTargetLinkIdCalc,
      type: 'integer',
      text: 'Length squared (cm²)',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory('length', `item.where(linkId = '${integerTargetLinkId}').answer.value`)
    ]
  }
);

export const IntegerCalculation: Story = createStory({
  args: {
    questionnaire: qIntegerCalculation
  },
  play: async ({ canvasElement }) => {
    await inputInteger(canvasElement, integerTargetLinkId, 16);

    await waitFor(async () => {
      const result = await getAnswers(integerTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueInteger).toBe(256);
    });
  }
}) as Story;

/* Quantity */
const quantityDaysTargetLinkId = 'duration-in-days';
const quantityHoursTargetLinkId = 'duration-in-hours';

const qQuantityCalculation = questionnaireFactory(
  [
    {
      linkId: quantityDaysTargetLinkId,
      extension: [unitExtFactory('d', 'days')],
      type: 'quantity',
      text: 'Duration (in days)'
    },
    {
      extension: [unitExtFactory('h', 'hours'), calculatedExpressionExtFactory('%durationInDays')],
      linkId: quantityHoursTargetLinkId,
      type: 'quantity',
      text: 'Duration (in hours)'
    }
  ],
  {
    extension: [
      variableExtFactory(
        'durationInDays',
        `(item.where(linkId='${quantityDaysTargetLinkId}').answer.value.value.toString() + ' days').toQuantity('h')`
      )
    ]
  }
);

export const QuantityCalculation: Story = createStory({
  args: {
    questionnaire: qQuantityCalculation
  },
  play: async ({ canvasElement }) => {
    await inputQuantity(canvasElement, quantityDaysTargetLinkId, 1);

    await waitFor(async () => {
      const result = await getAnswers(quantityHoursTargetLinkId);
      expect(result).toHaveLength(1);
      expect(result[0].valueQuantity).toEqual(
        expect.objectContaining({
          value: 24
          // Does not include the unit system/coding
        })
      );
    });
  }
}) as Story;

/* String */

const stringTargetLinkId = 'gender-controller';
const stringTargetLinkIdCalc = 'gender-string';
const stringTargetCoding = {
  system: 'http://hl7.org/fhir/administrative-gender',
  code: 'male',
  display: 'Male'
};

const qStringCalculation = questionnaireFactory(
  [
    {
      linkId: stringTargetLinkId,
      type: 'choice',
      text: 'Gender',
      answerOption: [
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'other',
            display: 'Other'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'unknown',
            display: 'Unknown'
          }
        }
      ]
    },
    {
      extension: [calculatedExpressionExtFactory('%gender')],
      linkId: stringTargetLinkIdCalc,
      type: 'string',
      text: 'Gender code',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory(
        'gender',
        `item.where(linkId = '${stringTargetLinkId}').answer.valueCoding.code`
      )
    ]
  }
);

export const StringCalculation: Story = createStory({
  args: {
    questionnaire: qStringCalculation
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, stringTargetLinkId, stringTargetCoding.display);

    await waitFor(async () => {
      const result = await getAnswers(stringTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueString).toBe(stringTargetCoding.code);
    });
  }
}) as Story;

/* Text */
const textEarHealthGroupLinkId = 'ear-health-group';
const textEarHealthTargetLinkId = 'ear-health-details';
const textEarHealthTargetLinkIdCalc = 'ear-health-summary';

const textMedicationsGroupLinkId = 'medications-group';
const textMedicationsTargetLinkId = 'medications-details';
const textMedicationsTargetLinkIdCalc = 'medications-summary';

const textSummaryGroupTargetLinkIdCalc = 'summaries-group';

const qTextCalculation = questionnaireFactory(
  [
    {
      linkId: textEarHealthGroupLinkId,
      text: 'Ear Health',
      type: 'group',
      item: [
        {
          linkId: 'ear-health-other',
          text: '... (other questions)',
          type: 'display'
        },
        {
          linkId: textEarHealthTargetLinkId,
          text: 'Details',
          type: 'text'
        }
      ]
    },
    {
      linkId: textMedicationsGroupLinkId,
      text: 'Medications',
      type: 'group',
      item: [
        {
          linkId: 'medications-other',
          text: '... (other questions)',
          type: 'display',
          readOnly: false
        },
        {
          linkId: textMedicationsTargetLinkId,
          text: 'Details',
          type: 'text',
          readOnly: false
        }
      ]
    },
    {
      linkId: 'summaries-group',
      text: 'Health Check Summaries',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [calculatedExpressionExtFactory('%earHealthDetails')],
          linkId: textEarHealthTargetLinkIdCalc,
          text: 'Ear Health',
          type: 'text',
          readOnly: true
        },
        {
          extension: [calculatedExpressionExtFactory('%medicationDetails')],
          linkId: textMedicationsTargetLinkIdCalc,
          text: 'Medications',
          type: 'text',
          readOnly: true
        }
      ]
    }
  ],
  {
    extension: [
      variableExtFactory(
        'earHealthDetails',
        `item.where((linkId = '${textEarHealthGroupLinkId}')).item.where((linkId = '${textEarHealthTargetLinkId}')).answer.value`
      ),
      variableExtFactory(
        'medicationDetails',
        `item.where((linkId = '${textMedicationsGroupLinkId}')).item.where((linkId = '${textMedicationsTargetLinkId}')).answer.value`
      )
    ]
  }
);

export const TextCalculation: Story = createStory({
  args: {
    questionnaire: qTextCalculation
  },
  play: async ({ canvasElement }) => {
    await inputText(
      canvasElement,
      textEarHealthTargetLinkId,
      'Patient has ringing in ears since last week'
    );

    await waitFor(async () => {
      const result = await getGroupAnswers(
        textSummaryGroupTargetLinkIdCalc,
        textEarHealthTargetLinkIdCalc
      );
      expect(result).toHaveLength(1);
      expect(result[0].valueString).toBe('Patient has ringing in ears since last week');
    });
  }
}) as Story;

/* Time */
const timeTargetLinkId = 'time-controller';
const timeTargetLinkIdCalc = 'calculated-time';

const qTimeCalculation = questionnaireFactory(
  [
    {
      linkId: 'time-instruction',
      text: 'Enter a time in one of the supported formats:',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n  <div>\r\n    <table style="border-collapse: collapse; empty-cells: hide;">\r\n      <thead style="background-color: #f3f4f6; font-weight: 600;">\r\n        <tr>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Supported Time Format <a href="https://www.hl7.org/fhir/datatypes.html#time" target="_blank" rel="noreferrer">https://www.hl7.org/fhir/datatypes.html#time</a></th>\r\n          <th style="padding: 8px; border: 1px solid #e5e7eb;">Example</th>\r\n        </tr>\r\n      </thead>\r\n      <tbody>\r\n        <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">hh:mm:ss</td><td style="padding: 8px; border: 1px solid #e5e7eb;">14:10:30</td></tr>\r\n      </tbody>\r\n    </table>\r\n  </div>\r\n</div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: timeTargetLinkId,
      text: 'Time (String)',
      type: 'string'
    },
    {
      extension: [calculatedExpressionExtFactory('%time')],
      linkId: timeTargetLinkIdCalc,
      text: 'Calculated Time (Time)',
      type: 'time',
      readOnly: true
    }
  ],
  {
    extension: [
      variableExtFactory('time', `item.where(linkId = '${timeTargetLinkId}').answer.value`)
    ]
  }
);

export const TimeCalculation: Story = createStory({
  args: {
    questionnaire: qTimeCalculation
  },
  play: async ({ canvasElement }) => {
    // hh:mm:ss
    await inputText(canvasElement, timeTargetLinkId, '14:10:30');

    await waitFor(async () => {
      const result = await getAnswers(timeTargetLinkIdCalc);
      expect(result).toHaveLength(1);
      expect(result[0].valueTime).toEqual('14:10:30');
    });
  }
}) as Story;
