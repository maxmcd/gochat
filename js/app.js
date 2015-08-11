var Input = React.createClass({displayName: "Input",
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
			React.createElement("div", null, 
				React.createElement("div", {className: "input"}, 
					React.createElement("form", {action: "#", onSubmit: this.handleSubmit}, 
						React.createElement("div", {className: "avatar", 
							style: avatarStyle}), 
						React.createElement("input", {
							ref: "whereTypingHappens", 
							type: "text", 
							className: "question", 
							placeholder: this.props.placeholder, autofocus: true}), 
						React.createElement("input", {type: "submit", value: "submit"})
					)
				)
			)
		)
	}	
})

var Message = React.createClass({displayName: "Message",
	render: function() {
		var style = {
			backgroundColor: this.props.message.color
		}
		return (
			React.createElement("div", {className: "message", key: this.props.index}, 
				React.createElement("div", {className: "avatar", style: style}), 
				this.props.message.body
			)
		)
	}
})

var Question = React.createClass({displayName: "Question",
	componentDidMount: function() {
		this.props.getData()
		this.props.poll()
	},
	createMessage: function(message, index) {
		return (
			React.createElement(Message, {
				message: message, 
				index: index}
			)
		)
	},
	render: function() {
		var qAvatarStyle = {
			backgroundColor: this.props.chat.color
		}
		return (
			React.createElement("div", null, 
				React.createElement("div", {className: "blob"}, 
					React.createElement("div", {className: "avatar", style: qAvatarStyle}), 
					this.props.chat.question
				), 
				this.props.chat.messages.map(this.createMessage), 
				React.createElement(Input, {
					handleSubmit: this.props.handleSubmit, 
					color: this.props.color}
				)
			)
		)
	}
})

var QuestionLink = React.createClass({displayName: "QuestionLink",
	render: function() {
		var key = "#" + this.props.question.key
		var style = {
			backgroundColor: this.props.question.color
		}
		return (
			React.createElement("a", {href: key, key: this.props.index, className: "blob"}, 
				React.createElement("div", {className: "avatar", style: style}), 
				this.props.question.question
			)            			
		)
	}
})

var Home = React.createClass({displayName: "Home",
	componentDidMount: function() {
		this.props.getData()
	},
	createQuestion: function(question, index) {
		return (
			React.createElement(QuestionLink, {question: question, index: index})
		)
	},
	render: function() {
		return (
			React.createElement("div", null, 
				React.createElement(Input, {
					placeholder: "ask your question...", 
					handleSubmit: this.props.handleSubmit, 
					color: this.props.color}
				), 
				this.props.questions.map(this.createQuestion)
			)
		)
	}
})

var Canvas = React.createClass({displayName: "Canvas",
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
	poll: function(location) {
		var latest = 1
		var messages = this.state.chat.messages
		if (messages.length > 0) {
			latest = messages[messages.length-1].created_at
		}
		$.ajax({
			url: "http://localhost:8001/listen/"+this.state.location+"/",
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
			url: 'http://localhost:8001/chats/',
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
				url: "http://localhost:8001/chat/" + this.state.location + "/",
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
				React.createElement(Home, {
					questions: this.state.questions, 
					getData: this.getQuestions, 
					handleSubmit: this.writeQuestion, 
					color: this.state.color}
				)
			)
		} else {
			return (
				React.createElement(Question, {
					poll: this.poll, 
					chat: this.state.chat, 
					getData: this.getChat, 
					handleSubmit: this.writeMessage, 
					questions: this.state.questions, 
					color: this.state.color}
				)
			)
		}		
	},
	icon: function() {
		if (this.state.location == "") {
			return (React.createElement("div", {className: "avatar logo"}))
		} else {
			return (React.createElement("div", {className: "back-arrow"}))
		}
	},
	render: function() {
		console.log(this.state)
		return (
			React.createElement("div", null, 
		        React.createElement("a", {href: "#", className: "header blob"}, 		            
		        	this.icon(), 
		            "welcome to chat"
		        ), 
		        this.content()
		    )
	    )
	}
});

$(function() {
	React.render(React.createElement(Canvas, null), document.getElementById('canvas'))	
})

Tools = {
    generateColor: function() {
        var color, colors;
        colors = ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed', 'Indigo', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'];
        color = colors[Math.floor(Math.random() * colors.length)];
        return color;
    },
    escape: function(s) {
        return ('' + s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'").replace(/\//g, '/');
    },
    setCookie: function(name, value) {
        var d, days, expires;
        d = new Date();
        days = 3000;
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "expires=" + d.toUTCString();
        return document.cookie = name + "=" + value + "; " + expires;
    },
    getCookie: function(cname) {
        var c, ca, i, name;
        name = cname + '=';
        ca = document.cookie.split(';');
        i = 0;
        while (i < ca.length) {
            c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
            i++;
        }
        return null;
    }
}