import { createMuiTheme } from '@material-ui/core/styles'

const crayola = '#1C3738'
const mint = '#F4FFF8'
const powder = '#C2DFE0'

const theme = createMuiTheme({
	palette: {
		common: {
			crayola,
			mint
		},
		primary: {
			main: `${crayola}`
		},
		secondary: {
			main: `${powder}`
		}
	},
	typography: {
		fontFamily: 'VT323, Courier New, monospace',
		tab: {
			fontFamily: 'VT323, Courier New, monospace',
			fontSize: '1.4rem',
			color: '#fff'
		},
		buttons: {
			fontSize: '1.4rem',
			boxShadow: 'none',
			'&:hover': {
				boxShadow: 'none'
			}
		}
	}
})

export default theme
