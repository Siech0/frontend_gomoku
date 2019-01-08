var Player = Object.freeze({invalid: 0x00, black:0x01, white:0x02}); //Player enum
var PieceType = Object.freeze({invalid: 0x00, black:0x01, white:0x02, victory: 0x04, victoryMask:0x04, playerMask: 0x03}); //Player enum
var VictoryType = Object.freeze({none: 0x00, horizontal:0x01, vertical: 0x02, diagonalTLBR: 0x04, diagonalTRBL: 0x08});
//Dont think about my design decisions too hard. None if it is great.

function Gomoku(canvas) {
	var ctx = canvas.getContext('2d');
	if(ctx === null){
		throw "Draw context not found";
	}
	//Game  state initialization
	var board = [];
	const boardSize = 15;
	for(var row = 0; row < boardSize; ++row) {
		board[row] = [];
		for(var column = 0; column < boardSize; ++column){
			board[row][column] = null;
		}
	}
	var currentPlayer = Player.white;
	var victor = null;
	var ghostLocation = {row: null, column:null}
	var onEnd = null;
	
	const cBlack = "#515151";
	const cWhite = "#FFFFFF";
	const cgBlack = "#333333";
	const cgWhite = "#F8F8F8";
	
	//game logic
	var checkVictory = function(row, column, player) {
		var hCount = 1;
		var vCount = 1;
		var dCount1 = 1;
		var dCount2 = 1;
		
		if(0 > row || row >= boardSize || 0 > column || column >= boardSize) {
			throw "checkVictory: [row:" + row + " ,column:" + column + "] is out of bounds.";
		}
		
		if(board[row][column] === null) { //Given bad input
			throw "checkVictory: move provided was on empty space.";
		}
		
		if(board[row][column] !== player) {
			throw "checkVictory: move provided was on incorrect player space."
		}
		
		for(var i = 1; i < 5; ++i) { //Left horizontal board positions
			if(column - i < 0 || board[row][column - i] !== player) {
				break;
			}
			hCount++;
		}
		for(var i = 1; i < 5; ++i) { //Right horizontal board positions
			if(column + i >= boardSize || board[row][column + i] !== player) {
				break;
			}
			hCount++;
		}
		if(hCount >= 5) return VictoryType.horizontal;
		
		for(var i = 1; i < 5; ++i) { //Top vertical board positions
			if(row - i < 0 || board[row - i][column] !== player) {
				break;
			}
			vCount ++;
		}
		for(var i = 1; i < 5; ++i) { //Bottom vertical board positions
			if(row + i >= boardSize || board[row + i][column] !== player) {
				break;
			}
			vCount++;
		}
		if(vCount >= 5) return VictoryType.vertical;
		
		for(var i  = 1; i < 5; ++i) { //TL diagonal board positions
			if(row - i < 0 || column + i < 0 || board[row - i][column - i] !== player) {
				break;
			}
			dCount1++;
		}
		for(var i = 1; i < 5; ++i){ //BR diagonal board positions
			if(row + i >= boardSize || column + i >= boardSize || board[row + i][column + i] !== player) {
				break;
			}
			dCount1++;
		}
		if(dCount1 >= 5) return VictoryType.diagonalTLBR;
		
		for(var i = 1; i < 5; ++i) {
			if(row - i < 0 || column + i >= boardSize || board[row - i][column + i] !== player) {
				break;
			}
			dCount2++;
		}
		for(var i = 1; i < 5; ++i) {
			if(row + i >= boardSize || column - i < 0 || board[row + i][column - i] !== player){
				break;
			}
			dCount2++;
		}
		if(dCount2 >= 5) return VictoryType.diagonalTRBL;
		return VictoryType.none;
	}
	
	var placePiece = function(row, column, player) {
		
		if(0 > row || row >= boardSize || 0 > column || column >= boardSize) { //range check
			throw "place: [row:" + row + " ,column:" + column + "] is out of bounds.";
		}
		
		if(board[row][column] !== null) //Space filled
			return false;
			
		board[row][column] = (player === Player.black ? PieceType.black : PieceType.white);
		return true;
	}
	
	var highlightPieces = function(row, column, vType){
		var player = (board[row][column] & PieceType.playerMask);
		board[row][column] |= PieceType.victory;
		if(vType === VictoryType.horizontal ) {
			for(var i = 1; i < 5; ++i) { //Left horizontal board positions
				if(column - i < 0 || board[row][column - i] !== player) {
					break;
					console.log("NO HERE");
				}
				board[row][column-i] |= PieceType.victory;
			}
			for(var i = 1; i < 5; ++i) { //Right horizontal board positions
				if(column + i >= boardSize || board[row][column + i] !== player) {
					break;
				}
				board[row][column-i] |= PieceType.victory;
			}
		} else if(vType === VictoryType.vertical) {
			for(var i = 1; i < 5; ++i) { //Top vertical board positions
				if(row - i < 0 || board[row - i][column] !== player) {
					break;
				}
				board[row-i][column] |= PieceType.victory;
			}
			for(var i = 1; i < 5; ++i) { //Bottom vertical board positions
				if(row + i >= boardSize || board[row + i][column] !== player) {
					break;
				}
				board[row+i][column] |= PieceType.victory;
			}
		}else if(vType === VictoryType.diagonalTLBR){
			for(var i  = 1; i < 5; ++i) { //TL diagonal board positions
				if(row - i < 0 || column + i < 0 || board[row - i][column - i] !== player) {
					break;
				}
				board[row-i][column-i] |= PieceType.victory;
			}
			for(var i = 1; i < 5; ++i){ //BR diagonal board positions
				if(row + i >= boardSize || column + i >= boardSize || board[row + i][column + i] !== player) {
					break;
				}
				board[row+i][column+i] |= PieceType.victory;
			}	
		} else if (vType === VictoryType.diagonalTRBL) {
			for(var i = 1; i < 5; ++i) {
				if(row - i < 0 || column + i >= boardSize || board[row - i][column + i] !== player) {
					break;
				}
				board[row-i][column+i] |= PieceType.victory;
			}
			for(var i = 1; i < 5; ++i) {
				if(row + i >= boardSize || column - i < 0 || board[row + i][column - i] !== player){
					break;
				}
				board[row+i][column - i] |= PieceType.victory;
			}				
		} else if (vType === VictoryType.none) {
			return;
		} else {
			throw "highlightPieces: Invalid victory type provided.";	
		}
	}
	
	//Draw initialization
	var ctxWidth = null;
	var ctxHeight = null;
	var margin = null;
	var padding = null;
	var outerLength = null;
	var innerLength = null;
	var cellLength = null;
	var olt = {x: null, y:null};
	var ilt = {x: null, y:null};
	var rad = null;
	
	
	
	var draw = function() {
		//ctx.rect(olt[0], olt[1], olt[0] + outerLength, olt[1] + outerLength);

		drawOuter();		
		drawGrid();
		drawPieces();
		drawGhost();
		drawText();
	}
	
	var drawOuter = function() {
		var x = olt.x;
		var y = olt.y;
		
		ctx.beginPath();
		ctx.rect(x, y, outerLength, outerLength);
		ctx.fillStyle = "#ddd194";
		ctx.fill();
	}
	
	var drawGrid = function() {
		var x = ilt.x;
		var y = ilt.y;
		ctx.beginPath();
		for(var i = 0; i < boardSize; ++i) {
			ctx.moveTo(x + cellLength*i, y);
			ctx.lineTo(x + cellLength*i, y + innerLength);
			ctx.moveTo(x, y + cellLength*i);
			ctx.lineTo(x + innerLength, y + cellLength*i);
		}
		ctx.stroke();
	}
	
	var drawPieces = function() {
		var x = ilt.x;
		var y = ilt.y;

		for(var row = 0; row < boardSize; ++row){
			for(var column = 0; column < boardSize; ++column) {
				if(board[row][column] !== null) {	
					ctx.beginPath();				
					ctx.moveTo(x + cellLength*column + rad, y + cellLength*row);
					ctx.arc(x + cellLength*column, y + cellLength*row, rad, 0, 2*Math.PI);
					ctx.fillStyle = ((board[row][column] & PieceType.playerMask) === PieceType.black ? cBlack : cWhite);
					ctx.fill();
					if((board[row][column] & PieceType.victoryMask) === PieceType.victory) {
						var prevStyle = ctx.strokeStyle;
						ctx.strokeStyle = "yellow";
						ctx.stroke();
						ctx.strokeStyle = prevStyle;
					}
					else {
						ctx.stroke();					
					}
				}
			}
		}

	}
	
	var drawGhost = function() {
		var row = ghostLocation.row;
		var column = ghostLocation.column;
		
		if(row === null || column === null || row < 0 || boardSize < row || column < 0 || boardSize < column)
			return; //Out of bounds or undefined.
		
		if(board[row][column] !== null)
			return; //Space filled
		
		var x = ilt.x;
		var y = ilt.y;
		
		ctx.beginPath();				
		ctx.moveTo(x + cellLength*column + rad, y + cellLength*row);
		ctx.arc(x + cellLength*column, y + cellLength*row, rad, 0, 2*Math.PI);
		ctx.fillStyle = (currentPlayer === Player.black ? cgBlack : cgWhite);
		ctx.fill();
		ctx.stroke();
	}
	
	var drawText = function() {
		ctx.clearRect(0, ctxHeight - margin/2 - 3, ctxWidth, ctxHeight); //Text likes to stick around without this.
		var str = null;
		if(victor === null) {
			str = "Current Player: " + (currentPlayer === Player.black ? "black" : "white");
		} else {
			str = "Victor: " + (victor === Player.black ? "black" : "white");
		}
		ctx.font = `${margin/2 - 6}px Arial`;
		ctx.textAlign = "center";
		ctx.fillStyle = "black";
		ctx.fillText(str, ctxWidth/2, ctxHeight - 3);
	}
	
	var eventToContextCoords = function(e){
		return [e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop];
	}
	
	var coordToGridJoint = function(x, y){ //Convert x, y to a grid point given that it is within the radius of a piece.
		var bx = x - olt.x;
		var by = y - olt.y;
		
		if(bx < 0 || outerLength < bx || by < 0 || outerLength < by){ //Out of board.
			return [null, null];
		}
		
		var intersect = function(px, py, gRow, gColumn) {
			var gx = ilt.x + cellLength * gColumn;
			var gy = ilt.y + cellLength * gRow;
			var a = px - gx;
			var b = py - gy;
			if(Math.sqrt(a*a + b*b) < rad) //distance within radius
				return true;
			else
				return false;
		}
		
		for(var row = 0; row < boardSize; ++row) { //Brute force, but I dont want to do math.
			for(var column = 0; column < boardSize; ++column) {
				if(intersect(x, y, row, column)){
					return [row, column]; //joint found
				}
			}
		}
		return [null, null] //between joints
	}
	
	var onResize = function() { 
		ctxWidth = ctx.canvas.clientWidth;
		ctxHeight = ctx.canvas.clientHeight;
		
		var minLen = Math.min(ctxWidth, ctxHeight);
		margin = minLen/10;
		outerLength = minLen - margin;
		cellLength = outerLength/(boardSize + 1); //14 "cells" and 2 areas for padding
		rad = cellLength/(2+0.1);
		innerLength = cellLength *(boardSize - 1) ;
		padding = cellLength;
		olt.x = (ctxWidth/2) - (outerLength/2);
		olt.y = (ctxHeight/2) - (outerLength / 2);
		ilt.x = (ctxWidth/2) - (innerLength/2);
		ilt.y = (ctxHeight/2) - (innerLength/2);
		draw();
	}
	
	var onMouseMove = function(e) {
		if(victor !== null) //Game is already won
			return;
		
		var [x, y] = eventToContextCoords(e);
		var [r, c] = coordToGridJoint(x, y);

		ghostLocation = {row: r, column: c};
		draw();
	}
	
	var onClick = function(e) {
		if(victor !== null) //Game is already won
			return;
		
		var [x, y] = eventToContextCoords(e);
		var [r, c] = coordToGridJoint(x, y);
		if(r === null || c === null)
			return; //Out of bounds
		if(placePiece(r, c, currentPlayer)){ //Can place piece
			var vType = checkVictory(r, c, currentPlayer);
			if(vType !== VictoryType.none){ //victory found
				victor = currentPlayer;
				highlightPieces(r, c, vType);
				draw();
				end();
				return;
			} else {
				currentPlayer = ( currentPlayer === Player.black ? Player.white : Player.black );
				draw();
			}
			
		}
	}
	

	var end = function() {
		window.removeEventListener("resize", onResize);
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("click", onClick);
		onEnd();
	}
	
	
	this.start = function(endFunc) {
		window.addEventListener("resize", onResize);
		canvas.addEventListener("mousemove", onMouseMove);
		canvas.addEventListener("click", onClick);
		onEnd = endFunc;
		onResize(); //Get initial draw variables set	
		draw();
	}
}

document.addEventListener("DOMContentLoaded", function() { //Script main
	canvas = document.getElementById("drawspace");
	if(canvas === null){
		console.log("Error: unable to find canvas element");
		return;
	}
	
	var resizeCanvas = function(){
		var nav = document.getElementById("navbar");
		var foot = document.getElementById("footer");
		var foot = document.getElementById("footer");
		if(nav === null || foot === null)
		{
			console.log("Error: unable to find navbar element");
			return;
		}
		//Apparently the standard way of getting viewport dimensions
		var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0); 
		var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		var nh = nav.offsetHeight;
		var fh = foot.offsetHeight;
		canvas.height = (h - nh - fh);
		canvas.width = (w);
	} //Create closure
	resizeCanvas(); //Initial size setting
	window.addEventListener("resize", resizeCanvas);
	
	var onEnd = function(){
		setTimeout(function(){
				new Gomoku(canvas).start(onEnd);
		}, 5000);
	}

	new Gomoku(canvas).start(onEnd); //Ghetto recursion.		
});