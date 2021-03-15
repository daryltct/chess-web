import React, { useState, useEffect, useContext } from 'react'
import Chessboard from 'chessboardjsx'

import { UserContext } from '../context/user/UserContext'
import { GameContext } from '../context/game/GameContext'
import DisconnectModal from './ui/DisconnectModal'
import { useMainStyles } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { useTheme } from '@material-ui/core/styles'
import { useMediaQuery, Grid, Typography, Button } from '@material-ui/core'

const lgScreenSize = 560
const mdScreenSize = 450
const xsScreenSize = 320

const useStyles = makeStyles((theme) => ({
	chatbox: {
		backgroundColor: '#000',
		height: lgScreenSize,
		width: lgScreenSize,
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
	winMsgContainer: {
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
	}
}))

const Game = () => {
	const mainClasses = useMainStyles()
	const classes = useStyles()
	const theme = useTheme()
	const isMD = useMediaQuery(theme.breakpoints.down('md'))
	const isXS = useMediaQuery(theme.breakpoints.down('xs'))

	const { userState, leaveQueue } = useContext(UserContext)
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
	const { game, roomId, color, fen, turn, winner, reason, rematch, opponent } = gameState

	const [ openDisconnectModal, setOpenDisconnectModal ] = useState(false)

	useEffect(() => {
		if (!game) {
			initGame()
		}
	}, [])

	useEffect(
		() => {
			const moveHandler = (move) => {
				game.move(move)
				makeMove()
			}

			const gameEndHandler = (data) => {
				const { move, winner, reason } = data
				game.move(move)
				gameEnd({ winner, reason })
			}

			const opponentDisconnectHandler = (data) => {
				console.log('opponent disconnected')
				setOpenDisconnectModal(true)
				pauseGame()
			}

			const opponentReconnectHandler = (data) => {
				console.log('opponent reconnected')
				setOpenDisconnectModal(false)
				resumeGame()
			}

			const playerLeaveHandler = (data) => {
				leaveGame()
				leaveQueue()
			}

			if (socket && game) {
				socket.on('move', moveHandler)
				socket.on('gameEnd', gameEndHandler)
				socket.on('rematch', receiveRematch)
				socket.on('playerDisconnect', opponentDisconnectHandler)
				socket.on('playerReconnect', opponentReconnectHandler)
				socket.on('playerLeave', playerLeaveHandler)

				return () => {
					socket.off('move', moveHandler)
					socket.off('gameEnd', gameEndHandler)
					socket.off('rematch', receiveRematch)
					socket.off('playerDisconnect', opponentDisconnectHandler)
					socket.off('playerReconnect', opponentReconnectHandler)
					socket.off('playerLeave', playerLeaveHandler)
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

	const leaveGameHandler = (voidRoom) => {
		socket.emit('playerLeave', { roomId, voidRoom })
		leaveGame()
		leaveQueue()
	}

	return (
		<Grid
			container
			direction="column"
			alignContent="center"
			alignItems="center"
			className={mainClasses.mainContainer}
			spacing={2}
		>
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
					<div className={classes.chatbox} />
				</Grid>
			</Grid>

			{/* Winning message when game ends */}
			{winner && (
				<Grid item className={classes.winMsgContainer}>
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
			<DisconnectModal openDisconnectModal={openDisconnectModal} leaveGameHandler={leaveGameHandler} />
		</Grid>
	)
}

export default Game
