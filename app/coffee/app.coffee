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
		@runRouter()
		@setRandomAvatars()
		window.socket = new CH.Socket
		window.onpopstate = history.onpushstate = @runRouter
		
	setRandomAvatars: ->
		colors = @colors
		$('.avatar').each (index, el) =>
			if not $(el).hasClass('logo')
				color = CH.Tools.generateColor()
				$(el).css({'background-color':color})			

	runRouter: ->
		location = document.location.hash
		$('.canvas').html('')
		$('.header').removeClass('back')
		if location is ""
			new CH.Questions(window.questions)
		else
			new CH.Chat(window.chat)

class CH.Questions

	constructor: (questions) ->
		@initialRender()
		# $('form').submit(@submit)
		@input = $('input[type=text]')
		@input.focus()

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
		@appendQuestions x for x in questions
		$('.canvas').html(@content)		

	appendQuestions: (obj) =>
		@content += @createQuestion(obj)		

	createQuestion: (question) =>
		"""
            <a href="#foo" class="blob">
                <div class="avatar"></div>
                #{CH.Tools.escape question.question}
            </a>            
		"""

	submit: (e) =>
		e.preventDefault()
		q = @input.val()
		@input.val('')
		$('.input').after(@createQuestion({question: q}))

class CH.Chat

	constructor: (chat) ->
		@initialRender()
		$('form').submit(@submit)
		@input = $('input[type=text]')
		@input.focus()

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
		@content += @createQuestion(chat.question)
		@appendAnswers x for x in chat.answers
		@content += input
		$('.canvas').html(@content)

	appendAnswers: (obj) =>
		@content += @createAnswer(obj)

	createQuestion: (question) =>
		"""
            <a href="#foo" class="blob">
                <div class="avatar"></div>
                #{CH.Tools.escape question.question}
            </a>            
		"""

	createAnswer: (obj) =>
		"""
        	<div class="message">
        		<div class="avatar"></div>
        		#{obj.message}
        	</div>
		"""

	submit: (e) =>
		e.preventDefault()
		q = @input.val()
		@input.val('')
		$('.input').before(@createAnswer({message: q}))

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


