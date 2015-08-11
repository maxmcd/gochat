var Input = React.createClass({
	componentDidMount: function() {
		$('.question').focus()
	},
	handleSubmit: function(e) {
		e.preventDefault()
		node = React.findDOMNode(
			this.refs.whereTypingHappens
		)
		this.props.handleSubmit(
			node.value
		)
		node.value = ""
	},
	render: function() {
		var avatarStyle = {
			backgroundColor: this.props.color
		}
		return (
			<div>
				<div className="input">
					<form action="#" onSubmit={this.handleSubmit}>
						<div className="avatar"
							style={avatarStyle}></div>
						<input 
							ref="whereTypingHappens"
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
		this.props.poll()
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
					handleSubmit={this.props.handleSubmit}
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
				<div className="avatar" style={style}></div>
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
					handleSubmit={this.props.handleSubmit}
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
	getServer: function() {
		// bad
		if (document.location.origin[7] == 'l') {
			return "http://l:8001/"
		} else {
			return "http://104.236.119.243:8001/"
		}
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
			location: this.getLocation(),
			server: this.getServer()
		}
	},
	getChat: function() {
		$.ajax({
			url: this.state.server+"chat/" + this.state.location + "/",
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
	poll: function(location) {
		var latest = 1
		var messages = this.state.chat.messages
		if (messages.length > 0) {
			latest = messages[messages.length-1].created_at
		}
		$.ajax({
			url: this.state.server+"listen/"+this.state.location+"/",
			dataType: "json",
			data: {
				latest: latest
			},
			success: function(messages) {
				if (location == this.state.location) {
					this.state.chat.messages = this.state.chat.messages.concat(messages)
					this.setState({chat: this.state.chat})
					// hmmmmmmmm
					// racey?					
				}
				if (this.state.location !== "") {
					window.setTimeout(function() {
						this.poll(this.state.location)
					}.bind(this), 300)
				}
			}.bind(this),
			error: function() {
				window.setTimeout(function() {
					this.poll(this.state.location)
				}.bind(this), 1000)
			}.bind(this)
		})
	},
	writeQuestion: function(question) {
		$.ajax({
			url: this.state.server+'chats/',
			type: 'post',
			data: {
				question: question,
				color: this.state.color
			},
			success: function(data) {
				window.location = "#" + data
			},
			error: function(data) {
				console.log(data)
			}
		})
	},
	writeMessage: function(message) {
		if (this.state.chat.question !== null) {
			$.ajax({
				url: this.state.server+"chat/" + this.state.location + "/",
				type: 'post',
				data: {
					color: this.state.color,
					message: message
				},
				success: function(data) {
					console.log(data)
				},
				error: function(data) {
					console.log(data)
				}
			})
		}
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
			url: this.state.server+'chats/',
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
					handleSubmit={this.writeQuestion}
					color={this.state.color}
				/>
			)
		} else {
			return (
				<Question
					poll={this.poll}
					chat={this.state.chat} 
					getData={this.getChat}
					handleSubmit={this.writeMessage}
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
		console.log(this.state)
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
