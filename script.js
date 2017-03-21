
var baseUrl = "http://ccs-sp4.azurewebsites.net";

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.lineWidth = 5;

// text boxes
var xVelText = document.getElementById("myXVelocity");
var yVelText = document.getElementById("myYVelocity");
var chatAreaText = document.getElementById("chat-area");
var userNameBox = document.getElementById("user-name");
var inputBox = document.getElementById("text-input");

// position variables
var x = 200; //600;
var y = 200; //400;

// velocity variables
var xvel = 0;
var yvel = 0;

// to limit http requests
var i = 0;

// color
var color = "Black";

// chat
var chat = "";

// multiplier
var mult = 0.5;
var frame_rate = 25;//500;

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

// updates x and y positions
function updatePos() {
    x = x + xvel * mult;
    y = y + yvel * mult;
}

// corrects x and y values if they cross the borders
function maintainBounds() {
    if (x <= 5) {
        x = 5;
        xvel = 0;
    }
    if (x >= c.width - 5) {
        x = c.width - 5;
        xvel = 0;
    }
    if (y <= 5) {
        y = 5;
        yvel = 0;
    }
    if (y >= c.height - 5) {
        y = c.height - 5;
        yvel = 0;
    }
}

// updates the chat html
function updateChat(message) {
    chatAreaText.innerHTML = message;
    chatAreaText.scrollTop = chatAreaText.scrollHeight;
}

// gets the server values of xv and yv and updates them
function getParams() {
    var col = "";

    httpGetAsync(baseUrl+"/api/velocity/", function callback(response) {
        obj = JSON.parse(response);
        xvel = parseInt(obj.XVelocity);
        yvel = parseInt(obj.YVelocity);
        col = obj.Color;
        checkColor(col);
        chat = obj.Chat;
        updateChat(chat);
    });
}

function draw() {
    // position cursor
    ctx.moveTo(x, y);

    // updates velocity based on database
    //getParams();

    // update x, y values
    updatePos();

    // maintain borders
    maintainBounds();

    // update x and y vel text
    //updateVelText();

    // draw line
    ctx.lineTo(x, y);
    ctx.stroke();

    // refresh the frame
    setTimeout(draw, frame_rate);
}

function moveLeft() {
    //httpGetAsync(baseUrl+"/api/velocity/decrementx", function callback(response) { });
    xvel--;
}

function moveRight() {
    //httpGetAsync(baseUrl+"/api/velocity/incrementx", function callback(response) { });
    xvel++;
}

function moveUp() {
    //httpGetAsync(baseUrl+"/api/velocity/decrementy", function callback(response) { });
    yvel--;
}

function moveDown() {
    //httpGetAsync(baseUrl+"/api/velocity/incrementy", function callback(response) { });
    yvel++;
}

function changeColor(col) {
    // update color locally
    ctx.beginPath();
    ctx.strokeStyle = col;
    color = col;
}

function checkColor(col) {
    var command = col.toLowerCase();

    if (command === color.toLowerCase()) {
        return;
    }

    if (command === "red") {
        changeColor("Red");
    } else if (command === "blue") {
        changeColor("Blue");
    } else if (command === "black") {
        changeColor("Black");
    } else if (command === "green") {
        changeColor("Green");
    } else if (command === "yellow") {
        changeColor("Gold");
    }
}

// should only be called when the client does something
// invokes update db color which would only be called one time per color change
function runCommand(s) {
    var command = s.toLowerCase();

    if (command === color.toLowerCase()) {
        return;
    }

    // only change if we need to
    if (command === "left") {
        moveLeft();
    } else if (command === "right") {
        moveRight();
    } else if (command === "up") {
        moveUp();
    } else if (command === "down") {
        moveDown();
    } else if (command === "red") {
        changeColor("Red");
    } else if (command === "blue") {
        changeColor("Blue");
    } else if (command === "black") {
        changeColor("Black");
    } else if (command === "green") {
        changeColor("Green");
    } else if (command === "yellow") {
        changeColor("Gold");
    }
}

function sendChat(message) {
    // sends the chat
    httpGetAsync(baseUrl + "/api/chat/set?message="+message, function callback(response) { });
}

function appendChat(message)
{
    chatAreaText.innerHTML = chatAreaText.innerHTML + message;
    chatAreaText.scrollTop = chatAreaText.scrollHeight;
}

// invoked on an enter press
// updates the text area, clears the input box
// and runs the command
function submitText() {
    // update the text area
    var userName = userNameBox.value;
    var command = inputBox.value;
    var msg = "";

    if (userName !== "")
    {
        msg = userName + ": " + command;
    }
    else
    {
        msg = "Anonymous: " + command;
    }

    msg = msg + "\n";
    
    appendChat(msg);
    //sendChat(msg);

    // clear the input box
    inputBox.value = "";

    // run the command
    runCommand(command);
}

// handles key presses
// to be replaced with server calls
document.onkeydown = function (e) {
    switch (e.keyCode) {
        case 13: // enter
            submitText();
            break;
    }
};

// initial call to kick off the loop
draw();