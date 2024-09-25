import Router from '@/Router.tsx';

function App() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <div className="mx-auto grid w-full  gap-2">
            <Router />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
