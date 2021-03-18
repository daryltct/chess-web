import React, { useState, useEffect } from 'react'
import axios from 'axios'

import { useAlert, setAlert } from '../context/alert/AlertContext'
import { useUser, loadUser } from '../context/user/UserContext'
import { useMainStyles } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography, CircularProgress } from '@material-ui/core'

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
		textAlign: 'left'
	},
	playerContainer: {
		marginBottom: '15px'
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

	useEffect(() => {
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
	}, [])

	// Leaderboard display
	const leaderboard = top5 ? (
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
									MY STATISTICS
								</Typography>
								<div className={classes.myDetailsContainer}>
									<Typography>EMAIL: {user.email.toUpperCase()}</Typography>
									<Typography>NAME: {user.name.toUpperCase()}</Typography>
									<Typography>RANK: {rank}</Typography>
									<Typography>ELO RATING: {user.games.elo}</Typography>
									<Typography>GAMES PLAYED: {user.games.total}</Typography>
									<Typography>GAMES WON: {user.games.wins}</Typography>
									<Typography>GAMES LOST: {user.games.loss}</Typography>
								</div>
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
