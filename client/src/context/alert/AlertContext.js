import React, { useReducer, createContext } from 'react'
import uniqid from 'uniqid'

import alertReducer from './alertReducer'

const AlertContext = createContext()

const initialState = []

const AlertContextProvider = (props) => {
	const [ alertState, dispatch ] = useReducer(alertReducer, initialState)

	const setAlert = (msg, type) => {
		const id = uniqid()
		dispatch({ type: 'SET_ALERT', payload: { id, msg, type } })

		setTimeout(() => dispatch({ type: 'REMOVE_ALERT', payload: id }), 3000)
	}

	return <AlertContext.Provider value={{ alertState, setAlert }}>{props.children}</AlertContext.Provider>
}

export { AlertContext, AlertContextProvider }
