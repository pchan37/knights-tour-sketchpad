var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var size_dropdown = document.getElementById("dropdown");
var clear_button = document.getElementById("clear");
var undo_button = document.getElementById("undo");

var flipH_button = document.getElementById("flipH");
var flipV_button = document.getElementById("flipV");
var rotateC_button = document.getElementById("rotateC");
var rotateCC_button = document.getElementById("rotateCC");

var amtPlaced = document.getElementById("amtCovered");
var amtNeeded = document.getElementById("amtNeeded");

var bgdColor0 = "#C47451";
var bgdColor1 = "#FFFFFF";

var size = 1;
var patchSize = 75;

var board = [[-1]];
var visited = [];
var possibleMoves = [];


var requestID;

var drawGreenBox = function(r, c){
    ctx.fillStyle = "#006400";
    ctx.fillRect(r * patchSize, c * patchSize, patchSize, patchSize);
};

var flash = function(){
    window.cancelAnimationFrame( requestID );

    var tick = 0;

    var drawFlash = function() {

        var rowOffsetList = [-2, -2, -1, -1, 1, 1, 2, 2];
        var colOffsetList = [-1, 1, -2, 2, -2, 2, -1, 1];
        var currentRow = visited[visited.length - 1][0];
        var currentCol = visited[visited.length - 1][1];
        possibleMoves = [];

        for(var i = 0; i < rowOffsetList.length; i++){
            var rowOffset = rowOffsetList[i];
            var colOffset = colOffsetList[i];
            var newRow = currentRow + rowOffset;
            var newCol = currentCol + colOffset;
            if (canPlaceHere(newRow, newCol)){
                possibleMoves.push([newRow, newCol]);
            }
        }

        for(var index = 0; index < possibleMoves.length; index++){
            var spot = possibleMoves[index];
            if (tick == 0){
                drawGreenBox(spot[0], spot[1]);
            }
            else if (tick == 30){
                drawBox(spot[0], spot[1]);
            }
        }

        tick = (tick + 1) % 60;
        requestID = window.requestAnimationFrame(drawFlash);
    };
    drawFlash();
};

var stop = function(){
    for(var index = 0; index < possibleMoves.length; index++){
        var spot = possibleMoves[index];
        drawBox(spot[0], spot[1]);
    }
    window.cancelAnimationFrame( requestID );
};

var animation = function(){
    if (amtPlaced.innerHTML >= 1 && amtNeeded.innerHTML >= 1){
        flash();
    }else{
        stop();
    }
};

var changeCanvasSize = function(e){
    size = parseInt(size_dropdown.options[size_dropdown.selectedIndex].value);

    canvas.setAttribute("height", size * patchSize);
    canvas.setAttribute("width", size * patchSize);

    clear();
    drawBackground();

    amtNeeded.innerHTML = size * size;
};

var drawBox = function(r, c){
    if (r % 2 != c % 2){
        ctx.fillStyle = bgdColor0;
    }
    else {
        ctx.fillStyle = bgdColor1;
    }
    ctx.fillRect(r * patchSize, c * patchSize, patchSize, patchSize);
};

var drawBackground = function(){
    ctx.clearRect(0, 0, patchSize * size, patchSize * size);
    for (var i = 0; i < size; i++){
        for (var j = 0; j < size; j++){
            drawBox(i, j);
        }
    }
};

var drawKnight = function(r, c){
    var knight = new Image(patchSize, patchSize);
    knight.setAttribute('crossOrigin', 'anonymous');
    knight.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chess_nlt45.svg/45px-Chess_nlt45.svg.png";
    knight.onload = function(){
        ctx.drawImage(knight, r * patchSize, c * patchSize, patchSize, patchSize);
        ctx.font = "20px Arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText(board[r][c], r * patchSize + patchSize / 2 + 12, c * patchSize + patchSize / 2 + 15);
    };
};

var canPlaceHere = function(r, c){
    if (visited.length == 0)
        return true;
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length)
        return false;
    if (board[r][c] != -1)
        return false;
    var lastMove = visited[visited.length - 1];
    var diffR = Math.abs(lastMove[0] - r);
    var diffC = Math.abs(lastMove[1] - c);
    if ( (diffR == 2 && diffC == 1) || (diffR == 1 && diffC == 2) )
        return true;
    return false;
};

