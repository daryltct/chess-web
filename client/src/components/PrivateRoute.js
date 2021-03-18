import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import { useUser } from '../context/user/UserContext'

const PrivateRoute = ({ component: Component, ...rest }) => {
	const [ userState ] = useUser()

	return (
		<Route
			{...rest}
			render={(props) => (userState.isLoggedIn ? <Component {...props} /> : <Redirect to="/login" />)}
		/>
	)
}

export default PrivateRoute
