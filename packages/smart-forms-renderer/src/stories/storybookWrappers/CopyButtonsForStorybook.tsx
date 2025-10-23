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

// @ts-ignore
import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '../../stores';

function CopyButtonsForStorybook() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();

  // track copy state separately for each button
  const [copiedQ, setCopiedQ] = useState(false);
  const [copiedQR, setCopiedQR] = useState(false);

  function copyToClipboard(payload: string, setCopied: (isCopied: boolean) => void) {
    navigator.clipboard.writeText(payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // revert back after
    });
  }

  return (
    <>
      <Button
        aria-label="Copy Questionnaire"
        onClick={() => {
          copyToClipboard(JSON.stringify(sourceQuestionnaire, null, 2), setCopiedQ);
        }}
        disabled={copiedQ}
        size="small"
        color="primary">
        {copiedQ ? 'Copied!' : ' Copy Q'}
      </Button>
      <Button
        aria-label="Copy QuestionnaireResponse"
        onClick={() => {
          copyToClipboard(JSON.stringify(updatableResponse, null, 2), setCopiedQR);
        }}
        disabled={copiedQR}
        size="small"
        color="primary">
        {copiedQR ? 'Copied!' : 'Copy QR'}
      </Button>
    </>
  );
}

export default CopyButtonsForStorybook;
