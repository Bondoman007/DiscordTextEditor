import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { store } from './store/store';
import TextGenerator from './components/TextGenerator';
import '@mantine/core/styles.css';

function App() {
  return (
    <Provider store={store}>
      <MantineProvider>
        <TextGenerator />
      </MantineProvider>
    </Provider>
  );
}

export default App;