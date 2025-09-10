import type { Preview } from '@storybook/react-vite';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/material-icons';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { createTheme } from '@mui/material/styles';
import { CssBaseline, ThemeProvider } from '@mui/material';
import '../src/stories/storybookWrappers/iframeResizerChild.js';

const mockLibrary: Record<string, unknown> = {
  'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender':
    {
      resourceType: 'ValueSet',
      expansion: {
        contains: [
          {
            code: 'female',
            display: 'Female',
            system: 'http://hl7.org/fhir/administrative-gender'
          },
          { code: 'male', display: 'Male', system: 'http://hl7.org/fhir/administrative-gender' }
        ]
      }
    }
};

// Override the global fetch function to return mock responses for specific URLs.
// This allows Storybook stories to work with predictable test data without relying on real network requests.

global.fetch = (async (input: RequestInfo | URL) => {
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
}) as typeof fetch;

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
      storySort: (a, b) =>
        a.id === b.id ? 0 : a.id.localeCompare(b.id, undefined, { numeric: true })
    }
  }
};

export default preview;
