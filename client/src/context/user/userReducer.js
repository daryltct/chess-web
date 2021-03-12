import uniqid from 'uniqid'

import { initialState } from './UserContext'

export default (state, action) => {
	switch (action.type) {
		case 'USER_LOADED':
			return {
				...state,
				isLoggedIn: true,
				isLoading: false,
				isGuest: false,
				user: action.payload,
				token: sessionStorage.token
			}
		case 'AUTH_ERROR':
			sessionStorage.removeItem('token')
			return {
				...initialState,
				isLoading: false
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
				...initialState,
				isLoading: false
			}
		case 'REGISTER_SUCCESS':
			sessionStorage.setItem('token', action.payload.token)
			return {
				...state,
				isLoggedIn: true,
				isLoading: false,
				isGuest: false,
				token: action.payload.token
			}
		case 'REGISTER_FAIL':
			sessionStorage.removeItem('token')
			return {
				...initialState,
				isLoading: false
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
		case 'INIT_SOCKET':
			return {
				...state,
				socket: action.payload
			}
		case 'LOGIN_GUEST':
			const randomId = uniqid('guest-')
			return {
				...state,
				isLoggedIn: true,
				isLoading: false,
				isGuest: true,
				token: null,
				user: {
					_id: randomId,
					name: randomId.slice(0, 11)
				}
			}
		default:
			return state
	}
}
