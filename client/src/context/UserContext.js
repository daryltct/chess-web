import React, { createContext, useState } from 'react'

const UserContext = createContext()

const UserContextProvider = (props) => {
	const [ userState, setUserState ] = useState({
		socket: null,
		inQueue: false
	})

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
		<UserContext.Provider value={{ userState, updateUserState, joinQueue, leaveQueue }}>
			{props.children}
		</UserContext.Provider>
	)
}

export { UserContext, UserContextProvider }
