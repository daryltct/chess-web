import React, { useEffect, useContext } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

import { UserContext } from '../context/user/UserContext'
import { GameContext } from '../context/game/GameContext'

const Game = () => {
	const { userState, leaveQueue } = useContext(UserContext)
	const { socket } = userState
	const {
		gameState,
		initGame,
		makeMove,
		gameEnd,
		receiveRematch,
		initRematch,
		declineRematch,
		acceptRematch,
		leaveGame
	} = useContext(GameContext)
	const { game, roomId, color, fen, turn, winner, reason, rematch, opponent } = gameState

	useEffect(() => {
		initGame()
		// updateGameState({
		// 	game: new Chess()
		// })
	}, [])

	useEffect(
		() => {
			const moveHandler = (move) => {
				game.move(move)
				makeMove()
				// updateGameState({
				// 	fen: game.fen(),
				// 	history: game.history({ verbose: true }),
				// 	turn: game.turn()
				// })
			}

			const gameEndHandler = (data) => {
				console.log(data)
				const { move, winner, reason } = data
				game.move(move)
				gameEnd({ winner, reason })
				// updateGameState({
				// 	fen: game.fen(),
				// 	turn: 'z',
				// 	winner,
				// 	reason
				// })
			}

			// const rematchHandler = (data) => {
			// 	updateGameState({
			// 		opponent: { ...data }
			// 	})
			// }

			const opponentDisconnectHandler = (data) => {
				//leaveGameState()
				leaveGame()
				leaveQueue()
			}

			if (socket && game) {
				socket.on('move', moveHandler)
				socket.on('gameEnd', gameEndHandler)
				socket.on('rematch', receiveRematch)
				socket.on('playerDisconnect', opponentDisconnectHandler)

				return () => {
					socket.off('move', moveHandler)
					socket.off('gameEnd', gameEndHandler)
					socket.off('rematch', receiveRematch)
				}
			}
		},
		[ socket, game, rematch, gameState ]
	)

	// if this player and opponent both 'true' in rematch, then restart board
	useEffect(
		() => {
			if (gameState) {
				if (opponent.rematch && rematch) {
					initRematch()
					//rematchGameState(new Chess())
				}
			}
		},
		[ gameState, opponent ]
	)

	const onDrop = ({ sourceSquare, targetSquare }) => {
		// check if the move is legal
		let move = game.move({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q'
		})

		// if illegal move
		if (move === null) return
		// else alter game state
		makeMove()
		// updateGameState({
		// 	fen: game.fen(),
		// 	history: game.history({ verbose: true }),
		// 	turn: game.turn()
		// })
		// check winning conditions
		if (game.in_checkmate()) {
			socket.emit('gameEnd', { roomId, move, winner: color, reason: 'checkmate' })
			gameEnd({ winner: color, reason: 'checkmate' })
			// updateGameState({
			// 	winner: color,
			// 	reason: 'checkmate'
			// })
		} else if (game.in_stalemate()) {
			socket.emit('gameEnd', { roomId, move, winner: color, reason: 'stalemate' })
			gameEnd({ winner: color, reason: 'stalemate' })
			// updateGameState({
			// 	winner: color,
			// 	reason: 'stalemate'
			// })
		} else {
			socket.emit('move', { roomId, move })
		}
	}

	const initiateRematch = () => {
		acceptRematch()
		// updateGameState({
		// 	rematch: true
		// })
		socket.emit('rematch', {
			roomId,
			opponent: {
				id: socket.id,
				rematch: true
			}
		})
	}

	const declineRematchHandler = () => {
		declineRematch()
		// updateGameState({
		// 	rematch: true,
		// 	opponent: {
		// 		id: opponent.id,
		// 		rematch: false
		// 	}
		// })
		socket.emit('rematch', {
			roomId,
			opponent: {
				id: socket.id,
				rematch: false,
				decline: true
			}
		})
	}

	const leaveGameHandler = () => {
		socket.emit('leaveRoom', { roomId })
		leaveGame()
		//leaveGameState()
		leaveQueue()
	}

	return (
		<div>
			<Chessboard position={fen} onDrop={onDrop} orientation={color} draggable={turn === color.charAt(0)} />
			{winner && (
				<div>
					<h1>{`${winner} won by ${reason}`}</h1>
					<button onClick={initiateRematch} disabled={rematch || opponent.rematch}>
						Rematch
					</button>
				</div>
			)}
			{opponent.rematch &&
			!rematch && (
				<React.Fragment>
					<button onClick={initiateRematch}>Accept Rematch</button>
					<button onClick={declineRematchHandler}>Decline Rematch</button>
				</React.Fragment>
			)}
			{opponent.decline && <h1>Opponent has declined rematch</h1>}
			<button onClick={leaveGameHandler}>Leave Game</button>
		</div>
	)
}

export default Game
