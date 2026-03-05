# Interface: SmartConfigStoreType

SmartConfigStore properties and methods
Properties can be accessed for fine-grain details.
Methods are usually used internally, using them from an external source is not recommended.

## Properties

### client

> **client**: `Client` \| `null`

The FHIRClient object (https://github.com/smart-on-fhir/client-js)

***

### encounter

> **encounter**: `Encounter` \| `null`

The encounter resource in context

***

### fhirContext

> **fhirContext**: `FhirContext`[] \| `null`

fhirContext array from SMART App Launch

***

### patient

> **patient**: `Patient` \| `null`

The patient resource in context

***

### resolvedFhirContextReferences

> **resolvedFhirContextReferences**: `Record`\<`string`, `FhirResource`\> \| `null`

resolved references from fhirContext, keyed by resource type e.g. `{ "PractitionerRole": <PractitionerRole> }`

***

### setClient()

> **setClient**: (`client`) => `void`

Set the FHIRClient object when launching via SMART App Launch

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | `Client` |

#### Returns

`void`

***

### setEncounter()

> **setEncounter**: (`encounter`) => `void`

Set the encounter resource in context

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `encounter` | `Encounter` |

#### Returns

`void`

***

### setFhirContext()

> **setFhirContext**: (`fhirContext`) => `void`

Set the fhirContext array from SMART App Launch

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fhirContext` | `FhirContext`[] |

#### Returns

`void`

***

### setPatient()

> **setPatient**: (`patient`) => `void`

Set the patient resource in context

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `patient` | `Patient` |

#### Returns

`void`

***

### setResolvedFhirContextReferences()

> **setResolvedFhirContextReferences**: (`resolvedFhirContextReferences`) => `void`

Set the resolvedFhirContextReferences object

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `resolvedFhirContextReferences` | `Record`\<`string`, `FhirResource`\> |

#### Returns

`void`

***

### setUser()

> **setUser**: (`user`) => `void`

Set the user resource in context

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `user` | `Practitioner` |

#### Returns

`void`

***

### user

> **user**: `Practitioner` \| `null`

The user resource in context
