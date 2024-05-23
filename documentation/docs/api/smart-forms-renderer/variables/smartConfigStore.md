# Variable: smartConfigStore

> `const` **smartConfigStore**: `StoreApi` \<[`SmartConfigStoreType`](../interfaces/SmartConfigStoreType.md)\>

Smart Config state management store. This is only used for answerExpressions.
It is recommended to manage the state of the FHIRClient, patient, user, and encounter in the parent application, since the renderer doesn't provide pre-population capabilities.
Will be deprecated in version 1.0.0.

This is the vanilla version of the store which can be used in non-React environments.

## See

SmartConfigStoreType for available properties and methods.
