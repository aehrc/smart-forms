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

import type { InputParameters } from '../../SDCPopulateQuestionnaireOperation';
import { QAboriginalTorresStraitIslanderHealthCheck } from './QAboriginalTorresStraitIslanderHealthCheck';
import { patRepop } from '../patRepop';
import { pracPrimaryPeter } from '../pracPrimaryPeter';

export const inputParamsAboriginalTorresStraitIslanderHealthCheck: InputParameters = {
  resourceType: 'Parameters',
  parameter: [
    {
      name: 'questionnaire',
      resource: QAboriginalTorresStraitIslanderHealthCheck
    },
    {
      name: 'subject',
      valueReference: {
        type: 'Patient',
        reference: 'Patient/pat-repop',
        display: 'Kimberly Repop'
      }
    },
    {
      // @ts-ignore
      name: 'canonical',
      valueString: 'http://www.health.gov.au/assessments/mbs/715'
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'patient'
        },
        {
          name: 'content',
          resource: patRepop
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'user'
        },
        {
          name: 'content',
          resource: pracPrimaryPeter
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'Condition'
        },
        {
          name: 'content',
          valueReference: {
            reference:
              'Condition?patient={{%patient.id}}&category=http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item',
            type: 'Condition'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsBloodPressure'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=85354-9&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsTobaccoSmokingStatus'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=72166-2&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'QuestionnaireResponseLatestCompleted'
        },
        {
          name: 'content',
          valueReference: {
            reference:
              'QuestionnaireResponse?status=completed&_count=1&_sort=-authored&patient={{%patient.id}}',
            type: 'QuestionnaireResponse'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'QuestionnaireResponseLatest'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'QuestionnaireResponse?_count=1&_sort=-authored&patient={{%patient.id}}',
            type: 'QuestionnaireResponse'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'MedicationStatement'
        },
        {
          name: 'content',
          valueReference: {
            reference:
              'MedicationStatement?patient={{%patient.id}}&status=active&_include=MedicationStatement:medication',
            type: 'MedicationStatement'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'AllergyIntolerance'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'AllergyIntolerance?patient={{%patient.id}}',
            type: 'AllergyIntolerance'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'Immunization'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Immunization?patient={{%patient.id}}&status=completed',
            type: 'Immunization'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsWaistCircumference'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=8280-0&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsHeartRate'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=8867-4&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsHeartRhythm'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=364074009&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsBodyHeight'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=8302-2&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsBodyWeight'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=29463-7&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsHeadCircumference'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=9843-4&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsTotalCholesterol'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=14647-2&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'ObsHDLCholesterol'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=14646-4&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: 'CVDRiskResult'
        },
        {
          name: 'content',
          valueReference: {
            reference: 'Observation?code=441829007&_sort=-date&patient={{%patient.id}}',
            type: 'Observation'
          }
        }
      ]
    },
    {
      name: 'local',
      valueBoolean: false
    }
  ]
};
