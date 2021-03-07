// import './App.css'
// import React, { useEffect, useContext } from 'react'
// import io from 'socket.io-client'

// import { UserContext } from './context/UserContext'
// import { GameContext } from './context/GameContext'
// import Game from './components/Game'

// const PORT = '/'

// const App = () => {
// 	const { userState, updateUserState, joinQueue, leaveQueue } = useContext(UserContext)
// 	const { gameState, updateGameState } = useContext(GameContext)

// 	const { socket, inQueue } = userState

// 	useEffect(() => {
// 		updateUserState({
// 			socket: io(PORT)
// 		})
// 	}, [])

// 	useEffect(() => {
// 		if (socket) {
// 			socket.on('gameStart', (data) => {
// 				updateGameState(data)
// 			})
// 		}
// 	})

// 	const toggleQueue = () => {
// 		if (!inQueue) {
// 			socket.emit('findGame', true)
// 			joinQueue()
// 		} else {
// 			socket.emit('findGame', false)
// 			leaveQueue()
// 		}
// 	}

// 	return (
// 		<div>
// 			{gameState.roomId ? (
// 				<Game />
// 			) : (
// 				<button onClick={toggleQueue}>{inQueue ? 'Cancel Search' : 'Find Game'}</button>
// 			)}
// 		</div>
// 	)
// }

// export default App

import './App.css'
import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import PrivateRoute from './components/PrivateRoute'
import Home from './components/Home'
import Login from './components/Login'

const App = () => {
	return (
		<Router>
			<Switch>
				<PrivateRoute exact path="/" component={Home} />
				<Route exact path="/login" component={Login} />
			</Switch>
		</Router>
	)
}

export default App
