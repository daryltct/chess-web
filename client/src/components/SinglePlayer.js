import React, { useState, useEffect } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'
import { Game } from 'js-chess-engine'

const LEVELS = [ { level: 1, desc: 'Rookie' }, { level: 2, desc: 'Intermediate' }, { level: 3, desc: 'Advanced' } ]

const SinglePlayer = () => {
	const [ gameState, setGameState ] = useState({
		level: null,
		game: null,
		fen: 'start',
		turn: 'w',
		winner: null
	})
	const { level, game, fen, turn } = gameState

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
		} catch (e) {
			console.log(e)
		}
	}

	const selectLevel = (level) => {
		setGameState((prevState) => ({
			...prevState,
			level
		}))
	}

	useEffect(
		() => {
			const invokeAI = () => {
				game.aiMove(level)
				updateStateOnMove()
			}
			if (game && turn === 'b') {
				setTimeout(invokeAI, 500)
			}
		},
		[ updateStateOnMove ]
	)

	const levelSelectionDisplay = (
		<div>
			<h1>Select Difficulty</h1>
			{LEVELS.map((obj) => <button onClick={() => selectLevel(obj.level)}>{obj.desc}</button>)}
		</div>
	)

	return (
		game &&
		(level ? (
			<Chessboard position={fen} onDrop={onDrop} draggable={turn === 'w' ? true : false} />
		) : (
			levelSelectionDisplay
		))
	)
}

export default SinglePlayer
