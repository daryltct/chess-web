import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Header from './components/ui/Header'
import PrivateRoute from './components/PrivateRoute'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import SinglePlayer from './components/SinglePlayer'
import Profile from './components/Profile'
import Alert from './components/ui/Alert'
import Error from './components/Error'

const App = () => {
	return (
		<Router>
			<Header />
			<Alert />
			<Switch>
				<PrivateRoute exact path="/" component={Home} />
				<Route exact path="/login" component={Login} />
				<Route exact path="/register" component={Register} />
				<PrivateRoute exact path="/single" component={SinglePlayer} />
				<PrivateRoute exact path="/profile" component={Profile} />
				<Route path="*" component={Error} />
			</Switch>
		</Router>
	)
}

export default App
