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

import React, { useMemo, useRef, useState } from 'react';
import type { Attachment } from 'fhir/r4';
import { useEventCallback } from 'usehooks-ts';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import debounce from 'lodash.debounce';
import { createEmptyQrItem, getQRItemId } from '../../../utils/qrItem';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import useReadOnly from '../../../hooks/useReadOnly';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import AttachmentFieldWrapper from './AttachmentFieldWrapper';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { getAttachmentAnswer, readAttachmentFile } from '../../../utils/fileUtils';
import type { AttachmentFileError } from '../../../utils/fileUtils';
import useValidationFeedbackSeverity from '../../../hooks/useValidationFeedbackSeverity';
import { getInstructionsId } from '../ItemParts/ItemFieldGrid';

export interface AttachmentValues {
  uploadedFile: File | null;
  url: string;
  fileName: string;
  fileError?: AttachmentFileError;
}

function AttachmentItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const answerKey = getQRItemId(qrItem?.answer?.[0]?.id);
  const initialAttachment = qrItem?.answer?.[0]?.valueAttachment;
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<AttachmentFileError>();
  const [url, setUrl] = useState(initialAttachment?.url ?? '');
  const [fileName, setFileName] = useState(initialAttachment?.title ?? '');
  const acceptedFile = useRef<{ file: File | null; attachment?: Attachment }>({
    file: null,
    attachment: initialAttachment
  });
  const latestRead = useRef(0);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const { feedback, feedbackSeverity } = useValidationFeedbackSeverity(qItem, feedbackFromParent);

  // Get instructions ID for aria-describedby
  const { displayInstructions } = useRenderingExtensions(qItem);
  const instructionsId = getInstructionsId(qItem, displayInstructions, !!feedback);

  const writeAnswer = useEventCallback(() => {
    const attachment = getAttachmentAnswer({
      ...acceptedFile.current.attachment,
      url,
      title: fileName
    });
    const newQrItem = createEmptyQrItem(qItem, answerKey);
    if (attachment) {
      newQrItem.answer = [{ id: answerKey, valueAttachment: attachment }];
    }
    onQrItemChange(newQrItem);
  });

  const saveText = useMemo(() => debounce(writeAnswer, DEBOUNCE_DURATION), [writeAnswer]);

  async function handleUploadFile(file: File | null) {
    const read = ++latestRead.current;
    setUploadedFile(file);
    setFileError(undefined);

    const result = file ? await readAttachmentFile(file) : undefined;
    if (read !== latestRead.current) return;

    if (result && 'error' in result) {
      setUploadedFile(acceptedFile.current.file);
      setFileError(result.error);
      saveText.flush();
      return;
    }

    acceptedFile.current = { file, attachment: result };
    saveText.cancel();
    writeAnswer();
  }

  function handleUrlChange(newUrl: string) {
    setUrl(newUrl);
    saveText();
  }

  function handleFileNameChange(newFileName: string) {
    setFileName(newFileName);
    saveText();
  }

  return (
    <DndProvider backend={HTML5Backend} context={window}>
      <AttachmentFieldWrapper
        qItem={qItem}
        attachmentValues={{ uploadedFile, url, fileName, fileError }}
        feedback={feedback}
        feedbackSeverity={feedbackSeverity}
        readOnly={readOnly}
        isRepeated={isRepeated}
        isTabled={isTabled}
        instructionsId={instructionsId}
        onUploadFile={handleUploadFile}
        onUrlChange={handleUrlChange}
        onFileNameChange={handleFileNameChange}
      />
    </DndProvider>
  );
}

export default AttachmentItem;
