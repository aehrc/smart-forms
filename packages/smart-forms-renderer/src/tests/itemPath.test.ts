import {
  appendRepeatIndexToLastSegment,
  createSingleItemPath,
  extendItemPath,
  itemPathToFhirPathString
} from '../utils/itemPath';

describe('createSingleItemPath', () => {
  it('creates a path with a single segment without repeatIndex', () => {
    expect(createSingleItemPath('question-1')).toEqual([{ linkId: 'question-1' }]);
  });

  it('creates a path with a single segment with repeatIndex', () => {
    expect(createSingleItemPath('question-1', 2)).toEqual([
      { linkId: 'question-1', repeatIndex: 2 }
    ]);
  });
});

describe('extendItemPath', () => {
  it('adds a new segment to an existing path', () => {
    const basePath = [{ linkId: 'groupA' }];
    const result = extendItemPath(basePath, 'groupB');
    expect(result).toEqual([{ linkId: 'groupA' }, { linkId: 'groupB' }]);
  });

  it('does not mutate the original path', () => {
    const basePath = [{ linkId: 'groupA' }];
    extendItemPath(basePath, 'groupB');
    expect(basePath).toEqual([{ linkId: 'groupA' }]);
  });
});

describe('appendRepeatIndexToLastSegment', () => {
  it('appends repeatIndex to the last segment', () => {
    const path = [{ linkId: 'groupA' }, { linkId: 'repeatingGroup' }];
    const result = appendRepeatIndexToLastSegment(path, 1);
    expect(result).toEqual([{ linkId: 'groupA' }, { linkId: 'repeatingGroup', repeatIndex: 1 }]);
  });

  it('returns empty array when path is empty', () => {
    expect(appendRepeatIndexToLastSegment([], 3)).toEqual([]);
  });

  it('does not mutate the original path', () => {
    const path = [{ linkId: 'groupA' }];
    appendRepeatIndexToLastSegment(path, 0);
    expect(path).toEqual([{ linkId: 'groupA' }]);
  });
});

describe('itemPathToFhirPathString', () => {
  it('converts simple path without repeats to FHIRPath string', () => {
    const path = [{ linkId: 'groupA' }, { linkId: 'questionB' }];
    const result = itemPathToFhirPathString(path);
    expect(result).toBe("item.where(linkId='groupA').item.where(linkId='questionB')");
  });

  it('converts path with repeatIndex to correct FHIRPath string', () => {
    const path = [
      { linkId: 'groupA' },
      { linkId: 'repeatingGroup', repeatIndex: 1 },
      { linkId: 'questionB' }
    ];
    const result = itemPathToFhirPathString(path);
    expect(result).toBe(
      "item.where(linkId='groupA').item.where(linkId='repeatingGroup')[1].item.where(linkId='questionB')"
    );
  });

  it('handles empty path', () => {
    const result = itemPathToFhirPathString([]);
    expect(result).toBe('');
  });
});
