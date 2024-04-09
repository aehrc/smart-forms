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

import { memo, useEffect, useState } from 'react';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import { calculateRemainingTime, getTokenExpirationTime } from '../utils/tokenTimer.ts';
import TokenTimerDialog from './TokenTimerDialog.tsx';
import TokenTimerIndicator from './TokenTimerIndicator.tsx';
import AutoSaveDialog from './AutoSaveDialog.tsx';
import type { AutoSaveStatus } from '../types/autosave.ts';

const TokenTimer = memo(function TokenTimer() {
  const { tokenReceivedTimestamp, smartClient } = useSmartClient();

  const tokenExpirationTimeInSeconds = getTokenExpirationTime(smartClient); // Expiration time of the token in seconds
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [hasReminded, setHasReminded] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('shouldSave');

  const reminderTime = 900; // 15 minutes = 900 seconds
  const autoSaveTime = 300; // 5 minutes = 300 seconds

  // Set up an interval to periodically check the remaining time
  useEffect(
    () => {
      const intervalId = setInterval(checkRemainingTime, 1000); // Check every minute (60000 milliseconds)

      // Clean up the interval when the component unmounts
      return () => clearInterval(intervalId);
    },
    // initialise interval for one time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function checkRemainingTime() {
    const remaining = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
    if (remaining === null) {
      return;
    }

    if (remaining <= reminderTime) {
      // 15 minutes = 900 seconds
      setReminderOpen(true);
      setTimeLeft(remaining);

      if (remaining <= autoSaveTime && autoSaveStatus === 'shouldSave') {
        setReminderOpen(false);
      }
    }
  }

  const showRemainingTime = typeof timeLeft === 'number' && timeLeft <= reminderTime;
  const isAutoSaving =
    typeof timeLeft === 'number' && timeLeft <= autoSaveTime && autoSaveStatus === 'shouldSave';

  return (
    <>
      <TokenTimerIndicator
        showRemainingTime={showRemainingTime}
        timeLeft={timeLeft}
        isAutoSaving={autoSaveStatus === 'saving'}
      />
      {reminderOpen ? (
        <TokenTimerDialog
          open={reminderOpen && !hasReminded}
          closeDialog={() => {
            setReminderOpen(false);
            setHasReminded(true);
            setAutoSaveStatus('shouldNotSave');
          }}
        />
      ) : null}

      {isAutoSaving ? <AutoSaveDialog onAutoSave={() => setAutoSaveStatus('saved')} /> : null}
    </>
  );
});

export default TokenTimer;
