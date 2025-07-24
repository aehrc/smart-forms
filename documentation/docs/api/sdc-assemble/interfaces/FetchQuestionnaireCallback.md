# Interface: FetchQuestionnaireCallback()

To define a method to fetch Questionnaire resources from the FHIR server with the given canonical URL

## See

[https://www.hl7.org/fhir/questionnaire.html](https://www.hl7.org/fhir/questionnaire.html)

## Example

```ts
const fetchQuestionnaireCallback: FetchQuestionnaireCallback = async (
  canonicalUrl: string,
  requestConfig: {url: string, authToken?: string}
) => {
  const { url, authToken } = requestConfig;

  let requestUrl = url;
  if (!requestUrl.endsWith('/')) {
    requestUrl += '/';
  }
  requestUrl += `Questionnaire?url=${canonicalUrl}`;

  const headers = authToken ? { ...HEADERS, Authorization: `Bearer ${authToken}` } : HEADERS;

  const response = await fetch(requestUrl, {
    headers: headers
  });

  if (!response.ok) {
    throw new Error(`HTTP error when performing ${requestUrl}. Status: ${response.status}`);
  }

  return response.json();
};
```

> **FetchQuestionnaireCallback**(`canonicalUrl`, `requestConfig`?): `Promise`\<`any`\>

To define a method to fetch Questionnaire resources from the FHIR server with the given canonical URL

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `canonicalUrl` | `string` | The canonical URL of the Questionnaire resource |
| `requestConfig`? | `any` | Any kind of request configuration necessary (auth, token, etc) |

## Returns

`Promise`\<`any`\>

A promise of the Questionnaire Bundle resource (or an error)!

## See

[https://www.hl7.org/fhir/questionnaire.html](https://www.hl7.org/fhir/questionnaire.html)

## Example

```ts
const fetchQuestionnaireCallback: FetchQuestionnaireCallback = async (
  canonicalUrl: string,
  requestConfig: {url: string, authToken?: string}
) => {
  const { url, authToken } = requestConfig;

  let requestUrl = url;
  if (!requestUrl.endsWith('/')) {
    requestUrl += '/';
  }
  requestUrl += `Questionnaire?url=${canonicalUrl}`;

  const headers = authToken ? { ...HEADERS, Authorization: `Bearer ${authToken}` } : HEADERS;

  const response = await fetch(requestUrl, {
    headers: headers
  });

  if (!response.ok) {
    throw new Error(`HTTP error when performing ${requestUrl}. Status: ${response.status}`);
  }

  return response.json();
};
```
