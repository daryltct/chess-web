import React, { Fragment, useEffect, useContext, useState } from 'react'
import io from 'socket.io-client'
import Typewriter from 'typewriter-effect'
import uniqid from 'uniqid'

import { UserContext } from '../context/user/UserContext'
import { GameContext } from '../context/game/GameContext'
import { AlertContext } from '../context/alert/AlertContext'
import Game from './Game'
import { useMainStyles } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography, Button, CircularProgress, Fade, TextField } from '@material-ui/core'

const PORT = '/'

// INLINE STYLES
const useStyles = makeStyles((theme) => ({
	placeholder: {
		height: 40
	},
	queueButton: {
		...theme.typography.buttons,
		marginBottom: '25px'
	},
	typewriter: {
		fontFamily: theme.typography.fontFamily,
		fontSize: '2.4rem',
		textAlign: 'center',
		color: theme.palette.common.crayola,
		height: 110,
		marginBottom: '30px',
		[theme.breakpoints.down('xs')]: {
			height: 150
		}
	},
	subContainer: {
		textAlign: 'center',
		marginBottom: '60px'
	},
	joinContainer: {
		marginTop: '20px',
		display: 'flex',
		justifyContent: 'center'
	},
	joinButton: {
		...theme.typography.buttons,
		marginLeft: '20px'
	}
}))

const Home = () => {
	const mainClasses = useMainStyles()
	const classes = useStyles()

	const { setAlert } = useContext(AlertContext)
	const { userState, initSocket, joinQueue, leaveQueue, hostGame, leaveHost } = useContext(UserContext)
	const { gameState, initRoom, reconnectGame } = useContext(GameContext)

	const { socket, inQueue, isHost, user } = userState

	const [ roomInput, setRoomInput ] = useState('')

	// initialize socket
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
			const reconnectHandler = (data) => {
				reconnectGame(data)
				joinQueue()
			}

			const errorHandler = (data) => {
				setAlert(data, 'error')
			}

			if (socket) {
				socket.on('gameStart', initRoom)
				socket.on('reconnect', reconnectHandler)
				socket.on('error', errorHandler)

				return () => {
					socket.off('gameStart', initRoom)
					socket.off('reconnect', reconnectGame)
					socket.off('error', errorHandler)
				}
			}
		},
		[ socket ]
	)

	// toggle queue button (join/leave queue)
	const toggleQueue = () => {
		if (!inQueue) {
			socket.emit('findGame', true)
			joinQueue()
		} else {
			socket.emit('findGame', false)
			leaveQueue()
		}
	}

	// toggle host game button (create/close game)
	const toggleHost = () => {
		if (!isHost) {
			const roomId = uniqid()
			socket.emit('hostRoom', { roomId, signal: true })
			hostGame(roomId)
		} else {
			socket.emit('hostRoom', { roomId: isHost, signal: false })
			leaveHost()
		}
	}

	// join a private game
	const joinHost = () => {
		if (roomInput) {
			socket.emit('joinHost', roomInput)
			setRoomInput('')
		}
	}

	// room code input update
	const handleChange = (event) => {
		const { value } = event.target
		setRoomInput(value)
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
		<Fragment>
			{/* Page header */}
			<Grid item className={classes.typewriter}>
				<Typewriter onInit={typewriterEffect} />
			</Grid>
			{/* Find random opponent */}
			<Grid item className={classes.subContainer}>
				<Typography variant="h4" align="center" gutterBottom color="primary">
					SEARCH FOR AN OPPONENT ONLINE
				</Typography>
				<Button
					className={classes.queueButton}
					variant="contained"
					color="primary"
					onClick={toggleQueue}
					disabled={isHost ? true : false}
				>
					{inQueue ? 'Cancel Search' : 'Find Game'}
				</Button>
				<div className={classes.placeholder}>
					<Fade in={inQueue} style={{ transitionDelay: inQueue ? '800ms' : '0ms' }} unmountOnExit>
						<CircularProgress />
					</Fade>
				</div>
			</Grid>
			{/* Host or join private game */}
			<Grid item className={classes.subContainer}>
				<Typography variant="h4" align="center" gutterBottom color="primary">
					HOST OR JOIN A PRIVATE GAME
				</Typography>
				<Button
					className={classes.queueButton}
					variant="contained"
					color="primary"
					onClick={toggleHost}
					disabled={inQueue}
				>
					{isHost ? 'Close Room' : 'Host Game'}
				</Button>
				<div className={classes.placeholder}>
					<Fade
						in={isHost ? true : false}
						style={{ transitionDelay: isHost ? '800ms' : '0ms' }}
						unmountOnExit
					>
						<CircularProgress />
					</Fade>
				</div>

				<div className={classes.joinContainer}>
					{/* If user hosted game, display room code & hide join game input/button */}
					{isHost ? (
						<Typography
							variant="h6"
							align="center"
							color="primary"
						>{`SEND YOUR FRIEND YOUR ROOM CODE: ${isHost}`}</Typography>
					) : (
						!inQueue && (
							<Fragment>
								<TextField
									name="roomId"
									type="text"
									value={roomInput}
									label="ROOM CODE"
									onChange={handleChange}
									variant="outlined"
								/>
								<Button
									className={classes.joinButton}
									variant="contained"
									color="secondary"
									onClick={joinHost}
								>
									Join Game
								</Button>
							</Fragment>
						)
					)}
				</div>
			</Grid>
		</Fragment>
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
