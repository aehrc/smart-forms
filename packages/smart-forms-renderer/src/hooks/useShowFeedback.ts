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

import { useState } from 'react';

/**
 * A custom hook that manages whether validation feedback should be shown based on user interaction with a form field (e.g., input or blur events).
 * Once the field has been blurred before, always show feedback.
 *
 */
function useShowFeedback() {
  const [showFeedback, setShowFeedback] = useState(true);
  const [hasBlurred, setHasBlurred] = useState(false);

  return {
    showFeedback,
    setShowFeedback,
    hasBlurred,
    setHasBlurred
  };
}

export default useShowFeedback;
