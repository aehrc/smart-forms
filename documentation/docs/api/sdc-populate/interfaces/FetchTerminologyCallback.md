# Interface: FetchTerminologyCallback()

To define a method to fetch resources from the FHIR server with a given query string
Method should be able to handle both absolute urls and query strings

## Example

```ts
const ABSOLUTE_URL_REGEX = /^(https?|ftp)://[^\s/$.?#].[^\s]*$/;

const fetchTerminologyCallback: FetchTerminologyCallback = (
  query: string,
  terminologyRequestConfig: TerminologyRequestConfig
) => {
  let { terminologyServerUrl } = terminologyRequestConfig;

  const headers = {
    Accept: 'application/json;charset=utf-8'
  };

  if (!terminologyServerUrl.endsWith('/')) {
    terminologyServerUrl += '/';
  }

  const queryUrl = ABSOLUTE_URL_REGEX.test(query) ? query : terminologyServerUrl + query;

  return axios.get(queryUrl, {
    headers: headers
  });
};
```

> **FetchTerminologyCallback**(`query`, `requestConfig`): `Promise`\<`any`\>

To define a method to fetch resources from the FHIR server with a given query string
Method should be able to handle both absolute urls and query strings

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `query` | `string` | The query URL of the FHIR resource |
| `requestConfig` | [`TerminologyRequestConfig`](TerminologyRequestConfig.md) | Terminology request configs - must have terminologyServerUrl + any key value pair - can be headers, auth tokens or endpoints |

## Returns

`Promise`\<`any`\>

A promise of the FHIR resource (or an error)!

## Example

```ts
const ABSOLUTE_URL_REGEX = /^(https?|ftp)://[^\s/$.?#].[^\s]*$/;

const fetchTerminologyCallback: FetchTerminologyCallback = (
  query: string,
  terminologyRequestConfig: TerminologyRequestConfig
) => {
  let { terminologyServerUrl } = terminologyRequestConfig;

  const headers = {
    Accept: 'application/json;charset=utf-8'
  };

  if (!terminologyServerUrl.endsWith('/')) {
    terminologyServerUrl += '/';
  }

  const queryUrl = ABSOLUTE_URL_REGEX.test(query) ? query : terminologyServerUrl + query;

  return axios.get(queryUrl, {
    headers: headers
  });
};
```
