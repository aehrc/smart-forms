# Interface: InputParameters

Input parameters for the $populate operation

## See

[http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-populate](http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-populate)

## Extends

- `Parameters`

## Properties

### \_id?

> `optional` **\_id**: `Element`

#### Inherited from

`Parameters._id`

***

### \_implicitRules?

> `optional` **\_implicitRules**: `Element`

#### Inherited from

`Parameters._implicitRules`

***

### \_language?

> `optional` **\_language**: `Element`

#### Inherited from

`Parameters._language`

***

### id?

> `optional` **id**: `string`

The only time that a resource does not have an id is when it is being submitted to the server using a create operation.

#### Inherited from

`Parameters.id`

***

### implicitRules?

> `optional` **implicitRules**: `string`

Asserting this rule set restricts the content to be only understood by a limited set of trading partners. This inherently limits the usefulness of the data in the long term. However, the existing health eco-system is highly fractured, and not yet ready to define, collect, and exchange data in a generally computable sense. Wherever possible, implementers and/or specification writers should avoid using this element. Often, when used, the URL is a reference to an implementation guide that defines these special rules as part of it's narrative along with other profiles, value sets, etc.

#### Inherited from

`Parameters.implicitRules`

***

### language?

> `optional` **language**: `string`

Language is provided to support indexing and accessibility (typically, services such as text to speech use the language tag). The html language tag in the narrative applies  to the narrative. The language tag on the resource may be used to specify the language of other presentations generated from the data in the resource. Not all the content has to be in the base language. The Resource.language should not be assumed to apply to the narrative automatically. If a language is specified, it should it also be specified on the div element in the html (see rules in HTML5 for information about the relationship between xml:lang and the html lang attribute).

#### Inherited from

`Parameters.language`

***

### meta?

> `optional` **meta**: `Meta`

The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource.

#### Inherited from

`Parameters.meta`

***

### parameter

> **parameter**: `InputParamsArray`

#### Overrides

`Parameters.parameter`

***

### resourceType

> `readonly` **resourceType**: `"Parameters"`

Resource Type Name (for serialization)

#### Inherited from

`Parameters.resourceType`
