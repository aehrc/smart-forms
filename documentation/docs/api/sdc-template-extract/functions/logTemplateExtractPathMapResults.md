# Function: logTemplateExtractPathMapResults()

> **logTemplateExtractPathMapResults**(`templateId`, `templateExtractPathMap`): `void`

Logs a simplified table showing only the entry path, evaluated context result,
and the evaluated value result for each extractable template path.

This is useful for quickly verifying extracted values without inspecting the full expression logic.

Each row includes:
- `entryPath`: The FHIRPath location in the resource,
- `valueResult`: The result of evaluating the value expression.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `templateId` | `string` | The identifier for the template being logged. |
| `templateExtractPathMap` | `Map`\<`string`, `TemplateExtractPath`\> | A map of FHIRPath entries to `TemplateExtractPath` objects, representing extract contexts and value expressions. |

## Returns

`void`

## Example

Example output:

```
🔹 Result columns for: PatientTemplate

| entryPath             | valueResult            |
|-----------------------|------------------------|
| Patient.identifier[0] | [ "8003608833357361" ] |
| Patient.name[0]       | [ "Jane" ]             |
| Patient.name[0]       | [ "Doe" ]              |
| Patient.telecom[0]    | [ "0491 572 665" ]     |
| Patient._gender       | [ "female" ]           |
```
