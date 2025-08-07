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

import type { CodeSystemLookupPromise } from '../../SDCPopulateQuestionnaireOperation/interfaces/expressions.interface';

export const resolvedLookupAboriginalTorresStraitIslanderHealthCheck: Promise<
  Record<string, CodeSystemLookupPromise>
> = Promise.resolve({
  'system=http://snomed.info/sct&code=128350005': {
    promise: Promise.resolve({}),
    oldCoding: {
      system: 'http://snomed.info/sct',
      code: '128350005',
      display: 'Bacterial conjunctivitis'
    },
    newCoding: {
      system: 'http://snomed.info/sct',
      code: '128350005',
      display: 'Bacterial conjunctivitis'
    }
  },
  'system=http://snomed.info/sct&code=38341003': {
    promise: Promise.resolve({}),
    oldCoding: {
      system: 'http://snomed.info/sct',
      code: '38341003',
      display: 'Hypertension'
    },
    newCoding: {
      system: 'http://snomed.info/sct',
      code: '38341003',
      display: 'Hypertension'
    }
  },
  'system=http://snomed.info/sct&code=38268001': {
    promise: Promise.resolve({}),
    oldCoding: {
      system: 'http://snomed.info/sct',
      code: '38268001',
      display: 'Ibuprofen'
    },
    newCoding: {
      system: 'http://snomed.info/sct',
      code: '38268001',
      display: 'Ibuprofen'
    }
  },
  'system=http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical&code=active': {
    promise: Promise.resolve({}),
    oldCoding: {
      system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
      code: 'active',
      display: 'Active'
    },
    newCoding: {
      system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
      code: 'active',
      display: 'Active'
    }
  },
  'system=http://snomed.info/sct&code=271807003': {
    promise: Promise.resolve({}),
    oldCoding: {
      system: 'http://snomed.info/sct',
      code: '271807003',
      display: 'Rash'
    },
    newCoding: {
      system: 'http://snomed.info/sct',
      code: '271807003',
      display: 'Rash'
    }
  }
});
