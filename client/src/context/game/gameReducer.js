import { initialState } from './GameContext'

export default (state, action) => {
	switch (action.type) {
		case 'INIT_ROOM':
			const { roomId, color, opponent } = action.payload
			return {
				...state,
				roomId,
				color,
				opponent
			}
		case 'GAME_START':
			return {
				...state,
				game: action.payload
			}
		case 'MAKE_MOVE':
			// const {fen, history, turn} = action.payload
			return {
				...state,
				fen: state.game.fen(),
				history: state.game.history({ verbose: true }),
				pgn: state.game.pgn(),
				turn: state.game.turn()
			}
		case 'GAME_END':
			const { winner, reason } = action.payload
			return {
				...state,
				fen: state.game.fen(),
				turn: '-',
				winner,
				reason
			}
		case 'RECEIVE_REMATCH':
			return {
				...state,
				opponent: { ...state.opponent, ...action.payload }
			}
		case 'INIT_REMATCH':
			return {
				...initialState,
				roomId: state.roomId,
				color: state.color === 'white' ? 'black' : 'white',
				game: action.payload,
				fen: 'start',
				pgn: null,
				opponent: {
					...state.opponent,
					id: state.opponent.id,
					rematch: false
				}
			}
		case 'DECLINE_REMATCH':
			return {
				...state,
				rematch: true,
				opponent: {
					...state.opponent,
					id: state.opponent.id,
					rematch: false
				}
			}
		case 'ACCEPT_REMATCH':
			return {
				...state,
				rematch: true
			}
		case 'LEAVE_GAME':
			return {
				...initialState
			}
		case 'RECONNECT_GAME':
			return {
				...state,
				...action.payload
			}
		case 'PAUSE_GAME':
			return {
				...state,
				turn: '-'
			}
		case 'RESUME_GAME':
			return {
				...state,
				turn: state.game.turn()
			}
		default:
			return state
	}
}
