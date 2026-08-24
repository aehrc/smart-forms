import { beforeEach, vi } from 'vitest';
import { destroyForm } from '@aehrc/smart-forms-renderer';

// Every request resolves to an empty object, so any item backed by an external answerValueSet
// renders without options. Without this mock, getValueSetPromise throws `client is not a
// function`, buildForm rejects, and the form never leaves `Loading...`.
vi.mock('fhirclient', () => ({
  client: () => ({
    request: vi.fn(() => Promise.resolve({}))
  })
}));

// jsdom has no ResizeObserver; the renderer's layout components require one.
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// The renderer keeps form state in module-level stores that outlive an unmounted component, so
// every test in a file shares them. buildForm happens to overwrite all of them but
// formChangesHistory, which makes the isolation an accident of renderer internals rather than
// something these tests ask for. destroyForm is the documented lifecycle — the application calls
// it before building a new form — so call it here and stop depending on the accident.
beforeEach(() => {
  destroyForm();
});
