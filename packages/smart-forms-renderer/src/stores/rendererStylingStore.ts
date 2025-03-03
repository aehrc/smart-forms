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
import type { Breakpoints } from '@mui/material';

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
  itemResponsive?: {
    labelBreakpoints: Partial<Breakpoints['values']>;
    fieldBreakpoints: Partial<Breakpoints['values']>;
    columnGapPixels: number;
    rowGapPixels: number;
  };
  showTabbedFormAt?: UseResponsiveProps;
  tabListWidthOrResponsive?:
    | number
    | {
        tabListBreakpoints: Partial<Breakpoints['values']>;
        tabContentBreakpoints: Partial<Breakpoints['values']>;
      };
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
  itemResponsive: {
    labelBreakpoints: Partial<Breakpoints['values']>;
    fieldBreakpoints: Partial<Breakpoints['values']>;
    columnGapPixels: number;
    rowGapPixels: number;
  };
  tabListWidthOrResponsive:
    | number
    | {
        tabListBreakpoints: Partial<Breakpoints['values']>;
        tabContentBreakpoints: Partial<Breakpoints['values']>;
      };
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
  itemResponsive: {
    labelBreakpoints: { xs: 12, md: 4 },
    fieldBreakpoints: { xs: 12, md: 8 },
    columnGapPixels: 32,
    rowGapPixels: 4
  },
  tabListWidthOrResponsive: {
    tabListBreakpoints: { xs: 12, sm: 3, md: 3, lg: 2.75 },
    tabContentBreakpoints: { xs: 12, sm: 9, md: 9, lg: 9.25 }
  },
  showTabbedFormAt: { query: 'up', start: 'md' },
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
      itemResponsive: params.itemResponsive ?? {
        labelBreakpoints: { xs: 12, md: 4 },
        fieldBreakpoints: { xs: 12, md: 8 },
        columnGapPixels: 32,
        rowGapPixels: 4
      },
      tabListWidthOrResponsive: params.tabListWidthOrResponsive ?? {
        tabListBreakpoints: { xs: 12, md: 3, lg: 2.75 },
        tabContentBreakpoints: { xs: 12, md: 9, lg: 9.25 }
      },
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
