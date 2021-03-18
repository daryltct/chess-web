import React, { useState, useEffect } from 'react'

import { useMainStyles, getModalStyle } from './Styles'
import { useUser, leaveQueue, leaveHost } from '../../context/user/UserContext'

import { useTheme } from '@material-ui/core/styles'
import { useMediaQuery, Grid, Typography, Button, Modal, Fade, Backdrop } from '@material-ui/core'

const LeaveModal = ({ openLeaveModal, leaveGame }) => {
	const mainClasses = useMainStyles()
	const theme = useTheme()
	const isXS = useMediaQuery(theme.breakpoints.down('xs'))

	const [ , userDispatch ] = useUser()

	const [ timer, setTimer ] = useState(5) // 5 seconds timer

	useEffect(
		() => {
			let id
			if (!openLeaveModal) {
				setTimer(5)
			} else {
				if (timer === 0) {
					leaveGame()
					leaveQueue(userDispatch)
					leaveHost(userDispatch)
				} else {
					id = openLeaveModal && timer > 0 && setTimeout(() => setTimer(timer - 1), 1000)
				}
			}

			return () => {
				if (id) {
					clearTimeout(id)
				}
			}
		},
		[ timer, openLeaveModal ]
	)

	// Modal content
	const popup = (
		<Fade in={openLeaveModal}>
			<div className={mainClasses.paper} style={getModalStyle()}>
				<Grid container direction="column" spacing={2}>
					{/* Modal header */}
					<Grid item>
						<Typography variant="h4" align="center">
							OPPONENT LEFT THE GAME
						</Typography>
						<hr />
					</Grid>
					{/* Modal body */}
					<Grid item>
						<Typography paragraph align="center">
							{'your opponent has left the game. you be redirected back to the lobby in:'.toUpperCase()}
						</Typography>
					</Grid>
					{/* Timer */}
					<Grid item>
						<Typography variant={isXS ? 'h5' : 'h4'} align="center">
							{timer}
						</Typography>
					</Grid>
					{/* Modal buttons */}
					<Grid item>
						<Button
							variant="contained"
							color="primary"
							className={mainClasses.modalButton}
							fullWidth
							onClick={() => {
								leaveGame()
								leaveQueue(userDispatch)
								leaveHost(userDispatch)
							}}
						>
							Return to lobby now
						</Button>
					</Grid>
				</Grid>
			</div>
		</Fade>
	)

	return (
		<Modal
			open={openLeaveModal}
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

export default LeaveModal
