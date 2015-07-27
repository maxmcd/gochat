window.CH = {}

class CH.App

	constructor: (@options) ->
		@colors = ['AliceBlue','AntiqueWhite','Aqua','Aquamarine','Azure','Beige','Bisque','Black','BlanchedAlmond','Blue','BlueViolet','Brown','BurlyWood','CadetBlue','Chartreuse','Chocolate','Coral','CornflowerBlue','Cornsilk','Crimson','Cyan','DarkBlue','DarkCyan','DarkGoldenRod','DarkGray','DarkGreen','DarkKhaki','DarkMagenta','DarkOliveGreen','DarkOrange','DarkOrchid','DarkRed','DarkSalmon','DarkSeaGreen','DarkSlateBlue','DarkSlateGray','DarkTurquoise','DarkViolet','DeepPink','DeepSkyBlue','DimGray','DodgerBlue','FireBrick','FloralWhite','ForestGreen','Fuchsia','Gainsboro','GhostWhite','Gold','GoldenRod','Gray','Green','GreenYellow','HoneyDew','HotPink','IndianRed','Indigo','Ivory','Khaki','Lavender','LavenderBlush','LawnGreen','LemonChiffon','LightBlue','LightCoral','LightCyan','LightGoldenRodYellow','LightGray','LightGreen','LightPink','LightSalmon','LightSeaGreen','LightSkyBlue','LightSlateGray','LightSteelBlue','LightYellow','Lime','LimeGreen','Linen','Magenta','Maroon','MediumAquaMarine','MediumBlue','MediumOrchid','MediumPurple','MediumSeaGreen','MediumSlateBlue','MediumSpringGreen','MediumTurquoise','MediumVioletRed','MidnightBlue','MintCream','MistyRose','Moccasin','NavajoWhite','Navy','OldLace','Olive','OliveDrab','Orange','OrangeRed','Orchid','PaleGoldenRod','PaleGreen','PaleTurquoise','PaleVioletRed','PapayaWhip','PeachPuff','Peru','Pink','Plum','PowderBlue','Purple','RebeccaPurple','Red','RosyBrown','RoyalBlue','SaddleBrown','Salmon','SandyBrown','SeaGreen','SeaShell','Sienna','Silver','SkyBlue','SlateBlue','SlateGray','Snow','SpringGreen','SteelBlue','Tan','Teal','Thistle','Tomato','Turquoise','Violet','Wheat','White','WhiteSmoke','Yellow','YellowGreen']
		@setRandomAvatars()

	setRandomAvatars: ->
		$('.avatar').each ->
			if not $(this).hasClass('logo')
				color = colors[Math.floor(Math.random() * colors.length)]
				$(this).css({'background-color':color})			

class CH.Questions

	constructor: (@options) ->

class CH.Chat

	constructor: (@options) ->


$ ->
	new CH.App

	$('.home .input form').submit(e) ->
		e.preventDefault()
		q = $(this).find('input.question').val()
		$(this).find('input.podium').val("")
		$('.input').after(
			'<a href="/chat/" class="'+
			'blob"><div class="avatar"></div>' +
			q + '</a>'
		)

	$('.chat .input form').submit(e) ->
		e.preventDefault()
		q = $(this).find('input.podium').val()
		$(this).find('input.podium').val("")
		$('.input').before(
			'<div class="'+
			'message"><div class="avatar"></div>' +
			q + '</div>'
		)

