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

escape = (s) -> 
	(''+s).replace(/&/g, '&').replace(/</g, '<')
    .replace(/>/g, '>').replace(/"/g, '"')
    .replace(/'/g, "'").replace(/\//g,'/')

class CH.App

	constructor: (@options) ->
		@colors = ['AliceBlue','AntiqueWhite','Aqua','Aquamarine','Azure','Beige','Bisque','Black','BlanchedAlmond','Blue','BlueViolet','Brown','BurlyWood','CadetBlue','Chartreuse','Chocolate','Coral','CornflowerBlue','Cornsilk','Crimson','Cyan','DarkBlue','DarkCyan','DarkGoldenRod','DarkGray','DarkGreen','DarkKhaki','DarkMagenta','DarkOliveGreen','DarkOrange','DarkOrchid','DarkRed','DarkSalmon','DarkSeaGreen','DarkSlateBlue','DarkSlateGray','DarkTurquoise','DarkViolet','DeepPink','DeepSkyBlue','DimGray','DodgerBlue','FireBrick','FloralWhite','ForestGreen','Fuchsia','Gainsboro','GhostWhite','Gold','GoldenRod','Gray','Green','GreenYellow','HoneyDew','HotPink','IndianRed','Indigo','Ivory','Khaki','Lavender','LavenderBlush','LawnGreen','LemonChiffon','LightBlue','LightCoral','LightCyan','LightGoldenRodYellow','LightGray','LightGreen','LightPink','LightSalmon','LightSeaGreen','LightSkyBlue','LightSlateGray','LightSteelBlue','LightYellow','Lime','LimeGreen','Linen','Magenta','Maroon','MediumAquaMarine','MediumBlue','MediumOrchid','MediumPurple','MediumSeaGreen','MediumSlateBlue','MediumSpringGreen','MediumTurquoise','MediumVioletRed','MidnightBlue','MintCream','MistyRose','Moccasin','NavajoWhite','Navy','OldLace','Olive','OliveDrab','Orange','OrangeRed','Orchid','PaleGoldenRod','PaleGreen','PaleTurquoise','PaleVioletRed','PapayaWhip','PeachPuff','Peru','Pink','Plum','PowderBlue','Purple','RebeccaPurple','Red','RosyBrown','RoyalBlue','SaddleBrown','Salmon','SandyBrown','SeaGreen','SeaShell','Sienna','Silver','SkyBlue','SlateBlue','SlateGray','Snow','SpringGreen','SteelBlue','Tan','Teal','Thistle','Tomato','Turquoise','Violet','Wheat','White','WhiteSmoke','Yellow','YellowGreen']
		@setRandomAvatars()
		@runRouter()


	setRandomAvatars: ->
		colors = @colors
		$('.avatar').each ->
			if not $(this).hasClass('logo')
				color = colors[Math.floor(Math.random() * colors.length)]
				$(this).css({'background-color':color})			

	runRouter: ->
		location = document.location.hash
		$('.canvas').html('')
		if location is ""
			new CH.Questions(window.questions)
		else
			new CH.Chat(window.chat)


class CH.Questions

	constructor: (questions) ->
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

	appendQuestions: (obj) ->
		@content += @createQuestion(obj)		

	createQuestion: (question) ->
		"""
            <a href="#foo" class="blob">
                <div class="avatar"></div>
                #{escape question.question}
            </a>            
		"""

class CH.Chat

	constructor: (chat) ->
		@content = ""
		input = """
            <div class="input">
                <form action="#">
                    <div class="avatar"></div>
                    <input type="text" class="question" placeholder="ask your question..." autofocus>
                    <input type="submit" value="submit">                
                </form>
            </div>
		"""
		@content += @createQuestion(chat.question)
		@appendAnswers x for x in chat.answers
		@content += input
		$('.canvas').html(@content)

	createQuestion: (question) ->
		"""
            <a href="#foo" class="blob">
                <div class="avatar"></div>
                #{escape question.question}
            </a>            
		"""

	appendAnswers: (obj) ->
		@content += @createAnswer(obj)

	createAnswer: (obj) ->
		"""
        	<div class="message">
        		<div class="avatar"></div>
        		#{obj.message}
        	</div>
		"""


$ ->
	new CH.App()

	$('.home .input form').submit (e) ->
		e.preventDefault()
		q = $(this).find('input.question').val()
		$(this).find('input.podium').val("")
		$('.input').after(
			'<a href="/chat/" class="'+
			'blob"><div class="avatar"></div>' +
			q + '</a>'
		)

	$('.chat .input form').submit (e) ->
		e.preventDefault()
		q = $(this).find('input.podium').val()
		$(this).find('input.podium').val("")
		$('.input').before(
			'<div class="'+
			'message"><div class="avatar"></div>' +
			q + '</div>'
		)

