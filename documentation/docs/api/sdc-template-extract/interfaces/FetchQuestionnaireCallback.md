# Interface: FetchQuestionnaireCallback()

To define a method to fetch resources from the FHIR server with a given query string
Method should be able to handle both absolute urls and query strings

## Example

```ts
const ABSOLUTE_URL_REGEX = /^(https?|ftp)://[^\s/$.?#].[^\s]*$/;

export const fetchQuestionnaireCallback: FetchQuestionnaireCallback = async (
  query: string,
  requestConfig: FetchQuestionnaireRequestConfig
) => {
  let { sourceServerUrl } = requestConfig;
  const { authToken } = requestConfig;

  const headers: Record<string, string> = {
    Accept: 'application/json;charset=utf-8'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (!sourceServerUrl.endsWith('/')) {
    sourceServerUrl += '/';
  }

  const requestUrl = ABSOLUTE_URL_REGEX.test(query) ? query : `${sourceServerUrl}${query}`;
  const response = await fetch(requestUrl, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error when performing ${requestUrl}. Status: ${response.status}`);
  }

  return response.json();
};
```

> **FetchQuestionnaireCallback**(`query`, `requestConfig`): `Promise`\<`any`\>

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `query` | `string` | The query URL of the FHIR resource |
| `requestConfig` | [`FetchQuestionnaireRequestConfig`](FetchQuestionnaireRequestConfig.md) | Questionnaire request configs - must have sourceServerUrl + any key value pair - can be headers, auth tokens or endpoints |

## Returns

`Promise`\<`any`\>

A promise of the FHIR resource (or an error)!
