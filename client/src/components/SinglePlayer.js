import React, { useState, useEffect, useContext } from 'react'
import Chessboard from 'chessboardjsx'
import { Game } from 'js-chess-engine'

import { UserContext } from '../context/user/UserContext'

const LEVELS = [ { level: 1, desc: 'Rookie' }, { level: 2, desc: 'Intermediate' }, { level: 3, desc: 'Advanced' } ]

const SinglePlayer = () => {
	const { userState: { socket } } = useContext(UserContext)

	const [ gameState, setGameState ] = useState({
		level: null,
		game: null,
		fen: 'start',
		turn: 'white',
		isFinished: false,
		winner: null
	})
	const { level, game, fen, turn, isFinished, winner } = gameState

	useEffect(() => {
		setGameState((prevState) => ({
			...prevState,
			game: new Game()
		}))
		socket.close()
	}, [])

	useEffect(
		() => {
			if (isFinished) {
				setGameState((prevState) => ({
					...prevState,
					winner: prevState.turn === 'white' ? 'black' : 'white',
					turn: '-'
				}))
			}
		},
		[ isFinished ]
	)

	const updateStateOnMove = () => {
		setGameState((prevState) => ({
			...prevState,
			fen: game.exportFEN(),
			turn: prevState.turn === 'white' ? 'black' : 'white',
			isFinished: game.exportJson().isFinished
		}))
	}

	const invokeAI = () => {
		game.aiMove(level - 1)
		updateStateOnMove()
	}

	const onDrop = ({ sourceSquare, targetSquare }) => {
		// check if the move is legal
		try {
			game.move(sourceSquare, targetSquare)
			updateStateOnMove()

			// if game has not ended, invoke chess ai
			if (!game.exportJson().isFinished) {
				setTimeout(invokeAI, 500)
			}
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

	const levelSelectionDisplay = (
		<div>
			<h1>Select Difficulty</h1>
			{LEVELS.map((obj) => <button onClick={() => selectLevel(obj.level)}>{obj.desc}</button>)}
		</div>
	)

	return (
		<div>
			{game &&
				(level ? (
					<Chessboard position={fen} onDrop={onDrop} draggable={turn === 'white'} />
				) : (
					levelSelectionDisplay
				))}
			{turn === 'black' && <h2>loading...</h2>}
			{winner && <h1>{winner === 'white' ? 'YOU WIN' : 'YOU LOSE'}</h1>}
		</div>
	)
}

export default SinglePlayer
