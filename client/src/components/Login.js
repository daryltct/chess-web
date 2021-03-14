import React, { useState, useEffect, useContext } from 'react'
import { useHistory, Link } from 'react-router-dom'

import { UserContext } from '../context/user/UserContext'
import useMainStyles from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography, Button, TextField, Modal, Fade, Backdrop } from '@material-ui/core'

function getModalStyle() {
	const top = 15

	return {
		top: `${top}%`,
		margin: 'auto'
	}
}

const useStyles = makeStyles((theme) => ({
	orLabel: {
		marginTop: '10px'
	},
	paper: {
		position: 'absolute',
		width: 400,
		backgroundColor: theme.palette.background.paper,
		border: '2px solid #000',
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3),
		outline: 'none',
		border: 'none',
		[theme.breakpoints.down('xs')]: {
			width: 280
		}
	},
	modalButton: {
		...theme.typography.buttons,
		height: '50px',
		fontSize: '1.2rem',
		[theme.breakpoints.down('xs')]: {
			height: '40px',
			fontSize: '1.1rem'
		}
	}
}))

const Login = () => {
	let history = useHistory()
	const mainClasses = useMainStyles()
	const classes = useStyles()

	const { login, userState, loginGuest } = useContext(UserContext)
	const { isLoggedIn } = userState

	const [ open, setOpen ] = useState(false)
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

	const callToAction = (
		<Fade in={open}>
			<div className={classes.paper} style={getModalStyle()}>
				<Grid container direction="column" spacing={2}>
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
					<Grid item>
						<Typography>
							<ol style={{ margin: '0px 0px 10px 0px', paddingLeft: '20px' }}>
								<li>KEEP TRACK OF YOUR PROGRESS (GAMES, WINS, LOSS, RATING)</li>
								<li>ABILITY TO RECONNECT TO GAMES</li>
								<li>PRIORITY QUEUEING</li>
								<li>HELP THE COMMUNITY ACHIEVE ACCURATE COMPETENCE RATINGS</li>
							</ol>
						</Typography>
					</Grid>
					<Grid item>
						<Button
							variant="contained"
							color="primary"
							className={classes.modalButton}
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
							className={classes.modalButton}
							onClick={loginGuest}
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
			<Typography variant="h4" align="center" gutterBottom color="primary">
				LOGIN
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

			<Grid item className={mainClasses.loginAndRegisterSubContainer}>
				<hr />
				<Typography variant="h5" align="center" className={mainClasses.loginAndRegisterFooterLabel}>
					NEW USER?
				</Typography>

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
