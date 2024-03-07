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

import type { Attachment } from 'fhir/r4';

export function getFileSize(fileSizeString: string) {
  if (fileSizeString.length < 7) {
    return `${Math.round(+fileSizeString / 1024)}kb`;
  }

  return `${Math.round(+fileSizeString / 1024) / 1000}MB`;
}

const fileToBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export async function createAttachmentAnswer(
  file: File | null,
  url: string,
  fileName: string
): Promise<Attachment | null> {
  if (!file || url === '') {
    return null;
  }

  try {
    const base64Data = (await fileToBase64(file)) as string;
    const attachment: Attachment = {
      contentType: file.type,
      data: base64Data,
      size: file.size
    };

    if (url) {
      attachment.url = url;
    }

    if (fileName) {
      attachment.title = fileName;
    }

    return attachment;
  } catch (error) {
    console.error(error);
    return null;
  }
}
