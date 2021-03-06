import React, { useState, useEffect } from 'react'
import { useHistory, Link } from 'react-router-dom'

import { useAlert } from '../context/alert/AlertContext'
import { useUser, register } from '../context/user/UserContext'
import { useMainStyles } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography, Button, TextField, IconButton } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
	disclaimerText: {
		fontSize: '0.8rem',
		color: 'gray'
	}
}))

const Register = () => {
	let history = useHistory()
	const classes = useStyles()
	const mainClasses = useMainStyles()

	const [ , alertDispatch ] = useAlert()
	const [ userState, userDispatch ] = useUser()
	const { isLoggedIn } = userState

	const [ maskPassword, setMaskPassword ] = useState(true)
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

	const toggleMaskPassword = () => {
		setMaskPassword((prevState) => !prevState)
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
					label="Username"
					onChange={handleChange}
					variant="outlined"
					fullWidth
				/>
			</Grid>
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<TextField
					name="password"
					type={maskPassword ? 'password' : 'text'}
					value={password}
					label="Password"
					onChange={handleChange}
					variant="outlined"
					InputProps={{
						endAdornment: (
							<IconButton aria-label="toggle password visibility" onClick={toggleMaskPassword}>
								{maskPassword ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						)
					}}
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
			{/* Disclaimer text */}
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<Typography align="center" className={classes.disclaimerText}>
					By registering, you are providing consent for the application to store your email address with the
					sole purpose of account authentication and nothing more.
				</Typography>
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
