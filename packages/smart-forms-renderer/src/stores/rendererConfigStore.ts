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

import { createStore } from 'zustand/vanilla';
import { createSelectors } from './selector';
import type { QuestionnaireItem } from 'fhir/r4';
import type { UseResponsiveProps } from '../hooks';
import type { Breakpoints } from '@mui/material';

/**
 * RendererConfig interface
 * Provides fine-grained control over the styling and behaviour of the renderer.
 *
 * @property requiredIndicatorPosition - Defines where the required asterisk (*) is placed relative to the label.
 *   - `"start"` (default): Asterisk appears before the label.
 *   - `"end"`: Asterisk appears after the label.
 *
 * @property itemResponsive - Controls responsive layout settings for item labels and fields.
 *   @property labelBreakpoints - Defines breakpoints for label width at different screen sizes.
 *     - Default: `{ xs: 12, md: 4 }`
 *   @property fieldBreakpoints - Defines breakpoints for field width at different screen sizes.
 *     - Default: `{ xs: 12, md: 8 }`
 *   @property columnGapPixels - Spacing (in pixels) between the label and the field.
 *     - Default: `32`
 *   @property rowGapPixels - Vertical spacing (in pixels) between stacked items.
 *     - Default: `4`
 *
 * @property showTabbedFormAt - Defines when the form should switch to a tabbed layout based on screen size.
 *   - Default: `{ query: 'up', start: 'md' }`
 *
 * @property tabListWidthOrResponsive - Configures the width of the tab list, either as a fixed number or responsive breakpoints.
 *   - Default: `{ tabListBreakpoints: { xs: 12, sm: 3, md: 3, lg: 2.75 }, tabContentBreakpoints: { xs: 12, sm: 9, md: 9, lg: 9.25 } }`
 *
 * @property tabListStickyTop - The pixel offset from the top of the viewport at which the tab list becomes sticky.
 *   Set this to the height of any sticky header in the consuming app so the tab list sticks immediately below it.
 *   - Default: `0`
 *
 * @property textFieldWidth - Defines the default width for text input fields (in pixels).
 *   - Default: `320`
 *
 * @property inputsFlexGrow - Determines whether input fields should grow to fill available space.
 *   - `false` (default): Inputs maintain their default size.
 *   - `true`: Inputs expand to fill space.
 *
 * @property reverseBooleanYesNo - If `true`, swaps "Yes" and "No" options for boolean fields.
 *   - Default: `false`
 *
 * @property hideClearButton - If `true`, hides the clear button on input fields.
 *   - Default: `false`
 *
 * @property hideQuantityComparatorField - If `true`, hides the quantity comparator field.
 *   - Default: `false`
 *
 * @property enableWhenAsReadOnly - Determines whether fields hidden by `enableWhen` logic should still be shown as read-only.
 *   - Can be `true` (all fields affected) or a `Set<QuestionnaireItem['type']>` to specify types.
 *   - Default: `false`
 *
 * @property disablePageCardView - If `true`, disables the card-style layout for pages.
 *   - Default: `false`
 *
 * @property disablePageButtons - If `true`, hides navigation buttons for pages.
 *   - Default: `false`
 *
 * @property disableTabButtons - If `true`, hides navigation buttons for tabs.
 *   - Default: `false`
 *
 * @property disableHeadingFocusOnTabSwitch - If `true`, disables automatic focus on the first heading when switching tabs.
 *  - Default: `false`
 *
 * @property readOnlyVisualStyle - If `true`, item.readOnly will result in form fields having MUI disabled property and styles (recommended from usability perspective). If `false`, item.readOnly will result in form fields having HTML readonly property (less stable, but recommended from accessibility perspective).
 *   - Default: `true`
 */
export interface RendererConfig {
  readOnlyVisualStyle?: 'disabled' | 'readonly';
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
  tabListStickyTop?: number;
  textFieldWidth?: number;
  inputsFlexGrow?: boolean;
  reverseBooleanYesNo?: boolean;
  hideClearButton?: boolean;
  hideQuantityComparatorField?: boolean;
  enableWhenAsReadOnly?: boolean | Set<QuestionnaireItem['type']>; // The Set<QuestionnaireItem['type']> is used to store the types of items that should be displayed as readOnly when hidden by enableWhen
  disablePageCardView?: boolean;
  disablePageButtons?: boolean;
  disableTabButtons?: boolean;
  disableHeadingFocusOnTabSwitch?: boolean;
}

/**
 * RendererConfigStore properties and methods
 *
 * @author Sean Fong
 */
export interface RendererConfigStoreType {
  readOnlyVisualStyle: 'disabled' | 'readonly';
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
  tabListStickyTop: number;
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
  disableHeadingFocusOnTabSwitch: boolean;
  setRendererConfig: (params: RendererConfig) => void;
}

/**
 * @author Sean Fong
 */
export const rendererConfigStore = createStore<RendererConfigStoreType>()((set) => ({
  readOnlyVisualStyle: 'disabled',
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
  tabListStickyTop: 0,
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
  disableHeadingFocusOnTabSwitch: false,
  setRendererConfig: (params: RendererConfig) => {
    set((state) => ({
      readOnlyVisualStyle: params.readOnlyVisualStyle ?? state.readOnlyVisualStyle,
      requiredIndicatorPosition:
        params.requiredIndicatorPosition ?? state.requiredIndicatorPosition,
      itemResponsive: params.itemResponsive ?? state.itemResponsive,
      tabListWidthOrResponsive: params.tabListWidthOrResponsive ?? state.tabListWidthOrResponsive,
      tabListStickyTop: params.tabListStickyTop ?? state.tabListStickyTop,
      showTabbedFormAt: params.showTabbedFormAt ?? state.showTabbedFormAt,
      textFieldWidth: params.textFieldWidth ?? state.textFieldWidth,
      inputsFlexGrow: params.inputsFlexGrow ?? state.inputsFlexGrow,
      reverseBooleanYesNo: params.reverseBooleanYesNo ?? state.reverseBooleanYesNo,
      hideClearButton: params.hideClearButton ?? state.hideClearButton,
      hideQuantityComparatorField:
        params.hideQuantityComparatorField ?? state.hideQuantityComparatorField,
      enableWhenAsReadOnly: params.enableWhenAsReadOnly ?? state.enableWhenAsReadOnly,
      disablePageCardView: params.disablePageCardView ?? state.disablePageCardView,
      disablePageButtons: params.disablePageButtons ?? state.disablePageButtons,
      disableTabButtons: params.disableTabButtons ?? state.disableTabButtons,
      disableHeadingFocusOnTabSwitch:
        params.disableHeadingFocusOnTabSwitch ?? state.disableHeadingFocusOnTabSwitch
    }));
  }
}));

export const useRendererConfigStore = createSelectors(rendererConfigStore);
