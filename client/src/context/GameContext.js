import React, { createContext, useState } from 'react'

const GameContext = createContext()

const initialState = {
	roomId: null,
	color: null,
	game: null,
	fen: 'start',
	history: [],
	turn: 'w',
	winner: null,
	reason: null
}

const GameContextProvider = (props) => {
	const [ gameState, setGameState ] = useState(initialState)

	const updateGameState = (obj) => {
		setGameState((prevState) => ({
			...prevState,
			...obj
		}))
	}

	const rematchGameState = (newChessObj) => {
		setGameState((prevState) => ({
			...initialState,
			roomId: prevState.roomId,
			color: prevState.color === 'white' ? 'black' : 'white',
			game: newChessObj,
			fen: 'start'
		}))
	}

	const leaveGameState = () => {
		setGameState(initialState)
	}

	return (
		<GameContext.Provider value={{ gameState, updateGameState, rematchGameState, leaveGameState }}>
			{props.children}
		</GameContext.Provider>
	)
}

export { GameContextProvider, GameContext }
