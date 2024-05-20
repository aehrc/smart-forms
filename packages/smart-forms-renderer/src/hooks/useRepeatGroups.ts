/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { RepeatGroupSingle } from '../interfaces/repeatGroup.interface';
import _isEqual from 'lodash/isEqual';

function useRepeatGroups(
  valueFromProps: RepeatGroupSingle[]
): [RepeatGroupSingle[], Dispatch<SetStateAction<RepeatGroupSingle[]>>] {
  const [repeatGroups, setRepeatGroups] = useState(valueFromProps);

  useEffect(
    () => {
      const valueFromPropsQRItems = valueFromProps.map(
        (repeatGroupSingle) => repeatGroupSingle.qrItem
      );
      const repeatGroupsQRItems = repeatGroups.map((repeatGroupSingle) => repeatGroupSingle.qrItem);

      if (!_isEqual(valueFromPropsQRItems, repeatGroupsQRItems)) {
        setRepeatGroups(valueFromProps);
      }
    },
    // Only trigger this effect if prop value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valueFromProps]
  );

  return [repeatGroups, setRepeatGroups];
}

export default useRepeatGroups;
