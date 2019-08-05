import React, { Component } from "react";
import { Modal } from "./bs-components";

class Cart extends Component {
	// state = { numItems: 0 };

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		// this.setState({ numItems: this.props.cart.itemCount });
	}

	getCartItemList = () => {
		if (this.props.cart.itemCount === 0) {
			return (
				<p>
					Aw man, no items. Click the Buy Me button to add items to the cart.
				</p>
			);
		} else {
			let price = this.props.price;
			const productRows = this.props.cart.items.map(p => {
				const newPrice = (price * p.MSRP).toFixed(2);

				return (
					<tr key={p.productCode}>
						<th>{p.productName}</th>
						<td>
							${newPrice} X {p.quantity}
						</td>
						<td>
							<button
								className="btn"
								onClick={() => {
									this.props.removeFromCart(p.productCode);
								}}
							>
								<i className="fas fa-trash-alt" />
							</button>
						</td>
					</tr>
				);
			});

			return (
				<table>
					<tbody>{productRows}</tbody>
				</table>
			);
		}
	};

	renderModal() {
		const checkoutDisabled =
			this.props.cart.itemCount < 1 || !Object.keys(this.props.customer).length;

		return (
			<div
				className="modal fade"
				id="cartModal"
				tabIndex="-1"
				role="dialog"
				// aria-labelledby="exampleModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLabel">
								Cart Contents
								<span className="badge badge-pill badge-dark text-right">
									{this.props.cart.itemCount}
								</span>
							</h5>
							<button
								type="button"
								className="close"
								data-dismiss="modal"
								aria-label="Close"
							>
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">{this.getCartItemList()}</div>
						<div className="modal-footer">
							<div className="float-left pr-3 mr-3">
								Total: ${this.props.cart.cost.toFixed(2)}
							</div>
							<div className="float-right">
								<button
									type="button"
									className="btn close"
									data-dismiss="modal"
									disabled={checkoutDisabled}
									onClick={() => {
										$("#commentModal").modal("show");
										// this.props.checkout();
									}}
								>
									Checkout
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	render() {
		return (
			<div>
				<Modal
					body={
						<form>
							<div className="form-group">
								<label htmlFor="orderComment" className="col-form-label">
									Any comment for your order:
								</label>
								<textarea
									className="form-control"
									onChange={e => this.props.addCartComment(e.target.value)}
									id="order-comment"
								/>
							</div>
						</form>
					}
					footer={
						<button
							type="button"
							className="btn btn-secondary close"
							data-dismiss="modal"
							onClick={() => {
								this.props.checkout();
							}}
						>
							Checkout
						</button>
					}
					id="commentModal"
					title="Add Order Comment"
				/>
				<button
					type="button"
					className="btn btn-light"
					data-toggle="modal"
					data-target="#cartModal"
				>
					<i className="fas fa-shopping-cart fa-lg" />
					<span
						className="badge badge-pill badge-dark"
						style={{
							position: "relative",
							top: "-11px",
							left: "-17px",
							fontSize: "0.6em"
						}}
					>
						{this.props.cart.itemCount}
					</span>
					<br />
					Cart
				</button>
				{this.renderModal()}
			</div>
		);
	}
}
export default Cart;
