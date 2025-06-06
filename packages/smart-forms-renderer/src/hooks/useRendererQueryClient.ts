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

import { keepPreviousData, QueryClient } from '@tanstack/react-query';

/**
 * Default QueryClient used by the renderer.
 * You can customise your own QueryClient with your own options, use v5 of @tanstack/react-query.
 * @see {@link https://tanstack.com/query/v5/docs/reference/QueryClient}
 *
 * @author Sean Fong
 */
function useRendererQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData
      }
    }
  });
}

export default useRendererQueryClient;
