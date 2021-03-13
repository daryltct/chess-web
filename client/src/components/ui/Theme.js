import { createMuiTheme } from '@material-ui/core/styles'

const gunmetal = '#16262E'
const charcoal = '#2e4756'

const crayola = '#1C3738'
const mint = '#F4FFF8'

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
			main: `${mint}`
		}
	}
})

export default theme
