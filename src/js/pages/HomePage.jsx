import React, { Component } from "react";
import Arrow from "../components/Arrow";
import Header from "../components/Header";
import { Modal } from "../components/bs-components";
import Product from "../components/Product";

class HomePage extends Component {
	maxProducts = 6;
	state = {
		cart: { items: [], itemCount: 0, cost: 0, comment: "" },
		customer: {},
		customers: [],
		error: false,
		loaded: false,
		location: { location: "USA", price: 1 },
		modal: { body: "Body", title: "title" },
		page: 1,
		pages: 1,
		productCount: 0,
		productFilter: "",
		products: []
	};

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		this.filterProducts();
		this.loadCustomers();
	}

	addCartComment = comment => {
		console.log(comment);
		let cart = { ...this.state.cart };
		cart.comment = comment;
		this.setState({ cart: cart });
	};

	addToCart = productCode => {
		let product = {
			...this.state.products.filter(p => p.productCode === productCode)[0]
		};
		let cartItems = [...this.state.cart.items];

		// find it in the cart
		let productInCart = cartItems.filter(p => p.productCode === productCode);
		if (productInCart.length > 0) {
			// product exists in cart already
			product = productInCart[0];
			product.quantity += 1;
		} else {
			// product does not exist in cart yet
			product.quantity = 1;
			cartItems.push(product);
		}
		let numItems = 0;
		let cost = 0;
		cartItems.map(p => {
			numItems += p.quantity;
			cost += p.quantity * p.MSRP * this.state.location.price;
		});

		this.setState({
			cart: { items: cartItems, itemCount: numItems, cost: cost }
		});

		if (cost > this.state.customer.creditLimit) {
			this.showMessageModal(
				"The cost of the items in your cart is more than your credit limit ",
				"Credit Limit Exceeded"
			);
		}
	};

	applyPayment = payment => {
		console.log("applyPayment");
		const theThis = this;

		axios({
			headers: { "Content-Type": "application/json", "x-api-key": "gingr" },
			method: "POST",
			data: {
				payment: payment,
				customerNumber: this.state.customer.customerNumber
			},
			url: this.props.apiUrl + "/payment"
		})
			.then(response => {
				let data = response.data;
				if (data.payment) {
					theThis.showMessageModal(data.payment, "Payment Applied");
				} else {
					theThis.showMessageModal(
						"An error has occurred: " + (data.error ? data.error : "unknown"),
						"API Error"
					);
					theThis.setState({
						error: true
					});
				}
			})
			.catch(function(error) {
				console.log(error);
				theThis.showMessageModal(
					"Unknown network error occurred.",
					"Network Error"
				);
				theThis.setState({
					error: true
				});
			});
	};

	checkout = () => {
		console.log("checkout");
		const theThis = this;

		axios({
			headers: { "Content-Type": "application/json", "x-api-key": "gingr" },
			method: "POST",
			data: {
				customerNumber: this.state.customer.customerNumber,
				cart: this.state.cart.items,
				comment: this.state.cart.comment,
				price: this.state.location.price
			},
			url: this.props.apiUrl + "/order"
		})
			.then(response => {
				let data = response.data;
				if (data.orderNumber) {
					theThis.showMessageModal(
						"Order number " + data.orderNumber + " created for you.",
						"Order Accepted"
					);
					theThis.setState({
						cart: { items: [], itemCount: 0, cost: 0 },
						error: false
					});
				} else {
					theThis.showMessageModal(
						"An error has occurred: " + (data.error ? data.error : "unknown"),
						"API Error"
					);
					theThis.setState({
						error: true
					});
				}
			})
			.catch(function(error) {
				theThis.showMessageModal(
					"Unknown network error occurred.",
					"Network Error"
				);
				theThis.setState({
					error: true
				});
			});
	};

	removeFromCart = productCode => {
		let cartItems = [...this.state.cart.items];
		let numItems = this.state.cart.itemCount;
		let cost = this.state.cart.cost;

		// find it in the cart
		let index;
		let productInCart = cartItems.filter((p, i) => {
			if (p.productCode === productCode) {
				index = i;
			}

			return p.productCode === productCode;
		})[0];
		cartItems.splice(index, 1);
		console.log(productInCart, cartItems);

		this.setState({
			cart: {
				items: cartItems,
				itemCount: numItems - productInCart.quantity,
				cost:
					cost -
					productInCart.quantity *
						productInCart.MSRP *
						this.state.location.price
			}
		});
	};

	changeLocation = location => {
		let locationObj = { ...this.state.location };
		locationObj.location = location;

		this.setState(
			{
				cart: { items: [], itemCount: 0, cost: 0 },
				location: locationObj
			},
			this.getLocationPrice
		);
	};

	changePage = dir => {
		this.setState(
			state => ({
				page: state.page + dir
			}),
			this.filterProducts
		);
	};

	changeProductFilter = e => {
		this.setState({ productFilter: e.target.value });
	};

	newSearch = () => {
		this.setState({ page: 1 }, this.filterProducts);
	};

	filterProducts = () => {
		const theThis = this;

		axios({
			headers: { "Content-Type": "application/json", "x-api-key": "gingr" },
			method: "GET",
			params: {
				filter: this.state.productFilter,
				max: this.maxProducts,
				page: this.state.page
			},
			url: this.props.apiUrl + "/product"
		})
			.then(response => {
				let data = response.data;
				if (data.products) {
					this.setState({
						error: false,
						loaded: true,
						page: data.page,
						pages: data.pages,
						productCount: data.count,
						products: data.products
					});
				} else {
					theThis.showMessageModal(
						"An error has occurred: " + (data.error ? data.error : ""),
						"API Error"
					);
					theThis.setState({
						products: [],
						error: true,
						loaded: false
					});
				}
			})
			.catch(function(error) {
				theThis.showMessageModal(
					"Unknown network error occurred.",
					"Network Error"
				);
				theThis.setState({
					customers: [],
					error: true,
					loaded: false
				});
			});
	};

	getLocationPrice = () => {
		const theThis = this;

		axios({
			headers: { "Content-Type": "application/json", "x-api-key": "gingr" },
			method: "GET",
			params: {
				location: this.state.location.location
			},
			url: this.props.apiUrl + "/location"
		})
			.then(response => {
				let data = response.data;
				if (data.price) {
					let locationObj = { ...this.state.location };
					locationObj.price = data.price;

					this.setState({
						location: locationObj
					});
				} else {
					theThis.showMessageModal(
						"An error has occurred: " + (data.error ? data.error : ""),
						"API Error"
					);
					theThis.setState({
						location: {
							location: "USA",
							price: 1
						}
					});
				}
			})
			.catch(function(error) {
				theThis.showMessageModal(
					"Unknown network error occurred.",
					"Network Error"
				);
				theThis.setState({
					error: true,
					location: { location: "USA", price: 1 }
				});
			});
	};

	loadCustomers() {
		const theThis = this;

		axios({
			headers: { "Content-Type": "application/json", "x-api-key": "gingr" },
			method: "GET",
			url: this.props.apiUrl + "/customer"
		})
			.then(response => {
				if (response.data.customers) {
					this.setState({
						customers: response.data.customers,
						error: false,
						loaded: true
					});
				} else {
					theThis.showMessageModal(
						"An error has occurred: " + (data.error ? data.error : ""),
						"API Error"
					);
					theThis.setState({
						customers: [],
						error: true,
						loaded: false
					});
				}
			})
			.catch(function(error) {
				theThis.showMessageModal(
					"Unknown network error occurred.",
					"Network Error"
				);
				theThis.setState({
					customers: [],
					error: true,
					loaded: false
				});
			});
	}

	selectCustomer = customerNumber => {
		const customer = [
			...this.state.customers.filter(c => c.customerNumber === customerNumber)
		];
		console.log("customer selected", customer[0]);
		this.setState({ customer: customer[0] || {} });
	};

	renderItemsCount() {
		// 1-6 of x items
		const item1 = (this.state.page - 1) * this.maxProducts + 1;
		const item2 = Math.min(
			this.state.page * this.maxProducts,
			this.state.productCount
		);

		return (
			<p>
				{item1}-{item2} of {this.state.productCount}
			</p>
		);
	}

	showMessageModal(body, title) {
		this.setState({ modal: { body: body, title: title } }, () => {
			$("#messageModal").modal("show");
		});
	}

	renderProducts() {
		const price = this.state.location.price;

		return this.state.products.map(p => {
			return (
				<Product
					addToCart={this.addToCart}
					key={p.productCode}
					price={price}
					product={p}
				/>
			);
		});
	}

	render() {
		return (
			<div>
				<Modal
					body={this.state.modal.body}
					id="messageModal"
					title={this.state.modal.title}
				/>
				<Header
					addCartComment={this.addCartComment}
					applyPayment={this.applyPayment}
					cart={this.state.cart}
					changeProductFilter={this.changeProductFilter}
					changeLocation={this.changeLocation}
					checkout={this.checkout}
					customer={this.state.customer}
					customers={this.state.customers}
					location={this.state.location}
					newSearch={this.newSearch}
					removeFromCart={this.removeFromCart}
					selectCustomer={this.selectCustomer}
				/>
				<div
					className="row"
					style={{
						background:
							"transparent url('https://via.placeholder.com/1280x500.png?text=Large+Marketing+Image') no-repeat center center /cover"
					}}
				>
					<div className="col-1 align-self-center">
						<Arrow
							side="left"
							page={this.state.page}
							pages={this.state.pages}
							onClick={() => {
								this.changePage(-1);
							}}
						/>
					</div>
					<div className="col pImg pt-5">
						<div className="row">{this.renderProducts()}</div>
					</div>
					<div className="col-1 align-self-center">
						<Arrow
							side="right"
							page={this.state.page}
							pages={this.state.pages}
							onClick={() => {
								console.log("click");
								this.changePage(1);
							}}
						/>
					</div>
				</div>
				<div className="row">
					<div className="col text-right">{this.renderItemsCount()}</div>
				</div>
			</div>
		);
	}
}

export default HomePage;
