import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import {GameContextProvider} from './context/GameContext'

ReactDOM.render(
  <GameContextProvider>
    <App />
  </GameContextProvider>,
  document.getElementById('root')
);

