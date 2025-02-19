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

import { createStore } from 'zustand/vanilla';
import { createSelectors } from './selector';
import type { QuestionnaireItem } from 'fhir/r4';
import type { UseResponsiveProps } from '../hooks';

export interface ItemGridBreakpoints {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface RendererStyling {
  itemLabelFontWeight?:
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | 'default';
  requiredIndicatorPosition?: 'start' | 'end';
  itemLabelGridBreakpoints?: ItemGridBreakpoints;
  itemFieldGridBreakpoints?: ItemGridBreakpoints;
  showTabbedFormAt?: UseResponsiveProps;
  textFieldWidth?: number;
  inputsFlexGrow?: boolean;
  reverseBooleanYesNo?: boolean;
  hideClearButton?: boolean;
  hideQuantityComparatorField?: boolean;
  enableWhenAsReadOnly?: boolean | Set<QuestionnaireItem['type']>; // The Set<QuestionnaireItem['type']> is used to store the types of items that should be displayed as readOnly when hidden by enableWhen
  disablePageCardView?: boolean;
  disablePageButtons?: boolean;
  disableTabButtons?: boolean;
}

/**
 * RendererStylingStore properties and methods
 *
 * @author Sean Fong
 */
export interface RendererStylingStoreType {
  itemLabelFontWeight:
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | 'default';
  requiredIndicatorPosition: 'start' | 'end';
  itemLabelGridBreakpoints: ItemGridBreakpoints;
  itemFieldGridBreakpoints: ItemGridBreakpoints;
  showTabbedFormAt: UseResponsiveProps;
  textFieldWidth: number;
  inputsFlexGrow: boolean; // radio, checkbox and boolean inputs should have flexGrow: 1
  reverseBooleanYesNo: boolean;
  hideClearButton: boolean;
  hideQuantityComparatorField: boolean;
  enableWhenAsReadOnly: boolean | Set<QuestionnaireItem['type']>;
  disablePageCardView: boolean;
  disablePageButtons: boolean;
  disableTabButtons: boolean;
  setRendererStyling: (params: RendererStyling) => void;
}

/**
 * @author Sean Fong
 */
export const rendererStylingStore = createStore<RendererStylingStoreType>()((set) => ({
  itemLabelFontWeight: 'default',
  requiredIndicatorPosition: 'start',
  itemLabelGridBreakpoints: { xs: 12, md: 4 },
  itemFieldGridBreakpoints: { xs: 12, md: 8 },
  showTabbedFormAt: { query: 'down', start: 'md' },
  textFieldWidth: 320,
  inputsFlexGrow: false,
  reverseBooleanYesNo: false,
  hideClearButton: false,
  hideQuantityComparatorField: false,
  enableWhenAsReadOnly: false,
  disablePageCardView: false,
  disablePageButtons: false,
  disableTabButtons: false,
  setRendererStyling: (params: RendererStyling) => {
    set(() => ({
      itemLabelFontWeight: params.itemLabelFontWeight ?? 'default',
      requiredIndicatorPosition: params.requiredIndicatorPosition ?? 'start',
      itemLabelGridBreakpoints: params.itemLabelGridBreakpoints ?? { xs: 12, md: 4 },
      itemFieldGridBreakpoints: params.itemFieldGridBreakpoints ?? { xs: 12, md: 8 },
      showTabbedFormAt: params.showTabbedFormAt ?? { query: 'up', start: 'md' },
      textFieldWidth: params.textFieldWidth ?? 320,
      inputsFlexGrow: params.inputsFlexGrow ?? false,
      reverseBooleanYesNo: params.reverseBooleanYesNo ?? false,
      hideClearButton: params.hideClearButton ?? false,
      hideQuantityComparatorField: params.hideQuantityComparatorField ?? false,
      enableWhenAsReadOnly: params.enableWhenAsReadOnly ?? false,
      disablePageCardView: params.disablePageCardView ?? false,
      disablePageButtons: params.disablePageButtons ?? false,
      disableTabButtons: params.disableTabButtons ?? false
    }));
  }
}));

export const useRendererStylingStore = createSelectors(rendererStylingStore);
