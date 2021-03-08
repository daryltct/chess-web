import React, { useEffect, useContext } from 'react'
import io from 'socket.io-client'

import { UserContext } from '../context/user/UserContext'
import { GameContext } from '../context/game/GameContext'
import Game from './Game'

const PORT = '/'

const Home = () => {
	const { userState, initSocket, joinQueue, leaveQueue } = useContext(UserContext)
	const { gameState, initRoom, reconnectGame } = useContext(GameContext)

	const { socket, inQueue, user } = userState

	useEffect(
		() => {
			if (user) {
				initSocket(
					io(PORT, {
						query: { playerId: user._id }
					})
				)
			}
		},
		[ user ]
	)

	useEffect(
		() => {
			if (socket) {
				socket.on('gameStart', initRoom)
				socket.on('reconnect', reconnectGame)

				return () => {
					socket.off('gameStart', initRoom)
					//socket.off('reconnect', (reconnectGame))
				}
			}
		},
		[ socket ]
	)

	const toggleQueue = () => {
		// console.log(userState.user._id)
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
