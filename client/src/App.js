import './App.css'
import React, { useState, useEffect, useContext } from 'react'
import io from 'socket.io-client'

import { GameContext } from './context/GameContext'
import Game from './components/Game'

const PORT = '/'

const App = () => {
	const { gameState, updateGameState } = useContext(GameContext)

	const [ socket, setSocket ] = useState(null)

	useEffect(() => {
		setSocket(io(PORT))
	}, [])

	useEffect(() => {
		if (socket) {
			socket.on('gameStart', (data) => {
				updateGameState(data)
			})
		}
	})

	return <div>{gameState.roomId ? <Game socket={socket} /> : <button>Find Game</button>}</div>
}

export default App
