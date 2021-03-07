import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

import loadAuthToken from '../utils/loadAuthToken'

const UserContext = createContext()

const initialState = {
	isLoggedIn: false,
	isLoading: true,
	isGuest: false,
	socket: null,
	inQueue: false,
	user: null,
	token: null
}

const UserContextProvider = (props) => {
	const [ userState, setUserState ] = useState(initialState)
	// load token on initial render
	loadAuthToken(userState.token)

	useEffect(
		() => {
			loadAuthToken(userState.token)
		},
		[ userState.token ]
	)

	const loadUser = async () => {
		// load token into axios headers
		loadAuthToken(sessionStorage.token)

		try {
			const res = await axios.get('/api/auth')

			setUserState((prevState) => ({
				...prevState,
				isLoggedIn: true,
				isLoading: false,
				isGuest: false,
				user: res.data
			}))
		} catch (e) {
			sessionStorage.removeItem('token')
			setUserState(initialState)
		}
	}

	const login = async (form) => {
		try {
			const res = await axios.post('/api/auth', form) // token
			// store token in local storage
			sessionStorage.setItem('token', res.data.token)
			// update user state
			setUserState((prevState) => ({
				...prevState,
				isLoggedIn: true,
				isLoading: false,
				isGuest: false,
				token: res.data.token
			}))
		} catch (e) {
			sessionStorage.removeItem('token')
			setUserState(initialState)
		}
	}

	const updateUserState = (obj) => {
		setUserState((prevState) => ({
			...prevState,
			...obj
		}))
	}

	const joinQueue = () => {
		setUserState((prevState) => ({
			...prevState,
			inQueue: true
		}))
	}

	const leaveQueue = () => {
		setUserState((prevState) => ({
			...prevState,
			inQueue: false
		}))
	}

	// load user on refresh
	if (userState.isLoading) {
		loadUser()
	}

	return (
		<UserContext.Provider value={{ userState, loadUser, login, updateUserState, joinQueue, leaveQueue }}>
			{props.children}
		</UserContext.Provider>
	)
}

export { UserContext, UserContextProvider }
