import { initialState } from './UserContext'

export default (state, action) => {
	switch (action.type) {
		case 'USER_LOADED':
			return {
				...state,
				isLoggedIn: true,
				isLoading: false,
				isGuest: false,
				user: action.payload
			}
		case 'AUTH_ERROR':
			sessionStorage.removeItem('token')
			return {
				...initialState
			}
		case 'LOGIN_SUCCESS':
			sessionStorage.setItem('token', action.payload.token)
			return {
				...state,
				isLoggedIn: true,
				isLoading: false,
				isGuest: false,
				token: action.payload.token
			}
		case 'LOGIN_FAIL':
			sessionStorage.removeItem('token')
			return {
				...initialState
			}
		case 'JOIN_QUEUE':
			return {
				...state,
				inQueue: true
			}
		case 'LEAVE_QUEUE':
			return {
				...state,
				inQueue: false
			}
		case 'UPDATE_USER':
			return {
				...state,
				...action.payload
			}
		default:
			return state
	}
}
