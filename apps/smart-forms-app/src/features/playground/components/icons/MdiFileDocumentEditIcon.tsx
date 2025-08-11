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

interface MdiFileDocumentEditIconProps {
  width?: number;
  height?: number;
}

// Lifted from Iconify mdi:file-document-edit
function MdiFileDocumentEditIcon(props: MdiFileDocumentEditIconProps) {
  const { width = 20, height = 20 } = props;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M6 2c-1.11 0-2 .89-2 2v16a2 2 0 0 0 2 2h4v-1.91L12.09 18H6v-2h8.09l2-2H6v-2h12.09L20 10.09V8l-6-6zm7 1.5L18.5 9H13zm7.15 9.5a.55.55 0 0 0-.4.16l-1.02 1.02l2.09 2.08l1.02-1.01c.21-.22.21-.58 0-.79l-1.3-1.3a.54.54 0 0 0-.39-.16m-2.01 1.77L12 20.92V23h2.08l6.15-6.15z"
      />
    </svg>
  );
}

export default MdiFileDocumentEditIcon;
