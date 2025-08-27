import './App.css';
import {MemoryProvider} from './components/MemoryContext';
import IndexPage from './components/index_page/IndexPage';

function App() {
  return (
    <MemoryProvider>
      <IndexPage/>
    </MemoryProvider>
  );
}

export default App;
