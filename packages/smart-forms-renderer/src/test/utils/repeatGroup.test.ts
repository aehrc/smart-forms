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
import { getQrRepeatGroupInstanceIndex } from '../../utils/repeatGroup';

/** Mirrors how RepeatGroup projects its instances into onQrRepeatGroupChange */
function toQrItems(repeatGroups: RepeatGroupSingleModel[]) {
  return repeatGroups.flatMap((singleGroup) => (singleGroup.qrItem ? [singleGroup.qrItem] : []));
}

describe('getQrRepeatGroupInstanceIndex', () => {
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

    repeatGroups.forEach((repeatGroup, index) => {
      const qrInstanceIndex = getQrRepeatGroupInstanceIndex(repeatGroups, index);

      if (qrInstanceIndex === null) {
        expect(repeatGroup.qrItem).toBeNull();
        return;
      }

      expect(qrItems[qrInstanceIndex].linkId).toBe(repeatGroup.id);
    });

    // The regression case from #1985: a blank first instance shifts the QR index of every later one
    expect(getQrRepeatGroupInstanceIndex(repeatGroups, 1)).toBe(0);
    expect(getQrRepeatGroupInstanceIndex(repeatGroups, 3)).toBe(1);
  });

  it('returns null for an instance that is not in the QuestionnaireResponse', () => {
    const repeatGroups = [emptyInstance('instance0'), filledInstance('instance1')];

    expect(getQrRepeatGroupInstanceIndex(repeatGroups, 0)).toBeNull();
  });

  it('returns null for an out-of-range index', () => {
    expect(getQrRepeatGroupInstanceIndex([filledInstance('instance0')], 5)).toBeNull();
  });

  it('is the rendered index when no earlier instance is empty', () => {
    const repeatGroups = [
      filledInstance('instance0'),
      filledInstance('instance1'),
      filledInstance('instance2')
    ];

    expect(getQrRepeatGroupInstanceIndex(repeatGroups, 0)).toBe(0);
    expect(getQrRepeatGroupInstanceIndex(repeatGroups, 1)).toBe(1);
    expect(getQrRepeatGroupInstanceIndex(repeatGroups, 2)).toBe(2);
  });
});
