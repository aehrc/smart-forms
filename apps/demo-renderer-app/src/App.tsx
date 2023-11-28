import Home from './components/Home.tsx';
import InputQuestionnaire from './components/InputQuestionnaire.tsx';
import useBearerToken from './hooks/useBearerToken.ts';
import useQuestionnaireUrl from './hooks/useQuestionnaireUrl.ts';

function App() {
  const questionnaireUrl = useQuestionnaireUrl();
  const bearerToken = useBearerToken();

  if (questionnaireUrl === '' || questionnaireUrl === null) {
    return <InputQuestionnaire bearerToken={bearerToken} />;
  }

  return <Home questionnaireUrl={questionnaireUrl} bearerToken={bearerToken} />;
}

export default App;
