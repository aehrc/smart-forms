import type { Observation } from 'fhir/r4';

export interface BloodPressureTemplate {
  systolic: {
    code: {
      system: string;
      code: string;
      display: string;
    };
    unit: string;
    system: string;
  };
  diastolic: {
    code: {
      system: string;
      code: string;
      display: string;
    };
    unit: string;
    system: string;
  };
}

export const bloodPressureTemplate: BloodPressureTemplate = {
  systolic: {
    code: {
      system: 'http://loinc.org',
      code: '8480-6',
      display: 'Systolic blood pressure'
    },
    unit: 'mmHg',
    system: 'http://unitsofmeasure.org'
  },
  diastolic: {
    code: {
      system: 'http://loinc.org',
      code: '8462-4',
      display: 'Diastolic blood pressure'
    },
    unit: 'mmHg',
    system: 'http://unitsofmeasure.org'
  }
};

export function createBloodPressureObservations(
  systolicValue: number,
  diastolicValue: number,
  subjectReference: string
): Observation[] {
  const systolicObservation: Observation = {
    resourceType: 'Observation',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ]
      }
    ],
    code: {
      coding: [bloodPressureTemplate.systolic.code]
    },
    subject: {
      reference: subjectReference
    },
    valueQuantity: {
      value: systolicValue,
      unit: bloodPressureTemplate.systolic.unit,
      system: bloodPressureTemplate.systolic.system,
      code: 'mm[Hg]'
    },
    effectiveDateTime: new Date().toISOString()
  };

  const diastolicObservation: Observation = {
    resourceType: 'Observation',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ]
      }
    ],
    code: {
      coding: [bloodPressureTemplate.diastolic.code]
    },
    subject: {
      reference: subjectReference
    },
    valueQuantity: {
      value: diastolicValue,
      unit: bloodPressureTemplate.diastolic.unit,
      system: bloodPressureTemplate.diastolic.system,
      code: 'mm[Hg]'
    },
    effectiveDateTime: new Date().toISOString()
  };

  return [systolicObservation, diastolicObservation];
} 