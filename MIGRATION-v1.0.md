# Migration Guide for @aehrc/smart-forms-renderer v1.0.0

**Major Breaking Changes** — This release introduces significant API changes. Please review the guide below to update your code accordingly.

This guide applies to users migrating from versions `0.45.1` and `1.0.0-alpha.x`.

## 1. `buildForm()` and `useBuildForm()` changes

### Before

```ts
await buildForm(
  questionnaire,
  questionnaireResponse,
  terminologyServerUrl,
  additionalVariables
);
```

### After

```ts
await buildForm({
  questionnaire,
  questionnaireResponse,
  terminologyServerUrl,
  additionalContext, // replaces additionalVariables
});
```

### Notes

* Both `buildForm()` and `useBuildForm()` now accept a single `BuildFormParams` object instead of multiple parameters.
* `additionalVariables` → **renamed to** `additionalContext`.

  * Functionally identical — used to inject additional FHIRPath context variables.
* A new helper, **`repopulateForm()`**, allows reloading a form with a new `QuestionnaireResponse` and/or `additionalContext` while preserving the current `QuestionnaireStore` state.
  * Its parameters are defined in the interface `RepopulateFormParams`.
  ```ts
  repopulateForm({
    questionnaire,
    additionalContext,
  });
  ```

---

## 2. `QuestionnaireStore` and `QuestionnaireResponseStore` changes

### Removed Functions

For pre-population/re-population, you do not need to call `QuestionnaireStore.updatePopulatedProperties` and `QuestionnaireResponseStore.setUpdatableResponseAsPopulated` anymore. 

Both of these functions are now removed. `buildForm()`, `useBuildForm()` and `repopulateForm()` will take care of it for you.

If you were previously calling `QuestionnaireStore.setPopulatedContext` to inject populatedContext into the renderer, you can also remove that call as it is now handled internally.

The following are **no longer required** and should be **removed**:

```ts
// ❌ Remove these lines
const updatedResponse = await updatePopulatedProperties(populatedResponse, populatedContext);
setUpdatableResponseAsPopulated(updatedResponse);

if (populatedContext) {
  setPopulatedContext(populatedContext, true);
}
```

### Replacement

Use `buildForm()` or `repopulateForm()` directly:

```ts
// ✅ Updated
await buildForm({
  questionnaire: sourceQuestionnaire,
  questionnaireResponse: populatedResponse,
  terminologyServerUrl: defaultTerminologyServerUrl,
  additionalContext: populatedContext,
});

// or

repopulateForm({
  questionnaire,
  additionalContext,
});
```

### Property and Setter Renames

| Old Name                | New Name                 | Notes                                             |
| ----------------------- | ------------------------ |---------------------------------------------------|
| `populatedContext`      | `additionalContext`      | Automatically managed by buildForm/repopulateForm |
| `setPopulatedContext()` | `setAdditionalContext()` | Should no longer be called manually               |

---

## 3. Cleaning Up Form States

It is still recommended to create yor own wrapper to destroy existing form states before rebuilding a new form:

```ts
// Define your own wrapper function in your project
async function resetAndBuildForm(params: BuildFormParams) {
  destroyForm(); // clean up old form states
  await buildForm(params); // build new form
}
```

---

## 4. Renderer Styling Changes

### Renaming

`RendererStylingStore` now has a new name `RendererConfigStore` to correctly reflect its purpose of configuring both appearance and behaviour. This is purely a naming change.

| Old Name                  | New Name                 |
|---------------------------|--------------------------|
| `RendererStylingStore`    | `RendererConfigStore`    |
| `useRendererStylingStore` | `useRendererConfigStore` |
| `RendererStyling`         | `RendererConfig`         |

### New Option in `buildForm()` and `useBuildForm()`

You can now pass `rendererConfigOptions` directly into `buildForm()` or `useBuildForm()`:

```ts
await buildForm({
  questionnaire,
  rendererConfigOptions: {
    hideClearButton: true,
    ...
  },
});
```

You no longer need to call `setRendererConfigStore()` manually.

---

## 5. Removed Hooks and Utility Functions

| Removed                         | Replacement / Action                                                   |
| ------------------------------- | ---------------------------------------------------------------------- |
| `useStringCalculatedExpression` | No replacement needed – handled internally                             |
| `useCodingCalculatedExpression` | No replacement needed – handled internally                             |
| `objectIsCoding`                | Removed – remove usage or replace with inline type checks if necessary |

### Notes

* Calculated expressions are now automatically handled by an internal task queue.
* If you previously used the removed hooks in component overrides, you can safely delete them.

If you are still having issues after completing these updates, please drop us a ticket on https://github.com/aehrc/smart-forms/issues so we can update this guide.
