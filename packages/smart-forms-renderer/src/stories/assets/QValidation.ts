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

// Add docs on validation is exposed as operationOutcomes

// Regex
export const qRegexValidation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RegexValidation',
  name: 'RegexValidation',
  title: 'Regex Validation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/validation/regex',
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

export const qrRegexValidation: QuestionnaireResponse = {
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
  questionnaire: 'https://smartforms.csiro.au/docs/validation/regex|0.1.0'
};

// MinLength
export const qMinLengthValidation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MinLengthValidation',
  name: 'MinLengthValidation',
  title: 'Min Length Validation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/validation/minLength',
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
          valueInteger: 9
        }
      ],
      linkId: 'phone-feedback',
      text: 'Phone/mobile (with feedback)',
      type: 'string',
      repeats: false
    }
  ]
};

export const qrMinLengthValidation: QuestionnaireResponse = {
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
  questionnaire: 'https://smartforms.csiro.au/docs/validation/minLength|0.1.0'
};

// MaxLength
export const qMaxLengthValidation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MaxLengthValidation',
  name: 'MaxLengthValidation',
  title: 'Max Length Validation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/validation/maxLength',
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

export const qrMaxLengthValidation: QuestionnaireResponse = {
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

// MaxDecimalPlaces
export const qMaxDecimalPlacesValidation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MaxDecimalPlacesValidation',
  name: 'MaxDecimalPlacesValidation',
  title: 'Max Decimal Places Validation',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/validation/maxDecimalPlaces',
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

export const qrMaxDecimalPlacesValidation: QuestionnaireResponse = {
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
  questionnaire: 'https://smartforms.csiro.au/docs/validation/maxDecimalPlaces|0.1.0'
};

// MinValue
export const qMinValueValidation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MinValueValidation',
  name: 'MinValueValidation',
  title: 'Min Value Validation for Integer',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/validation/minValue',
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

export const qrMinValueValidation: QuestionnaireResponse = {
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
  questionnaire: 'https://smartforms.csiro.au/docs/validation/minValue|0.1.0'
};

// MaxValue
export const qMaxValueValidation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MaxValueValidation',
  name: 'MaxValueValidation',
  title: 'Max Value Validation for Integer',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/validation/maxValue',
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

export const qrMaxValueValidation: QuestionnaireResponse = {
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
  questionnaire: 'https://smartforms.csiro.au/docs/validation/maxValue|0.1.0'
};
