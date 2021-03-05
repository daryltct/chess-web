import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { GameContextProvider } from './context/GameContext'
import { UserContextProvider } from './context/UserContext'

ReactDOM.render(
	<UserContextProvider>
		<GameContextProvider>
			<App />
		</GameContextProvider>
	</UserContextProvider>,
	document.getElementById('root')
)
