import { makeStyles } from '@material-ui/styles'

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
	}
}))

export default useMainStyles
