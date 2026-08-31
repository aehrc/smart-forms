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

import type { RepeatGroupSingleModel } from '../../interfaces/repeatGroup.interface';
import { getQrRepeatGroupInstanceIndexes } from '../../utils/repeatGroup';

/** Mirrors how RepeatGroup projects its instances into onQrRepeatGroupChange */
function toQrItems(repeatGroups: RepeatGroupSingleModel[]) {
  return repeatGroups.flatMap((singleGroup) => (singleGroup.qrItem ? [singleGroup.qrItem] : []));
}

describe('getQrRepeatGroupInstanceIndexes', () => {
  const filledInstance = (id: string): RepeatGroupSingleModel => ({
    id,
    qrItem: { linkId: id, item: [] }
  });

  const emptyInstance = (id: string): RepeatGroupSingleModel => ({ id, qrItem: null });

  it('matches the instance position in the QuestionnaireResponse for every instance', () => {
    const repeatGroups = [
      emptyInstance('instance0'), // never filled in, so absent from the QR
      filledInstance('instance1'),
      emptyInstance('instance2'),
      filledInstance('instance3')
    ];

    const qrItems = toQrItems(repeatGroups);
    const qrInstanceIndexes = getQrRepeatGroupInstanceIndexes(repeatGroups);

    expect(qrInstanceIndexes).toHaveLength(repeatGroups.length);

    repeatGroups.forEach((repeatGroup, index) => {
      const qrInstanceIndex = qrInstanceIndexes[index];

      if (qrInstanceIndex === null) {
        expect(repeatGroup.qrItem).toBeNull();
        return;
      }

      expect(qrItems[qrInstanceIndex].linkId).toBe(repeatGroup.id);
    });

    // The regression case from #1985: a blank first instance shifts the QR index of every later one
    expect(qrInstanceIndexes).toEqual([null, 0, null, 1]);
  });

  it('returns null for an instance that is not in the QuestionnaireResponse', () => {
    const repeatGroups = [emptyInstance('instance0'), filledInstance('instance1')];

    expect(getQrRepeatGroupInstanceIndexes(repeatGroups)).toEqual([null, 0]);
  });

  it('returns an empty array when there are no instances', () => {
    expect(getQrRepeatGroupInstanceIndexes([])).toEqual([]);
  });

  it('is the rendered index when no earlier instance is empty', () => {
    const repeatGroups = [
      filledInstance('instance0'),
      filledInstance('instance1'),
      filledInstance('instance2')
    ];

    expect(getQrRepeatGroupInstanceIndexes(repeatGroups)).toEqual([0, 1, 2]);
  });
});
