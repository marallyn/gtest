import React, { Component } from "react";
import { Link } from "react-router-dom";

export function Breadcrumb(props) {
	const lis = props.whereAmI.map((e, index, arr) => {
		let classes = "breadcrumb-item ";
		let ariaCurrent = "";
		let link = "";

		if (index === arr.length - 1) {
			classes += "active";
			ariaCurrent = "page";
			link = e.text;
		} else {
			link = <Link to={e.link}>{e.text}</Link>;
		}

		return (
			<li key={e.link} className={classes} aria-current={ariaCurrent}>
				{link}
			</li>
		);
	});

	return (
		<nav aria-label="breadcrumb">
			<ol className="breadcrumb">{lis}</ol>
		</nav>
	);
}

export class Modal extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const footer = this.props.footer ? (
			this.props.footer
		) : (
			<button
				type="button"
				className="btn btn-secondary close"
				data-dismiss="modal"
			>
				Close
			</button>
		);

		return (
			<div
				aria-hidden="true"
				className="modal fade"
				id={this.props.id}
				role="dialog"
				tabIndex="-1"
			>
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{this.props.title}</h5>
							<button
								type="button"
								className="close"
								data-dismiss="modal"
								aria-label="Close"
							>
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">{this.props.body}</div>
						<div className="modal-footer">{footer}</div>
					</div>
				</div>
			</div>
		);
	}
}
