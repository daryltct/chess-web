import React, { useState, useEffect } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'
import { Game } from 'js-chess-engine'

const SinglePlayer = () => {
	const [ gameState, setGameState ] = useState({
		game: null,
		color: null,
		fen: 'start',
		turn: 'w',
		winner: null,
		reason: null
	})
	const { game, color, fen, turn } = gameState

	useEffect(() => {
		setGameState((prevState) => ({
			...prevState,
			game: new Game()
		}))
	}, [])

	useEffect(
		() => {
			const updateFen = () => {
				setGameState((prevState) => ({
					...prevState,
					fen: game.exportFEN()
				}))
			}
			if (game) {
				updateFen()
			}
		},
		[ game ]
	)

	const onDrop = ({ sourceSquare, targetSquare }) => {
		// check if the move is legal
		let newMove = game.move(sourceSquare, targetSquare)

		// if illegal move
		if (newMove === null) return
		// else alter game state
		setGameState((prevState) => ({
			...prevState,
			fen: game.exportFEN(),
			turn: 'b'
		}))

		// AI make move
		game.aiMove()
		setGameState((prevState) => ({
			...prevState,
			fen: game.exportFEN(),
			turn: 'w'
		}))
	}

	return game && <Chessboard position={fen} onDrop={onDrop} />
}

export default SinglePlayer
