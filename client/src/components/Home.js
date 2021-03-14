import React, { Fragment, useEffect, useContext } from 'react'
import io from 'socket.io-client'
import Typewriter from 'typewriter-effect'

import { UserContext } from '../context/user/UserContext'
import { GameContext } from '../context/game/GameContext'
import Game from './Game'
import useMainStyles from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography, Button, CircularProgress, Fade } from '@material-ui/core'

const PORT = '/'

const useStyles = makeStyles((theme) => ({
	placeholder: {
		height: 40
	},
	queueButton: {
		...theme.typography.buttons,
		marginTop: '25px'
	},
	typewriter: {
		fontFamily: 'VT323, Courier New, monospace',
		fontSize: '2.4rem',
		textAlign: 'center',
		color: theme.palette.common.crayola,
		height: 110,
		marginBottom: '30px',
		[theme.breakpoints.down('xs')]: {
			height: 150
		}
	}
}))

const Home = () => {
	const mainClasses = useMainStyles()
	const classes = useStyles()

	const { userState, initSocket, joinQueue, leaveQueue } = useContext(UserContext)
	const { gameState, initRoom, reconnectGame } = useContext(GameContext)

	const { socket, inQueue, user } = userState

	useEffect(
		() => {
			if (user) {
				initSocket(
					io(PORT, {
						query: { playerId: user._id, playerName: user.name }
					})
				)
			}
		},
		[ user ]
	)

	useEffect(
		() => {
			if (socket) {
				socket.on('gameStart', initRoom)
				socket.on('reconnect', reconnectGame)

				return () => {
					socket.off('gameStart', initRoom)
					//socket.off('reconnect', (reconnectGame))
				}
			}
		},
		[ socket ]
	)

	const toggleQueue = () => {
		// console.log(userState.user._id)
		if (!inQueue) {
			socket.emit('findGame', true)
			joinQueue()
		} else {
			socket.emit('findGame', false)
			leaveQueue()
		}
	}

	const typewriterEffect = (typewriter) => {
		typewriter
			.typeString(`HELLO, ${user.name.toUpperCase()}!`)
			.pauseFor(2000)
			.deleteAll()
			.typeString("USE 'LOBBY' FOR ONLINE GAMES.")
			.pauseFor(2000)
			.deleteChars(25)
			.typeString("'SINGLE PLAYER' TO PLAY AGAINST A COMPUTER.")
			.pauseFor(2000)
			.deleteAll()
			.typeString(`HAVE FUN, ${user.name.toUpperCase()}!`)
			.start()
	}

	const findGameInterface = (
		<Grid item>
			<Grid container direction="column" alignContent="center" alignItems="center">
				<div className={classes.typewriter}>
					<Typewriter onInit={typewriterEffect} />
				</div>
				<div>
					<Typography variant="h4" align="center" gutterBottom color="primary">
						SEARCH FOR AN OPPONENT ONLINE
					</Typography>
				</div>
				<div className={classes.placeholder}>
					<Fade in={inQueue} style={{ transitionDelay: inQueue ? '800ms' : '0ms' }} unmountOnExit>
						<CircularProgress />
					</Fade>
				</div>
				<Button className={classes.queueButton} variant="contained" color="primary" onClick={toggleQueue}>
					{inQueue ? 'Cancel Search' : 'Find Game'}
				</Button>
			</Grid>
		</Grid>
	)

	return (
		user && (
			<Grid
				container
				direction="column"
				alignContent="center"
				alignItems="center"
				className={mainClasses.mainContainer}
			>
				{gameState.roomId ? <Game /> : findGameInterface}
			</Grid>
		)
	)
}

export default Home
