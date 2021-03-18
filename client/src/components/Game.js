import React, { useState, useEffect, useContext, useRef } from 'react'
import Chessboard from 'chessboardjsx'

// import { UserContext } from '../context/user/UserContext'
import { useUser, leaveQueue, leaveHost } from '../context/user/UserContext'
import { GameContext } from '../context/game/GameContext'
import { AlertContext } from '../context/alert/AlertContext'
import { useMainStyles } from './ui/Styles'
import DisconnectModal from './ui/DisconnectModal'
import LeaveModal from './ui/LeaveModal'
import convertMoveToMessage from '../utils/convertMoveToMessage'

import { makeStyles } from '@material-ui/styles'
import { useTheme } from '@material-ui/core/styles'
import { useMediaQuery, Grid, Typography, Button } from '@material-ui/core'

const lgScreenSize = 560
const mdScreenSize = 450
const xsScreenSize = 320

// INLINE STYLES
const useStyles = makeStyles((theme) => ({
	chatbox: {
		backgroundColor: '#000',
		height: lgScreenSize,
		width: lgScreenSize,
		padding: '2px 5px',
		display: 'flex',
		flexDirection: 'column',
		boxSizing: 'border-box',
		[theme.breakpoints.down('md')]: {
			height: mdScreenSize,
			width: mdScreenSize
		},
		[theme.breakpoints.down('sm')]: {
			height: 300
		},
		[theme.breakpoints.down('xs')]: {
			height: xsScreenSize,
			width: xsScreenSize
		}
	},
	chatboxContainer: {
		display: 'flex',
		flexDirection: 'row',
		color: '#fff',
		[theme.breakpoints.down('sm')]: {
			justifyContent: 'center'
		}
	},
	boardContainer: {
		display: 'flex',
		flexDirection: 'row-reverse',
		[theme.breakpoints.down('sm')]: {
			justifyContent: 'center'
		}
	},
	subContainer: {
		textAlign: 'center'
	},
	leaveAndRematchButton: {
		...theme.typography.buttons,
		width: '180px',
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.2rem',
			width: '160px'
		}
	},
	acceptAndDeclineButton: {
		...theme.typography.buttons,
		margin: '5px 10px',
		width: '180px',
		[theme.breakpoints.down('xs')]: {
			fontSize: '1.2rem',
			width: '160px'
		}
	},
	inputContainer: {
		marginTop: 'auto',
		display: 'inline-flex'
	},
	input: {
		backgroundColor: '#000',
		color: '#fff',
		flexGrow: 100,
		border: 'none',
		fontFamily: theme.typography.fontFamily,
		fontSize: '1rem',
		'&:focus': {
			outline: 'none'
		}
	},
	messagesContainer: {
		overflow: 'scroll'
	}
}))

