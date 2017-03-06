$(document).ready(function()
{
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var width = $("#canvas").width();
	var height = $("#canvas").height();
	var cell = 15;
	var speed = 100;

	var player1;
	var player2;
	var player1direction;
	var player2direction;
	var player1score;
	var player2score;
	/*var player1food;
	var player2food;*/
	var player1color;
	var player2color;
	var foodcolor1;
	var foodcolor2;
	var playfieldcolor = "black";
	//var item1;
	var player1dc = false;
	var player2dc = false;
	var winner;
	var playernumber;
	var dif;

	var firstItem;
	var item1active;
	var item2active;
	var noItemActive;
	var fastModeCounter;
	var itemTimer;

	function init()
	{

		if(sessionStorage.getItem('playfieldcolor') == "green")
		{
			playfieldcolor = "#003300";
		}
		else
		{
			playfieldcolor = sessionStorage.getItem('playfieldcolor');
		}
		player1color = sessionStorage.getItem('player1color');
		if(player1color == "red")foodcolor1 = "#ff6666";
		else if(player1color == "blue")foodcolor1 = "#80b3ff";
		else if(player1color == "white")foodcolor1 = "#d9d9d9";
		player2color = sessionStorage.getItem('player2color');
		if(player2color == "red")foodcolor2 = "#ff6666";
		else if(player2color == "blue")foodcolor2 = "#80b3ff";
		else if(player2color == "white")foodcolor2 = "#d9d9d9";
		player1direction = "up";
		player2direction = "up";
		player1score = 0;
		player2score = 0;
		create_player();
		create_food(3);

		speed = 100;
		firstItem = false;
		item1active = false;
		item2active = false;
		noItemActive = true;
		fastModeCounter = 0;
		itemTimer = 0;

		gameloopUpdate();
	}
	init();

	function gameloopUpdate()
	{
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, speed);
	}

	function create_player()
	{
		var length = 5;
		player1 = [];
		player2 = [];
		for(var i = 0; i<=4; i++)
		{
			player1.push({x: 7, y: i+30});
		}
		for(var i = 0; i<=4; i++)
		{
			player2.push({x: 53, y: i+30});
		}
	}

	function create_food(playernumber)
	{
		if(playernumber == 1)
		{
			player1food =
			{
				x: Math.round(Math.random()*(width-cell)/cell), 
				y: Math.round(Math.random()*(height-cell)/cell),
			};
			if(player1food.x == player2food.x && player1food.y == player2food.y)
			{
				create_food(1);
			}
		}
		else if(playernumber == 2)
		{
			player2food =
			{
				x: Math.round(Math.random()*(width-cell)/cell), 
				y: Math.round(Math.random()*(height-cell)/cell),
			};
			if(player1food.x == player2food.x && player1food.y == player2food.y)
			{
				create_food(2);
			}
		}
		else
		{
			player1food =
			{
				x: Math.round(Math.random()*(width-cell)/cell), 
				y: Math.round(Math.random()*(height-cell)/cell),
			};
			player2food =
			{
				x: Math.round(Math.random()*(width-cell)/cell), 
				y: Math.round(Math.random()*(height-cell)/cell),
			};
			if(player1food.x == player2food.x && player1food.y == player2food.y)
			{
				create_food(playernumber);
			}
		}
	}

	function createItem()
	{
		var itemNumber = Math.floor((Math.random() * 2) + 5);

		if(itemNumber == 5)
		{
			item1 =
			{
				x: Math.round(Math.random()*(width-cell)/cell), 
				y: Math.round(Math.random()*(height-cell)/cell),
			};
			if(item1.x == player1food.x && item1.y == player1food.y || item1.x == player2food.x && item1.y == player2food.y)
			{
				createItem();
			}
			item1active = true;
		}
		else if(itemNumber == 6)
		{
			item2 =
			{
				x: Math.round(Math.random()*(width-cell)/cell), 
				y: Math.round(Math.random()*(height-cell)/cell),
			};
			if(item2.x == player1food.x && item2.y == player1food.y || item2.x == player2food.x && item2.y == player2food.y)
			{
				createItem();
			}
			item2active = true;
		}
	}

	function paint()
	{
		drawContext();
		player1dc = false;
		player2dc = false;

		var p1NewX = player1[0].x;
		var p1NewY = player1[0].y;
		var p2NewX = player2[0].x;
		var p2NewY = player2[0].y;

		if(item1active == false && item2active == false)
		{
			noItemActive = true;
		}
		else
		{
			noItemActive = false;
			itemTimer++;
			if(itemTimer >= 100)
			{
				item1active = false;
				item2active = false;
				itemTimer = 0;
			}
		}

		if(firstItem == false && player1score >= 5 || firstItem == false && player2score >= 5)
		{
			firstItem = true;
			createItem();
		}
		else
		{
			var itemChance = Math.floor((Math.random() * 100) + 1);
			if(noItemActive && firstItem && fastModeCounter == 0 && itemChance == 100)
			{
				createItem();
			}
		}

		if(speed != 100)
		{
			fastModeCounter++;
			if(fastModeCounter >= 75)
			{
				speed = 100;
				gameloopUpdate();
				fastModeCounter = 0;
			}
		}

		if(player1direction == "up") p1NewY--;
		else if(player1direction == "right") p1NewX++;
		else if(player1direction == "left") p1NewX--;
		else if(player1direction == "down") p1NewY++;

		if(player2direction == "up") p2NewY--;
		else if(player2direction == "right") p2NewX++;
		else if(player2direction == "left") p2NewX--;
		else if(player2direction == "down") p2NewY++;

		if(p1NewX == -1 || p1NewX == 60 || p1NewY == -1 || p1NewY == 40 || check_collision(p1NewX, p1NewY, player1) || enemy_collision(p1NewX, p1NewY, player2))
		{
			winner = "Player 2";
			console.log(winner + " won this round!");
			init();
			return;
		}
		/*if(p2NewX == -1 || p2NewX == 60 || p2NewY == -1 || p2NewY == 40 || check_collision(p2NewX, p2NewY, player2) || enemy_collision(p2NewX, p2NewY, player1))
		{
			winner = "Player 1";
			console.log(winner + " won this round!");
			init();
			return;
		}*/
		if(p1NewX == p2NewX && p1NewY == p2NewY)
		{
			if(player1score > player2score)
			{
				winner = "Player 1";
				console.log(winner + " won this round!");
				init();
				return;
			}
			else if(player2score > player1score)
			{
				winner = "Player 2";
				console.log(winner + " won this round!");
				init();
				return;
			}
			else
			{
				if(player1.lenght > player2.lenght)
				{
					winner = "Player 1";
					console.log(winner + " won this round!");
					init();
					return;
				}
				else if(player2.lenght > player1.lenght)
				{
					winner = "Player 2";
					console.log(winner + " won this round!");
					init();
					return;
				}
				else
				{
					console.log("Gleiche Punkte und Länge. Unentschieden!");
					init();
					return;
				}
			}
		}

		if(p1NewX == player1food.x && p1NewY == player1food.y)
		{
			var player1tail = {x: p1NewX, y: p1NewY};
			player1score++;
			create_food(1);
		}
		else
		{
			var player1tail = player1.pop();
			player1tail.x = p1NewX;
			player1tail.y = p1NewY;
		}
		if(item1active == true && p1NewX == item1.x && p1NewY == item1.y)
		{
			player1score += 5;
			item1active = false;
			itemTimer = 0;
		}
		if(item2active == true && p1NewX == item2.x && p1NewY == item2.y)
		{
			speed /= 2;
			gameloopUpdate();
			item2active = false;
			itemTimer = 0;
		}

		if(p2NewX == player2food.x && p2NewY == player2food.y)
		{
			var player2tail = {x: p2NewX, y: p2NewY};
			player2score++;
			create_food(2);
		}
		else
		{
			var player2tail = player2.pop();
			player2tail.x = p2NewX;
			player2tail.y = p2NewY;
		}
		if(item1active == true && p2NewX == item1.x && p2NewY == item1.y)
		{
			player2score += 5;
			item1active = false;
			itemTimer = 0;
		}
		if(item2active == true && p2NewX == item2.x && p2NewY == item2.y)
		{
			speed /= 2;
			gameloopUpdate();
			item2active = false;
			itemTimer = 0;
		}

		player1.unshift(player1tail);
		player2.unshift(player2tail);

		for(var i = 0; i < player1.length; i++)
		{
			//c noch ändern!!
			var c = player1[i];
			paint_cell(c.x, c.y, 1);
		}
		for(var i = 0; i < player2.length; i++)
		{
			var c = player2[i];
			paint_cell(c.x, c.y, 2);
		}

		paint_cell(player1food.x, player1food.y, 3);
		paint_cell(player2food.x, player2food.y, 4);
		if(item1active == true)
		{
			paint_cell(item1.x, item1.y, 5);
		}
		if(item2active == true)
		{
			paint_cell(item2.x, item2.y, 6);
		}

		//Score Display noch ändern!!
		var score_text = "Score: " + player1score;
		ctx.fillStyle = "white";
		ctx.fillText(score_text, 5, height-5);
		var score_text2 = "Score: " + player2score;
		ctx.fillStyle = "white";
		ctx.fillText(score_text2, width-50, height-5);
	}

	function drawContext()
	{
		ctx.fillStyle = playfieldcolor;
		ctx.fillRect(0, 0, width, height);
		ctx.strokeStyle = "white";
		ctx.strokeRect(0, 0, width, height);
	}

	function paint_cell(x, y, dif)
	{
		if(dif == 1) //Player 1
		{
			ctx.fillStyle = player1color;
			ctx.fillRect(x*cell, y*cell, cell, cell);
			ctx.strokeStyle = "black";
			ctx.strokeRect(x*cell, y*cell, cell, cell);
		}
		else if(dif == 3) //Food 1
		{
			ctx.fillStyle = foodcolor1;
			ctx.fillRect(x*cell, y*cell, cell, cell);
			ctx.strokeStyle = "black";
			ctx.strokeRect(x*cell, y*cell, cell, cell);
		}
		else if(dif == 2) //Player 2
		{
			ctx.fillStyle = player2color;
			ctx.fillRect(x*cell, y*cell, cell, cell);
			ctx.strokeStyle = "black";
			ctx.strokeRect(x*cell, y*cell, cell, cell);
		}
		else if(dif == 4) //Food 2
		{
			ctx.fillStyle = foodcolor2;
			ctx.fillRect(x*cell, y*cell, cell, cell);
			ctx.strokeStyle = "black";
			ctx.strokeRect(x*cell, y*cell, cell, cell);
		}
		else if(dif == 5) //Item 1
		{
			ctx.beginPath();
			ctx.arc(x*cell+cell/2, y*cell+cell/2, cell/2, 0, 2*Math.PI);
			ctx.fillStyle = "white";
			ctx.fill();
			ctx.stroke();
		}
		else if(dif == 6) //Item 2
		{
			ctx.beginPath();
			ctx.arc(x*cell+cell/2, y*cell+cell/2, cell/2, 0, 2*Math.PI);
			ctx.fillStyle = "#ffc080";
			ctx.fill();
			ctx.stroke();
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

	function enemy_collision(x, y, array)
	{
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			return true;
		}
		return false;
	}

	$(document).keydown(function(e)
	{
		var key = e.which;
		if(key == "38" && player1direction != "down" && player1dc == false)
		{
			player1direction = "up";
			player1dc = true;
		}	
		else if(key == "37" && player1direction != "right" && player1dc == false) 
		{
			player1direction = "left";
			player1dc = true;
		}
		else if(key == "39" && player1direction != "left" && player1dc == false)
		{
			player1direction = "right";
			player1dc = true;
		} 
		else if(key == "40" && player1direction != "up" && player1dc == false) 
		{
			player1direction = "down";
			player1dc = true;
		}
		else if(key == "87" && player2direction != "down" && player2dc == false) 
		{
			player2direction = "up";
			player2dc = true;
		}
		else if(key == "65" && player2direction != "right" && player2dc == false) 
		{
			player2direction = "left";
			player2dc = true;
		}
		else if(key == "68" && player2direction != "left" && player2dc == false) 
		{
			player2direction = "right";
			player2dc = true;
		}
		else if(key == "83" && player2direction != "up" && player2dc == false) 
		{
			player2direction = "down";
			player2dc = true;
		}
	})
})