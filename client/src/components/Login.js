import React, { useState, useEffect, useContext } from 'react'
import { useHistory, Link } from 'react-router-dom'

import { UserContext } from '../context/user/UserContext'
import useMainStyles from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography, Button, CircularProgress, Fade, TextField } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
	subContainer: {
		width: 'inherit',
		maxWidth: '400px'
	},
	tipContainer: {
		width: 'inherit',
		maxWidth: '400px',
		marginTop: '20px',
		padding: '20px 40px !important',
		border: `2px solid ${theme.palette.common.crayola}`,
		borderRadius: '25px'
	},
	loginButton: {
		...theme.typography.buttons,
		height: '60px',
		marginTop: '10px',
		width: '100%',
		[theme.breakpoints.down('xs')]: {
			height: '50px',
			fontSize: '1.2rem'
		}
	},
	orLabel: {
		marginTop: '10px'
	},
	newLabel: {
		margin: '20px 0px 10px 0px'
	}
}))

const Login = () => {
	let history = useHistory()
	const mainClasses = useMainStyles()
	const classes = useStyles()

	const { login, userState, loginGuest } = useContext(UserContext)
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
		<Grid
			container
			direction="column"
			alignContent="center"
			// alignItems="center"
			className={mainClasses.mainContainer}
			spacing={3}
		>
			<Typography variant="h4" align="center" gutterBottom color="primary">
				LOGIN
			</Typography>
			{/* <Grid container item direction="column" alignContent="center" alignItems="center" spacing={3}> */}
			<Grid item className={classes.subContainer}>
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
			<Grid item className={classes.subContainer}>
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
			<Grid item className={classes.subContainer}>
				<Button className={classes.loginButton} variant="contained" color="primary" onClick={handleSubmit}>
					Login
				</Button>

				<Typography variant="h5" align="center" className={classes.orLabel}>
					OR
				</Typography>

				<Button className={classes.loginButton} variant="contained" color="secondary" onClick={loginGuest}>
					Continue as Guest
				</Button>
			</Grid>

			<Grid item className={classes.subContainer}>
				<hr />
				<Typography variant="h5" align="center" className={classes.newLabel}>
					NEW USER?
				</Typography>

				<Button
					className={classes.loginButton}
					variant="contained"
					color="primary"
					component={Link}
					to="/register"
				>
					Register
				</Button>
			</Grid>
		</Grid>
	)
}

export default Login
