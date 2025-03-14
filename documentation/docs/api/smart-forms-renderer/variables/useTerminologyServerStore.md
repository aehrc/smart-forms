# Variable: useTerminologyServerStore

> `const` **useTerminologyServerStore**: `StoreApi`\<[`TerminologyServerStoreType`](../interfaces/TerminologyServerStoreType.md)\> & `object`

Terminology server state management store. This is used for resolving valueSets externally.
Defaults to use https://tx.ontoserver.csiro.au/fhir.
This is the React version of the store which can be used as React hooks in React functional components.

## Type declaration

### use

> **use**: `object`

#### use.resetUrl()

> **resetUrl**: () => () => `void`

##### Returns

`Function`

###### Returns

`void`

#### use.setUrl()

> **setUrl**: () => (`newUrl`) => `void`

##### Returns

`Function`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `newUrl` | `string` |

###### Returns

`void`

#### use.url()

> **url**: () => `string`

##### Returns

`string`

## See

TerminologyServerStoreType for available properties and methods.
