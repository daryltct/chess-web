import React, { useEffect, useContext } from 'react'
import io from 'socket.io-client'

import { UserContext } from '../context/user/UserContext'
import { GameContext } from '../context/game/GameContext'
import Game from './Game'

const PORT = '/'

const Home = () => {
	const { userState, initSocket, joinQueue, leaveQueue } = useContext(UserContext)
	const { gameState, initRoom } = useContext(GameContext)

	const { socket, inQueue, user } = userState

	useEffect(() => {
		initSocket(io(PORT))
	}, [])

	useEffect(
		() => {
			if (socket) {
				socket.on('gameStart', initRoom)

				return () => {
					socket.off('gameStart', initRoom)
				}
			}
		},
		[ socket ]
	)

	const toggleQueue = () => {
		// console.log(userState.user._id)
		if (!inQueue) {
			socket.emit('findGame', { id: user._id, signal: true })
			joinQueue()
		} else {
			socket.emit('findGame', { id: user._id, signal: false })
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
