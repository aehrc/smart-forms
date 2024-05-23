# Variable: useSmartConfigStore

> `const` **useSmartConfigStore**: `StoreApi` \<[`SmartConfigStoreType`](../interfaces/SmartConfigStoreType.md)\> & `object`

Smart Config state management store. This is only used for answerExpressions.
It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities.
Will be deprecated in version 1.0.0.

This is the React version of the store which can be used as React hooks in React functional components.

## See

 - SmartConfigStoreType for available properties and methods.
 - smartConfigStore for the vanilla store.

## Type declaration

### use

> **use**: `object`

### use.client()

> **client**: () => `null` \| `default`

#### Returns

`null` \| `default`

### use.encounter()

> **encounter**: () => `null` \| `Encounter`

#### Returns

`null` \| `Encounter`

### use.patient()

> **patient**: () => `null` \| `Patient`

#### Returns

`null` \| `Patient`

### use.setClient()

> **setClient**: () => (`client`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `default` |

##### Returns

`void`

### use.setEncounter()

> **setEncounter**: () => (`encounter`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `encounter` | `Encounter` |

##### Returns

`void`

### use.setPatient()

> **setPatient**: () => (`patient`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `patient` | `Patient` |

##### Returns

`void`

### use.setUser()

> **setUser**: () => (`user`) => `void`

#### Returns

`Function`

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `user` | `Practitioner` |

##### Returns

`void`

### use.user()

> **user**: () => `null` \| `Practitioner`

#### Returns

`null` \| `Practitioner`
