import React, { useState, useEffect } from 'react'
import { useHistory, Link } from 'react-router-dom'

import { useAlert } from '../context/alert/AlertContext'
import { useUser, login, loginGuest } from '../context/user/UserContext'
import { useMainStyles, getModalStyle } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography, Button, TextField, Modal, Fade, Backdrop, IconButton } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'

// INLINE STYLES
const useStyles = makeStyles((theme) => ({
	orLabel: {
		marginTop: '10px'
	},
	orderedList: {
		margin: '0px 0px 10px 0px',
		paddingLeft: '20px',
		fontFamily: theme.typography.fontFamily
	},
	listItem: {
		marginBottom: '5px'
	}
}))

const Login = () => {
	let history = useHistory()
	const mainClasses = useMainStyles()
	const classes = useStyles()

	const [ , alertDispatch ] = useAlert()
	const [ userState, userDispatch ] = useUser()
	const { isLoggedIn } = userState

	const [ maskPassword, setMaskPassword ] = useState(true)
	const [ open, setOpen ] = useState(false)
	const [ user, setUser ] = useState({
		email: '',
		password: ''
	})
	const { email, password } = user

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
		login(userDispatch, alertDispatch, user)
	}

	const toggleMaskPassword = () => {
		setMaskPassword((prevState) => !prevState)
	}

	// display call to action modal to register if user attempts to login as guest
	const callToAction = (
		<Fade in={open}>
			<div className={mainClasses.paper} style={getModalStyle()}>
				<Grid container direction="column" spacing={2}>
					{/* Modal header */}
					<Grid item>
						<Typography variant="h4" align="center">
							CONSIDER REGISTERING!
						</Typography>
						<hr />
					</Grid>
					<Grid item>
						<Typography variant="h6" align="center">
							ENJOY THESE PERKS WHEN PLAYING WITH AN ACCOUNT:
						</Typography>
					</Grid>
					{/* Modal body */}
					<Grid item>
						<ol className={classes.orderedList}>
							<li className={classes.listItem}>
								KEEP TRACK OF YOUR PROGRESS (GAMES, WINS, LOSS, RATING)
							</li>
							<li className={classes.listItem}>ABILITY TO RECONNECT TO GAMES</li>
							<li className={classes.listItem}>PRIORITY QUEUEING</li>
							<li className={classes.listItem}>HELP THE COMMUNITY ACHIEVE ACCURATE COMPETENCE RATINGS</li>
						</ol>
					</Grid>
					{/* Modal buttons */}
					<Grid item>
						<Button
							variant="contained"
							color="primary"
							className={mainClasses.modalButton}
							component={Link}
							to="/register"
							fullWidth
						>
							REGISTER NOW
						</Button>
					</Grid>
					<Grid item>
						<Button
							variant="contained"
							color="secondary"
							className={mainClasses.modalButton}
							onClick={() => loginGuest(userDispatch)}
							fullWidth
						>
							I'LL PASS ON THESE PERKS
						</Button>
					</Grid>
				</Grid>
			</div>
		</Fade>
	)

	return (
		<Grid container direction="column" alignContent="center" className={mainClasses.mainContainer} spacing={3}>
			{/* Page header */}
			<Typography variant="h4" align="center" gutterBottom color="primary">
				LOGIN
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
			{/* Login button */}
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<Button
					className={mainClasses.loginAndRegisterButton}
					variant="contained"
					color="primary"
					onClick={handleSubmit}
				>
					Login
				</Button>

				<Typography variant="h5" align="center" className={classes.orLabel}>
					OR
				</Typography>

				<Button
					className={mainClasses.loginAndRegisterButton}
					variant="contained"
					color="secondary"
					onClick={() => setOpen(true)}
				>
					Continue as Guest
				</Button>
			</Grid>
			{/* Footer - link to register page */}
			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<hr />
				<Typography variant="h5" align="center" className={mainClasses.loginAndRegisterFooterLabel}>
					NEW USER?
				</Typography>
				{/* Register button */}
				<Button
					className={mainClasses.loginAndRegisterButton}
					variant="contained"
					color="primary"
					component={Link}
					to="/register"
				>
					Register
				</Button>
			</Grid>
			<Modal
				open={open}
				onClose={() => setOpen(false)}
				style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500
				}}
			>
				{callToAction}
			</Modal>
		</Grid>
	)
}

export default Login
