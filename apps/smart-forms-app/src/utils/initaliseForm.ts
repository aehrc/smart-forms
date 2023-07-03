import { assignPopulatedAnswersToEnableWhen } from './enableWhen.ts';
import { evaluateInitialEnableWhenExpressions } from './enableWhenExpression.ts';
import { getFirstVisibleTab } from './tabs.ts';
import type { Expression, QuestionnaireResponse } from 'fhir/r4';
import type {
  EnableWhenExpression,
  EnableWhenItems
} from '../features/enableWhen/types/enableWhen.interface.ts';
import type { Tabs } from '../features/renderer/types/tab.interface.ts';

interface initialFormFromResponseParams {
  questionnaireResponse: QuestionnaireResponse;
  enableWhenItems: EnableWhenItems;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  variablesFhirPath: Record<string, Expression[]>;
  tabs: Tabs;
}

export function initialiseFormFromResponse(params: initialFormFromResponseParams): {
  initialEnableWhenItems: EnableWhenItems;
  initialEnableWhenLinkedQuestions: Record<string, string[]>;
  initialEnableWhenExpressions: Record<string, EnableWhenExpression>;
  firstVisibleTab: number;
} {
  const { questionnaireResponse, enableWhenItems, enableWhenExpressions, variablesFhirPath, tabs } =
    params;

  const { initialisedItems, linkedQuestions } = assignPopulatedAnswersToEnableWhen(
    enableWhenItems,
    questionnaireResponse
  );

  const initialEnableWhenExpressions = evaluateInitialEnableWhenExpressions({
    initialResponse: questionnaireResponse,
    enableWhenExpressions: enableWhenExpressions,
    variablesFhirPath: variablesFhirPath
  });

  const firstVisibleTab =
    Object.keys(tabs).length > 0
      ? getFirstVisibleTab(tabs, initialisedItems, initialEnableWhenExpressions)
      : 0;

  return {
    initialEnableWhenItems: initialisedItems,
    initialEnableWhenLinkedQuestions: linkedQuestions,
    initialEnableWhenExpressions,
    firstVisibleTab
  };
}
