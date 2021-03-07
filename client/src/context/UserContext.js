import React, { createContext, useState } from 'react'

const UserContext = createContext()

const initialState = {
	socket: null,
	inQueue: false
}

const UserContextProvider = (props) => {
	const [ userState, setUserState ] = useState(null)

	const userLogin = (userObj) => {
		setUserState({
			...userObj,
			...initialState
		})
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

	return (
		<UserContext.Provider value={{ userState, userLogin, updateUserState, joinQueue, leaveQueue }}>
			{props.children}
		</UserContext.Provider>
	)
}

export { UserContext, UserContextProvider }
