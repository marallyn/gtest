import React, { Component } from "react";
import { Breadcrumb, Modal } from "./bs-components";
import Cart from "./Cart";

class Header extends Component {
	state = { payment: { checkNum: 0, amount: 0 } };

	constructor(props) {
		super(props);
	}

	customerSelect = () => {
		let customers = [
			<option key="0" value="0">
				Pick one from list
			</option>
		];
		customers.push(
			this.props.customers.map(c => {
				return (
					<option key={c.customerNumber} value={c.customerNumber}>
						{c.customerName}
					</option>
				);
			})
		);

		return (
			<select
				onChange={e => {
					this.props.selectCustomer(e.target.value);
				}}
			>
				{customers}
			</select>
		);
	};

	handlePaymentFormChange = e => {
		let payment = { ...this.state.payment };
		payment[e.target.id] = e.target.value;
		this.setState({
			payment: payment
		});
	};

	paymentButton = () => {
		return this.props.customer.customerNumber ? (
			<button
				type="button"
				className="btn btn-secondary"
				onClick={() => {
					$("#paymentModal").modal("show");
				}}
			>
				Payment
			</button>
		) : null;
	};

	paymentModalFooter = () => {
		return (
			<button
				type="button"
				className="btn btn-secondary"
				onClick={() => {
					$("#paymentModal").modal("toggle");
					this.props.applyPayment(this.state.payment);
				}}
			>
				Apply Payment
			</button>
		);
	};

	paymentModalBody = () => {
		return (
			<form>
				<div className="form-group">
					<label htmlFor="checknum" className="col-form-label">
						Check number:
					</label>
					<input
						type="text"
						className="form-control"
						id="checkNum"
						onChange={this.handlePaymentFormChange}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="amount" className="col-form-label">
						Amount:
					</label>
					<input
						type="number"
						className="form-control"
						id="amount"
						onChange={this.handlePaymentFormChange}
					/>
				</div>
			</form>
		);
	};

	searchBar = () => {
		return (
			<div className="input-group">
				<input
					type="text"
					className="form-control"
					placeholder="Product title search"
					onChange={this.props.changeProductFilter}
				/>
				<div className="input-group-append">
					<button
						type="button"
						className="btn btn-outline-secondary"
						onClick={this.props.newSearch}
					>
						Search
					</button>
				</div>
			</div>
		);
	};

	renderLocationButtons = () => {
		const usaDisabled = this.props.location.location === "USA";
		const intDisabled = this.props.location.location === "international";

		return (
			<div>
				<button
					className="btn btn-sm btn-link"
					disabled={usaDisabled}
					onClick={() => this.props.changeLocation("USA")}
					type="button"
				>
					USA
				</button>
				{"|"}
				<button
					className="btn btn-sm btn-link"
					disabled={intDisabled}
					onClick={() => this.props.changeLocation("international")}
					type="button"
				>
					International
				</button>
			</div>
		);
	};

	render() {
		return (
			<div className="row">
				<Modal
					body={this.paymentModalBody()}
					footer={this.paymentModalFooter()}
					id="paymentModal"
					title="Enter Payment Info"
				/>

				<div className="col-2 p-0" style={{ width: "150px" }}>
					<img src="https://via.placeholder.com/150x75.png?text=Logo" />
				</div>
				<div className="col">
					<div className="row">
						<div className="col p-0">{this.searchBar()}</div>
					</div>
					<div className="row">
						<div className="col p-0">
							<Breadcrumb
								whereAmI={[
									{ text: "Home", link: "/" },
									{ text: "Reports", link: "/reports" },
									{ text: "Products", link: "" }
								]}
							/>
						</div>
					</div>
				</div>
				<div className="col-1">
					<div className="row">
						<div className="col-6 p-0">
							<Cart
								addCartComment={this.props.addCartComment}
								cart={this.props.cart}
								checkout={this.props.checkout}
								customer={this.props.customer}
								price={this.props.location.price}
								removeFromCart={this.props.removeFromCart}
							/>
						</div>
						<div className="col-6">
							<span className="badge badge-pill badge-dark">4</span>
						</div>
					</div>
					<div className="row">{this.renderLocationButtons()}</div>
				</div>
				<div className="col-3">
					<div className="row">
						<div className="col">{this.customerSelect()}</div>
					</div>
					<div className="row">
						<div className="col">{this.paymentButton()}</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Header;
