import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Header from './components/ui/Header'

import PrivateRoute from './components/PrivateRoute'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import SinglePlayer from './components/SinglePlayer'

const App = () => {
	return (
		<Router>
			<Header />
			<Switch>
				<PrivateRoute exact path="/" component={Home} />
				<Route exact path="/login" component={Login} />
				<Route exact path="/register" component={Register} />
				<Route exact path="/single" component={SinglePlayer} />
			</Switch>
		</Router>
	)
}

export default App
