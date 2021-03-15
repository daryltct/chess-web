import { makeStyles } from '@material-ui/styles'

function getModalStyle() {
	const top = 15

	return {
		top: `${top}%`,
		margin: 'auto'
	}
}

const useMainStyles = makeStyles((theme) => ({
	mainContainer: {
		padding: '20px'
	},
	loginAndRegisterSubContainer: {
		width: 'inherit',
		maxWidth: '400px'
	},
	loginAndRegisterButton: {
		...theme.typography.buttons,
		height: '60px',
		marginTop: '10px',
		width: '100%',
		[theme.breakpoints.down('xs')]: {
			height: '50px',
			fontSize: '1.2rem'
		}
	},
	loginAndRegisterFooterLabel: {
		margin: '20px 0px 10px 0px'
	},
	// Modal components
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

export { useMainStyles, getModalStyle }
