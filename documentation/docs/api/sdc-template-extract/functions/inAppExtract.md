# Function: inAppExtract()

> **inAppExtract**(`questionnaireResponse`, `questionnaireOrCallback`, `comparisonSourceResponse`): `Promise`\<[`InAppExtractOutput`](../interfaces/InAppExtractOutput.md)\>

An abstraction layer over the SDC `extract()` function, which implements the `$extract` operation.

This utility handles:
- Packing of input parameters (e.g., QuestionnaireResponse, Questionnaire, comparison source).
- Unpacking of output parameters (e.g., return Bundle, issues, debug info).
- Optional fallback handling when a Questionnaire resource is not provided directly.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `questionnaireResponse` | `QuestionnaireResponse` | The primary `QuestionnaireResponse` to extract data from. |
| `questionnaireOrCallback` | [`QuestionnaireOrCallback`](../type-aliases/QuestionnaireOrCallback.md) | Either a `Questionnaire` resource or a fetch/callback configuration for dynamic retrieval. |
| `comparisonSourceResponse` | `QuestionnaireResponse` \| `null` | An optional `QuestionnaireResponse` used for comparison when extracting. If this is provided, only "modified" items will be extracted. |

## Returns

`Promise`\<[`InAppExtractOutput`](../interfaces/InAppExtractOutput.md)\>

A promise resolving to an `InAppExtractOutput`:
- On success: `{ extractSuccess: true, extractResult: { extractedBundle, issues?, debugInfo? } }`
- On failure: `{ extractSuccess: false, extractResult: OperationOutcome }`
