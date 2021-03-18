import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'

// import { UserContext } from '../../context/user/UserContext'
import { useUser } from '../../context/user/UserContext'

import { makeStyles } from '@material-ui/styles'
import {
	useMediaQuery,
	AppBar,
	Toolbar,
	Typography,
	Tabs,
	Tab,
	SwipeableDrawer,
	Button,
	IconButton,
	List,
	ListItem,
	ListItemText
} from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
import VideogameAssetIcon from '@material-ui/icons/VideogameAsset'
import MenuIcon from '@material-ui/icons/Menu'

// INLINE STYLES
const useStyles = makeStyles((theme) => ({
	headerMargin: {
		...theme.mixins.toolbar,
		marginBottom: '2.5em',
		[theme.breakpoints.down('sm')]: {
			marginBottom: '2em'
		}
	},
	logo: {
		padding: 0,
		color: '#fff',
		'&:hover': {
			backgroundColor: 'transparent'
		}
	},
	logoMargin: {
		marginRight: '8px'
	},
	header: {
		height: '6em',
		[theme.breakpoints.down('sm')]: {
			height: '5.5em'
		}
	},
	tabContainer: {
		marginLeft: 'auto'
	},
	tab: {
		...theme.typography.tab,
		minWidth: '30px',
		marginLeft: '25px'
	},
	drawerIcon: {
		marginLeft: 'auto',
		color: '#fff',
		'&:hover': {
			backgroundColor: 'transparent'
		}
	},
	drawer: {
		backgroundColor: theme.palette.common.crayola
	},
	drawerItemContainer: {
		height: '5em',
		width: '15em'
	},
	drawerItem: {
		...theme.typography.tab
	},
	appbar: {
		zIndex: theme.zIndex.modal + 1
	}
}))

const routes = [
	{ name: 'Lobby', link: '/', activeIndex: 0 },
	{ name: 'Single Player', link: '/single', activeIndex: 1 },
	{ name: 'Profile', link: '/profile', activeIndex: 2 }
]

const Header = () => {
	const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent)
	const classes = useStyles()
	const theme = useTheme()
	const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

	const [ userState, userDispatch ] = useUser()
	const { isLoggedIn, inQueue, isHost } = userState
	// const { userState: { isLoggedIn, inQueue, isHost } } = useContext(UserContext)

	const [ active, setActive ] = useState(0)
	const [ openDrawer, setOpenDrawer ] = useState(false)

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
		[ active ]
	)

	const changeTab = (e, value) => {
		setActive(value)
	}

	// Tabs on navigation bar (large screen)
	const tabs = (
		<Fragment>
			<Tabs className={classes.tabContainer} value={active} onChange={changeTab}>
				{routes.map((route, index) => (
					<Tab
						key={index}
						className={classes.tab}
						label={route.name}
						component={Link}
						to={route.link}
						disabled={inQueue || isHost ? true : false}
					/>
				))}
			</Tabs>
		</Fragment>
	)

	// Slideable drawer (small screen)
	const drawer = (
		<Fragment>
			<SwipeableDrawer
				disableBackdropTransition={!iOS}
				disableDiscovery={iOS}
				anchor="right"
				classes={{ paper: classes.drawer }}
				open={openDrawer}
				onClose={() => setOpenDrawer(false)}
				onOpen={() => setOpenDrawer(true)}
			>
				<div className={classes.headerMargin} />
				<List disablePadding>
					{routes.map((route, index) => (
						<ListItem
							key={index}
							divider
							button
							component={Link}
							to={route.link}
							selected={active === route.activeIndex}
							onClick={() => {
								setOpenDrawer(false)
								setActive(route.activeIndex)
							}}
							className={classes.drawerItemContainer}
						>
							<ListItemText className={classes.drawerItem} disableTypography>
								{route.name}
							</ListItemText>
						</ListItem>
					))}
				</List>
			</SwipeableDrawer>
			<IconButton className={classes.drawerIcon} onClick={() => setOpenDrawer(!openDrawer)}>
				<MenuIcon />
			</IconButton>
		</Fragment>
	)

	return (
		<Fragment>
			<AppBar elevation={0} className={classes.appbar}>
				<Toolbar className={classes.header}>
					<Button className={classes.logo} component={Link} to="/" disableRipple onClick={() => setActive(0)}>
						<VideogameAssetIcon fontSize="large" className={classes.logoMargin} />
						<Typography variant={isSmall ? 'h5' : 'h4'}>PLAYING CHESS...</Typography>
					</Button>
					{/* hide tabs/drawer if user is not logged in */}
					{isLoggedIn && (isSmall ? drawer : tabs)}
				</Toolbar>
			</AppBar>
			<div className={classes.headerMargin} />
		</Fragment>
	)
}

export default Header
