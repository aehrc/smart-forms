# Interface: FetchResourceCallback()

To define a method to fetch resources from the FHIR server with a given query string
Method should be able to handle both absolute urls and query strings

## Example

```ts
const ABSOLUTE_URL_REGEX = /^(https?|ftp)://[^\s/$.?#].[^\s]*$/;

const fetchResourceCallback: FetchResourceCallback = (canonicalUrl: string, requestConfig: any) => {
const { clientEndpoint, authToken } = requestConfig
const headers = {
    'Cache-Control': 'no-cache',
    Accept: 'application/json;charset=utf-8',
    Authorization: `Bearer ${authToken}`
  };

  if (ABSOLUTE_URL_REGEX.test(query)) {
    return axios.get(query, {
      headers: headers
    });
  } else {
    return axios.get(clientEndpoint + query, {
      headers: headers
    });
  }
};
```

> **FetchResourceCallback**(`query`, `requestConfig`?): `Promise`\<`any`\>

## Parameters

| Parameter | Type |
| :------ | :------ |
| `query` | `string` |
| `requestConfig`? | `any` |

## Returns

`Promise`\<`any`\>
