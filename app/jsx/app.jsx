var Input = React.createClass({
	render: function() {
		var avatarStyle = {
			backgroundColor: this.props.color
		}
		return (
			<div>
				<div className="input">
					<form action="#">
						<div className="avatar"
							style={avatarStyle}></div>
						<input 
							type="text" 
							className="question" 
							placeholder={this.props.placeholder} autofocus />
						<input type="submit" value="submit" />
					</form>
				</div>
			</div>
		)
	}	
})

var Message = React.createClass({
	render: function() {
		var style = {
			backgroundColor: this.props.message.color
		}
		return (
			<div className="message" key={this.props.index}>
				<div className="avatar" style={style}></div>
				{this.props.message.body}
			</div>
		)
	}
})

var Question = React.createClass({
	componentDidMount: function() {
		this.props.getData()
	},
	createMessage: function(message, index) {
		return (
			<Message
				message={message}
				index={index}
			/>
		)
	},
	render: function() {
		var qAvatarStyle = {
			backgroundColor: this.props.chat.color
		}
		return (
			<div>
				<div className="blob">
					<div className="avatar" style={qAvatarStyle}></div>
					{this.props.chat.question}
				</div>            
				{this.props.chat.messages.map(this.createMessage)}
				<Input 
					color={this.props.color}
				/>
			</div>
		)
	}
})

var QuestionLink = React.createClass({
	render: function() {
		var key = "#" + this.props.question.key
		var style = {
			backgroundColor: this.props.question.color
		}
		return (
			<a href={key} key={this.props.index} className="blob">
				<div className="avatar"></div>
				{this.props.question.question}
			</a>            			
		)
	}
})

var Home = React.createClass({
	componentDidMount: function() {
		this.props.getData()
	},
	createQuestion: function(question, index) {
		return (
			<QuestionLink question={question} index={index} />
		)
	},
	render: function() {
		return (
			<div>
				<Input 
					placeholder="ask your question..."
					color={this.props.color}
				/>
				{this.props.questions.map(this.createQuestion)}
			</div>
		)
	}
})

var Canvas = React.createClass({
	retrieveColor: function() {
		var color = Tools.getCookie('color')
		if (!color) {
			color = Tools.generateColor()
			Tools.setCookie('color', color)
		}
		return color
	},
	getLocation: function() {
		return document.location.hash.slice(1)
	},
	attachEventHandlers: function() {
		// history state change
		window.onpopstate = history.onpushstate = function() {
			this.setState({location: this.getLocation()})
		}.bind(this)
	},
	getInitialState: function() {
		this.attachEventHandlers()
		return {
			color: this.retrieveColor(),
			chat: {
				created_at: 0,
				question: null,
				messages: []
			},
			questions: [],
			location: this.getLocation()
		}
	},
	getChat: function() {
		$.ajax({
			url: "http://localhost:8001/chat/" + this.state.location + "/",
			dataType: 'json',
			success: function(chat) {
				if (chat.messages == null){
					chat.messages = []
				}
				this.setState({chat: chat})
			}.bind(this),
			error: function(data) {
				console.log('404')
				this.setState({location: ""})
			} 
		})
	},
	getQuestions: function() {
		// clear chat when you go back home
		// so that it doesn't render
		// when a different chat is selected
		this.setState({chat: {
			created_at: 0,
			question: null,
			messages: []
		}})
		$.ajax({
			url: 'http://localhost:8001/chats/',
			dataType: 'json',
			success: function(questions) {
				this.setState({questions: questions})
			}.bind(this)
		})
	},
	content: function() {
		if (this.state.location == "") {
			return (
				<Home 
					questions={this.state.questions} 
					getData={this.getQuestions}
					color={this.state.color}
				/>
			)
		} else {
			return (
				<Question
					chat={this.state.chat} 
					getData={this.getChat}
					questions={this.state.questions}
					color={this.state.color}
				/>
			)
		}		
	},
	icon: function() {
		if (this.state.location == "") {
			return (<div className="avatar logo"></div>)
		} else {
			return (<div className="back-arrow"></div>)
		}
	},
	render: function() {
		return (
			<div>
		        <a href="#" className="header blob">		            
		        	{this.icon()}
		            welcome to chat
		        </a>
		        {this.content()}
		    </div>
	    )
	}
});

$(function() {
	React.render(<Canvas />, document.getElementById('canvas'))	
})
