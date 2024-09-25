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

import type { Patient, Practitioner, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import LaunchContextPicker from './LaunchContextPicker.tsx';
import { useState } from 'react';
import LaunchContextDetails from './LaunchContextDetails.tsx';
import PrePopButton from './PrePopButton.tsx';
import LaunchButton from './LaunchButton.tsx';
import CsiroRenderer from '@/components/CsiroRenderer.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable.tsx';
import { getResponse } from '@aehrc/smart-forms-renderer';
import LhcFormsRenderer from '@/components/LhcFormsRenderer.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible.tsx';

interface QuestionnaireResponseResult {
  resource: QuestionnaireResponse | null;
  lastUpdated: Date | null;
}

interface FormViewerProps {
  questionnaire: Questionnaire;
  bearerToken: string | null;
}

function FormViewer(props: FormViewerProps) {
  const { questionnaire, bearerToken } = props;

  const [persistChanges, setPersistChanges] = useState(true);
  const [activeTab, setActiveTab] = useState('csiro');
  const [questionnaireResponseResult, setQuestionnaireResponseResult] =
    useState<QuestionnaireResponseResult>({ resource: null, lastUpdated: null });

  const [patient, setPatient] = useState<Patient | null>(null);
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);

  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(true);

  function printResponse() {
    const result: QuestionnaireResponseResult = {
      resource: null,
      lastUpdated: new Date()
    };

    if (activeTab === 'csiro') {
      result.resource = getResponse();
    }

    if (activeTab === 'nlm') {
      // @ts-ignore
      result.resource = LForms.Util.getFormFHIRData(
        'QuestionnaireResponse',
        'R4',
        'myFormContainer'
      );
    }

    setQuestionnaireResponseResult(result);
  }

  return (
    <>
      <Collapsible
        open={additionalDetailsOpen}
        onOpenChange={setAdditionalDetailsOpen}
        className="space-y-2 mb-1 ">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            {additionalDetailsOpen ? 'Hide pre-population details' : 'Show pre-population details'}
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {additionalDetailsOpen ? (
                <ChevronsDownUp className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="rounded-md border px-4 py-3 text-sm space-y-2">
            <div className="font-semibold">
              If you are planning to perform pre-population, get a bearer token first.
            </div>
            <div className="font-semibold">Bearer Token:</div>
            <div className="rounded-md border p-3 bg-white overflow-auto max-w-[650px]">
              <pre className="text-sm">{bearerToken ?? 'null'}</pre>
            </div>

            <LaunchButton />
            <hr />

            <LaunchContextPicker
              patient={patient}
              practitioner={practitioner}
              bearerToken={bearerToken}
              onPatientChange={(newPatient) => setPatient(newPatient)}
              onPractitionerChange={(newPractitioner) => setPractitioner(newPractitioner)}
            />
            <LaunchContextDetails patient={patient} practitioner={practitioner} />
            <PrePopButton
              questionnaire={questionnaire}
              patient={patient}
              practitioner={practitioner}
              bearerToken={bearerToken}
              onQuestionnaireResponseChange={(newQuestionnaireResponse) =>
                setQuestionnaireResponseResult({
                  resource: newQuestionnaireResponse,
                  lastUpdated: new Date()
                })
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex items-center space-x-2 justify-end">
        <Switch
          checked={persistChanges}
          onCheckedChange={() => setPersistChanges(!persistChanges)}
        />
        <div>Persist form inputs when switching tabs</div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={50} className="min-w-[450px]">
          <div className="p-3">
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}>
              <TabsList>
                <TabsTrigger value="csiro">CSIRO Smart Forms</TabsTrigger>
                <TabsTrigger value="nlm">NLM LHC-Forms</TabsTrigger>
              </TabsList>
              {persistChanges ? null : (
                <>
                  <TabsContent value="csiro">
                    <div className="my-2">
                      <CsiroRenderer
                        questionnaire={questionnaire}
                        questionnaireResponse={questionnaireResponseResult.resource ?? undefined}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="nlm">
                    <LhcFormsRenderer
                      questionnaire={questionnaire}
                      questionnaireResponse={questionnaireResponseResult.resource ?? undefined}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>

            {persistChanges ? (
              <>
                <div className={activeTab === 'csiro' ? '' : 'hidden'}>
                  <CsiroRenderer
                    questionnaire={questionnaire}
                    questionnaireResponse={questionnaireResponseResult.resource ?? undefined}
                  />
                </div>

                <div className={activeTab === 'nlm' ? '' : 'hidden'}>
                  <LhcFormsRenderer
                    questionnaire={questionnaire}
                    questionnaireResponse={questionnaireResponseResult.resource ?? undefined}
                  />
                </div>
              </>
            ) : null}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="p-2.5">
            <div className="flex items-center mb-2 gap-1">
              <div className="text-xl font-semibold">QuestionnaireResponse</div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={printResponse}>
                  Update from {activeTab === 'csiro' ? ' CSIRO' : 'LHC-Forms'}
                </Button>
                <div className="text-xs text-muted-foreground">
                  Last updated:{' '}
                  {questionnaireResponseResult.lastUpdated
                    ? formatTime(questionnaireResponseResult.lastUpdated)
                    : 'N/A'}{' '}
                </div>
              </div>
            </div>

            <div className="overflow-auto">
              <pre className="text-xs text-muted-foreground">
                {JSON.stringify(questionnaireResponseResult.resource, null, 2)}
              </pre>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
      </ResizablePanelGroup>
    </>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: 'numeric'
  });
}

export default FormViewer;
