import React, { createContext, useReducer, useEffect, useContext } from 'react'
import axios from 'axios'

import userReducer from './userReducer'
import loadAuthToken from '../../utils/loadAuthToken'
import { AlertContext } from '../alert/AlertContext'

const UserContext = createContext()

export const initialState = {
	isLoggedIn: false,
	isLoading: true,
	isGuest: false,
	socket: null,
	inQueue: false,
	isHost: false,
	user: null,
	token: null
}

const UserContextProvider = (props) => {
	const { setAlert } = useContext(AlertContext)
	const [ userState, userDispatch ] = useReducer(userReducer, initialState)

	// load token on initial render
	loadAuthToken(userState.token)

	useEffect(
		() => {
			loadAuthToken(userState.token)
		},
		[ userState.token ]
	)

	// LOAD USER
	const loadUser = async () => {
		// load token into axios headers
		loadAuthToken(sessionStorage.token)

		try {
			const res = await axios.get('/api/auth')
			userDispatch({ type: 'USER_LOADED', payload: res.data })
		} catch (err) {
			userDispatch({ type: 'AUTH_ERROR' })
		}
	}

	// LOGIN USER
	const login = async (form) => {
		try {
			const res = await axios.post('/api/auth', form) // token
			userDispatch({ type: 'LOGIN_SUCCESS', payload: res.data })
			loadUser()
		} catch (err) {
			userDispatch({ type: 'LOGIN_FAIL', payload: err.response.data.msg })
			setAlert(err.response.data.msg, 'error')
		}
	}

	// REGISTER
	const register = async (form) => {
		try {
			const res = await axios.post('/api/users', form) // token
			userDispatch({ type: 'REGISTER_SUCCESS', payload: res.data })
			loadUser()
		} catch (err) {
			userDispatch({ type: 'REGISTER_FAIL', payload: err.response.data.msg })
			setAlert(err.response.data.msg, 'error')
		}
	}

	// UPDATE USER STATE
	const initSocket = (socket) => {
		userDispatch({ type: 'INIT_SOCKET', payload: socket })
	}

	// JOIN QUEUE
	const joinQueue = () => {
		userDispatch({ type: 'JOIN_QUEUE' })
	}

	// LEAVE QUEUE
	const leaveQueue = () => {
		userDispatch({ type: 'LEAVE_QUEUE' })
	}

	// HOST GAME
	const hostGame = (roomId) => {
		userDispatch({ type: 'HOST_GAME', payload: roomId })
	}

	// LEAVE HOST
	const leaveHost = () => {
		userDispatch({ type: 'LEAVE_HOST' })
	}

	// GUEST LOGIN
	const loginGuest = () => {
		userDispatch({ type: 'LOGIN_GUEST' })
	}

	if (userState.isLoading) {
		loadUser()
	}

	return (
		<UserContext.Provider
			value={{
				userState,
				loadUser,
				login,
				register,
				initSocket,
				joinQueue,
				leaveQueue,
				hostGame,
				leaveHost,
				loginGuest
			}}
		>
			{props.children}
		</UserContext.Provider>
	)
}

export { UserContext, UserContextProvider }
