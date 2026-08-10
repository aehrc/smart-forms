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

import { useRendererConfigStore } from '../stores';
import { resolveDateFormat } from '../components/FormComponents/DateTimeItems/utils/parseDate';

/**
 * Returns the resolved full-date input/display format for the active renderer config.
 *
 * Subscribes to both the `locale` and the optional `dateFormat` override so components
 * re-render when either changes. See {@link resolveDateFormat} for the resolution order.
 */
function useDateFormat(): string {
  const dateFormatOverride = useRendererConfigStore.use.rendererStrings().dateFormat;
  const locale = useRendererConfigStore.use.locale();

  return resolveDateFormat(locale, dateFormatOverride);
}

export default useDateFormat;
