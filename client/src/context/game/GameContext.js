import React, { createContext, useReducer, useContext } from 'react'
import Chess from 'chess.js'

import gameReducer from './gameReducer'
import { joinQueue } from '../user/UserContext'

const GameContext = createContext()

// ############### CUSTOM HOOK ###############
export const useGame = () => {
	const { gameState, gameDispatch } = useContext(GameContext)
	return [ gameState, gameDispatch ]
}

// ############# ACTION CREATORS #############

// INITIALIZE ROOM, GAME FOUND
export const initRoom = (dispatch, data) => {
	// data: room id, color, opponent
	dispatch({ type: 'INIT_ROOM', payload: data })
}

// START GAME
export const initGame = (dispatch, userDispatch) => {
	dispatch({ type: 'GAME_START', payload: new Chess() })
	joinQueue(userDispatch)
}

// MAKE MOVE
export const makeMove = (dispatch) => {
	dispatch({ type: 'MAKE_MOVE' })
}

// END GAME
export const gameEnd = (dispatch, data) => {
	// data: winner, reason
	dispatch({ type: 'GAME_END', payload: data })
}

// RECEIVE REMATCH REQUEST/DECLINE FROM OPPONENT
export const receiveRematch = (dispatch, data) => {
	dispatch({ type: 'RECEIVE_REMATCH', payload: data })
}

// INITIALIZE REMATCH
export const initRematch = (dispatch) => {
	dispatch({ type: 'INIT_REMATCH', payload: new Chess() })
}

// DECLINE REMATCH REQUEST
export const declineRematch = (dispatch) => {
	dispatch({ type: 'DECLINE_REMATCH' })
}

// ACCEPT/INITIATE REMATCH
export const acceptRematch = (dispatch) => {
	dispatch({ type: 'ACCEPT_REMATCH' })
}

// LEAVE GAME
export const leaveGame = (dispatch) => {
	dispatch({ type: 'LEAVE_GAME' })
}

// RECONNECT TO GAME
export const reconnectGame = (dispatch, data) => {
	const { pgn } = data
	const newGame = new Chess()
	newGame.load_pgn(pgn)

	dispatch({
		type: 'RECONNECT_GAME',
		payload: { ...data, game: newGame, turn: newGame.turn(), fen: newGame.fen() }
	})
}

// PAUSE GAME
export const pauseGame = (dispatch) => {
	dispatch({ type: 'PAUSE_GAME' })
}

// RESUME GAME
export const resumeGame = (dispatch) => {
	dispatch({ type: 'RESUME_GAME' })
}

// ############# CONTEXT PROVIDER #############

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
	const [ gameState, gameDispatch ] = useReducer(gameReducer, initialState)

	return <GameContext.Provider value={{ gameState, gameDispatch }}>{props.children}</GameContext.Provider>
}

export default GameContextProvider
