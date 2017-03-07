$(document).ready(function()
{
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var width = 900;
	var height = 600;
	var cell = 15;
	var speed = 100;

	var player;
	var color;
	var score;
	var direction;
	var playfieldcolor;
	var dc;
	var foodcolor;
	var highscore;

	var dif;
	var pause;
	var gameover;
	var newHighscore;
	var newFastmodeHighscore;
	var winnermodal;
	var pausemodal;


	function setup()
	{
		winnermodal = document.getElementById("winnerScreen");
		pausemodal = document.getElementById("pauseScreen");
		highscore = localStorage.getItem("highscore");
		fastmodeHighscore = localStorage.getItem("fastmodeHighscore");

		if(sessionStorage.getItem("fastmode") == 1)speed = 40;
		else speed = 100;

		color = sessionStorage.getItem("color");
		if(sessionStorage.getItem("playfieldcolor") == "green") playfieldcolor = "#003300";
		else if(sessionStorage.getItem("playfieldcolor") == "brown")playfieldcolor = "#1a0e00";
		else playfieldcolor = sessionStorage.getItem("playfieldcolor");

		if(color == "red")foodcolor = "#ff6666";
		else if(color == "blue")foodcolor = "#80b3ff";
		else if(color == "white")foodcolor = "#d9d9d9";

		create_player();
		create_food();
		reset();
		music();

		gameloopUpdate();
	}

	setup();

	function reset()
	{
		dc = false;
		direction = "up";
		score = 0;

		pause = false;
		gameover = false;
		newHighscore = false;
		newFastmodeHighscore = false;

		winnermodal.style.display = "none";
	}

	function gameloopUpdate()
	{
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		if(pause == false)game_loop = setInterval(update, speed);
		else game_loop = setInterval(checkForNewGame, speed);
	}

	function checkForNewGame()
	{
		if(newGame == true)
		{
			setup();
			newGame = false;
		}
	}

	function create_player()
	{
		var length = 5;
		player = [];
		for(var i = 0; i<=4; i++)
		{
			player.push({x: 7, y: i+30});
		}
	}

	function create_food()
	{
		food =
		{
			x: Math.round(Math.random()*(width-cell)/cell), 
			y: Math.round(Math.random()*(height-cell)/cell),
		};
	}

	function update()
	{
		drawContext();
		dc = false;

		var newX = player[0].x;
		var newY = player[0].y;

		if(direction == "up") newY--;
		else if(direction == "right") newX++;
		else if(direction == "left") newX--;
		else if(direction == "down") newY++;

		//Setzen eines neuen lokalen Rekordes
		if(speed == 100 && score > highscore)
		{
			highscore = score;
			localStorage.setItem("highscore", highscore);
			newHighscore = true;
		}
		if(speed == 40 && score > fastmodeHighscore)
		{
			fastmodeHighscore = score;
			localStorage.setItem("fastmodeHighscore", fastmodeHighscore);
			newFastmodeHighscore = true;
		}

		if(newX == -1 || newX == 60 || newY == -1 || newY == 40 || check_collision(newX, newY, player))
		{
			if(newHighscore || newFastmodeHighscore)
			{
				document.getElementById("winnerText").innerHTML = "You died" + "<br>" + "Final Score: " + score
				+ "<br>" + "NEW HIGHSCORE!";
			}
			else
			{
				document.getElementById("winnerText").innerHTML = "You died" + "<br>" + "Final Score: " + score;
			}
			showWinner();
			pause = true;
			gameloopUpdate();
		}

		if(newX == food.x && newY == food.y)
		{
			var tail = {x: newX, y: newY};
			score++;
			create_food();
			foodCollectedSound();
		}
		else
		{
			var tail = player.pop();
			tail.x = newX;
			tail.y = newY;
		}

		player.unshift(tail);

		for(var i = 0; i < player.length; i++)
		{
			var cellToDraw = player[i];
			draw(cellToDraw.x, cellToDraw.y, 1);
		}

		draw(food.x, food.y, 2);

		var score_text = "Score: " + score;
		if(speed == 100)var highscore_text = "Personal Highscore: " + highscore;
		else if(speed == 40)var highscore_text = "Personal Highscore: " + fastmodeHighscore;
		ctx.font = "12px Verdana";
		ctx.fillStyle = "white";
		ctx.fillText(score_text, 8, height + 15);
		ctx.fillText(highscore_text, width-170, height + 15);
	}

	function drawContext()
	{
		ctx.fillStyle = playfieldcolor;
		ctx.fillRect(0, 0, width, height + 20);
		ctx.strokeStyle = "white";
		ctx.strokeRect(0, 0, width, height);
	}

	function draw(x, y, dif)
	{
		if(dif == 1) //Player
		{
			ctx.fillStyle = color;
			ctx.fillRect(x*cell, y*cell, cell, cell);
			ctx.strokeStyle = "black";
			ctx.strokeRect(x*cell, y*cell, cell, cell);
		}
		else if(dif == 2) //Food
		{
			ctx.fillStyle = foodcolor;
			ctx.fillRect(x*cell, y*cell, cell, cell);
			ctx.strokeStyle = "black";
			ctx.strokeRect(x*cell, y*cell, cell, cell);
		}
	}

	function check_collision(x, y, array)
	{
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			return true;
		}
		return false;
	}

	function showWinner()
	{
		gameover = true;
		winnermodal.style.display = "block";
	}

	$(document).keydown(function(e)
	{
		var key = e.which;
		if(key == "38" && direction != "down" && dc == false)
		{
			direction = "up";
			dc = true;
		}	
		else if(key == "37" && direction != "right" && dc == false) 
		{
			direction = "left";
			dc = true;
		}
		else if(key == "39" && direction != "left" && dc == false)
		{
			direction = "right";
			dc = true;
		} 
		else if(key == "40" && direction != "up" && dc == false) 
		{
			direction = "down";
			dc = true;
		}
		else if(key == "27") 
		{
			if(pause == false)
			{
				pausemodal.style.display = "block";
				pause = true;
				musicPause();
			}
			else if(pause == true && gameover == false)
			{
				pausemodal.style.display = "none";
				pause = false;
				music();
			}
			gameloopUpdate();
		}
	})
})