import React, { useReducer, createContext, useContext } from 'react'
import uniqid from 'uniqid'

import alertReducer from './alertReducer'

const AlertContext = createContext()

// ############### CUSTOM HOOK ###############
export const useAlert = () => {
	const { alertState, alertDispatch } = useContext(AlertContext)
	return [ alertState, alertDispatch ]
}

// ############# ACTION CREATORS #############

// SET ALERT
export const setAlert = (dispatch, msg, type) => {
	const id = uniqid()
	dispatch({ type: 'SET_ALERT', payload: { id, msg: msg ? msg : 'Server Error', type } })
	// Remove alert after 3 seconds
	setTimeout(() => dispatch({ type: 'REMOVE_ALERT', payload: id }), 3000)
}

// ############# CONTEXT PROVIDER #############

const initialState = []

const AlertContextProvider = (props) => {
	const [ alertState, alertDispatch ] = useReducer(alertReducer, initialState)

	return <AlertContext.Provider value={{ alertState, alertDispatch }}>{props.children}</AlertContext.Provider>
}

export default AlertContextProvider
