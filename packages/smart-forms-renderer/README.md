# Smart Forms Renderer
This React-based package acts as the rendering engine for the [Smart Forms app](https://github.com/aehrc/smart-forms).

## Installation
```bash
npm install @aehrc/smart-forms-renderer
```

## Basic Usage

```typescript jsx
import React from 'react';
import { SmartFormsRenderer, getResponse } from 'aehrc/smart-forms-renderer';

export default function App () {
  const questionnaire = {...}   // FHIR R4.Questionnaire
  
  return (
    <div>
      <SmartFormsRenderer questionnaire={questionnaire}/>
      <button onClick={() => {
        const response = getResponse()
        // Do something with the questionnaire response
      }}/>
    </div>  
  )
}

```
### SmartFormsRenderer Props 


| Name                  | Type                                                 | Description                                                                                    | Required? |
|-----------------------|------------------------------------------------------|------------------------------------------------------------------------------------------------|-----------|
| questionnaire         | FHIR R4.Questionnaire                                | Questionnaire to be rendered                                                                   | Required  |
| questionnaireResponse | FHIR R4.QuestionnaireResponse                        | Pre-populated QuestionnaireResponse to be rendered                                             | Optional  |
| additionalVariables   | Record<string, Extension>                            | Key-value pair of [SDC variables](http://hl7.org/fhir/R4/extension-variable.html) <name, variable extension> | Optional  |

The below props are not supported at the moment, but will be in the future.

| Name                 | Type                                                 | Description                                 |
|----------------------|------------------------------------------------------|---------------------------------------------|
| fhirClient           | [Client](https://github.com/smart-on-fhir/client-js) | FhirClient to perform further FHIR calls    |
| terminologyServerUrl | string                                               | Terminology server url to fetch terminology |

### Functions

```javascript
/**
 * Get the filled QuestionnaireResponse at its current state.
 * If no changes have been made to the form, the initial or an empty QuestionnaireResponse is returned.
 *
 * @returns {FHIR R4.QuestionnaireResponse} The filled QuestionnaireResponse
 */
function getResponse() {}
```


## Advanced Usage (If basic usage does not suffice)

```typescript
/* Components */
// A self-initialising wrapper around the rendering engine. This is sufficient for most use cases.

function SmartFormsRenderer(props: {
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  additionalVariables?: Record<string, Extension>
}): JSX.Element {}

// BaseRenderer underneath the SmartFormsRenderer wrapper. Requires buildForm() to initialise form.
function BaseRenderer(): JSX.Element {}

/* Functions */
// Get the filled QuestionnaireResponse at its current state.
// If no changes have been made to the form, the initial QuestionnaireResponse is returned.
function getResponse(): QuestionnaireResponse {}

// Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse.
// If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.
async function buildForm(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse
): Promise<void> {}

// Destroy the form to clean up the questionnaire and questionnaireResponse stores.
function destroyForm(): void {}

// Remove all hidden answers from the filled QuestionnaireResponse.
// This takes into account the questionnaire-hidden extension, enableWhens and enableWhenExpressions.
function removeHiddenAnswersFromResponse(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): QuestionnaireResponse {}
```

The Smart Forms app uses a even finer-grained control which directly interacts with the state management stores.

At the moment there are no plans to document it, but I am happy to do so if there is demand for it.
Raise a request in https://github.com/aehrc/smart-forms/issues if you want to see it happen!

---

Copyright © 2022, Commonwealth Scientific and Industrial Research Organisation (CSIRO) ABN 41 687 119 230. All rights reserved.