var place = function(e){

    var xcor = e.offsetX;
    var ycor = e.offsetY;

    var r = Math.floor(xcor / patchSize);
    var c = Math.floor(ycor / patchSize);

    if (! canPlaceHere(r, c))
        return;
    drawKnight(r, c);
    visited.push([r, c]);
    board[r][c] = visited.length;
    amtCovered.innerHTML = visited.length;

    stop();

    animation();

};

var undo = function(){
    if (visited.length == 0)
        return;

    stop();

    var lastIndex = visited.length - 1;
    var lastOne = visited[lastIndex];
    var r = lastOne[0];
    var c = lastOne[1];

    ctx.clearRect(r * patchSize, c * patchSize, patchSize, patchSize);
    drawBox(r, c);

    visited.splice(visited.length - 1, 1);

    board[r][c] = -1;

    amtCovered.innerHTML = visited.length;

    flash();
};

var clear = function(){
    visited = [];
    amtCovered.innerHTML = 0;
    board = [];
    for (var i = 0; i < size; i++){
        var row = [];
        for (var j = 0; j < size; j++){
            row.push(-1);
        }
        board.push(row);
    }
    drawBackground();
};


var drawAllKnights = function(){
    for (var index = 0; index < visited.length; index++) {
        var knight = visited[index];
        drawKnight(knight[0], knight[1]);
    }
};

//only run when board has been flipped/rotated
var updateBgdColors = function(){
    if (size % 2 == 0){ //no change for odd N boards (rotational and reflective symmetry)
        var temp = bgdColor1;
        bgdColor1 = bgdColor0;
        bgdColor0 = temp;
    }
};

var flipCoords = function(coord) {
    var doneList = [];

    for (var index = 0; index < visited.length; index++) {
	if (doneList.indexOf(index) != -1){
	    continue;
        }
	var knight = visited[index];
	var knightXcor = knight[0];
	var knightYcor = knight[1];
	if (coord == 0){
            var temp = board[size - 1 - knightXcor][knightYcor];
	    board[size - 1 - knightXcor][knightYcor] = board[knightXcor][knightYcor];
            board[knightXcor][knightYcor] = temp;
            visited[index][0] = size - 1 - knightXcor;
	    if (temp != -1){
		visited[temp - 1][0] = knightXcor;
		doneList.push(temp - 1);
	    }
	}else{
	    var temp = board[knightYcor][size - 1 - knightXcor];
            board[knightXcor][size - 1 - knightYcor] = board[knightXcor][knightYcor];
            board[knightXcor][knightYcor] = temp;
            visited[index][1] = size - 1 - knightYcor;
	    if (temp != -1){
		visited[temp - 1][1] = knightYcor;
		doneList.push(temp - 1);
	    }
	    }
    }
};

var flipH = function(){
    flipCoords(0);
    updateBgdColors();
    drawBackground();
    drawAllKnights();
};

var flipV = function(){
    flipCoords(1);
    updateBgdColors();
    drawBackground();
    drawAllKnights();
};

var rotateCoords = function(dir){
    for (var index = 0; index < visited.length; index++) {
        var knight = visited[index];
        var otherCoord = (dir + 1) % 2;
        var knightXcor = knight[0];
        var knightYcor = knight[1];
        if (otherCoord == 0){
            board[dir][size - 1 - knightXcor] = board[knightXcor][knightYcor];
            board[knightXcor][knightYcor] = -1;
            visited[index][0] = size - 1 - knightXcor;
        }
        //var temp = knight[otherCoord];
        //knight[otherCoord] = knight[dir];
        //knight[dir] = size - 1 - temp;
    }
};

var rotateC = function(){
    rotateCoords(0);
    updateBgdColors();
    drawBackground();
    drawAllKnights();
};

var rotateCC = function(){
    rotateCoords(1);
    updateBgdColors();
    drawBackground();
    drawAllKnights();
};

size_dropdown.addEventListener("click", changeCanvasSize);
canvas.addEventListener("click", place);
clear_button.addEventListener("click", clear);
undo_button.addEventListener("click", undo);

flipH_button.addEventListener("click", flipH);
flipV_button.addEventListener("click", flipV);
rotateC_button.addEventListener("click", rotateC);
rotateCC_button.addEventListener("click", rotateCC);
