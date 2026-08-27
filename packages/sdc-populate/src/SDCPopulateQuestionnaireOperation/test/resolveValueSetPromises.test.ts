import { describe } from '@jest/globals';
import { filterValueSetAnswersRecursive, resolveValueSetPromises } from '../utils/processValueSets';
import type { ValueSet } from 'fhir/r4';
import type { ValueSetPromise } from '../interfaces/expressions.interface';

describe('resolveValueSetPromises', () => {
  it('resolves all promises and filters rejected ones', async () => {
    const valueSetPromises = {
      first: {
        promise: Promise.resolve({ resourceType: 'ValueSet', id: 'vs1' }),
        valueSet: undefined
      },
      second: {
        promise: Promise.reject(new Error('fail')),
        valueSet: undefined
      },
      third: {
        promise: Promise.resolve({ data: { resourceType: 'ValueSet', id: 'vs3' } }),
        valueSet: undefined
      },
      fourth: {
        promise: Promise.resolve({ resourceType: 'NotValueSet' }),
        valueSet: undefined
      }
    };

    const result = await resolveValueSetPromises(valueSetPromises);

    expect(result.first.valueSet).toEqual({ resourceType: 'ValueSet', id: 'vs1' });
    expect(result.second).toBeUndefined();
    expect(result.third.valueSet).toEqual({ resourceType: 'ValueSet', id: 'vs3' });
    expect(result.fourth.valueSet).toBeUndefined();
  });
});

