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

// simplebar-react doesn't correctly expose its types due to an issue with its package.json "exports" field.
// TypeScript can't resolve them automatically, so we manually declare the module here to avoid TS7016 errors.
// https://stackoverflow.com/questions/51638818/how-to-properly-declare-a-module-ts7016
declare module 'simplebar-react';
