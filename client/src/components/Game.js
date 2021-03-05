import React, { useEffect, useState, useContext } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

import { GameContext } from '../context/GameContext'

const initialState = {
	initiate: false,
	receive: false
}

const Game = ({ socket }) => {
	const { gameState, updateGameState, rematchGameState } = useContext(GameContext)
	const { game, roomId, color, fen, turn, winner, reason } = gameState

	const [ rematch, setRematch ] = useState(initialState)

	useEffect(() => {
		updateGameState({
			game: new Chess()
		})
	}, [])

	useEffect(
		() => {
			const moveHandler = (move) => {
				game.move(move)
				updateGameState({
					fen: game.fen(),
					history: game.history({ verbose: true }),
					turn: game.turn()
				})
			}

			const gameEndHandler = (data) => {
				console.log(data)
				const { move, winner, reason } = data
				game.move(move)
				updateGameState({
					fen: game.fen(),
					turn: 'z',
					winner,
					reason
				})
			}

			const rematchHandler = (data) => {
				// both players initiated
				if (rematch.initiate && data.rematch) {
					rematchGameState(new Chess())
					setRematch(initialState)
				} else if (data.rematch) {
					setRematch((prevState) => ({
						...prevState,
						receive: true
					}))
				}
			}

			if (socket && game) {
				socket.on('move', moveHandler)
				socket.on('gameEnd', gameEndHandler)
				socket.on('rematch', rematchHandler)

				return () => {
					socket.off('move', moveHandler)
					socket.off('gameEnd', gameEndHandler)
					socket.off('rematch', rematchHandler)
				}
			}
		},
		[ socket, game, rematch, gameState ]
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
		updateGameState({
			fen: game.fen(),
			history: game.history({ verbose: true }),
			turn: game.turn()
		})
		// check winning conditions
		if (game.in_checkmate()) {
			socket.emit('gameEnd', { roomId, move, winner: color, reason: 'checkmate' })
			updateGameState({
				winner: color,
				reason: 'checkmate'
			})
		} else if (game.in_stalemate()) {
			socket.emit('gameEnd', { roomId, move, winner: color, reason: 'stalemate' })
			updateGameState({
				winner: color,
				reason: 'stalemate'
			})
		} else {
			socket.emit('move', { roomId, move })
		}
	}

	const initiateRematch = () => {
		setRematch((prevState) => ({
			...prevState,
			initiate: true
		}))
		socket.emit('rematch', { roomId, rematch: true })
	}

	const acceptRematch = () => {
		rematchGameState(new Chess())
		setRematch(initialState)
		socket.emit('rematch', { roomId, rematch: true })
	}

	return (
		<div>
			<Chessboard position={fen} onDrop={onDrop} orientation={color} draggable={turn === color.charAt(0)} />
			{winner && (
				<div>
					<h1>{`${winner} won by ${reason}`}</h1>
					<button onClick={initiateRematch} disabled={rematch.initiate || rematch.receive}>
						Rematch
					</button>
					<button onClick={() => console.log(rematch.initiate)}>print</button>
				</div>
			)}
			{rematch.receive &&
			!rematch.initiate && (
				<React.Fragment>
					<button onClick={acceptRematch}>Accept Rematch</button>
					<button>Decline Rematch</button>
				</React.Fragment>
			)}
		</div>
	)
}

export default Game
