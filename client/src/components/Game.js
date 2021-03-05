import React, { useEffect, useState, useContext } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

import { GameContext } from '../context/GameContext'

const Game = ({ socket }) => {
	const { gameState, updateGameState } = useContext(GameContext)
	const { game, roomId, color, fen, turn, winner, reason } = gameState

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

			if (socket && game) {
				socket.on('move', moveHandler)
				socket.on('gameEnd', gameEndHandler)

				return () => {
					socket.off('move', moveHandler)
					socket.off('gameEnd', gameEndHandler)
				}
			}
		},
		[ socket, game ]
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

	return (
		<div>
			<Chessboard position={fen} onDrop={onDrop} orientation={color} draggable={turn === color.charAt(0)} />
			{winner && <h1>{`${winner} won by ${reason}`}</h1>}
		</div>
	)
}

export default Game
