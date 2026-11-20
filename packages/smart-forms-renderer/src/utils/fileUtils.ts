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

import type { Attachment } from 'fhir/r4';

export function getFileSize(fileSizeString: string) {
  if (fileSizeString.length < 7) {
    return `${Math.round(+fileSizeString / 1024)}kb`;
  }

  return `${Math.round(+fileSizeString / 1024) / 1000}MB`;
}

export type AttachmentFileError = 'attachmentTypeUnknown' | 'attachmentReadError';

export async function readAttachmentFile(
  file: File
): Promise<Attachment | { error: AttachmentFileError }> {
  const contentType = file.type.trim();
  if (!contentType) {
    return { error: 'attachmentTypeUnknown' };
  }

  try {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      // readAsDataURL returns "data:<mime>;base64,<data>", but Attachment.data is plain base64.
      // The MIME type can contain commas and base64 can't, so the data starts after the last one.
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.slice(result.lastIndexOf(',') + 1));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return { contentType, data, size: file.size };
  } catch {
    return { error: 'attachmentReadError' };
  }
}

export function getAttachmentAnswer({ url, title, ...fields }: Attachment): Attachment | null {
  const trimmedUrl = url?.trim();
  if (!fields.data && !trimmedUrl) {
    return null;
  }

  const answer: Attachment = fields;
  if (trimmedUrl) {
    answer.url = trimmedUrl;
  }
  if (title) {
    answer.title = title;
  }
  return answer;
}
