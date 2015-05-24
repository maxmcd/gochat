var app = {};

// app.values = {
// 	apiEndpoint: "http://localhost:80801"
// }
app.api = {
    addQuestion: function() {

    },
    getQuestions: function() {

    },
    getQuestion: function(hash) {

    }
};

app.tools = {
    createUser: function() {

    },
    _generateColor: function() {

    },
    _generateIndentifier: function() {

    }
};

app.socket = {
    sock: null,
    init: function() {
        this.sock = new SockJS("http://localhost:8001/ws" + '/echo');
        this.sock.onopen = this.onopen;
        this.sock.onmessage = this.onmessage;
        this.sock.onclose = this.onclose;
    },
    onopen: function() {
        // console.log('connection open');
        document.getElementById("status").innerHTML = "connected";
        document.getElementById("send").disabled = false;
    },
    onmessage: function(e) {
        document.getElementById("output").value += e.data + "\n";
    },
    onclose: function() {
        // console.log('connection closed');
        document.getElementById("status").innerHTML = "disconnected";
        document.getElementById("send").disabled = true;
    },
};

app.socket.init()