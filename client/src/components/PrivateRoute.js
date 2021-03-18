import React, { useContext } from 'react'
import { Route, Redirect } from 'react-router-dom'

// import { UserContext } from '../context/user/UserContext'
import { useUser } from '../context/user/UserContext'

const PrivateRoute = ({ component: Component, ...rest }) => {
	// const { userState } = useContext(UserContext)
	const [ userState, userDispatch ] = useUser()

	return (
		<Route
			{...rest}
			render={(props) => (userState.isLoggedIn ? <Component {...props} /> : <Redirect to="/login" />)}
		/>
	)
}

export default PrivateRoute
