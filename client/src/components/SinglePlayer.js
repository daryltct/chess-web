import React, { useState, useEffect } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'
import { Game } from 'js-chess-engine'

const SinglePlayer = () => {
	const [ gameState, setGameState ] = useState({
		game: null,
		fen: 'start',
		turn: 'w',
		winner: null
	})
	const { game, fen, turn } = gameState

	useEffect(() => {
		setGameState((prevState) => ({
			...prevState,
			game: new Game()
		}))
	}, [])

	const updateStateOnMove = () => {
		setGameState((prevState) => ({
			...prevState,
			fen: game.exportFEN(),
			turn: prevState.turn === 'w' ? 'b' : 'w'
		}))
	}

	const onDrop = ({ sourceSquare, targetSquare }) => {
		// check if the move is legal
		try {
			game.move(sourceSquare, targetSquare)
			updateStateOnMove()

			// // AI make move
			// game.aiMove(3)
			// updateStateOnMove()
		} catch (e) {
			console.log(e)
		}
	}

	useEffect(
		() => {
			const invokeAI = () => {
				game.aiMove(2)
				updateStateOnMove()
			}
			if (game && turn === 'b') {
				setTimeout(invokeAI, 500)
			}
		},
		[ updateStateOnMove ]
	)

	return game && <Chessboard position={fen} onDrop={onDrop} draggable={turn === 'w' ? true : false} />
}

export default SinglePlayer
