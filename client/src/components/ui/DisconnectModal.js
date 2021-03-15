import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/styles'
import { useMediaQuery, Grid, Typography, Button, Modal, Fade, Backdrop } from '@material-ui/core'

function getModalStyle() {
	const top = 15

	return {
		top: `${top}%`,
		margin: 'auto'
	}
}

const useStyles = makeStyles((theme) => ({
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

const DisconnectModal = ({ openDisconnectModal, leaveGameHandler }) => {
	const classes = useStyles()

	const [ timer, setTimer ] = useState(60)

	useEffect(
		() => {
			let id
			if (!openDisconnectModal) {
				setTimer(60)
			} else {
				id = openDisconnectModal && timer > 0 && setTimeout(() => setTimer(timer - 1), 1000)
			}

			return () => {
				if (id) {
					clearTimeout(id)
				}
			}
		},
		[ timer, openDisconnectModal ]
	)

	const popup = (
		<Fade in={openDisconnectModal}>
			<div className={classes.paper} style={getModalStyle()}>
				<Grid container direction="column" spacing={2}>
					<Grid item>
						<Typography variant="h4" align="center">
							OPPONENT DISCONNECTED
						</Typography>
						<hr />
					</Grid>
					<Grid item>
						<Typography paragraph>
							{'please wait for 60s to give your opponent the opportunity to reconnect to the game. leaving after 60s will be considered as a win for you, the game is voided otherwise.'.toUpperCase()}
						</Typography>
					</Grid>
					<Grid item>
						<Typography variant="h3" align="center">
							TIME REMAINING:
						</Typography>
						<Typography variant="h3" align="center">
							{timer}
						</Typography>
					</Grid>
					<Grid item>
						<Button
							variant="contained"
							color="primary"
							className={classes.modalButton}
							fullWidth
							disabled={timer !== 0}
							onClick={() => leaveGameHandler(false)}
						>
							Leave with a win
						</Button>
					</Grid>
					<Grid item>
						<Button
							variant="contained"
							color="secondary"
							className={classes.modalButton}
							onClick={() => leaveGameHandler(true)}
							fullWidth
						>
							Leave now
						</Button>
					</Grid>
				</Grid>
			</div>
		</Fade>
	)

	return (
		<Modal
			open={openDisconnectModal}
			style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
			closeAfterTransition
			disableBackdropClick
			disableEscapeKeyDown
			BackdropComponent={Backdrop}
			BackdropProps={{
				timeout: 500
			}}
		>
			{popup}
		</Modal>
	)
}

export default DisconnectModal
