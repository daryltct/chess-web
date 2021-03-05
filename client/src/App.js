import './App.css'
import React, { useState, useEffect, useContext } from 'react'
import io from 'socket.io-client'

import { UserContext } from './context/UserContext'
import { GameContext } from './context/GameContext'
import Game from './components/Game'

const PORT = '/'

const App = () => {
	const { userState, updateUserState, joinQueue } = useContext(UserContext)
	const { gameState, updateGameState } = useContext(GameContext)

	const { socket, inQueue } = userState

	//const [ socket, setSocket ] = useState(null)

	useEffect(() => {
		updateUserState({
			socket: io(PORT)
		})
		//setSocket(io(PORT))
	}, [])

	useEffect(() => {
		if (socket) {
			socket.on('gameStart', (data) => {
				updateGameState(data)
			})
		}
	})

	const findGame = () => {
		socket.emit('findGame')
		joinQueue()
	}

	return (
		<div>
			{gameState.roomId ? (
				<Game />
			) : (
				<button onClick={findGame} disabled={inQueue}>
					Find Game
				</button>
			)}
		</div>
	)
}

export default App
