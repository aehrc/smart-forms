/// <reference types="jest" />

/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getBaseLinkIdFromErrorKey, getValidationErrorKey } from '../utils/validateErrorKey';

describe('getValidationErrorKey', () => {
  it('returns the bare linkId when there is no repeat instance path', () => {
    expect(getValidationErrorKey('my-item')).toBe('my-item');
    expect(getValidationErrorKey('my-item', [])).toBe('my-item');
    expect(getValidationErrorKey('my-item', undefined)).toBe('my-item');
  });

  it('appends a single instance index', () => {
    expect(getValidationErrorKey('my-item', [0])).toBe('my-item///0');
    expect(getValidationErrorKey('my-item', [2])).toBe('my-item///2');
  });

  it('appends nested instance indices joined by a dot', () => {
    expect(getValidationErrorKey('my-item', [1, 3])).toBe('my-item///1.3');
  });

  it('produces distinct keys for different instances of the same linkId', () => {
    const instance0 = getValidationErrorKey('my-item', [0]);
    const instance1 = getValidationErrorKey('my-item', [1]);
    expect(instance0).not.toBe(instance1);
  });
});

describe('getBaseLinkIdFromErrorKey', () => {
  it('returns the key unchanged when it has no instance path', () => {
    expect(getBaseLinkIdFromErrorKey('my-item')).toBe('my-item');
  });

  it('strips a single instance suffix', () => {
    expect(getBaseLinkIdFromErrorKey('my-item///0')).toBe('my-item');
  });

  it('strips a nested instance suffix', () => {
    expect(getBaseLinkIdFromErrorKey('my-item///1.3')).toBe('my-item');
  });

  it('round-trips with getValidationErrorKey', () => {
    const key = getValidationErrorKey('some-link-id', [4, 2]);
    expect(getBaseLinkIdFromErrorKey(key)).toBe('some-link-id');
  });
});
