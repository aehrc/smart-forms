import type { Preview } from '@storybook/react-vite';
import type { Bundle, Condition, Observation, ValueSet } from 'fhir/r4';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/material-icons';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { createTheme } from '@mui/material/styles';
import { CssBaseline, ThemeProvider } from '@mui/material';
import '../src/stories/storybookWrappers/iframeResizerChild.js';

const createObservationBundle = (observation: Observation): Bundle => ({
  resourceType: 'Bundle',
  type: 'searchset',
  total: 1,
  entry: [{ resource: observation }]
});

const formPopulationConditions: Condition[] = [
  {
    resourceType: 'Condition',
    id: 'condition-diabetes-pat-sf',
    subject: {
      reference: 'Patient/pat-sf'
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'problem-list-item'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '44054006',
          display: 'Diabetes mellitus type 2'
        }
      ],
      text: 'Diabetes mellitus type 2'
    },
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
          display: 'Active'
        }
      ]
    },
    onsetDateTime: '2020-01-10',
    recordedDate: '2020-01-15'
  },
  {
    resourceType: 'Condition',
    id: 'condition-asthma-pat-sf',
    subject: {
      reference: 'Patient/pat-sf'
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'problem-list-item'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '195967001',
          display: 'Asthma'
        }
      ],
      text: 'Asthma'
    },
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'resolved',
          display: 'Resolved'
        }
      ]
    },
    onsetDateTime: '2018-05-01',
    recordedDate: '2018-05-03'
  }
];

const formPopulationConditionBundle: Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  total: formPopulationConditions.length,
  entry: formPopulationConditions.map((resource) => ({ resource }))
};

const mockLibrary: Record<string, Bundle | ValueSet> = {
  'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender':
    {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: '2026-01-01T00:00:00Z',
        contains: [
          {
            code: 'female',
            display: 'Female',
            system: 'http://hl7.org/fhir/administrative-gender'
          },
          { code: 'male', display: 'Male', system: 'http://hl7.org/fhir/administrative-gender' },
          { code: 'other', display: 'Other', system: 'http://hl7.org/fhir/administrative-gender' },
          {
            code: 'unknown',
            display: 'Unknown',
            system: 'http://hl7.org/fhir/administrative-gender'
          }
        ]
      }
    },
  'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2':
    {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: '2026-01-01T00:00:00Z',
        contains: [
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'ACT',
            display: 'Australian Capital Territory'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'NSW',
            display: 'New South Wales'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'NT',
            display: 'Northern Territory'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'OTHER',
            display: 'Other territories'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'QLD',
            display: 'Queensland'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'SA',
            display: 'South Australia'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'TAS',
            display: 'Tasmania'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'VIC',
            display: 'Victoria'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'WA',
            display: 'Western Australia'
          }
        ]
      }
    },
  'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://smartforms.csiro.au/ig/ValueSet/MedicalHistory&filter=Asthma&count=10':
    {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: '2026-01-01T00:00:00Z',
        contains: [
          {
            system: 'http://snomed.info/sct',
            code: '195967001',
            display: 'Asthma'
          }
        ]
      }
    },
  'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://smartforms.csiro.au/ig/ValueSet/MedicalHistory&filter=Hypertension&count=10':
    {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: '2026-01-01T00:00:00Z',
        contains: [
          {
            system: 'http://snomed.info/sct',
            code: '38341003',
            display: 'Hypertension'
          }
        ]
      }
    },
  'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/languages':
    {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: '2026-01-01T00:00:00Z',
        contains: [
          {
            system: 'urn:ietf:bcp:47',
            code: 'en',
            display: 'English'
          },
          {
            system: 'urn:ietf:bcp:47',
            code: 'es',
            display: 'Spanish'
          },
          {
            system: 'urn:ietf:bcp:47',
            code: 'fr',
            display: 'French'
          }
        ]
      }
    },
  'https://sqlonfhir-r4.azurewebsites.net/fhir/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/languages':
    {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: '2026-01-01T00:00:00Z',
        contains: [
          {
            system: 'urn:ietf:bcp:47',
            code: 'en',
            display: 'English'
          },
          {
            system: 'urn:ietf:bcp:47',
            code: 'es',
            display: 'Spanish'
          },
          {
            system: 'urn:ietf:bcp:47',
            code: 'fr',
            display: 'French'
          }
        ]
      }
    },
  'https://proxy.smartforms.io/v/r4/fhir/Condition?patient=pat-sf': formPopulationConditionBundle,
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=72166-2&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-smoking-status-pat-sf',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '72166-2', display: 'Tobacco smoking status' }]
      },
      valueCodeableConcept: {
        coding: [{ system: 'http://snomed.info/sct', code: '8517006', display: 'Ex-Smoker' }]
      }
    }),
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=8302-2&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-height-pat-sf',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '8302-2', display: 'Body height' }]
      },
      valueQuantity: { value: 163, unit: 'cm', system: 'http://unitsofmeasure.org', code: 'cm' }
    }),
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=29463-7&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-weight-pat-sf',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '29463-7', display: 'Body weight' }]
      },
      valueQuantity: { value: 77.3, unit: 'kg', system: 'http://unitsofmeasure.org', code: 'kg' }
    }),
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=9843-4&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-head-circumference-pat-sf',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '9843-4',
            display: 'Head Occipital-frontal circumference'
          }
        ]
      },
      valueQuantity: { value: 56.1, unit: 'cm', system: 'http://unitsofmeasure.org', code: 'cm' }
    }),
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=8280-0&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-waist-circumference-pat-sf',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8280-0',
            display: 'Waist Circumference at umbilicus by Tape measure'
          }
        ]
      },
      valueQuantity: { value: 91.4, unit: 'cm', system: 'http://unitsofmeasure.org', code: 'cm' }
    }),
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=85354-9&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-blood-pressure-pat-sf',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '85354-9',
            display: 'Blood pressure panel with all children optional'
          }
        ]
      },
      component: [
        {
          code: {
            coding: [
              { system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }
            ]
          },
          valueQuantity: {
            value: 124,
            unit: 'mm[Hg]',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        },
        {
          code: {
            coding: [
              { system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }
            ]
          },
          valueQuantity: {
            value: 78,
            unit: 'mm[Hg]',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        }
      ]
    }),
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=8867-4&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-heart-rate-pat-sf',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }]
      },
      valueQuantity: {
        value: 72,
        unit: 'beats/minute',
        system: 'http://unitsofmeasure.org',
        code: '/min'
      }
    }),
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=14647-2&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-total-cholesterol-pat-sf',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '14647-2',
            display: 'Cholesterol [Moles/volume] in Serum or Plasma'
          }
        ]
      },
      valueQuantity: {
        value: 5.4,
        unit: 'mmol/L',
        system: 'http://unitsofmeasure.org',
        code: 'mmol/L'
      }
    }),
  'https://proxy.smartforms.io/v/r4/fhir/Observation?code=14646-4&_count=1&_sort=-date&patient=pat-sf':
    createObservationBundle({
      resourceType: 'Observation',
      id: 'observation-hdl-cholesterol-pat-sf',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '14646-4',
            display: 'Cholesterol in HDL [Moles/volume] in Serum or Plasma'
          }
        ]
      },
      valueQuantity: {
        value: 1.6,
        unit: 'mmol/L',
        system: 'http://unitsofmeasure.org',
        code: 'mmol/L'
      }
    })
};