const Game = () => {
	const mainClasses = useMainStyles()
	const classes = useStyles()
	const theme = useTheme()
	const isMD = useMediaQuery(theme.breakpoints.down('md'))
	const isXS = useMediaQuery(theme.breakpoints.down('xs'))

	const messagesEndRef = useRef(null) // chatbox

	const { setAlert } = useContext(AlertContext)
	// const { userState, leaveQueue, leaveHost } = useContext(UserContext)
	const [ userState, userDispatch ] = useUser()
	const { socket } = userState
	const {
		gameState,
		initGame,
		makeMove,
		gameEnd,
		receiveRematch,
		initRematch,
		declineRematch,
		acceptRematch,
		leaveGame,
		pauseGame,
		resumeGame
	} = useContext(GameContext)
	const { game, roomId, color, fen, turn, winner, reason, rematch, opponent, history } = gameState

	const [ openDisconnectModal, setOpenDisconnectModal ] = useState(false)
	const [ openLeaveModal, setOpenLeaveModal ] = useState(false)
	const [ chat, setChat ] = useState([])
	const [ message, setMessage ] = useState('')

	useEffect(() => {
		if (!game) {
			initGame()
		}
		// scroll to bottom of chat on each message added
		if (messagesEndRef) {
			messagesEndRef.current.addEventListener('DOMNodeInserted', (event) => {
				const { currentTarget: target } = event
				target.scroll({ top: target.scrollHeight, behavior: 'smooth' })
			})
		}
	}, [])

	useEffect(
		() => {
			// opponent makes move
			const moveHandler = (move) => {
				game.move(move)
				makeMove()
			}

			// opponent won game
			const gameEndHandler = (data) => {
				const { move, winner, reason } = data
				game.move(move)
				makeMove()
				gameEnd({ winner, reason })
			}

			// opponent disconencted
			const opponentDisconnectHandler = () => {
				setAlert('OPPONENT DISCONNECTED', 'info')
				setOpenDisconnectModal(true)
				pauseGame()
			}

			// opponent reconnected
			const opponentReconnectHandler = () => {
				setAlert('OPPONENT RECONNECTED', 'info')
				setOpenDisconnectModal(false)
				resumeGame()
			}

			// opponent left game
			const playerLeaveHandler = (data) => {
				setOpenLeaveModal(true)
			}

			// opponent sent a message
			const newMessageHandler = (data) => {
				setChat((prevState) => [ ...prevState, data ])
			}

			if (socket && game) {
				socket.on('move', moveHandler)
				socket.on('gameEnd', gameEndHandler)
				socket.on('rematch', receiveRematch)
				socket.on('playerDisconnect', opponentDisconnectHandler)
				socket.on('playerReconnect', opponentReconnectHandler)
				socket.on('playerLeave', playerLeaveHandler)
				socket.on('message', newMessageHandler)

				return () => {
					socket.off('move', moveHandler)
					socket.off('gameEnd', gameEndHandler)
					socket.off('rematch', receiveRematch)
					socket.off('playerDisconnect', opponentDisconnectHandler)
					socket.off('playerReconnect', opponentReconnectHandler)
					socket.off('playerLeave', playerLeaveHandler)
					socket.off('message', newMessageHandler)
				}
			}
		},
		[ socket, game, rematch, gameState ]
	)

	// if this player and opponent both 'true' in rematch, then restart board
	useEffect(
		() => {
			if (gameState) {
				if (opponent.rematch && rematch) {
					initRematch()
				}
			}
		},
		[ gameState, opponent ]
	)

	// provide updates on move in chat
	useEffect(
		() => {
			if (history.length) {
				const latestMove = history[history.length - 1]
				setChat((prevState) => [ ...prevState, { from: 'MOVE-UPDATE', msg: convertMoveToMessage(latestMove) } ])
			}
		},
		[ history ]
	)

	const onDrop = ({ sourceSquare, targetSquare }) => {
		// check if the move is legal
		let move = game.move({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q'
		})

		// if illegal move
		if (move === null) return
		// else alter game state
		makeMove()
		// check winning conditions
		if (game.in_checkmate()) {
			socket.emit('gameEnd', { roomId, move, winner: color, reason: 'checkmate' })
			gameEnd({ winner: color, reason: 'checkmate' })
		} else if (game.in_stalemate()) {
			socket.emit('gameEnd', { roomId, move, winner: color, reason: 'stalemate' })
			gameEnd({ winner: color, reason: 'stalemate' })
		} else if (game.in_draw()) {
			socket.emit('gameEnd', { roomId, move, winner: color, reason: 'draw' })
			gameEnd({ winner: color, reason: 'draw' })
		} else {
			socket.emit('move', { roomId, move, pgn: game.pgn() })
		}
	}

	// initiate/accept rematch
	const initiateRematch = () => {
		acceptRematch()
		socket.emit('rematch', {
			roomId,
			opponent: {
				id: socket.id,
				rematch: true
			}
		})
	}

	// decline rematch
	const declineRematchHandler = () => {
		declineRematch()
		socket.emit('rematch', {
			roomId,
			opponent: {
				id: socket.id,
				rematch: false,
				decline: true
			}
		})
	}

	// leave game
	const leaveGameHandler = (voidRoom) => {
		socket.emit('playerLeave', { roomId, voidRoom })
		leaveGame()
		leaveQueue(userDispatch)
		leaveHost(userDispatch)
	}

	// chat input update
	const handleChange = (event) => {
		const { value } = event.target
		setMessage(value)
	}

	// send message on 'enter' key
	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			socket.emit('message', {
				roomId,
				message: {
					from: userState.user.name,
					msg: message
				}
			})
			// add to chat
			setChat((prevState) => [ ...prevState, { from: userState.user.name, msg: message } ])
			// reset input
			setMessage('')
		}
	}

	const chatbox = (
		<div className={classes.messagesContainer} ref={messagesEndRef}>
			{chat.map((message, index) => <Typography key={index}>{`$${message.from}: ${message.msg}`}</Typography>)}
		</div>
	)

	return (
		<Grid
			container
			direction="column"
			alignContent="center"
			alignItems="center"
			className={mainClasses.mainContainer}
			spacing={2}
		>
			{/* Page header */}
			<Typography variant="h4" align="center" gutterBottom color="primary">
				{`PLAYING AGAINST: ${opponent.name.toUpperCase()}`}
			</Typography>

			<Grid item>
				<Typography variant="h6">{`TURN: ${turn.toUpperCase()}`}</Typography>
			</Grid>
			<Grid container item justify="center">
				{/* Chessboard */}
				<Grid item sm={12} md={6} className={classes.boardContainer}>
					<Chessboard
						position={fen}
						onDrop={onDrop}
						orientation={color}
						draggable={turn === color.charAt(0)}
						width={isXS ? xsScreenSize : isMD ? mdScreenSize : lgScreenSize}
					/>
				</Grid>
				{/* Chatbox */}
				<Grid item sm={12} md={6} className={classes.chatboxContainer}>
					<div className={classes.chatbox}>
						{chatbox}
						<div className={classes.inputContainer}>
							<Typography>{`$${userState.user.name}:`}</Typography>
							<input
								type="text"
								value={message}
								autoFocus
								className={classes.input}
								onKeyDown={handleKeyDown}
								onChange={handleChange}
							/>
						</div>
					</div>
				</Grid>
			</Grid>

			{/* Winning message when game ends */}
			{winner && (
				<Grid item className={classes.subContainer}>
					<Typography variant="h4" align="center" gutterBottom>
						{reason === 'draw' ? "IT'S A DRAW" : `${winner} won by ${reason}`.toUpperCase()}
					</Typography>
					{/* If opponent already initiated or decline rematch, hide rematch button */}
					{opponent.decline ? (
						<Typography variant="h4" align="center" gutterBottom>
							OPPONENT DECLINED REMATCH
						</Typography>
					) : (
						!opponent.rematch && (
							<Button
								className={classes.leaveAndRematchButton}
								variant="contained"
								color="primary"
								onClick={initiateRematch}
								disabled={rematch || opponent.rematch}
							>
								Rematch
							</Button>
						)
					)}
				</Grid>
			)}
			{/* If receive rematch request from opponent, display accept & decline rematch buttons */}
			{opponent.rematch &&
			!rematch && (
				<Grid item className={classes.subContainer}>
					<Button
						className={classes.acceptAndDeclineButton}
						variant="contained"
						color="secondary"
						onClick={initiateRematch}
					>
						Accept Rematch
					</Button>
					<Button
						className={classes.acceptAndDeclineButton}
						variant="contained"
						color="secondary"
						onClick={declineRematchHandler}
					>
						Decline Rematch
					</Button>
				</Grid>
			)}
			{/* Leave game button */}
			<Grid item>
				<Button
					className={classes.leaveAndRematchButton}
					variant="contained"
					color="primary"
					onClick={() => leaveGameHandler(false)}
				>
					Leave Game
				</Button>
			</Grid>
			{/* Display modal when opponent disconnected */}
			<DisconnectModal openDisconnectModal={openDisconnectModal} leaveGameHandler={leaveGameHandler} />
			{/* Display modal when opponent leaves */}
			<LeaveModal openLeaveModal={openLeaveModal} leaveGame={leaveGame} />
		</Grid>
	)
}

export default Game
