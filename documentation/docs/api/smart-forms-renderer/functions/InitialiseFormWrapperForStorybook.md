# Function: InitialiseFormWrapperForStorybook()

> **InitialiseFormWrapperForStorybook**(`props`): `Element`

This is a one-to-one replacement for the SmartFormsRenderer for demo purposes.
Instead of using this React component, define your own wrapper component that uses the BaseRenderer directly.
Things to note:
- It is required to wrap the BaseRenderer with the QueryClientProvider to make requests.
- You can wrap the BaseRenderer with the RendererThemeProvider to apply the default renderer theme used in Smart Forms. Optionally, you can define your own ThemeProvider https://mui.com/material-ui/customization/theming/.
- Make your buildForm() call in a button click or other event handler. Alternatively, you can use the useInitialiseForm hook to initialise the form.
- Make your own initialiseFhirClient() call in a button click or other event handler. Alternatively, you can use the useInitialiseForm hook to initialise the form.
- The initialised FHIRClient is only used for further FHIR calls. It does not provide pre-population capabilities.

For button click usage examples of buildForm(), see:
- https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/BuildFormButtonTesterWrapperForStorybook.tsx
- https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/BuildFormButtonForStorybook.tsx
- https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/PrePopWrapperForStorybook.tsx
- https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/PrePopButtonForStorybook.tsx

## Parameters

| Parameter | Type |
| :------ | :------ |
| `props` | [`InitialiseFormWrapperProps`](../interfaces/InitialiseFormWrapperProps.md) |

## Returns

`Element`
