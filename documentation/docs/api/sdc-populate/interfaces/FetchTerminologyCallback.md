# Interface: FetchTerminologyCallback()

To define a method to fetch resources from the FHIR server with a given query string
Method should be able to handle both absolute urls and query strings

## Example

```ts
const ABSOLUTE_URL_REGEX = /^(https?|ftp)://[^\s/$.?#].[^\s]*$/;

export const fetchTerminologyCallback: FetchTerminologyCallback = async (
  query: string,
  requestConfig: FetchTerminologyRequestConfig
) => {
  let { terminologyServerUrl } = requestConfig;

  const headers: Record<string, string> = {
    Accept: 'application/json;charset=utf-8'
  };

  if (!terminologyServerUrl.endsWith('/')) {
    terminologyServerUrl += '/';
  }

  const requestUrl = ABSOLUTE_URL_REGEX.test(query) ? query : `${terminologyServerUrl}${query}`;
  const response = await fetch(requestUrl, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error when performing ${requestUrl}. Status: ${response.status}`);
  }

  return response.json();
};
```

> **FetchTerminologyCallback**(`query`, `requestConfig`): `Promise`\<`any`\>

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `query` | `string` | The query URL of the FHIR resource |
| `requestConfig` | [`FetchTerminologyRequestConfig`](FetchTerminologyRequestConfig.md) | Terminology request configs - must have terminologyServerUrl + any key value pair - can be headers, auth tokens or endpoints |

## Returns

`Promise`\<`any`\>

A promise of the FHIR resource (or an error)!
