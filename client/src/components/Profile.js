import React, { useState, useEffect } from 'react'
import axios from 'axios'

import { useAlert, setAlert } from '../context/alert/AlertContext'
import { useUser, loadUser } from '../context/user/UserContext'
import { useMainStyles } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography, CircularProgress, Button, TextField } from '@material-ui/core'

// INLINE STYLES
const useStyles = makeStyles((theme) => ({
	profileContainer: {
		padding: '20px',
		maxWidth: '350px'
	},
	subContainer: {
		padding: '20px',
		textAlign: 'center',
		maxWidth: '350px'
	},
	myDetailsContainer: {
		display: 'inline-block',
		textAlign: 'left',
		height: '200px'
	},
	playerContainer: {
		marginBottom: '15px'
	},
	inputContainer: {
		display: 'flex',
		flexDirection: 'column',
		height: '200px',
		justifyContent: 'space-evenly'
	},
	editButton: {
		...theme.typography.buttons,
		display: 'block',
		width: '150px',
		margin: '0px auto 20px auto'
	}
}))

const Profile = () => {
	const mainClasses = useMainStyles()
	const classes = useStyles()

	const [ , alertDispatch ] = useAlert()
	const [ userState, userDispatch ] = useUser()
	const { user, isGuest, socket } = userState

	const [ top5, setTop5 ] = useState(null)
	const [ rank, setRank ] = useState(null)
	const [ editMode, setEditMode ] = useState(false)
	const [ userDetails, setUserDetails ] = useState({
		email: '',
		name: ''
	})
	const { email, name } = userDetails

	useEffect(
		() => {
			const getUsers = async () => {
				try {
					const res = await axios.get('/api/users')
					setRank(res.data.rank)
					setTop5(res.data.users)
				} catch (err) {
					setAlert(alertDispatch, err.response.data.msg, 'error')
				}
			}
			if (socket) {
				socket.close()
			}
			if (!isGuest) {
				loadUser(userDispatch)
				getUsers()
			}
		},
		[ isGuest, socket, alertDispatch, userDispatch ]
	)

	useEffect(
		() => {
			if (user) {
				setUserDetails({
					email: user.email,
					name: user.name
				})
			}
		},
		[ user ]
	)

	// input fields update
	const handleChange = (event) => {
		const { name, value } = event.target
		setUserDetails((prevState) => ({
			...prevState,
			[name]: value
		}))
	}

	// if in edit mode, update user details; else set edit mode to true
	const toggleEditOrUpdate = async () => {
		if (editMode) {
			try {
				await axios.put('/api/users', userDetails)
				loadUser(userDispatch)
				setAlert(alertDispatch, 'PROFILE UPDATED', 'success')
				setEditMode(false)
			} catch (err) {
				setAlert(alertDispatch, err.response.data.msg, 'error')
			}
		} else {
			setEditMode(true)
		}
	}

	// revert changes made in edit mode & exit
	const exitEdit = () => {
		setUserDetails({
			email: user.email,
			name: user.name
		})
		setEditMode(false)
	}

	// Leaderboard display
	const leaderboard =
		!isGuest && top5 ? (
			top5.map((player, index) => (
				<div key={index} className={classes.playerContainer}>
					<Typography variant="h6">{`${index + 1}. ${player.name.toUpperCase()}`}</Typography>
					<Typography variant="h6">{`ELO RATING: ${player.games.elo}`}</Typography>
					<Typography>{`GAMES PLAYED/WON/LOSS: ${player.games.total}/${player.games.wins}/${player.games
						.loss}`}</Typography>
				</div>
			))
		) : (
			<CircularProgress />
		)

	// My profile display
	const profile =
		!isGuest && user ? (
			<div className={classes.myDetailsContainer}>
				<Typography>EMAIL: {user.email.toUpperCase()}</Typography>
				<Typography>NAME: {user.name.toUpperCase()}</Typography>
				<Typography>RANK: {rank}</Typography>
				<Typography>ELO RATING: {user.games.elo}</Typography>
				<Typography>GAMES PLAYED: {user.games.total}</Typography>
				<Typography>GAMES WON: {user.games.wins}</Typography>
				<Typography>GAMES LOST: {user.games.loss}</Typography>
			</div>
		) : (
			<CircularProgress />
		)

	// Edit profile display
	const profileEdit = !isGuest && (
		<div className={classes.inputContainer}>
			<TextField
				name="email"
				type="email"
				value={email}
				label="Email Address"
				onChange={handleChange}
				variant="outlined"
				fullWidth
			/>
			<TextField
				name="name"
				type="text"
				value={name}
				label="Username"
				onChange={handleChange}
				variant="outlined"
				fullWidth
			/>
		</div>
	)

	return (
		user && (
			<Grid container direction="column" alignContent="center" className={mainClasses.mainContainer}>
				{/* Page header */}
				<Typography variant="h4" align="center" gutterBottom color="primary">
					PROFILE
				</Typography>
				<Grid container item justify="center">
					{!isGuest ? (
						<React.Fragment>
							{/* Profile */}
							<Grid item xs={12} lg={6} className={classes.subContainer}>
								<Typography variant="h5" align="center" color="primary" gutterBottom>
									{editMode ? 'EDIT PROFILE' : 'MY PROFILE'}
								</Typography>
								{editMode ? profileEdit : profile}
								<Button
									variant="contained"
									color="primary"
									onClick={toggleEditOrUpdate}
									className={classes.editButton}
									disabled={editMode && user.name === name && user.email === email}
								>
									{editMode ? 'Save Changes' : 'Edit Profile'}
								</Button>
								{editMode && (
									<Button
										variant="contained"
										color="secondary"
										className={classes.editButton}
										onClick={exitEdit}
									>
										Back
									</Button>
								)}
							</Grid>
							{/* Leaderboard */}
							<Grid item xs={12} lg={6} className={classes.subContainer}>
								<Typography variant="h5" align="center" color="primary" gutterBottom>
									LEADERBOARD
								</Typography>
								{leaderboard}
							</Grid>
						</React.Fragment>
					) : (
						<Grid item>
							<Typography variant="h5">SORRY, GUEST ACCOUNTS DO NOT HAVE PROFILES.</Typography>
						</Grid>
					)}
				</Grid>
			</Grid>
		)
	)
}

export default Profile
