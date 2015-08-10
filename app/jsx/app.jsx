
var Canvas = React.createClass({
	render: function() {
		return (
			<div className="input">
				<form action="#">
					<div className="avatar"></div>
					<input type="text" className="question" placeholder="ask your question..." autofocus />
					<input type="submit" value="submit" />
				</form> 
			</div>
		)
	}
});

React.render(<Canvas />, document.getElementById('canvas'))