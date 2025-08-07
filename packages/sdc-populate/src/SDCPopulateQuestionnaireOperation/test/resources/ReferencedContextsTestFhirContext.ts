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

import type { ReferenceContext } from '../../interfaces/inputParameters.interface';

export const ReferencedContextsTestFhirContext: ReferenceContext[] = [
  {
    name: 'context',
    part: [
      { name: 'name', valueString: 'ObsBodyHeight' },
      {
        name: 'content',
        valueReference: {
          reference: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
        }
      }
    ]
  },
  {
    name: 'context',
    part: [
      { name: 'name', valueString: 'ObsBodyWeight' },
      {
        name: 'content',
        valueReference: {
          reference: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
        }
      }
    ]
  },
  {
    name: 'context',
    part: [
      { name: 'name', valueString: 'PrePopQuery' },
      {
        name: 'content',
        valueReference: {
          reference: '#PrePopQuery'
        }
      }
    ]
  }
];
