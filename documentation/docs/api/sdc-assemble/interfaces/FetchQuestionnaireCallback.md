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

## Parameters

| Parameter | Type |
| :------ | :------ |
| `canonicalUrl` | `string` |
| `requestConfig`? | `any` |

## Returns

`Promise`\<`any`\>
