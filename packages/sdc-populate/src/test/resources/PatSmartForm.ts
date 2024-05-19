import type { Patient } from 'fhir/r4';

export const patSmartForm: Patient = {
  resourceType: 'Patient',
  id: 'pat-sf',
  meta: {
    versionId: '1',
    lastUpdated: '2024-05-14T04:18:27.156+00:00',
    source: '#7awrHf9svvQ9oRrA',
    profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-patient']
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p style="border: 1px #661aff solid; background-color: #e6e6ff; padding: 10px;"><b>Clever Form</b> female, DoB: 1968-10-11 ( Medicare Number/69514496771 (period: (?) --&gt; 2024-08))</p><hr/><table class="grid"><tr><td style="background-color: #f3f5da" title="Other Ids (see the one above)">Other Id:</td><td colspan="3">IHI/8003608833357361</td></tr><tr><td style="background-color: #f3f5da" title="Alternate names (see the one above)">Alt. Name:</td><td colspan="3">Mrs. Smart Form(OFFICIAL)</td></tr><tr><td style="background-color: #f3f5da" title="Ways to contact the Patient">Contact Details:</td><td colspan="3"><ul><li>ph: 0491 572 665(MOBILE)</li><li>ph: 0123456879(HOME)</li><li>4 Brisbane Street Brisbane QLD 4112 AU (HOME)</li><li>PO Box Number Brisbane QLD 4112 AU (TEMP)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Languages spoken">Language:</td><td colspan="3"><span title="Codes: {urn:ietf:bcp:47 yub}">Yugambal</span></td></tr><tr><td style="background-color: #f3f5da" title="Nominated Contact: Emergency Contact">Emergency Contact:</td><td colspan="3"><ul><li>Ms Phone A Friend</li><li>0987654321</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="The pronouns to use when referring to an individual in verbal or written communication.">Individual Pronouns:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://loinc.org LA29520-6}">they/them/their/theirs/themselves</span></li><li>period: 2018-02 --&gt; 2022-06</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="The pronouns to use when referring to an individual in verbal or written communication.">Individual Pronouns:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://loinc.org LA29519-8}">she/her/her/hers/herself</span></li><li>period: 2022-06 --&gt; (ongoing)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Recorded sex or gender (RSG) information includes the various sex and gender concepts that are often used in existing systems but are known NOT to represent a gender identity, sex parameter for clinical use, or attributes related to sexuality, such as sexual orientation, sexual activity, or sexual attraction. Examples of recorded sex or gender concepts include administrative gender, administrative sex, and sex assigned at birth.  When exchanging this concept, refer to the guidance in the [Gender Harmony Implementation Guide](http://hl7.org/xprod/ig/uv/gender-harmony/).\n\nThis extension is published in this guide to pre-adopt an extension published in the R5 [FHIR Extensions Pack](http://hl7.org/fhir/extensions/StructureDefinition-individual-recordedSexOrGender.html). The only material difference is the data type for extension part sourceDocument (R5 CodeableReference to a choice between R4 CodeableConcept or Reference).">Person Recorded Sex Or Gender:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://snomed.info/sct 248152002}">Female</span></li><li>type: <span title="Codes: {http://snomed.info/sct 1515311000168102}">Sex at Birth</span></li><li>effectivePeriod: 2022-06 --&gt; (ongoing)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Recorded sex or gender (RSG) information includes the various sex and gender concepts that are often used in existing systems but are known NOT to represent a gender identity, sex parameter for clinical use, or attributes related to sexuality, such as sexual orientation, sexual activity, or sexual attraction. Examples of recorded sex or gender concepts include administrative gender, administrative sex, and sex assigned at birth.  When exchanging this concept, refer to the guidance in the [Gender Harmony Implementation Guide](http://hl7.org/xprod/ig/uv/gender-harmony/).\n\nThis extension is published in this guide to pre-adopt an extension published in the R5 [FHIR Extensions Pack](http://hl7.org/fhir/extensions/StructureDefinition-individual-recordedSexOrGender.html). The only material difference is the data type for extension part sourceDocument (R5 CodeableReference to a choice between R4 CodeableConcept or Reference).">Person Recorded Sex Or Gender:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://snomed.info/sct 32570681000036106}">Indeterminate sex</span></li><li>type: <span title="Codes: {http://snomed.info/sct 1515311000168102}">Sex at Birth</span></li><li>effectivePeriod: 2018-02 --&gt; 2022-06</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="This extension applies to the Patient, Person, and RelatedPerson resources and is used to indicate whether a person identifies as being of Aboriginal or Torres Strait Islander origin."><a href="https://build.fhir.org/ig/hl7au/au-fhir-base//StructureDefinition-indigenous-status.html">Australian Indigenous Status:</a></td><td colspan="3"><ul><li>https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1 1: Aboriginal but not Torres Strait Islander origin</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="An individual\'s personal sense of being a man, woman, boy, girl, nonbinary, or something else. This represents an individual’s identity, ascertained by asking them what that identity is. \n In the case where the gender identity is communicated by a third party, for example, if a spouse indicates the gender identity of their partner on an intake form, a Provenance resource can be used with a Provenance.target referring to the Patient, with a targetElement extension identifying the gender identity extension as the target element within the Patient resource.  When exchanging this concept, refer to the guidance in the [Gender Harmony Implementation Guide](http://hl7.org/xprod/ig/uv/gender-harmony/).">Individual Gender Identity:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://snomed.info/sct 446141000124107}">Identifies as female gender</span></li></ul></td></tr></table></div>'
  },
  extension: [
    {
      url: 'http://hl7.org.au/fhir/StructureDefinition/indigenous-status',
      valueCoding: {
        system: 'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
        code: '1',
        display: 'Aboriginal but not Torres Strait Islander origin'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-genderIdentity',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '446141000124107',
                display: 'Identifies as female gender'
              }
            ]
          }
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA29520-6',
                display: 'they/them/their/theirs/themselves'
              }
            ]
          }
        },
        {
          url: 'period',
          valuePeriod: {
            start: '2018-02',
            end: '2022-06'
          }
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA29519-8',
                display: 'she/her/her/hers/herself'
              }
            ]
          }
        },
        {
          url: 'period',
          valuePeriod: {
            start: '2022-06'
          }
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '248152002',
                display: 'Female'
              }
            ],
            text: 'Female'
          }
        },
        {
          url: 'type',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '1515311000168102',
                display: 'Biological sex at birth'
              }
            ],
            text: 'Sex at Birth'
          }
        },
        {
          url: 'effectivePeriod',
          valuePeriod: {
            start: '2022-06'
          }
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '32570681000036106',
                display: 'Indeterminate sex'
              }
            ],
            text: 'Indeterminate sex'
          }
        },
        {
          url: 'type',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '1515311000168102',
                display: 'Biological sex at birth'
              }
            ],
            text: 'Sex at Birth'
          }
        },
        {
          url: 'effectivePeriod',
          valuePeriod: {
            start: '2018-02',
            end: '2022-06'
          }
        }
      ]
    }
  ],
  identifier: [
    {
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MC'
          }
        ],
        text: 'Medicare Number'
      },
      system: 'http://ns.electronichealth.net.au/id/medicare-number',
      value: '69514496771',
      period: {
        end: '2024-08'
      }
    },
    {
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'NI',
            display: 'National unique individual identifier'
          }
        ],
        text: 'IHI'
      },
      system: 'http://ns.electronichealth.net.au/id/hi/ihi/1.0',
      value: '8003608833357361'
    }
  ],
  name: [
    {
      use: 'official',
      text: 'Mrs. Smart Form',
      family: 'Form',
      given: ['Smart'],
      prefix: ['Mrs']
    },
    {
      use: 'usual',
      text: 'Clever Form'
    }
  ],
  telecom: [
    {
      system: 'phone',
      value: '0491 572 665',
      use: 'mobile'
    },
    {
      system: 'phone',
      value: '0123456879',
      use: 'home'
    }
  ],
  gender: 'female',
  birthDate: '1968-10-11',
  address: [
    {
      use: 'home',
      type: 'physical',
      line: ['4 Brisbane Street'],
      city: 'Brisbane',
      state: 'QLD',
      postalCode: '4112',
      country: 'AU'
    },
    {
      use: 'temp',
      type: 'postal',
      line: ['PO Box Number'],
      city: 'Brisbane',
      state: 'QLD',
      postalCode: '4112',
      country: 'AU'
    }
  ],
  contact: [
    {
      relationship: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
              code: 'C'
            }
          ]
        }
      ],
      name: {
        use: 'usual',
        text: 'Ms Phone A Friend'
      },
      telecom: [
        {
          system: 'phone',
          value: '0987654321'
        }
      ]
    }
  ],
  communication: [
    {
      language: {
        coding: [
          {
            system: 'urn:ietf:bcp:47',
            code: 'yub'
          }
        ],
        text: 'Yugambal'
      }
    }
  ]
};
