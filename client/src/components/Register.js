import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'

import { UserContext } from '../context/user/UserContext'

const Register = () => {
	let history = useHistory()

	const { register, userState } = useContext(UserContext)
	const { isLoggedIn } = userState

	const [ user, setUser ] = useState({
		email: '',
		name: '',
		password: ''
	})
	const { email, name, password } = user

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
		register(user)
	}

	return (
		<div>
			<h1>Register Page</h1>
			<form onSubmit={handleSubmit}>
				<label htmlFor="email">Email Address</label>
				<input name="email" type="email" value={email} onChange={handleChange} />

				<label htmlFor="name">Name</label>
				<input name="name" type="text" value={name} onChange={handleChange} />

				<label htmlFor="password">Password</label>
				<input name="password" type="password" value={password} onChange={handleChange} />

				<input type="submit" value="Register" />
			</form>
		</div>
	)
}

export default Register
