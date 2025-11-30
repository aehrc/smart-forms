import {
  getAdjustedDeletePathSegments,
  parseFhirPath,
  parseFhirPathToWritableSegments
} from '../utils/parseFhirPath';

describe('parseFhirPath', () => {
  it('parses a simple path with no arrays or underscore fields', () => {
    expect(parseFhirPath('Patient.name')).toEqual(['Patient', 'name']);
  });

  it('parses a path with array indices', () => {
    expect(parseFhirPath('Patient.name[0].given[1]')).toEqual(['Patient', 'name', 0, 'given', 1]);
  });

  it('parses a path with an underscore-prefixed field and extension structure', () => {
    expect(parseFhirPath('Patient.name[0]._family.extension[0]')).toEqual([
      'Patient',
      'name',
      0,
      '_family',
      'extension',
      0
    ]);
  });

  it('parses a path with a single underscore-prefixed field', () => {
    expect(parseFhirPath('Patient._gender')).toEqual(['Patient', '_gender']);
  });

  it('parses deeply nested paths', () => {
    expect(parseFhirPath('Patient.contact[0].name[0]._text.extension[0]')).toEqual([
      'Patient',
      'contact',
      0,
      'name',
      0,
      '_text',
      'extension',
      0
    ]);
  });
});

describe('parseFhirPathToWritableSegments', () => {
  it('strips _field.extension[x] into field', () => {
    expect(parseFhirPathToWritableSegments('Patient.name[0]._family.extension[0]')).toEqual([
      'Patient',
      'name',
      0,
      'family'
    ]);
  });

  it('converts final _field to field without extension structure', () => {
    expect(parseFhirPathToWritableSegments('Patient._gender')).toEqual(['Patient', 'gender']);
    expect(parseFhirPathToWritableSegments('Patient.name[0]._text')).toEqual([
      'Patient',
      'name',
      0,
      'text'
    ]);
    expect(parseFhirPathToWritableSegments('Patient.name[0]._given[0]')).toEqual([
      'Patient',
      'name',
      0,
      'given',
      0
    ]);
  });

  it('returns plain segments when no underscores are used', () => {
    expect(parseFhirPathToWritableSegments('Patient.name[0]')).toEqual(['Patient', 'name', 0]);
    expect(parseFhirPathToWritableSegments('Patient.name[0].given[1]')).toEqual([
      'Patient',
      'name',
      0,
      'given',
      1
    ]);
  });
});

describe('getAdjustedDeletePathSegments', () => {
  const patientTemplate = {
    resourceType: 'Patient',
    id: 'patTemplate',
    identifier: [
      {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
            valueString: "item.where(linkId = 'ihi').answer.value"
          }
        ],
        type: {
          text: 'National Identifier (IHI)'
        },
        system: 'http://example.org/nhio',
        _value: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: 'first()'
            }
          ]
        }
      }
    ],
    name: [
      {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
            valueString: "item.where(linkId = 'name')"
          }
        ],
        _text: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: "item.where(linkId='given' or linkId='family').answer.value.join(' ')"
            }
          ]
        },
        _family: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: "item.where(linkId = 'family').answer.value.first()"
            }
          ]
        }
      }
    ],
    telecom: [
      {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
            valueString: "item.where(linkId = 'mobile-phone').answer.value"
          }
        ],
        system: 'phone',
        _value: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: 'first()'
            }
          ]
        },
        use: 'mobile'
      }
    ],
    gender: 'unknown',
    _gender: {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: "item.where(linkId = 'gender').answer.value.first().code"
        }
      ]
    }
  };

  test('returns truncated path for single extension - context variant', () => {
    const segments = ['Patient', 'identifier', 0, 'extension', 0];
    const result = getAdjustedDeletePathSegments(patientTemplate, segments, 'context', []);

    // Should truncate to remove just "extension"
    expect(result).toEqual(['Patient', 'identifier', 0, 'extension']);
  });

  test('returns truncated path for single extension - value variant', () => {
    const segments = ['Patient', '_gender', 'extension', 0];
    const result = getAdjustedDeletePathSegments(patientTemplate, segments, 'value', []);

    // Should truncate to remove "_gender"
    expect(result).toEqual(['Patient', '_gender']);
  });

  test('returns full path when multiple extensions - context variant', () => {
    // Augment template by adding dummy extension
    patientTemplate.identifier?.[0]?.extension.push({
      url: 'http://example.org/extension',
      valueString: 'example extension'
    });
    const segments = ['Patient', 'identifier', 0, 'extension', 0];
    const result = getAdjustedDeletePathSegments(patientTemplate, segments, 'context', []);

    expect(result).toEqual(segments); // no truncation
  });

  test('returns full path when multiple extensions - value variant', () => {
    // Augment template by adding dummy extension
    patientTemplate._gender?.extension.push({
      url: 'http://example.org/extension',
      valueString: 'example extension'
    });
    const segments = ['Patient', '_gender', 'extension', 0];
    const result = getAdjustedDeletePathSegments(patientTemplate, segments, 'value', []);

    expect(result).toEqual(segments); // no truncation
  });
});
