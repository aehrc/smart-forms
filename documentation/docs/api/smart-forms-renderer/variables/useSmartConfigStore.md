# Variable: useSmartConfigStore

> `const` **useSmartConfigStore**: `StoreApi`\<[`SmartConfigStoreType`](../interfaces/SmartConfigStoreType.md)\> & `object`

Smart Config state management store. This is only used for answerExpressions.
It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities.
Will be deprecated in version 1.0.0.

This is the React version of the store which can be used as React hooks in React functional components.

## Type Declaration

### use

> **use**: `object`

#### use.client()

> **client**: () => `Client` \| `null`

##### Returns

`Client` \| `null`

#### use.encounter()

> **encounter**: () => `Encounter` \| `null`

##### Returns

`Encounter` \| `null`

#### use.fhirContext()

> **fhirContext**: () => `FhirContext`[] \| `null`

##### Returns

`FhirContext`[] \| `null`

#### use.patient()

> **patient**: () => `Patient` \| `null`

##### Returns

`Patient` \| `null`

#### use.setClient()

> **setClient**: () => (`client`) => `void`

##### Returns

> (`client`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | `Client` |

###### Returns

`void`

#### use.setEncounter()

> **setEncounter**: () => (`encounter`) => `void`

##### Returns

> (`encounter`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `encounter` | `Encounter` |

###### Returns

`void`

#### use.setFhirContext()

> **setFhirContext**: () => (`fhirContext`) => `void`

##### Returns

> (`fhirContext`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `fhirContext` | `FhirContext`[] |

###### Returns

`void`

#### use.setPatient()

> **setPatient**: () => (`patient`) => `void`

##### Returns

> (`patient`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `patient` | `Patient` |

###### Returns

`void`

#### use.setUser()

> **setUser**: () => (`user`) => `void`

##### Returns

> (`user`): `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `user` | `Practitioner` |

###### Returns

`void`

#### use.user()

> **user**: () => `Practitioner` \| `null`

##### Returns

`Practitioner` \| `null`

## See

 - [SmartConfigStoreType](../interfaces/SmartConfigStoreType.md) for available properties and methods.
 - [smartConfigStore](smartConfigStore.md) for the vanilla store.
