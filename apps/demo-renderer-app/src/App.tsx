import HomePage from './HomePage.tsx';
import InputPage from './InputPage.tsx';

function App() {
  // get query url from url params
  const urlParams = new URLSearchParams(window.location.search);
  const questionnaireUrl = urlParams.get('url') ?? '';

  if (questionnaireUrl === '') {
    return <InputPage />;
  }

  return <HomePage />;
}

export default App;
