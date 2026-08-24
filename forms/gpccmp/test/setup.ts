import { beforeEach, vi } from 'vitest';
import { destroyForm } from '@aehrc/smart-forms-renderer';
import smokingStatus from './terminology/smoking-status-1.json';
import alcoholIntakeStatus from './terminology/alcohol-intake-status-1.json';
import australianStatesTerritories from './terminology/australian-states-territories-2.json';

// The renderer resolves external answerValueSets through fhirclient. Left unmocked,
// getValueSetPromise throws `client is not a function`, buildForm rejects, and the form never
// leaves `Loading...`. Mocked to `{}`, a choice item renders with no options and therefore no
// input element at all — so the expansions below are what make those items selectable.
// See terminology/PROVENANCE.md for where they came from and how to refresh them.
const expansions: Record<string, unknown> = {
  'https://healthterminologies.gov.au/fhir/ValueSet/smoking-status-1': smokingStatus,
  'https://healthterminologies.gov.au/fhir/ValueSet/alcohol-intake-status-1': alcoholIntakeStatus,
  'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2':
    australianStatesTerritories
};

// getValueSetPromise splits any absolute `…/ValueSet/$expand?url=…` into a server URL and a
// ValueSet URL, then requests `ValueSet/$expand?url={valueSetUrl}` — optionally with `|version`
// rewritten to `&version=`. Match on the ValueSet URL alone; the version is not pinned by the
// questionnaire and the fixtures hold one expansion each.
vi.mock('fhirclient', () => ({
  client: () => ({
    request: vi.fn(({ url }: { url: string }) => {
      const valueSetUrl = url.replace(/^ValueSet\/\$expand\?url=/, '').split('&version=')[0];
      return Promise.resolve(expansions[valueSetUrl] ?? {});
    })
  })
}));

// Nothing in this suite may reach the network. `fhirclient` is the only HTTP client in the
// dependency chain and it is mocked above, so this guard is not what makes the suite offline — it
// is what keeps it that way. Without it, a renderer that started calling `fetch` directly, or a new
// test that forgot a mock, would quietly talk to the real Ontoserver in CI: slow, flaky, and green
// for the wrong reason. Failing loudly at the call site names the culprit.
function blockNetwork(label: string) {
  return (...args: unknown[]) => {
    const target = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
    throw new Error(
      `Network access from a test: ${label} ${target}. This suite must run offline — add the ` +
        `response to test/terminology/ or mock the caller. See test/terminology/PROVENANCE.md.`
    );
  };
}

globalThis.fetch = blockNetwork('fetch') as unknown as typeof fetch;
XMLHttpRequest.prototype.open = blockNetwork('XMLHttpRequest.open');

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
