import React from "react";

function Product(props) {
	const p = props.product;
	const price = (props.price * p.MSRP).toFixed(2);
	const Button = function() {
		return +p.quantityInStock > 0 ? (
			<button
				type="button"
				className="btn btn-light"
				onClick={() => {
					props.addToCart(p.productCode);
				}}
			>
				<i className="fas fa-plus-square fa-2x" />
				<br />
				BUY ME
			</button>
		) : (
			<button type="button" className="btn btn-primary">
				Sell Yours ${p.buyPrice}
			</button>
		);
	};

	return (
		<div className="col-sm-6 col-lg-4">
			<div className="card">
				<div className="card-body">
					<h5 className="card-title">{p.productName}</h5>
					<img
						src="https://via.placeholder.com/150x75.png?text=Item+Image"
						className="card-img"
					/>
					<p className="card-text">{p.description}</p>
					<p className="card-text">{p.productVendor}</p>
					<p className="card-text text-right">${price}</p>
				</div>
				<div className="card-footer text-right">
					<Button />
				</div>
			</div>
		</div>
	);
}

export default Product;
