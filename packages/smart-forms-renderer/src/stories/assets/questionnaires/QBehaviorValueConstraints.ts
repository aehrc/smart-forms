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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

// TODO Add docs on validation is exposed as operationOutcomes

// MaxLength
export const qMaxLength: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MaxLength',
  name: 'MaxLength',
  title: 'Max Length',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/value-constraints/max-length',
  item: [
    {
      linkId: 'pensioner-card-number-empty',
      text: 'Pensioner Card Number (empty)',
      type: 'string',
      repeats: false,
      maxLength: 10
    },
    {
      linkId: 'pensioner-card-number-filled',
      text: 'Pensioner Card Number (filled)',
      type: 'string',
      repeats: false,
      maxLength: 10
    },
    {
      linkId: 'pensioner-card-number-feedback',
      text: 'Pensioner Card Number (with feedback)',
      type: 'string',
      repeats: false,
      maxLength: 10
    }
  ]
};

export const qrMaxLength: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'pensioner-card-number-filled',
      text: 'Pensioner Card Number (filled)',
      answer: [
        {
          valueString: '111111111A'
        }
      ]
    },
    {
      linkId: 'pensioner-card-number-feedback',
      text: 'Pensioner Card Number (with feedback)',
      answer: [
        {
          valueString: '111111111AA'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/validation/maxLength|0.1.0'
};

// MinLength
export const qMinLength: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MinLength',
  name: 'MinLength',
  title: 'Min Length',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/value-constraints/min-length',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minLength',
          valueInteger: 10
        }
      ],
      linkId: 'phone-empty',
      text: 'Phone/mobile number (empty)',
      type: 'string',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minLength',
          valueInteger: 10
        }
      ],
      linkId: 'phone-filled',
      text: 'Phone/mobile (filled)',
      type: 'string',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minLength',
          valueInteger: 10
        }
      ],
      linkId: 'phone-feedback',
      text: 'Phone/mobile (with feedback)',
      type: 'string',
      repeats: false
    }
  ]
};

export const qrMinLength: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'phone-filled',
      text: 'Phone/mobile number (filled)',
      answer: [
        {
          valueString: '0112345678'
        }
      ]
    },
    {
      linkId: 'phone-feedback',
      text: 'Phone/mobile number (with feedback)',
      answer: [
        {
          valueString: '0112345'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/behavior/value-constraints/min-length|0.1.0'
};

// Regex
export const qRegex: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'Regex',
  name: 'Regex',
  title: 'Regex',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/value-constraints/regex',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: "matches('^[0-9]{4}$')"
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
          valueString: '####'
        }
      ],
      linkId: 'postcode-au-empty',
      definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.postalCode',
      text: 'Postcode (empty)',
      type: 'string',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: "matches('^[0-9]{4}$')"
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
          valueString: '####'
        }
      ],
      linkId: 'postcode-au-filled',
      definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.postalCode',
      text: 'Postcode (filled)',
      type: 'string',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/regex',
          valueString: "matches('^[0-9]{4}$')"
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
          valueString: '####'
        }
      ],
      linkId: 'postcode-au-feedback',
      definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.postalCode',
      text: 'Postcode (with feedback)',
      type: 'string',
      repeats: false
    }
  ]
};

export const qrRegex: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'postcode-au-filled',
      text: 'Postcode (filled)',
      answer: [
        {
          valueString: '2000'
        }
      ]
    },
    {
      linkId: 'postcode-au-feedback',
      text: 'Postcode (with feedback)',
      answer: [
        {
          valueString: '20000'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/behavior/value-constraints/regex|0.1.0'
};

// MinValue
// TODO need to add more examples question (where type='date', 'dateTime', 'time', 'decimal', 'integer')
export const qMinValue: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MinValue',
  name: 'MinValue',
  title: 'Min Value',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/value-constraints/min-value',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 18
        }
      ],
      linkId: 'age-empty',
      text: 'Age (>=18) (empty)',
      type: 'integer',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 18
        }
      ],
      linkId: 'age-filled',
      text: 'Age (>=18) (filled)',
      type: 'integer',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 18
        }
      ],
      linkId: 'age-feedback',
      text: 'Age (>=18) (with feedback)',
      type: 'integer',
      repeats: false
    }
  ]
};

export const qrMinValue: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'age-filled',
      text: 'Age (>=18) (filled)',
      answer: [
        {
          valueInteger: 25
        }
      ]
    },
    {
      linkId: 'age-feedback',
      text: 'Age (>=18) (with feedback)',
      answer: [
        {
          valueInteger: 15
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/behavior/value-constraints/min-value|0.1.0'
};

// MaxValue
export const qMaxValue: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MaxValueValidation',
  name: 'MaxValueValidation',
  title: 'Max Value Validation for Integer',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/value-constraints/max-value',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 65
        }
      ],
      linkId: 'age-empty',
      text: 'Age (<=65) (empty)',
      type: 'integer',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 65 // Example: Maximum age requirement
        }
      ],
      linkId: 'age-filled',
      text: 'Age (<=65) (filled)',
      type: 'integer',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 65
        }
      ],
      linkId: 'age-feedback',
      text: 'Age (<=65) (with feedback)',
      type: 'integer',
      repeats: false
    }
  ]
};

export const qrMaxValue: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'age-filled',
      text: 'Age (<=65) (filled)',
      answer: [
        {
          valueInteger: 60
        }
      ]
    },
    {
      linkId: 'age-feedback',
      text: 'Age (<=65) (with feedback)',
      answer: [
        {
          valueInteger: 70
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/behavior/value-constraints/max-value|0.1.0'
};

// MaxDecimalPlaces
export const qMaxDecimalPlaces: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MaxDecimalPlaces',
  name: 'MaxDecimalPlaces',
  title: 'Max Decimal Places',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/value-constraints/max-decimal-places',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces',
          valueInteger: 2
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'kg',
            display: 'kg'
          }
        }
      ],
      linkId: 'weight-empty',
      text: 'Weight (kg) (empty)',
      type: 'decimal',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces',
          valueInteger: 2
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'kg',
            display: 'kg'
          }
        }
      ],
      linkId: 'weight-filled',
      text: 'Weight (kg) (filled)',
      type: 'decimal',
      repeats: false
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxDecimalPlaces',
          valueInteger: 2
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'kg',
            display: 'kg'
          }
        }
      ],
      linkId: 'weight-feedback',
      text: 'Weight (kg) (with feedback)',
      type: 'decimal',
      repeats: false
    }
  ]
};

export const qrMaxDecimalPlaces: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'weight-filled',
      text: 'Weight (kg) (filled)',
      answer: [
        {
          valueDecimal: 72.34
        }
      ]
    },
    {
      linkId: 'weight-feedback',
      text: 'Weight (kg) (with feedback)',
      answer: [
        {
          valueDecimal: 72.345
        }
      ]
    }
  ],
  questionnaire:
    'https://smartforms.csiro.au/docs/behavior/value-constraints/max-decimal-places|0.1.0'
};
