import {useEffect} from 'react';
import './App.css';
import {MemoryProvider} from './components/MemoryContext';
import IndexPage from './components/index_page/IndexPage';

function App() {

  useEffect(() => {
    const tryLock = () => {
      const s = window.screen;
      if (s && s.orientation && s.orientation.lock) {
        s.orientation.lock("portrait").catch(() => {});
      }
      document.removeEventListener("click", tryLock);
    };
    // Lock after first user gesture (required by most browsers)
    document.addEventListener("click", tryLock, { once: true });
    return () => document.removeEventListener("click", tryLock);
  }, []);

  return (
    <MemoryProvider>
      <IndexPage/>
    </MemoryProvider>
  );
}

export default App;
