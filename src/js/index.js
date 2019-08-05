import React, { Component } from "react";
import ReactDOM from "react-dom";
import HomePage from "./pages/HomePage";
import ReportsPage from "./pages/ReportsPage";
import { BrowserRouter, Route, Switch } from "react-router-dom";

class App extends Component {
	apiUrl = "";

	constructor(props) {
		super(props);
		this.apiUrl =
			window.location.protocol + "//" + window.location.hostname + "/gtest/api";
	}
	// {/* <Route path="/products" component={ProductPage} />
	// <Route path="/products/:searchTerm" component={ProductPage} /> */}
	render() {
		return (
			<div>
				<BrowserRouter>
					<Switch>
						<Route
							path="/reports"
							render={() => {
								return <ReportsPage apiUrl={this.apiUrl} />;
							}}
						/>
						<Route
							render={() => {
								return <HomePage apiUrl={this.apiUrl} />;
							}}
						/>
					</Switch>
				</BrowserRouter>
			</div>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("app"));
