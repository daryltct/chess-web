import React, { useContext } from 'react'

import { AlertContext } from '../../context/alert/AlertContext'

import { makeStyles } from '@material-ui/core/styles'
import { Snackbar } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'

const CustomizedAlert = (props) => {
	return <MuiAlert elevation={6} variant="filled" {...props} />
}

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		'& > * + *': {
			marginTop: theme.spacing(2)
		}
	}
}))

const Alert = () => {
	const classes = useStyles()

	const { alertState } = useContext(AlertContext)

	return (
		alertState &&
		alertState.map((alert) => (
			<div className={classes.root} key={alert.id}>
				<Snackbar open={true} autoHideDuration={3000}>
					<CustomizedAlert severity={alert.type}>{alert.msg}</CustomizedAlert>
				</Snackbar>
			</div>
		))
	)
}

export default Alert
