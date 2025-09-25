# Variable: useSmartConfigStore

> `const` **useSmartConfigStore**: `StoreApi`\<[`SmartConfigStoreType`](../interfaces/SmartConfigStoreType.md)\> & `object`

Smart Config state management store. This is only used for answerExpressions.
It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities.
Will be deprecated in version 1.0.0.

This is the React version of the store which can be used as React hooks in React functional components.

## Type declaration

### use

> **use**: `object`

#### use.client()

> **client**: () => `null` \| `Client`

##### Returns

`null` \| `Client`

#### use.encounter()

> **encounter**: () => `null` \| `Encounter`

##### Returns

`null` \| `Encounter`

#### use.fhirContext()

> **fhirContext**: () => `null` \| `FhirContext`[]

##### Returns

`null` \| `FhirContext`[]

#### use.patient()

> **patient**: () => `null` \| `Patient`

##### Returns

`null` \| `Patient`

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

> **user**: () => `null` \| `Practitioner`

##### Returns

`null` \| `Practitioner`

## See

 - SmartConfigStoreType for available properties and methods.
 - smartConfigStore for the vanilla store.
