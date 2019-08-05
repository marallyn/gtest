import React, { Component } from "react";
import { Modal } from "../components/bs-components";
import { Link } from "react-router-dom";

class ReportsPage extends Component {
	state = {
		error: false,
		modal: { body: "No message, for now.", title: "Message Modal" },
		report: null
	};

	constructor(props) {
		super(props);
	}

	componentDidMount() {}

	showReport = e => {
		const theThis = this;
		const reportName = e.target.dataset.reportname;

		axios({
			headers: { "Content-Type": "application/json", "x-api-key": "gingr" },
			method: "GET",
			params: {
				reportName: reportName
			},
			url: this.props.apiUrl + "/report"
		})
			.then(response => {
				let data = response.data;
				if (data.report) {
					theThis.processReport(data.report);
				} else {
					theThis.showMessageModal(data.error, "Api Error");
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

	processReport(reportData) {
		const { align, columnNames, columnText, data } = reportData;

		const headerRow = (
			<tr>
				{columnText.map(n => (
					<th key={n}>{n}</th>
				))}
			</tr>
		);

		const dataRows = data.map((row, i) => {
			return (
				<tr key={i}>
					{columnNames.map((colName, index) => (
						<td key={colName} className={"text-" + align[index]}>
							{row[colName]}
						</td>
					))}
				</tr>
			);
		});

		this.setState({
			report: (
				<table>
					<thead>{headerRow}</thead>
					<tbody>{dataRows}</tbody>
				</table>
			)
		});
	}

	showMessageModal(body, title) {
		this.setState({ modal: { body: body, title: title } }, () => {
			$("#messageModal").modal("show");
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
				<div className="row">
					<div className="col">
						<h1>Reports Page</h1>
						<Link to="/">Home</Link>
					</div>
				</div>
				<div className="row">
					<div className="col">
						<button
							className="btn btn-sm btn-link"
							data-reportname="sales-commission"
							onClick={this.showReport}
							type="button"
						>
							Sales Commissions
						</button>
						{"|"}
						<button
							className="btn btn-sm btn-link"
							data-reportname="office-commission"
							onClick={this.showReport}
							type="button"
						>
							Office Commissions
						</button>
						{"|"}
						<button
							className="btn btn-sm btn-link"
							data-reportname="product-sales"
							onClick={this.showReport}
							type="button"
						>
							Product Sales
						</button>
					</div>
				</div>
				<div className="row">
					<div className="col">{this.state.report}</div>
				</div>
			</div>
		);
	}
}

export default ReportsPage;
