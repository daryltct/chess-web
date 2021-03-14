import React, { useState, useEffect, useContext } from 'react'
import { useHistory, Link } from 'react-router-dom'

import { UserContext } from '../context/user/UserContext'
import useMainStyles from './ui/Styles'

import { Grid, Typography, Button, TextField } from '@material-ui/core'

const Register = () => {
	let history = useHistory()
	const mainClasses = useMainStyles()

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
		<Grid container direction="column" alignContent="center" className={mainClasses.mainContainer} spacing={3}>
			<Typography variant="h4" align="center" gutterBottom color="primary">
				REGISTRATION
			</Typography>
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
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<hr />
				<Typography variant="h5" align="center" className={mainClasses.loginAndRegisterFooterLabel}>
					ALREADY HAVE AN ACCOUNT?
				</Typography>

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
