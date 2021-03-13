import React, { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/styles'
import { AppBar, Toolbar, Typography, Tabs, Tab } from '@material-ui/core'
import VideogameAssetIcon from '@material-ui/icons/VideogameAsset'

const useStyles = makeStyles((theme) => ({
	headerMargin: {
		...theme.mixins.toolbar,
		marginBottom: '2em'
	},
	logoMargin: {
		marginRight: '8px'
	},
	header: {
		height: '6em'
	},
	tabContainer: {
		marginLeft: 'auto'
	},
	tab: {
		fontSize: '1rem',
		minWidth: '30px',
		marginLeft: '25px'
	}
}))

const routes = [
	{ name: 'Lobby', link: '/', activeIndex: 0 },
	{ name: 'Single Player', link: '/single', activeIndex: 1 },
	{ name: 'Profile', link: '/profile', activeIndex: 2 }
]

const Header = () => {
	const classes = useStyles()

	const [ active, setActive ] = useState(0)

	// prevent active tab from defaulting upon refresh
	useEffect(
		() => {
			routes.forEach((route) => {
				switch (window.location.pathname) {
					case `${route.link}`:
						if (active !== route.activeIndex) {
							setActive(route.activeIndex)
						}
						break
					default:
						break
				}
			})
		},
		[ active, routes ]
	)

	const changeTab = (e, value) => {
		setActive(value)
	}

	return (
		<Fragment>
			<AppBar elevation={0}>
				<Toolbar className={classes.header}>
					<VideogameAssetIcon fontSize="large" className={classes.logoMargin} />
					<Typography variant="h5">Play Chess</Typography>
					<Tabs className={classes.tabContainer} value={active} onChange={changeTab}>
						<Tab className={classes.tab} label="Lobby" component={Link} to="/" />
						<Tab className={classes.tab} label="Single Player" component={Link} to="/single" />
						<Tab className={classes.tab} label="Profile" component={Link} to="/profile" />
					</Tabs>
				</Toolbar>
			</AppBar>
			<div className={classes.headerMargin} />
		</Fragment>
	)
}

export default Header
