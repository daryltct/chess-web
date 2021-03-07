import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { UserContext } from '../context/user/UserContext'

const Login = () => {
	let history = useHistory()

	const { login, userState } = useContext(UserContext)
	const { isLoggedIn } = userState

	const [ user, setUser ] = useState({
		email: '',
		password: ''
	})
	const { email, password } = user

	useEffect(
		() => {
			if (isLoggedIn) {
				history.push('/')
			}
		},
		[ isLoggedIn ]
	)

	const handleChange = (event) => {
		const { name, value } = event.target
		setUser((prevState) => ({
			...prevState,
			[name]: value
		}))
	}

	const handleSubmit = (event) => {
		event.preventDefault()
		login(user)
	}

	return (
		<div>
			<h1>Login Page</h1>
			<form onSubmit={handleSubmit}>
				<label htmlFor="email">Email Address</label>
				<input name="email" type="email" value={email} onChange={handleChange} />

				<label htmlFor="password">Password</label>
				<input name="password" type="password" value={password} onChange={handleChange} />

				<input type="submit" value="Login" />
			</form>
		</div>
	)
}

export default Login
