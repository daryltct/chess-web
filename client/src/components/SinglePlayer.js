import React, { Fragment, useState, useEffect, useContext } from 'react'
import Chessboard from 'chessboardjsx'
import { Game } from 'js-chess-engine'

import { AlertContext } from '../context/alert/AlertContext'
import { UserContext } from '../context/user/UserContext'
import { useMainStyles } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { useTheme } from '@material-ui/core/styles'
import { useMediaQuery, Grid, Typography, Button, LinearProgress } from '@material-ui/core'

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
	const isXS = useMediaQuery(theme.breakpoints.down('xs'))

	const { setAlert } = useContext(AlertContext)
	const { userState: { socket } } = useContext(UserContext)

	const [ gameState, setGameState ] = useState(initialState)
	const { level, game, fen, turn, isFinished, winner } = gameState

	useEffect(() => {
		setGameState((prevState) => ({
			...prevState,
			game: new Game()
		}))
		if (socket) {
			socket.close()
		}
	}, [])

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
				setAlert('INVALID MOVE', 'warning')
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
						<Chessboard
							position={fen}
							onDrop={onDrop}
							draggable={turn === 'white'}
							width={isXS ? 320 : 560}
						/>
					) : (
						levelSelectionDisplay
					))}
				{/* Display loading bar if computer is processing next move */}
				{turn === 'black' && <LinearProgress />}
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
			</Grid>
		</Grid>
	)
}

export default SinglePlayer