describe('filterValueSetAnswersRecursive', () => {
  const mockAnswerOptions = {
    q1: [
      { valueCoding: { system: 'sys', code: 'a', display: 'A' } },
      { valueCoding: { system: 'sys', code: 'b', display: 'B' } }
    ]
  };

  const mockContainedResources: Record<string, ValueSet> = {
    q3: {
      resourceType: 'ValueSet',
      status: 'draft',
      expansion: {
        timestamp: '2023-10-01T00:00:00Z',
        contains: [
          { system: 'sys', code: 'x', display: 'X' },
          { system: 'sys', code: 'y', display: 'Y' }
        ]
      }
    }
  };

  const mockResolvedValueSetPromises: Record<string, ValueSetPromise> = {
    q2: {
      promise: Promise.resolve({
        resourceType: 'ValueSet',
        expansion: {
          contains: [
            { system: 'sys', code: '1', display: 'One' },
            { system: 'sys', code: '2', display: 'Two' }
          ]
        }
      }),
      valueSet: {
        resourceType: 'ValueSet',
        status: 'draft',
        expansion: {
          timestamp: '2023-10-01T00:00:00Z',
          contains: [
            { system: 'sys', code: '1', display: 'One' },
            { system: 'sys', code: '2', display: 'Two' }
          ]
        }
      }
    }
  };

  it('recursively filters answers in nested items', () => {
    // Only Coding answers not present in options are filtered out.
    // String answers are not filtered because open-choice questions can have arbitrary strings.
    const input = {
      linkId: 'root',
      item: [
        {
          linkId: 'q1',
          answer: [
            { valueCoding: { system: 'sys', code: 'a' } },
            { valueCoding: { system: 'sys', code: 'c' } }
          ]
        },
        {
          linkId: 'q2',
          answer: [{ valueString: '1' }, { valueString: '3' }]
        },
        {
          linkId: 'q3',
          answer: [{ valueString: 'x' }, { valueString: 'z' }]
        }
      ]
    };

    const result = filterValueSetAnswersRecursive(
      input,
      mockResolvedValueSetPromises,
      mockAnswerOptions,
      mockContainedResources
    );

    expect(result).toBeDefined();
    expect(result?.item).toHaveLength(3);

    const filteredQ1 = result?.item.find((i) => i.linkId === 'q1');
    expect(filteredQ1?.answer).toEqual([
      { valueCoding: { system: 'sys', code: 'a', display: 'A' } }
    ]);

    const filteredQ2 = result?.item.find((i) => i.linkId === 'q2');
    expect(filteredQ2?.answer).toEqual([
      { valueCoding: { system: 'sys', code: '1', display: 'One' } },
      { valueString: '3' }
    ]);

    const filteredQ3 = result?.item.find((i) => i.linkId === 'q3');
    expect(filteredQ3?.answer).toEqual([
      { valueCoding: { system: 'sys', code: 'x', display: 'X' } },
      { valueString: 'z' }
    ]);
  });

  it('returns null if all answers filtered out in contained resource', () => {
    const input = {
      linkId: 'q3',
      answer: [
        {
          valueCoding: { system: 'sys', code: 'z', display: 'Z' } // not in contained resources
        }
      ]
    };

    const result = filterValueSetAnswersRecursive(input, {}, {}, mockContainedResources);

    expect(result).toBeNull();
  });

  it('returns the item unchanged if no answers or valueSets present', () => {
    const input = {
      linkId: 'q4',
      text: 'No answers'
    };

    const result = filterValueSetAnswersRecursive(input, {}, {}, {});

    expect(result).toEqual(input);
  });

  it('preserves coding answers outside answerOptions for open-choice items', () => {
    const input = {
      linkId: 'q1',
      answer: [
        { valueCoding: { system: 'sys', code: 'a' } },
        { valueCoding: { system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'J44.9' } }
      ]
    };

    const result = filterValueSetAnswersRecursive(
      input,
      {},
      mockAnswerOptions,
      {},
      {
        q1: 'open-choice'
      }
    );

    // Matching coding is normalised to the option's coding, non-matching coding is kept as is
    expect(result?.answer).toEqual([
      { valueCoding: { system: 'sys', code: 'a', display: 'A' } },
      { valueCoding: { system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'J44.9' } }
    ]);
  });

  it('still filters out non-matching coding answers for choice items', () => {
    const input = {
      linkId: 'q1',
      answer: [
        { valueCoding: { system: 'sys', code: 'a' } },
        { valueCoding: { system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'J44.9' } }
      ]
    };

    const result = filterValueSetAnswersRecursive(
      input,
      {},
      mockAnswerOptions,
      {},
      {
        q1: 'choice'
      }
    );

    expect(result?.answer).toEqual([{ valueCoding: { system: 'sys', code: 'a', display: 'A' } }]);
  });

  it('does not rewrite a same-code coding from a different system to the option coding', () => {
    const input = {
      linkId: 'q1',
      answer: [
        { valueCoding: { system: 'http://snomed.info/sct', code: 'a', display: 'SNOMED A' } }
      ]
    };

    const choiceResult = filterValueSetAnswersRecursive(
      input,
      {},
      mockAnswerOptions,
      {},
      { q1: 'choice' }
    );
    // dropped, not substituted with { system: 'sys', code: 'a' }
    expect(choiceResult?.answer).toEqual([]);

    const openChoiceResult = filterValueSetAnswersRecursive(
      input,
      {},
      mockAnswerOptions,
      {},
      { q1: 'open-choice' }
    );
    // kept exactly as populated, still SNOMED
    expect(openChoiceResult?.answer).toEqual([
      { valueCoding: { system: 'http://snomed.info/sct', code: 'a', display: 'SNOMED A' } }
    ]);
  });

  it('matches display-only codings by display instead of undefined === undefined', () => {
    const displayOnlyOptions = {
      q1: [{ valueCoding: { display: 'A' } }, { valueCoding: { display: 'B' } }]
    };
    const input = {
      linkId: 'q1',
      answer: [{ valueCoding: { display: 'B' } }]
    };

    const result = filterValueSetAnswersRecursive(
      input,
      {},
      displayOnlyOptions,
      {},
      {
        q1: 'choice'
      }
    );

    // stays B; a code-only comparison would find option A first
    expect(result?.answer).toEqual([{ valueCoding: { display: 'B' } }]);
  });

  it('preserves coding answers outside a contained valueSet for open-choice items', () => {
    const input = {
      linkId: 'q3',
      answer: [{ valueCoding: { system: 'sys', code: 'z', display: 'Z' } }]
    };

    const result = filterValueSetAnswersRecursive(input, {}, {}, mockContainedResources, {
      q3: 'open-choice'
    });

    expect(result?.answer).toEqual([{ valueCoding: { system: 'sys', code: 'z', display: 'Z' } }]);
  });

  it('preserves coding answers outside an expanded valueSet for open-choice items', () => {
    const input = {
      linkId: 'q2',
      answer: [{ valueCoding: { system: 'sys', code: '9' } }]
    };

    const result = filterValueSetAnswersRecursive(
      input,
      mockResolvedValueSetPromises,
      {},
      {},
      {
        q2: 'open-choice'
      }
    );

    expect(result?.answer).toEqual([{ valueCoding: { system: 'sys', code: '9' } }]);
  });
});
