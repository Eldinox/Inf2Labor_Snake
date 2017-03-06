$(document).ready(function()
{
	//Spielfeld
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var width = 900;
	var height = 600;
	var cell = 15;
	var speed = 100;

	//Spielervariablen
	var player1;
	var player2;
	var player1color;
	var player2color;
	var player1score = 0;
	var player2score = 0;
	var player1direction = "up";
	var player2direction = "up";
	var playfieldcolor = "black";
	var player1dc = false;
	var player2dc = false;
	var player1transparent = false;
	var player2transparent = false;
	var foodcolor1;
	var foodcolor2;
	
	//Parameter und Menüs
	var winner;
	var playernumber;
	var dif;
	var endCase;
	var pause = false;
	var gameover = false;
	var winnermodal;
	var pausemodal;

	//Items
	var itemX;
	var itemY;
	var itemNumber;
	var firstItem = false;
	var item1active = false;
	var item2active = false;
	var item3active = false;
	var item4active = false;
	var noItemActive = true;
	var itemTimer = 0;
	var fastModeCounter = 0;
	var	transparentCounter = 0;

	//Initialisierung bei Spielbeginn
	function setup() 
	{
		winnermodal = document.getElementById("winnerScreen");
		pausemodal = document.getElementById("pauseScreen");

		//Ausgewählte Farben werden initialisiert
		player1color = sessionStorage.getItem('player1color');
		player2color = sessionStorage.getItem('player2color');
		if(sessionStorage.getItem('playfieldcolor') == "green") playfieldcolor = "#003300";
		else if(sessionStorage.getItem('playfieldcolor') == "brown")playfieldcolor = "#1a0e00";
		else playfieldcolor = sessionStorage.getItem('playfieldcolor');

		//Farbe des Essens wird angepasst
		if(player1color == "red")foodcolor1 = "#ff6666";
		else if(player1color == "blue")foodcolor1 = "#80b3ff";
		else if(player1color == "white")foodcolor1 = "#d9d9d9";
		if(player2color == "red")foodcolor2 = "#ff6666";
		else if(player2color == "blue")foodcolor2 = "#80b3ff";
		else if(player2color == "white")foodcolor2 = "#d9d9d9";
		
		//Funktionen werden aufgerufen
		create_player();
		create_food(3);

		//Gameloop
		gameloopUpdate();
	}

	setup();
	
	//Gameloop, der in einem bestimmten Intervall die Updatefunktion aufruft
	function gameloopUpdate() 
	{
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		if(pause == false)game_loop = setInterval(update, speed);
	}

	//Erstellen der Spieler
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

	//Erstellen des Essens je nach Parameter
	//Liegt dort schon etwas ruft sich die Funktion selbst erneut auf
	function create_food(playernumber)
	{
		var foodX = Math.round(Math.random()*(width-cell)/cell);
		var foodY = Math.round(Math.random()*(height-cell)/cell);

		if(playernumber == 1) //Essen für Spieler 1
		{
			player1food = {x: foodX, y: foodY,};
			if((player1food.x == player2food.x && player1food.y == player2food.y) || (player1food.x == itemX && player1food.y == itemY))
			{
				create_food(1);
			}
		}
		else if(playernumber == 2) //Essen für Spieler 2
		{
			player2food = {x: foodX, y: foodY,};
			if((player1food.x == player2food.x && player1food.y == player2food.y) || (player2food.x == itemX && player2food.y == itemY))
			{
				create_food(2);
			}
		}
		else //Essen für beide Spieler bei Spielbeginn
		{
			player1food = {x: foodX, y: foodY,};
			player2food =
			{
				x: Math.round(Math.random()*(width-cell)/cell),
				y: Math.round(Math.random()*(height-cell)/cell),
			};
			if((player1food.x == player2food.x && player1food.y == player2food.y) || 
				(player1food.x == itemX && player1food.y == itemY) || 
				(player2food.x == itemX && player2food.y == itemY))
				{
					create_food(playernumber);
				}
		}
	}

	//Erstellt die Items
	function createItem()
	{
		itemX = Math.round(Math.random()*(width-cell)/cell);
		itemY = Math.round(Math.random()*(height-cell)/cell);
		itemNumber = Math.floor((Math.random() * 4) + 1);

		if(itemNumber == 1) //Bonuspunkte Item
		{
			item1 = {x: itemX, y: itemY,};
			if((item1.x == player1food.x && item1.y == player1food.y) || (item1.x == player2food.x && item1.y == player2food.y))
			{
				createItem();
			}
			item1active = true;
		}
		else if(itemNumber == 2) //Fastmode Item
		{
			item2 = {x: itemX, y: itemY,};
			if((item2.x == player1food.x && item2.y == player1food.y) || (item2.x == player2food.x && item2.y == player2food.y))
			{
				createItem();
			}
			item2active = true;
		}
		else if(itemNumber == 3) //Transparenz Item
		{
			item3 = {x: itemX, y: itemY,};
			if((item3.x == player1food.x && item3.y == player1food.y) || (item3.x == player2food.x && item3.y == player2food.y))
			{
				createItem();
			}
			item3active = true;
		}
		else if(itemNumber == 4) //Diät Item
		{
			item4 = {x: itemX, y: itemY,};
			if((item4.x == player1food.x && item4.y == player1food.y) || (item4.x == player2food.x && item4.y == player2food.y))
			{
				createItem();
			}
			item4active = true;
		}
	}

	function update()
	{
		drawContext();
		player1dc = false;
		player2dc = false;

		//Neue Position der Köpfe der Spieler
		var p1NewX = player1[0].x;
		var p1NewY = player1[0].y;
		var p2NewX = player2[0].x;
		var p2NewY = player2[0].y;

		if(item1active == false && item2active == false && item3active == false && item4active == false)
		{
			noItemActive = true;
		}
		else
		{
			//Wenn ein Item auf dem Feld liegt bleibt es dort für 100 Frames
			noItemActive = false;
			itemTimer++;
			if(itemTimer >= 100)
			{
				item1active = false;
				item2active = false;
				item3active = false;
				item4active = false;
				itemTimer = 0;
			}
		}

		//Erstes Item erscheint wenn ein Spieler 50 Punkte erreicht
		if(firstItem == false && (player1score >= 50 || player2score >= 50))
		{
			firstItem = true;
			createItem();
		}
		else
		{
			//Danach erscheinen Items, wenn kein anderes auf dem Feld oder noch aktiv ist und random = 100 ist 
			var itemChance = Math.floor((Math.random() * 100) + 1);
			if(noItemActive && firstItem && fastModeCounter == 0 && transparentCounter == 0 && itemChance == 100)
			{
				createItem();
			}
		}

		//Timer für Fastmode(75 Frames) und Transparent(150 Frames) Items
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
		else if(player1transparent || player2transparent)
		{
			transparentCounter++;
			if(transparentCounter >= 150)
			{
				player1transparent = false;
				player2transparent = false;
				transparentCounter = 0;
			}
		}

		//Berechnung der neuen Koordinaten
		if(player1direction == "up") p1NewY--;
		else if(player1direction == "right") p1NewX++;
		else if(player1direction == "left") p1NewX--;
		else if(player1direction == "down") p1NewY++;

		if(player2direction == "up") p2NewY--;
		else if(player2direction == "right") p2NewX++;
		else if(player2direction == "left") p2NewX--;
		else if(player2direction == "down") p2NewY++;

		//Spieler stirbt (Spielfeldrand oder Spieler)
		if((outOfPlayfield(p1NewX, p1NewY) && outOfPlayfield(p2NewX, p2NewY) == false) || 
		(player1transparent == false && check_collision(p1NewX, p1NewY, player1)) || 
		(player1transparent == false && check_collision(p1NewX, p1NewY, player2)))
		{
			gameEnd(1);
		}
		if((outOfPlayfield(p2NewX, p2NewY) && outOfPlayfield(p1NewX, p1NewY) == false) || 
		(player2transparent == false && check_collision(p2NewX, p2NewY, player2)) || 
		(player2transparent == false && check_collision(p2NewX, p2NewY, player1)))
		{
			gameEnd(2);
		}

		//Beide Spieler sterben am Spielfeldrand
		if(outOfPlayfield(p1NewX, p1NewY) && outOfPlayfield(p2NewX, p2NewY))
		{
			//Spieler mit mehr Punkten gewinnt
			if(player1score > player2score)gameEnd(3);
			else if(player2score > player1score)gameEnd(4);
			else
			{
				//Spieler der mehr Punkte durch Essen erhalten hat gewinnt(Länge)
				if(player1.length > player2.length)gameEnd(5);
				else if(player2.length > player1.length)gameEnd(6);
				//Unentschieden
				else gameEnd(7);
			}
		}

		//Beide Spieler stoßen mit einem Körper zusammen
		if((check_collision(p1NewX, p1NewY, player1) && check_collision(p2NewX, p2NewY, player2))
			|| (check_collision(p1NewX, p1NewY, player1) && check_collision(p2NewX, p2NewY, player1))
			|| (check_collision(p1NewX, p1NewY, player2) && check_collision(p2NewX, p2NewY, player2))
			|| (check_collision(p1NewX, p1NewY, player2) && check_collision(p2NewX, p2NewY, player1)))
		{
			//Transparenter Spieler gewinnt
			if(player2transparent)gameEnd(1);
			else if(player1transparent)gameEnd(2);
			else if(player1score > player2score)gameEnd(3);
			else if(player2score > player1score)gameEnd(4);
			else
			{
				if(player1.length > player2.length)gameEnd(5);
				else if(player2.length > player1.length)gameEnd(6);
				else gameEnd(7);
			}
		}

		//Beide Spieler stoßen mit den Köpfen gegeneinander
		if(p1NewX == p2NewX && p1NewY == p2NewY)
		{
			if(player2transparent)gameEnd(1);
			else if(player1transparent)gameEnd(2);
			else if(player1score > player2score)gameEnd(3);
			else if(player2score > player1score)gameEnd(4);
			else
			{
				if(player1.length > player2.length)gameEnd(5);
				else if(player2.length > player1.length)gameEnd(6);
				else gameEnd(7);
			}
		}

		//Spieler 1 nimmt Essen auf
		if(p1NewX == player1food.x && p1NewY == player1food.y)
		{
			var player1tail = {x: p1NewX, y: p1NewY};
			player1score += 10;
			create_food(1);
			foodCollectedSound();
		}
		else
		{
			var player1tail = player1.pop();
			player1tail.x = p1NewX;
			player1tail.y = p1NewY;
		}
		//Spieler 1 nimmt Item auf
		if(item1active == true && p1NewX == item1.x && p1NewY == item1.y)
		{
			player1score += 30;
			item1active = false;
			itemTimer = 0;
			itemCollectedSound();
		}
		else if(item2active == true && p1NewX == item2.x && p1NewY == item2.y)
		{
			player1score += 5;
			speed /= 2;
			gameloopUpdate();
			item2active = false;
			itemTimer = 0;
			itemCollectedSound();
		}
		else if(item3active == true && p1NewX == item3.x && p1NewY == item3.y)
		{
			player1score += 5;
			player1transparent = true;
			item3active = false;
			itemTimer = 0;
			itemCollectedSound();
		}
		else if(item4active == true && p1NewX == item4.x && p1NewY == item4.y)
		{
			player1score += 5;
			if(player1.length > 30) player1.length -= 10;
			else if(player1.length > 10) player1.length -= 5;
			else if(player1.length > 5)player1.length -= 2;
			item4active = false;
			itemTimer = 0;
			itemCollectedSound();
		}

		//Spieler 2 nimmt Essen auf
		if(p2NewX == player2food.x && p2NewY == player2food.y)
		{
			var player2tail = {x: p2NewX, y: p2NewY};
			player2score += 10;
			create_food(2);
			foodCollectedSound();
		}
		else
		{
			var player2tail = player2.pop();
			player2tail.x = p2NewX;
			player2tail.y = p2NewY;
		}
		//Spieler 2 nimmt Item auf
		if(item1active == true && p2NewX == item1.x && p2NewY == item1.y)
		{
			player2score += 30;
			item1active = false;
			itemTimer = 0;
			itemCollectedSound();
		}
		else if(item2active == true && p2NewX == item2.x && p2NewY == item2.y)
		{
			player2score += 5;
			speed /= 2;
			gameloopUpdate();
			item2active = false;
			itemTimer = 0;
			itemCollectedSound();
		}
		else if(item3active == true && p2NewX == item3.x && p2NewY == item3.y)
		{
			player2score += 5;
			player2transparent = true;
			item3active = false;
			itemTimer = 0;
			itemCollectedSound();
		}
		else if(item4active == true && p2NewX == item4.x && p2NewY == item4.y)
		{
			player2score += 5;
			if(player2.length > 30) player2.length -= 10;
			else if(player2.length > 10) player2.length -= 5;
			else if(player2.length > 5)player2.length -= 2;
			item4active = false;
			itemTimer = 0;
			itemCollectedSound();
		}

		//.pop entfernt das letzte Teil der Schlange und .unshift fügt es vorne wieder hinzu
		player1.unshift(player1tail);
		player2.unshift(player2tail);

		//Zeichnen der gesamten Schlange
		for(var i = 0; i < player1.length; i++)
		{
			var cellToDraw = player1[i];
			draw(cellToDraw.x, cellToDraw.y, 1);
		}
		for(var i = 0; i < player2.length; i++)
		{
			var cellToDraw = player2[i];
			draw(cellToDraw.x, cellToDraw.y, 2);
		}

		//Zeichnen des Essens
		draw(player1food.x, player1food.y, 3);
		draw(player2food.x, player2food.y, 4);

		//Zeichnen des Items
		if(item1active == true)draw(item1.x, item1.y, 5);
		else if(item2active == true)draw(item2.x, item2.y, 6);
		else if(item3active == true)draw(item3.x, item3.y, 7);
		else if(item4active == true)draw(item4.x, item4.y, 8);

		//Zeichnen des Score Textes
		var score_text = "Score: " + player1score;
		var score_text2 = "Score: " + player2score;
		ctx.font = "12px Verdana";
		ctx.fillStyle = "white";
		ctx.fillText(score_text, 8, height + 15);
		ctx.fillText(score_text2, width-80, height + 15);
	}

	//Zeichnen des Spielfeldes
	function drawContext()
	{
		ctx.fillStyle = playfieldcolor;
		ctx.fillRect(0, 0, width, height + 20);
		ctx.strokeStyle = "white";
		ctx.strokeRect(0, 0, width, height);
	}

	function draw(x, y, dif)
	{
		if(dif == 1) //Player 1
		{
			if(player1transparent && player1color == "blue")ctx.fillStyle = "rgba(77, 77, 255, 0.4)";
			else if(player1transparent && player1color == "red")ctx.fillStyle = "rgba(255, 77, 77, 0.4)";
			else if(player1transparent && player1color == "white")ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
			else ctx.fillStyle = player1color;

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
			if(player2transparent && player2color == "blue")ctx.fillStyle = "rgba(77, 77, 255, 0.4)";
			else if(player2transparent && player2color == "red")ctx.fillStyle = "rgba(255, 77, 77, 0.4)";
			else if(player2transparent && player2color == "white")ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
			else ctx.fillStyle = player2color;

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
			ctx.fillStyle = "ff80aa";
			ctx.fill();
			ctx.stroke();
		}
		else if(dif == 6) //Item 2
		{
			ctx.beginPath();
			ctx.arc(x*cell+cell/2, y*cell+cell/2, cell/2, 0, 2*Math.PI);
			ctx.fillStyle = "#ffa64d";
			ctx.fill();
			ctx.stroke();
		}
		else if(dif == 7) //Item 3
		{
			ctx.beginPath();
			ctx.arc(x*cell+cell/2, y*cell+cell/2, cell/2, 0, 2*Math.PI);
			ctx.fillStyle = "#ffe6ff";//rgba(217, 217, 217, 0.3)";
			ctx.fill();
			ctx.stroke();
		}
		else if(dif == 8) //Item 4
		{
			ctx.beginPath();
			ctx.arc(x*cell+cell/2, y*cell+cell/2, cell/2, 0, 2*Math.PI);
			ctx.fillStyle = "#ccff99";
			ctx.fill();
			ctx.stroke();
		}
	}

	//Abfrage ob Spieler sich im Spielfeld befindet
	function outOfPlayfield(x, y)
	{
		if(x == -1 || x == 60 || y == -1 || y == 40)
		{
			return true;
		}
		return false;
	}

	//Abfrage ob Spieler mit einem Körper zusammenstößt
	function check_collision(x, y, array)
	{
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			return true;
		}
		return false;
	}

	//Setzt den richtigen Text für den Gewinner
	function gameEnd(endCase)
	{
		var displayText;
		switch(endCase)
		{
			case 1: displayText = "Player 1 died" + "<br>" + "Player 2 wins with : " + player2score + " points"; break;
			case 2: displayText = "Player 2 died" + "<br>" + "Player 1 wins with : " + player1score + " points"; break;
			case 3: displayText = "Both Players died." + "<br>" + "Player 1 wins with " + player1score + " to " + player2score + " points"; break;
			case 4: displayText = "Both Players died." + "<br>" + "Player 2 wins with " + player2score + " to " + player1score + " points"; break;
			case 5: displayText = "Both Players died and have the same amount of points." + "<br>" + "Player 1 wins with a lenght of " + player1.length; break;
			case 6: displayText = "Both Players died and have the same amount of points." + "<br>" + "Player 2 wins with a lenght of " + player2.length; break;
			case 7: displayText = "Both Players died and have the same amount of points and the same lenght." + "<br>" + "Dont really know what to do now so lets call it a draw."; break;
		}
		document.getElementById("winnerText").innerHTML = displayText;
		showWinner();
		pause = true;
		gameover = true;
		gameloopUpdate();
	}

	//Zeigt den Spielendeschirm
	function showWinner()
	{
		winnermodal.style.display = "block";
	}

	//Steuerung
	$(document).keydown(function(e)
	{
		var key = e.which;
		/*
			Ändert die Richtung, wenn sie nicht entgegengesetzt der aktuellen Richtung ist und
			der Spieler diesen Frame noch nicht die Richtung geändert hat.
		*/ 
		if(key == "87" && player1direction != "down" && player1dc == false)
		{
			player1direction = "up";
			player1dc = true;
		}	
		else if(key == "65" && player1direction != "right" && player1dc == false) 
		{
			player1direction = "left";
			player1dc = true;
		}
		else if(key == "68" && player1direction != "left" && player1dc == false)
		{
			player1direction = "right";
			player1dc = true;
		} 
		else if(key == "83" && player1direction != "up" && player1dc == false) 
		{
			player1direction = "down";
			player1dc = true;
		}
		else if(key == "38" && player2direction != "down" && player2dc == false)
		{
			player2direction = "up";
			player2dc = true;
		}
		else if(key == "37" && player2direction != "right" && player2dc == false)
		{
			player2direction = "left";
			player2dc = true;
		}
		else if(key == "39" && player2direction != "left" && player2dc == false)
		{
			player2direction = "right";
			player2dc = true;
		}
		else if(key == "40" && player2direction != "up" && player2dc == false)
		{
			player2direction = "down";
			player2dc = true;
		}
		else if(key == "27") 
		{
			if(pause == false)
			{
				pausemodal.style.display = "block";
				pause = true;
			}
			else if(pause == true && gameover == false)
			{
				pausemodal.style.display = "none";
				pause = false;	
			}
			gameloopUpdate();
		}
	})
})