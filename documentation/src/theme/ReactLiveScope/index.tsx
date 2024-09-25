import React from 'react';
import {
  BaseRenderer,
  getResponse,
  RendererThemeProvider,
  useBuildForm,
  useQuestionnaireResponseStore,
  useQuestionnaireStore,
  useRendererQueryClient,
  useSmartConfigStore,
  useTerminologyServerStore
} from '@aehrc/smart-forms-renderer';
import type { Questionnaire } from 'fhir/r4';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  qBooleanBasic,
  qCalculatedExpressionBMICalculator,
  qChoiceAnswerValueSetBasic,
  qItemControlDisplayContextDisplay
} from '@site/src/theme/ReactLiveScope/questionnaires';

function YourBaseRendererWrapper(props: {
  questionnaire: Questionnaire;
  terminologyServerUrl?: string;
}) {
  const { questionnaire, terminologyServerUrl } = props;

  const queryClient = useRendererQueryClient();

  const isBuilding = useBuildForm(questionnaire, undefined, undefined, terminologyServerUrl);

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div style={{ padding: '0 12px' }}>
          <BaseRenderer />
        </div>
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

function JsonViewer(props: { hookName: string; data: any }) {
  const { hookName, data } = props;
  return (
    <>
      <div style={{ border: `1px solid #EBEDF0`, borderRadius: '8px' }}>
        <div
          style={{
            color: '#757575',
            fontSize: '13px',
            margin: '2px 8px 0 8px'
          }}>
          {hookName}
        </div>
        <div
          style={{
            borderTop: '1px solid #EBEDF0'
          }}
        />
        <pre style={{ fontSize: '11px' }}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
}

// Add react-live imports you need here
const ReactLiveScope = {
  React,
  ...React,
  BaseRenderer,
  useBuildForm,
  useRendererQueryClient,
  getResponse,
  QueryClientProvider,
  qBooleanBasic,
  qCalculatedExpressionBMICalculator,
  qItemControlDisplayContextDisplay,
  qChoiceAnswerValueSetBasic,
  YourBaseRendererWrapper,
  JsonViewer,
  useQuestionnaireStore,
  useQuestionnaireResponseStore,
  useSmartConfigStore,
  useTerminologyServerStore
};

export default ReactLiveScope;
