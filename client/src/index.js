import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { GameContextProvider } from './context/game/GameContext'
import { UserContextProvider } from './context/user/UserContext'
import theme from './components/ui/Theme'

import { ThemeProvider } from '@material-ui/styles'

ReactDOM.render(
	<UserContextProvider>
		<GameContextProvider>
			<ThemeProvider theme={theme}>
				<App />
			</ThemeProvider>
		</GameContextProvider>
	</UserContextProvider>,
	document.getElementById('root')
)
