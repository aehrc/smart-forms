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

import React, { useCallback, useState } from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import debounce from 'lodash.debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import useReadOnly from '../../../hooks/useReadOnly';
import AttachmentFieldWrapper from './AttachmentFieldWrapper';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { createAttachmentAnswer } from '../../../utils/fileUtils';

export interface AttachmentValues {
  uploadedFile: File | null;
  url: string;
  fileName: string;
}

interface AttachmentItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function AttachmentItem(props: AttachmentItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  let valueString = '';
  if (qrItem?.answer && qrItem?.answer[0].valueString) {
    valueString = qrItem.answer[0].valueString;
  }

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [url, setUrl] = useState(valueString);
  const [fileName, setFileName] = useState(valueString);

  // Event handlers
  async function handleUploadFile(newUploadedFile: File | null) {
    setUploadedFile(newUploadedFile);

    const attachment = await createAttachmentAnswer(newUploadedFile, url, fileName);
    if (attachment) {
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueAttachment: attachment }]
      });
    } else {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  }

  async function handleUrlChange(newUrl: string) {
    setUrl(newUrl);
    await updateQrItemWithDebounce(uploadedFile, newUrl, fileName);
  }

  async function handleFileNameChange(newFileName: string) {
    setFileName(newFileName);
    await updateQrItemWithDebounce(uploadedFile, url, newFileName);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce(async (file: File | null, url: string, fileName: string) => {
      const attachment = await createAttachmentAnswer(file, url, fileName);

      if (attachment) {
        onQrItemChange({
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueAttachment: attachment }]
        });
      } else {
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  return (
    <DndProvider backend={HTML5Backend} context={window}>
      <AttachmentFieldWrapper
        qItem={qItem}
        attachmentValues={{ uploadedFile: uploadedFile, url: url, fileName: fileName }}
        readOnly={readOnly}
        isRepeated={isRepeated}
        isTabled={isTabled}
        onUploadFile={handleUploadFile}
        onUrlChange={handleUrlChange}
        onFileNameChange={handleFileNameChange}
      />
    </DndProvider>
  );
}

export default AttachmentItem;
