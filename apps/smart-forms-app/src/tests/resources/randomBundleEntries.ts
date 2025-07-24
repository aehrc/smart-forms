import type { BundleEntry } from 'fhir/r4';

export const randomBundleEntries: BundleEntry[] = [
  // Invalid entry: no request
  {
    fullUrl: 'urn:uuid:patient-1232',
    resource: {
      resourceType: 'Patient',
      id: 'patient-123',
      name: [{ given: ['John'], family: 'Doe' }],
      gender: 'male',
      birthDate: '1990-01-01'
    }
  },
  {
    fullUrl: 'urn:uuid:patient-123',
    request: {
      method: 'POST',
      url: 'Patient'
    },
    resource: {
      resourceType: 'Patient',
      id: 'patient-123',
      name: [{ given: ['John'], family: 'Doe' }],
      gender: 'male',
      birthDate: '1990-01-01'
    }
  },
  {
    fullUrl: 'Patient/456',
    request: {
      method: 'PUT',
      url: 'Patient/456'
    },
    resource: {
      resourceType: 'Patient',
      id: '456',
      name: [{ given: ['Jane'], family: 'Smith' }],
      gender: 'female',
      birthDate: '1985-05-15'
    }
  },
  {
    request: {
      method: 'POST',
      url: 'Observation'
    },
    resource: {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '29463-7', display: 'Body Weight' }]
      },
      subject: { reference: 'Patient/123' },
      valueQuantity: { value: 70, unit: 'kg' }
    }
  },
  // Invalid entry: Fails parametersIsFhirPatch() check due to parameter[2] "type" remove (invalid)
  {
    request: {
      method: 'PATCH',
      url: 'Patient/789'
    },
    resource: {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'operation',
          part: [
            { name: 'type', valueCode: 'replace' },
            { name: 'path', valueString: 'name[0].given[0]' },
            { name: 'value', valueString: 'Michael' }
          ]
        },
        {
          name: 'operation',
          part: [
            { name: 'type', valueCode: 'add' },
            { name: 'path', valueString: 'telecom' },
            { name: 'value', valueContactPoint: { system: 'phone', value: '555-0123' } }
          ]
        },
        {
          name: 'operation',
          part: [
            { name: 'type', valueCode: 'remove (invalid)' },
            { name: 'path', valueString: 'address[0]' }
          ]
        }
      ]
    }
  },
  // Invalid entry: no request, Parameters no "parameters"
  {
    fullUrl: 'urn:uuid:f6fb59c6-47da-4ede-a3c3-2012d3c6da8b',
    resource: {
      resourceType: 'Parameters'
    }
  }
];
