window.CH = {}

window.questions = [
	{
		"question": "Why is the sky blue?",
		"color":"AliceBlue"
	},
	{
		"question": "How will I get down from here?",
		"color":"AntiqueWhite"
	},
	{
		"question": "What is up with these grapes?",
		"color":"Aqua"
	},
]

window.chat = {
	"question":	{
		"question": "Why is the sky blue?",
		"color":"AliceBlue"
	},
	"answers": [
		{
			"message": "Why is the sky blue?",
			"color":"AliceBlue"
		},
		{
			"message": "How will I get down from here?",
			"color":"AntiqueWhite"
		},
		{
			"message": "What is up with these grapes?",
			"color":"Aqua"
		},
	]
}

class CH.Tools

	@generateColor: ->
		colors = ['AliceBlue','AntiqueWhite','Aqua','Aquamarine','Azure','Beige','Bisque','Black','BlanchedAlmond','Blue','BlueViolet','Brown','BurlyWood','CadetBlue','Chartreuse','Chocolate','Coral','CornflowerBlue','Cornsilk','Crimson','Cyan','DarkBlue','DarkCyan','DarkGoldenRod','DarkGray','DarkGreen','DarkKhaki','DarkMagenta','DarkOliveGreen','DarkOrange','DarkOrchid','DarkRed','DarkSalmon','DarkSeaGreen','DarkSlateBlue','DarkSlateGray','DarkTurquoise','DarkViolet','DeepPink','DeepSkyBlue','DimGray','DodgerBlue','FireBrick','FloralWhite','ForestGreen','Fuchsia','Gainsboro','GhostWhite','Gold','GoldenRod','Gray','Green','GreenYellow','HoneyDew','HotPink','IndianRed','Indigo','Ivory','Khaki','Lavender','LavenderBlush','LawnGreen','LemonChiffon','LightBlue','LightCoral','LightCyan','LightGoldenRodYellow','LightGray','LightGreen','LightPink','LightSalmon','LightSeaGreen','LightSkyBlue','LightSlateGray','LightSteelBlue','LightYellow','Lime','LimeGreen','Linen','Magenta','Maroon','MediumAquaMarine','MediumBlue','MediumOrchid','MediumPurple','MediumSeaGreen','MediumSlateBlue','MediumSpringGreen','MediumTurquoise','MediumVioletRed','MidnightBlue','MintCream','MistyRose','Moccasin','NavajoWhite','Navy','OldLace','Olive','OliveDrab','Orange','OrangeRed','Orchid','PaleGoldenRod','PaleGreen','PaleTurquoise','PaleVioletRed','PapayaWhip','PeachPuff','Peru','Pink','Plum','PowderBlue','Purple','RebeccaPurple','Red','RosyBrown','RoyalBlue','SaddleBrown','Salmon','SandyBrown','SeaGreen','SeaShell','Sienna','Silver','SkyBlue','SlateBlue','SlateGray','Snow','SpringGreen','SteelBlue','Tan','Teal','Thistle','Tomato','Turquoise','Violet','Wheat','White','WhiteSmoke','Yellow','YellowGreen']
		color = colors[Math.floor(Math.random() * colors.length)]
		return color

	@escape: (s) -> 
		(''+s).replace(/&/g, '&').replace(/</g, '<')
	    .replace(/>/g, '>').replace(/"/g, '"')
	    .replace(/'/g, "'").replace(/\//g,'/')

class CH.App

	constructor: (@options) ->
		@socket = new CH.Socket
		@runRouter()
		@setRandomAvatars()
		window.onpopstate = history.onpushstate = @runRouter
		
	setRandomAvatars: =>
		colors = @colors
		$('.avatar').each (index, el) =>
			if not $(el).hasClass('logo')
				color = CH.Tools.generateColor()
				$(el).css({'background-color':color})			

	runRouter: =>
		location = document.location.hash
		$('.canvas').html('')
		$('.header').removeClass('back')
		if location is ""
			new CH.Questions({
				socket: @socket
			})
		else
			new CH.Chat({
				socket: @socket	
				location: location
			})

class CH.Questions

	constructor: (@options) ->
		@initialRender()
		$('form').submit(@submit)
		@input = $('input[type=text]')
		@input.focus()
		@getQuestions()
		@options.socket.sock.onmessage = @onmessage

	initialRender: =>
		input = """
            <div class="input">
                <form action="#">
                    <div class="avatar"></div>
                    <input type="text" class="question" placeholder="ask your question..." autofocus>
                    <input type="submit" value="submit">             
                </form>
            </div>
		"""
		@content = input
		$('.canvas').html(@content)		

	getQuestions: =>
		$.ajax
			url: 'http://localhost:8001/chats/'
			dataType: 'json'
			success: (questions) =>
				@appendQuestion question for question in questions

	appendQuestion: (obj) =>
		$('.input').after(@createQuestion(obj))		

	createQuestion: (question) =>
		"""
            <a href="##{question.key}" class="blob">
                <div class="avatar"></div>
                #{CH.Tools.escape question.question}
            </a>            
		"""

	onmessage: (message) =>

	submit: (e) =>
		e.preventDefault()
		q = @input.val()
		@input.val('')
		$.ajax
			url: 'http://localhost:8001/chats/'
			type: 'post'
			data:
				question: q
				key: 'faq'
			success: (data) =>
				console.log(data)
				window.location = "##{data}"


class CH.Chat

	constructor: (@options) ->
		console.log(@options)
		@getChat()
		@initialRender()
		$('form').submit(@submit)
		@input = $('input[type=text]')
		@input.focus()
		@options.socket.sock.onmessage = @onmessage

	addMessage: (obj) =>
		$('.input').before(@createMessage(obj))

	addQuestion: (obj) =>
		$('.canvas').prepend(@createQuestion(obj))

	createQuestion: (question) =>
		"""
            <a href="#foo" class="blob">
                <div class="avatar"></div>
                #{CH.Tools.escape question.question}
            </a>            
		"""

	createMessage: (obj) =>
		"""
        	<div class="message">
        		<div class="avatar"></div>
        		#{CH.Tools.escape obj.body}
        	</div>
		"""

	getChat: () =>
		location = @options.location.slice(1)
		$.ajax
			url: "http://localhost:8001/chat/#{location}/"
			dataType: 'json'
			success: (chat) =>
				@addQuestion(chat)
				if chat.messages
					@addMessage(message) for message in chat.messages

	initialRender: =>
		@content = ""
		input = """
            <div class="input">
                <form action="#">
                    <div class="avatar"></div>
                    <input type="text" class="question" placeholder="" autofocus>
                    <input type="submit" value="submit">                
                </form>
            </div>
		"""	
		$('.header').addClass('back')
		@content += input
		$('.canvas').html(@content)

	onmessage: (message) =>
		answer = @createAnswer({message: message.data})
		$('.input').before(answer)

	submit: (e) =>
		e.preventDefault()
		q = @input.val()
		@input.val('')
		@options.socket.sock.send(q)

class CH.Socket

	constructor: ->
		@sock = new SockJS("http://localhost:8001/ws/echo");
		@attachHandlers()

	attachHandlers: =>
		@sock.onopen = @onopen
		@sock.onmessage = @onmessage
		@sock.onclose = @onclose

	onopen: =>
		console.log('socket onopen')

	onmessage: (message) =>
		console.log('socket onmessage')
		console.log(message.data)

	onclose: () =>
		console.log('socket onclose')

$ ->
	new CH.App()