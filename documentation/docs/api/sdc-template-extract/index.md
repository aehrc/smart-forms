# @aehrc/sdc-template-extract

## Interfaces

| Interface | Description |
| ------ | ------ |
| [CustomDebugInfoParameter](interfaces/CustomDebugInfoParameter.md) | - |
| [ExtractResult](interfaces/ExtractResult.md) | - |
| [FetchQuestionnaireCallback](interfaces/FetchQuestionnaireCallback.md) | To define a method to fetch resources from the FHIR server with a given query string Method should be able to handle both absolute urls and query strings |
| [FetchQuestionnaireRequestConfig](interfaces/FetchQuestionnaireRequestConfig.md) | - |
| [FetchQuestionnaireResolver](interfaces/FetchQuestionnaireResolver.md) | - |
| [FhirPatchParameterEntry](interfaces/FhirPatchParameterEntry.md) | - |
| [FhirPatchParameters](interfaces/FhirPatchParameters.md) | Interface representing a https://build.fhir.org/fhirpatch.html |
| [InAppExtractOutput](interfaces/InAppExtractOutput.md) | - |
| [InputParameters](interfaces/InputParameters.md) | Input parameters for the $extract operation |
| [IssuesParameter](interfaces/IssuesParameter.md) | - |
| [OutputParameters](interfaces/OutputParameters.md) | Output parameters for the $extract operation |
| [ReturnParameter](interfaces/ReturnParameter.md) | - |
| [TemplateExtractDebugInfo](interfaces/TemplateExtractDebugInfo.md) | - |
| [TemplateExtractPathJsObject](interfaces/TemplateExtractPathJsObject.md) | - |
| [TemplateExtractValueEvaluation](interfaces/TemplateExtractValueEvaluation.md) | Result of evaluating a `valueExpression` from the `templateExtractValue` extension. e.g. `"item.where(linkId = 'family').answer.value.first()"` → `"Doe"` |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [QuestionnaireOrCallback](type-aliases/QuestionnaireOrCallback.md) | - |
| [TemplateExtractPathJsObjectTuple](type-aliases/TemplateExtractPathJsObjectTuple.md) | - |

## Functions

| Function | Description |
| ------ | ------ |
| [canBeTemplateExtracted](functions/canBeTemplateExtracted.md) | Checks whether a Questionnaire or any of its items contains a valid `sdc-questionnaire-templateExtract` extension with a required `template` slice. Array.prototype.some() is short-circuiting, so it will return true as soon as it finds a valid extension. |
| [createInputParameters](functions/createInputParameters.md) | Create input parameters to be passed to sdc-template-extract extract(). Questionnaire parameter is optional. Refer to https://build.fhir.org/ig/HL7/sdc/OperationDefinition-QuestionnaireResponse-extract.html. |
| [extract](functions/extract.md) | - |
| [extractResultIsOperationOutcome](functions/extractResultIsOperationOutcome.md) | - |
| [inAppExtract](functions/inAppExtract.md) | An abstraction layer over the SDC `extract()` function, which implements the `$extract` operation. |
| [logTemplateExtractPathMapFull](functions/logTemplateExtractPathMapFull.md) | Logs a summary table of all extractable context and value paths from a given template. Useful for debugging or inspecting the structure of a `TemplateExtractPath` map. |
| [logTemplateExtractPathMapJsObjectFull](functions/logTemplateExtractPathMapJsObjectFull.md) | - |
| [logTemplateExtractPathMapJsObjectResults](functions/logTemplateExtractPathMapJsObjectResults.md) | - |
| [logTemplateExtractPathMapResults](functions/logTemplateExtractPathMapResults.md) | Logs a simplified table showing only the entry path, evaluated context result, and the evaluated value result for each extractable template path. |
| [objIsTemplateExtractDebugInfo](functions/objIsTemplateExtractDebugInfo.md) | - |
| [parametersIsFhirPatch](functions/parametersIsFhirPatch.md) | - |
