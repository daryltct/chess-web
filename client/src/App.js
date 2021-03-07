import './App.css'
import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import PrivateRoute from './components/PrivateRoute'
import Home from './components/Home'
import Login from './components/Login'

const App = () => {
	return (
		<Router>
			<Switch>
				<PrivateRoute exact path="/" component={Home} />
				<Route exact path="/login" component={Login} />
			</Switch>
		</Router>
	)
}

export default App
