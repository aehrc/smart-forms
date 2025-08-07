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
