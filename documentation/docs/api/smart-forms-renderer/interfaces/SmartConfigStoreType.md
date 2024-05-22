# Interface: SmartConfigStoreType

SmartConfigStore properties and methods
Properties can be accessed for fine-grain details.
Methods are usually used internally, using them from an external source is not recommended.

## Method

setClient - Set the FHIRClient object when launching via SMART App Launch

## Method

setPatient - Set the patient resource in context

## Method

setUser - Set the user resource in context

## Method

setEncounter - Set the encounter resource in context

## Properties

### client

> **client**: `null` \| `default`

The FHIRClient object (https://github.com/smart-on-fhir/client-js)

***

### encounter

> **encounter**: `null` \| `Encounter`

The encounter resource in context

***

### patient

> **patient**: `null` \| `Patient`

The patient resource in context

***

### setClient()

> **setClient**: (`client`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `client` | `default` |

#### Returns

`void`

***

### setEncounter()

> **setEncounter**: (`encounter`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `encounter` | `Encounter` |

#### Returns

`void`

***

### setPatient()

> **setPatient**: (`patient`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `patient` | `Patient` |

#### Returns

`void`

***

### setUser()

> **setUser**: (`user`) => `void`

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `user` | `Practitioner` |

#### Returns

`void`

***

### user

> **user**: `null` \| `Practitioner`

The user resource in context
