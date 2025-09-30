# Interface: FhirContext

Represents a contextual FHIR resource reference passed during app launch.

Used in the `fhirContext` array to describe resources relevant to the launch,
excluding `Patient` and `Encounter` which remain top-level parameters unless a custom role is specified.

At least one of `reference`, `canonical`, or `identifier` must be present.

Properties:
- `reference`: A relative reference to a FHIR resource (e.g. "Observation/123").
- `canonical`: A canonical URL referencing the resource (optionally with version).
- `identifier`: A FHIR `Identifier` object used to locate the resource.
- `type`: The resource type (e.g. "Observation"). Recommended when using `canonical` or `identifier`.
- `role`: URI describing the role of the context resource. If omitted, defaults to `"launch"`.
          Use an absolute URI unless using a predefined role from the fhirContext Role Registry.

Notes:
- Multiple `fhirContext` items may reference the same resource type.
- When `role` is `"launch"`, it indicates the app was launched in context of that resource.
- `Patient` and `Encounter` are only allowed in `fhirContext` if a non-launch role is specified.

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### canonical?

> `optional` **canonical**: `string`

***

### identifier?

> `optional` **identifier**: `Identifier`

***

### reference?

> `optional` **reference**: `string`

***

### role?

> `optional` **role**: `string`

***

### type?

> `optional` **type**: `string`
