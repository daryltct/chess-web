import React from 'react'
import Typewriter from 'typewriter-effect'

import { useMainStyles } from './ui/Styles'

import { makeStyles } from '@material-ui/styles'
import { Grid, Typography } from '@material-ui/core'

// INLINE STYLES
const useStyles = makeStyles((theme) => ({
	typewriter: {
		fontFamily: theme.typography.fontFamily,
		fontSize: '2.0rem'
	}
}))

const Error = () => {
	const mainClasses = useMainStyles()
	const classes = useStyles()

	const typewriterEffect = (typewriter) => {
		typewriter.typeString('PAGE NOT FOUND...').start()
	}

	return (
		<Grid container direction="column" alignContent="center" className={mainClasses.mainContainer}>
			<Typography variant="h2" align="center" gutterBottom color="primary">
				404
			</Typography>
			<Grid item className={classes.typewriter}>
				<Typewriter onInit={typewriterEffect} />
			</Grid>
		</Grid>
	)
}

export default Error
