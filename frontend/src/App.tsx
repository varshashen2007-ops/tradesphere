import AppRouter from './routes/AppRouter';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';

function App() {
  useAuthBootstrap();

  return <AppRouter />;
}

export default App;