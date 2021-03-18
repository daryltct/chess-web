import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { GameContextProvider } from './context/game/GameContext'
import UserContextProvider from './context/user/UserContext'
import AlertContextProvider from './context/alert/AlertContext'
import theme from './components/ui/Theme'

import { ThemeProvider } from '@material-ui/styles'

ReactDOM.render(
	<AlertContextProvider>
		<UserContextProvider>
			<GameContextProvider>
				<ThemeProvider theme={theme}>
					<App />
				</ThemeProvider>
			</GameContextProvider>
		</UserContextProvider>
	</AlertContextProvider>,
	document.getElementById('root')
)
