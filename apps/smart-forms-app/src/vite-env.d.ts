/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

/// <reference types="vite/client" />

declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';

declare const RENDERER_VERSION: string;
declare const TEMPLATE_EXTRACT_VERSION: string;

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_ONTOSERVER_URL: string;
  readonly VITE_FORMS_SERVER_URL: string;
  readonly VITE_LAUNCH_SCOPE: string;
  readonly VITE_LAUNCH_CLIENT_ID: string;
  readonly VITE_IN_APP_POPULATE: boolean;
  readonly VITE_SHOW_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
