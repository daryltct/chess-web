import React, { useState, useEffect } from 'react'
import { useHistory, Link } from 'react-router-dom'

import { useAlert } from '../context/alert/AlertContext'
import { useUser, register } from '../context/user/UserContext'
import { useMainStyles } from './ui/Styles'

import { Grid, Typography, Button, TextField } from '@material-ui/core'

const Register = () => {
	let history = useHistory()
	const mainClasses = useMainStyles()

	const [ , alertDispatch ] = useAlert()
	const [ userState, userDispatch ] = useUser()
	const { isLoggedIn } = userState

	const [ user, setUser ] = useState({
		email: '',
		name: '',
		password: ''
	})
	const { email, name, password } = user

	// If user already logged in, redirect to home page
	useEffect(
		() => {
			if (isLoggedIn) {
				history.push('/')
			}
		},
		[ isLoggedIn, history ]
	)

	// input fields update
	const handleChange = (event) => {
		const { name, value } = event.target
		setUser((prevState) => ({
			...prevState,
			[name]: value
		}))
	}

	const handleSubmit = (event) => {
		event.preventDefault()
		register(userDispatch, alertDispatch, user)
	}

	return (
		<Grid container direction="column" alignContent="center" className={mainClasses.mainContainer} spacing={3}>
			{/* Page header */}
			<Typography variant="h4" align="center" gutterBottom color="primary">
				REGISTRATION
			</Typography>
			{/* Input fields */}
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<TextField
					name="email"
					type="email"
					value={email}
					label="Email Address"
					onChange={handleChange}
					variant="outlined"
					fullWidth
				/>
			</Grid>
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<TextField
					name="name"
					type="text"
					value={name}
					label="Name"
					onChange={handleChange}
					variant="outlined"
					fullWidth
				/>
			</Grid>
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<TextField
					name="password"
					type="password"
					value={password}
					label="Password"
					onChange={handleChange}
					variant="outlined"
					fullWidth
				/>
			</Grid>
			{/* Register button */}
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<Button
					className={mainClasses.loginAndRegisterButton}
					variant="contained"
					color="primary"
					onClick={handleSubmit}
				>
					Register
				</Button>
			</Grid>
			{/* Footer - link to login page */}
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<hr />
				<Typography variant="h5" align="center" className={mainClasses.loginAndRegisterFooterLabel}>
					ALREADY HAVE AN ACCOUNT?
				</Typography>
				{/* Login button */}
				<Button
					className={mainClasses.loginAndRegisterButton}
					variant="contained"
					color="primary"
					component={Link}
					to="/login"
				>
					Login
				</Button>
			</Grid>
		</Grid>
	)
}

export default Register
