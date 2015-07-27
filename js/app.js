var escape;

window.CH = {};

window.questions = [
  {
    "question": "Why is the sky blue?",
    "color": "AliceBlue"
  }, {
    "question": "How will I get down from here?",
    "color": "AntiqueWhite"
  }, {
    "question": "What is up with these grapes?",
    "color": "Aqua"
  }
];

window.chat = {
  "question": {
    "question": "Why is the sky blue?",
    "color": "AliceBlue"
  },
  "answers": [
    {
      "message": "Why is the sky blue?",
      "color": "AliceBlue"
    }, {
      "message": "How will I get down from here?",
      "color": "AntiqueWhite"
    }, {
      "message": "What is up with these grapes?",
      "color": "Aqua"
    }
  ]
};

escape = function(s) {
  return ('' + s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'").replace(/\//g, '/');
};

CH.App = (function() {
  function App(options) {
    this.options = options;
    this.colors = ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed', 'Indigo', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'];
    this.setRandomAvatars();
    this.runRouter();
  }

  App.prototype.setRandomAvatars = function() {
    var colors;
    colors = this.colors;
    return $('.avatar').each(function() {
      var color;
      if (!$(this).hasClass('logo')) {
        color = colors[Math.floor(Math.random() * colors.length)];
        return $(this).css({
          'background-color': color
        });
      }
    });
  };

  App.prototype.runRouter = function() {
    var location;
    location = document.location.hash;
    $('.canvas').html('');
    if (location === "") {
      return new CH.Questions(window.questions);
    } else {
      return new CH.Chat(window.chat);
    }
  };

  return App;

})();

CH.Questions = (function() {
  function Questions(questions) {
    var i, input, len, x;
    input = "<div class=\"input\">\n    <form action=\"#\">\n        <div class=\"avatar\"></div>\n        <input type=\"text\" class=\"question\" placeholder=\"ask your question...\" autofocus>\n        <input type=\"submit\" value=\"submit\">                \n    </form>\n</div>";
    this.content = input;
    for (i = 0, len = questions.length; i < len; i++) {
      x = questions[i];
      this.appendQuestions(x);
    }
    $('.canvas').html(this.content);
  }

  Questions.prototype.appendQuestions = function(obj) {
    return this.content += this.createQuestion(obj);
  };

  Questions.prototype.createQuestion = function(question) {
    return "<a href=\"#foo\" class=\"blob\">\n    <div class=\"avatar\"></div>\n    " + (escape(question.question)) + "\n</a>            ";
  };

  return Questions;

})();

CH.Chat = (function() {
  function Chat(chat) {
    var i, input, len, ref, x;
    this.content = "";
    input = "<div class=\"input\">\n    <form action=\"#\">\n        <div class=\"avatar\"></div>\n        <input type=\"text\" class=\"question\" placeholder=\"ask your question...\" autofocus>\n        <input type=\"submit\" value=\"submit\">                \n    </form>\n</div>";
    this.content += this.createQuestion(chat.question);
    ref = chat.answers;
    for (i = 0, len = ref.length; i < len; i++) {
      x = ref[i];
      this.appendAnswers(x);
    }
    this.content += input;
    $('.canvas').html(this.content);
  }

  Chat.prototype.createQuestion = function(question) {
    return "<a href=\"#foo\" class=\"blob\">\n    <div class=\"avatar\"></div>\n    " + (escape(question.question)) + "\n</a>            ";
  };

  Chat.prototype.appendAnswers = function(obj) {
    return this.content += this.createAnswer(obj);
  };

  Chat.prototype.createAnswer = function(obj) {
    return "<div class=\"message\">\n	<div class=\"avatar\"></div>\n	" + obj.message + "\n</div>";
  };

  return Chat;

})();

$(function() {
  new CH.App();
  $('.home .input form').submit(function(e) {
    var q;
    e.preventDefault();
    q = $(this).find('input.question').val();
    $(this).find('input.podium').val("");
    return $('.input').after('<a href="/chat/" class="' + 'blob"><div class="avatar"></div>' + q + '</a>');
  });
  return $('.chat .input form').submit(function(e) {
    var q;
    e.preventDefault();
    q = $(this).find('input.podium').val();
    $(this).find('input.podium').val("");
    return $('.input').before('<div class="' + 'message"><div class="avatar"></div>' + q + '</div>');
  });
});
