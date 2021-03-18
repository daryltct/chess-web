import React, { createContext, useReducer, useContext } from 'react'
import Chess from 'chess.js'

import gameReducer from './gameReducer'
// import { UserContext } from '../user/UserContext'
import { useUser, joinQueue } from '../user/UserContext'

const GameContext = createContext()

export const initialState = {
	roomId: null,
	color: null,
	game: null,
	fen: 'start',
	history: [],
	pgn: null,
	turn: 'w',
	winner: null,
	reason: null,
	rematch: false,
	opponent: null
}

const GameContextProvider = (props) => {
	// const { joinQueue } = useContext(UserContext)
	const [ , userDispatch ] = useUser()
	const [ gameState, gameDispatch ] = useReducer(gameReducer, initialState)

	// INITIALIZE ROOM, GAME FOUND
	const initRoom = (data) => {
		// data: room id, color, opponent
		gameDispatch({ type: 'INIT_ROOM', payload: data })
	}

	// START GAME
	const initGame = () => {
		gameDispatch({ type: 'GAME_START', payload: new Chess() })
		joinQueue(userDispatch)
	}

	// MAKE MOVE
	const makeMove = () => {
		gameDispatch({ type: 'MAKE_MOVE' })
	}

	// END GAME
	const gameEnd = (data) => {
		// data: winner, reason
		gameDispatch({ type: 'GAME_END', payload: data })
	}

	// RECEIVE REMATCH REQUEST/DECLINE FROM OPPONENT
	const receiveRematch = (data) => {
		gameDispatch({ type: 'RECEIVE_REMATCH', payload: data })
	}

	// INITIALIZE REMATCH
	const initRematch = () => {
		gameDispatch({ type: 'INIT_REMATCH', payload: new Chess() })
	}

	// DECLINE REMATCH REQUEST
	const declineRematch = () => {
		gameDispatch({ type: 'DECLINE_REMATCH' })
	}

	// ACCEPT/INITIATE REMATCH
	const acceptRematch = () => {
		gameDispatch({ type: 'ACCEPT_REMATCH' })
	}

	// LEAVE GAME
	const leaveGame = () => {
		gameDispatch({ type: 'LEAVE_GAME' })
	}

	// RECONNECT TO GAME
	const reconnectGame = (data) => {
		const { pgn } = data
		const newGame = new Chess()
		newGame.load_pgn(pgn)

		gameDispatch({
			type: 'RECONNECT_GAME',
			payload: { ...data, game: newGame, turn: newGame.turn(), fen: newGame.fen() }
		})
	}

	// PAUSE GAME
	const pauseGame = () => {
		gameDispatch({ type: 'PAUSE_GAME' })
	}

	// RESUME GAME
	const resumeGame = () => {
		gameDispatch({ type: 'RESUME_GAME' })
	}

	return (
		<GameContext.Provider
			value={{
				gameState,
				initRoom,
				initGame,
				makeMove,
				gameEnd,
				receiveRematch,
				initRematch,
				declineRematch,
				acceptRematch,
				leaveGame,
				reconnectGame,
				pauseGame,
				resumeGame
			}}
		>
			{props.children}
		</GameContext.Provider>
	)
}

export { GameContext, GameContextProvider }
