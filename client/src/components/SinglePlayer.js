import React, { Fragment, useState, useEffect } from 'react'
import Chessboard from 'chessboardjsx'
import { Game } from 'js-chess-engine'

import { useAlert, setAlert } from '../context/alert/AlertContext'
import { useUser } from '../context/user/UserContext'
import { useMainStyles } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { useTheme } from '@material-ui/core/styles'
import { useMediaQuery, Grid, Typography, Button, LinearProgress } from '@material-ui/core'

const lgScreenSize = 560
const mdScreenSize = 450
const xsScreenSize = 320

// INLINE STYLES
const useStyles = makeStyles((theme) => ({
	levelButtons: {
		...theme.typography.buttons,
		height: '80px',
		margin: '20px 0px 20px 0px'
	},
	rematchButton: {
		...theme.typography.buttons,
		height: '60px',
		marginTop: '10px',
		[theme.breakpoints.down('xs')]: {
			height: '50px',
			fontSize: '1.2rem'
		}
	},
	endGameMsg: {
		marginTop: '10px'
	},
	boardContainer: {
		height: lgScreenSize + 10,
		[theme.breakpoints.down('md')]: {
			height: mdScreenSize + 10
		},
		[theme.breakpoints.down('xs')]: {
			height: xsScreenSize + 10
		}
	}
}))

const initialState = {
	level: null,
	game: null,
	fen: 'start',
	turn: 'white',
	isFinished: false,
	winner: null
}

const LEVELS = [ { level: 1, desc: 'Rookie' }, { level: 2, desc: 'Intermediate' }, { level: 3, desc: 'Advanced' } ]

const SinglePlayer = () => {
	const mainClasses = useMainStyles()
	const classes = useStyles()
	const theme = useTheme()
	const isMD = useMediaQuery(theme.breakpoints.down('md'))
	const isXS = useMediaQuery(theme.breakpoints.down('xs'))

	const [ , alertDispatch ] = useAlert()
	const [ userState ] = useUser()
	const { socket } = userState

	const [ gameState, setGameState ] = useState(initialState)
	const { level, game, fen, turn, isFinished, winner } = gameState

	useEffect(
		() => {
			setGameState((prevState) => ({
				...prevState,
				game: new Game()
			}))
			if (socket) {
				socket.close()
			}
		},
		[ socket ]
	)

	useEffect(
		() => {
			if (isFinished) {
				setGameState((prevState) => ({
					...prevState,
					winner: prevState.turn === 'white' ? 'black' : 'white',
					turn: '-'
				}))
			}
		},
		[ isFinished ]
	)

	const updateStateOnMove = () => {
		setGameState((prevState) => ({
			...prevState,
			fen: game.exportFEN(),
			turn: prevState.turn === 'white' ? 'black' : 'white',
			isFinished: game.exportJson().isFinished
		}))
	}

	const invokeAI = () => {
		game.aiMove(level - 1)
		updateStateOnMove()
	}

	const onDrop = ({ sourceSquare, targetSquare }) => {
		// check if the move is legal
		try {
			game.move(sourceSquare, targetSquare)
			updateStateOnMove()

			// if game has not ended, invoke chess ai
			if (!game.exportJson().isFinished) {
				setTimeout(invokeAI, 500)
			}
		} catch (e) {
			if (sourceSquare !== targetSquare) {
				setAlert(alertDispatch, 'INVALID MOVE', 'warning')
			}
		}
	}

	const selectLevel = (level) => {
		setGameState((prevState) => ({
			...prevState,
			level
		}))
	}

	const startRematch = () => {
		setGameState({
			...initialState,
			game: new Game()
		})
	}

	const levelSelectionDisplay = (
		<Fragment>
			{/* Page header */}
			<Typography variant="h4" align="center" gutterBottom color="primary">
				SELECT DIFFICULTY
			</Typography>
			{/* Difficulty selection buttons */}
			{LEVELS.map((obj, index) => (
				<Button
					key={index}
					className={classes.levelButtons}
					variant="contained"
					color="primary"
					onClick={() => selectLevel(obj.level)}
				>
					{obj.desc}
				</Button>
			))}
		</Fragment>
	)

	return (
		<Grid container direction="column" alignContent="center" className={mainClasses.mainContainer}>
			<Grid container item direction="column" alignContent="center">
				{game &&
					(level ? (
						<div className={classes.boardContainer}>
							<Chessboard
								position={fen}
								onDrop={onDrop}
								draggable={turn === 'white'}
								width={isXS ? xsScreenSize : isMD ? mdScreenSize : lgScreenSize}
							/>
							{/* Display loading bar if computer is processing next move */}
							{turn === 'black' && <LinearProgress />}
						</div>
					) : (
						levelSelectionDisplay
					))}

				{winner && (
					<Fragment>
						{/* Wining message display */}
						<Typography variant={isXS ? 'h5' : 'h4'} align="center" className={classes.endGameMsg}>
							{winner === 'white' ? 'YOU WON, REMATCH?' : 'YOU LOST, TRY AGAIN?'}
						</Typography>
						{/* Rematch button */}
						<Button
							className={classes.rematchButton}
							variant="contained"
							color="primary"
							onClick={startRematch}
						>
							Rematch
						</Button>
					</Fragment>
				)}
				{!winner &&
				level && (
					<Button
						className={classes.rematchButton}
						variant="contained"
						color="primary"
						onClick={startRematch}
					>
						Leave Game
					</Button>
				)}
			</Grid>
		</Grid>
	)
}

export default SinglePlayer
