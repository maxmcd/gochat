var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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

CH.Tools = (function() {
  function Tools() {}

  Tools.generateColor = function() {
    var color, colors;
    colors = ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed', 'Indigo', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'];
    color = colors[Math.floor(Math.random() * colors.length)];
    return color;
  };

  Tools.escape = function(s) {
    return ('' + s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'").replace(/\//g, '/');
  };

  return Tools;

})();

CH.App = (function() {
  function App(options) {
    this.options = options;
    this.runRouter();
    this.setRandomAvatars();
    window.onpopstate = history.onpushstate = this.runRouter;
  }

  App.prototype.setRandomAvatars = function() {
    var colors;
    colors = this.colors;
    return $('.avatar').each((function(_this) {
      return function(index, el) {
        var color;
        if (!$(el).hasClass('logo')) {
          color = CH.Tools.generateColor();
          return $(el).css({
            'background-color': color
          });
        }
      };
    })(this));
  };

  App.prototype.runRouter = function() {
    var location;
    location = document.location.hash;
    $('.canvas').html('');
    $('.header').removeClass('back');
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
    this.submit = bind(this.submit, this);
    this.createQuestion = bind(this.createQuestion, this);
    this.appendQuestions = bind(this.appendQuestions, this);
    this.initialRender = bind(this.initialRender, this);
    this.initialRender();
    $('form').submit(this.submit);
    this.input = $('input[type=text]');
    this.input.focus();
  }

  Questions.prototype.initialRender = function() {
    var i, input, len, x;
    input = "<div class=\"input\">\n    <form action=\"#\">\n        <div class=\"avatar\"></div>\n        <input type=\"text\" class=\"question\" placeholder=\"ask your question...\" autofocus>\n        <input type=\"submit\" value=\"submit\">             \n    </form>\n</div>";
    this.content = input;
    for (i = 0, len = questions.length; i < len; i++) {
      x = questions[i];
      this.appendQuestions(x);
    }
    return $('.canvas').html(this.content);
  };

  Questions.prototype.appendQuestions = function(obj) {
    return this.content += this.createQuestion(obj);
  };

  Questions.prototype.createQuestion = function(question) {
    return "<a href=\"#foo\" class=\"blob\">\n    <div class=\"avatar\"></div>\n    " + (CH.Tools.escape(question.question)) + "\n</a>            ";
  };

  Questions.prototype.submit = function(e) {
    var q;
    e.preventDefault();
    q = this.input.val();
    this.input.val('');
    return $('.input').after(this.createQuestion({
      question: q
    }));
  };

  return Questions;

})();

CH.Chat = (function() {
  function Chat(chat) {
    this.submit = bind(this.submit, this);
    this.createAnswer = bind(this.createAnswer, this);
    this.createQuestion = bind(this.createQuestion, this);
    this.appendAnswers = bind(this.appendAnswers, this);
    this.initialRender = bind(this.initialRender, this);
    this.initialRender();
    $('form').submit(this.submit);
    this.input = $('input[type=text]');
    this.input.focus();
  }

  Chat.prototype.initialRender = function() {
    var i, input, len, ref, x;
    this.content = "";
    input = "<div class=\"input\">\n    <form action=\"#\">\n        <div class=\"avatar\"></div>\n        <input type=\"text\" class=\"question\" placeholder=\"ask your question...\" autofocus>\n        <input type=\"submit\" value=\"submit\">                \n    </form>\n</div>";
    $('.header').addClass('back');
    this.content += this.createQuestion(chat.question);
    ref = chat.answers;
    for (i = 0, len = ref.length; i < len; i++) {
      x = ref[i];
      this.appendAnswers(x);
    }
    this.content += input;
    return $('.canvas').html(this.content);
  };

  Chat.prototype.appendAnswers = function(obj) {
    return this.content += this.createAnswer(obj);
  };

  Chat.prototype.createQuestion = function(question) {
    return "<a href=\"#foo\" class=\"blob\">\n    <div class=\"avatar\"></div>\n    " + (CH.Tools.escape(question.question)) + "\n</a>            ";
  };

  Chat.prototype.createAnswer = function(obj) {
    return "<div class=\"message\">\n	<div class=\"avatar\"></div>\n	" + obj.message + "\n</div>";
  };

  Chat.prototype.submit = function(e) {
    var q;
    e.preventDefault();
    q = this.input.val();
    this.input.val('');
    return $('.input').before(this.createAnswer({
      message: q
    }));
  };

  return Chat;

})();

$(function() {
  return new CH.App();
});
