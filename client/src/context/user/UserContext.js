import React, { createContext, useReducer, useEffect, useContext } from 'react'
import axios from 'axios'

import userReducer from './userReducer'
import loadAuthToken from '../../utils/loadAuthToken'
import { AlertContext } from '../alert/AlertContext'

const UserContext = createContext()

// ############### CUSTOM HOOK ###############
export const useUser = () => {
	const { userState, userDispatch } = useContext(UserContext)
	return [ userState, userDispatch ]
}

// ############# ACTION CREATORS #############

// LOAD USER
export const loadUser = async (dispatch) => {
	// load token into axios headers
	loadAuthToken(sessionStorage.token)

	try {
		const res = await axios.get('/api/auth')
		dispatch({ type: 'USER_LOADED', payload: res.data })
	} catch (err) {
		dispatch({ type: 'AUTH_ERROR' })
	}
}

// LOGIN USER
export const login = async (dispatch, form) => {
	try {
		const res = await axios.post('/api/auth', form) // token
		dispatch({ type: 'LOGIN_SUCCESS', payload: res.data })
		loadUser(dispatch)
	} catch (err) {
		dispatch({ type: 'LOGIN_FAIL', payload: err.response.data.msg })
		// setAlert(err.response.data.msg, 'error')
	}
}

// REGISTER
export const register = async (dispatch, form) => {
	try {
		const res = await axios.post('/api/users', form) // token
		dispatch({ type: 'REGISTER_SUCCESS', payload: res.data })
		loadUser(dispatch)
	} catch (err) {
		dispatch({ type: 'REGISTER_FAIL', payload: err.response.data.msg })
		// setAlert(err.response.data.msg, 'error')
	}
}

// GUEST LOGIN
export const loginGuest = (dispatch) => {
	dispatch({ type: 'LOGIN_GUEST' })
}

// INITIALIZE SOCKET
export const initSocket = (dispatch, socket) => {
	dispatch({ type: 'INIT_SOCKET', payload: socket })
}

// JOIN QUEUE
export const joinQueue = (dispatch) => {
	dispatch({ type: 'JOIN_QUEUE' })
}

// LEAVE QUEUE
export const leaveQueue = (dispatch) => {
	dispatch({ type: 'LEAVE_QUEUE' })
}

// HOST GAME
export const hostGame = (dispatch, roomId) => {
	dispatch({ type: 'HOST_GAME', payload: roomId })
}

// LEAVE HOST
export const leaveHost = (dispatch) => {
	dispatch({ type: 'LEAVE_HOST' })
}

// ############# CONTEXT PROVIDER #############

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
	// const { setAlert } = useContext(AlertContext)
	const [ userState, userDispatch ] = useReducer(userReducer, initialState)

	// load token on initial render
	loadAuthToken(userState.token)

	if (userState.isLoading) {
		loadUser(userDispatch)
	}

	useEffect(
		() => {
			loadAuthToken(userState.token)
		},
		[ userState.token ]
	)

	return <UserContext.Provider value={{ userState, userDispatch }}>{props.children}</UserContext.Provider>
}

export default UserContextProvider
