import React from "react";

function Icon(props) {
	return (
		<i
			onClick={props.onClick}
			className={props.classList}
			style={{ color: props.color }}
		/>
	);
}

const Arrow = function(props) {
	const classList = "far fa-2x fa-arrow-alt-circle-" + props.side;
	let show = false;

	if (props.side === "left" && props.page > 1) {
		show = true;
	} else if (props.side === "right" && props.page < props.pages) {
		show = true;
	}

	return show ? <Icon classList={classList} onClick={props.onClick} /> : null;
};

export default Arrow;