// If running CI tests, override the global fetch function to return mock responses for specific URLs.
// This allows Storybook stories to work with predictable test data without relying on real network requests.
// @ts-expect-error - `import.meta.env` typing differs in Storybook runtime
const isCI = import.meta.env.VITE_CI === 'true';
if (isCI) {
  const ciFetch: typeof fetch = async (input) => {
    const url =
      typeof input === 'string' ? input.trim() : input instanceof URL ? input.href : input.url;

    if (mockLibrary[url]) {
      return new Response(JSON.stringify(mockLibrary[url]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Mock not found for ' + url }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  global.fetch = ciFetch;
}

export const decorators = [
  withThemeFromJSXProvider({
    themes: { light: createTheme() },
    defaultTheme: 'light',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline
  })
];

const preview: Preview = {
  parameters: {
    actions: {},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    options: {
      // The `a` and `b` arguments in this function have a type of `import('storybook/internal/types').IndexEntry`. Remember that the function is executed in a JavaScript environment, so use JSDoc for IntelliSense to introspect it.
      storySort: (a, b) => {
        const getFolder = (id) => id.split('-')[0].toLowerCase();

        // Enforce folder sequence: itemtype, SDC, custom, testing
        const folderOrder = ['itemtype', 'sdc', 'custom', 'testing'];
        const aFolderIndex = folderOrder.indexOf(getFolder(a.id));
        const bFolderIndex = folderOrder.indexOf(getFolder(b.id));
        if (aFolderIndex !== bFolderIndex) {
          return aFolderIndex - bFolderIndex;
        }

        /* Put 'Overview' MDX files at the top e.g. itemtype-overview--docs if Meta title="ItemType/Overview" on an MDX file */
        if (typeof a.id === 'string' && a.id.includes('overview--docs')) {
          return -1;
        }

        if (typeof b.id === 'string' && b.id.includes('overview--docs')) {
          return 1;
        }

        /* Default to sorting alphabetically */
        return a.id === b.id ? 0 : a.id.localeCompare(b.id, undefined, { numeric: true });
      }
    }
  }
};

export default preview;
