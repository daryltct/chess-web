import React, { useEffect, useContext } from 'react'
import io from 'socket.io-client'

import { UserContext } from '../context/user/UserContext'
import { GameContext } from '../context/game/GameContext'
import Game from './Game'

const PORT = '/'

const Home = () => {
	const { userState, initSocket, joinQueue, leaveQueue } = useContext(UserContext)
	const { gameState, initRoom } = useContext(GameContext)

	const { socket, inQueue } = userState

	useEffect(() => {
		initSocket(io(PORT))
	}, [])

	useEffect(
		() => {
			if (socket) {
				socket.on('gameStart', initRoom)
			}
		},
		[ socket ]
	)

	const toggleQueue = () => {
		if (!inQueue) {
			socket.emit('findGame', true)
			joinQueue()
		} else {
			socket.emit('findGame', false)
			leaveQueue()
		}
	}

	return (
		<div>
			{gameState.roomId ? (
				<Game />
			) : (
				<button onClick={toggleQueue}>{inQueue ? 'Cancel Search' : 'Find Game'}</button>
			)}
		</div>
	)
}

export default Home
