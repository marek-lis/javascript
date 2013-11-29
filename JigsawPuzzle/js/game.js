/**
*
* JIGSAW PUZZLE, JS
* 27.11.2013, Wroclaw
* Marek Lis 
* www.LinkedIn.com/in/mareklis
* www.GoldenLine.pl/marek-lis
*
**/

$(document).ready(function(){
	var items = {},
	holders = {}, 
	src = "img/background.jpg",
	cols = 3,
	rows = 3,
	zIndex = 1,
	itemsNum = 0,
	itemWidth = 100,
	itemHeight = 100,
	correctItems = 0,
	timeStarted = 0,
	timeStopped = 0,
	timeBest = -1,
	queue = $(".queue"),
	board = $(".board"),
	start = $(".start"),
	dialog = $("#dialog"),
	info = $("#info"),
	target = board;
		
	$(window).resize(onWindowResizeHandler);
	
	start.button();
	dialog.dialog({closeOnEscape: true});
	dialog.dialog("close");
	dialog.dialog("option", "modal", true);
	dialog.dialog("option", "width", 400);
	
	start.fadeOut(0);
	
	setTimeout(function() {
		loadSettings();
		initHolders(board);
		initItems(board);
		moveItems(board, 0, "sort");
		fadeItems(board, 1000, "fadeIn", function() {
			showDialog("Welcome to Jigsaw Puzzle :)");
			start.fadeIn(500);
			start.click(onStartClickedHandler);
		});
	}, 500);
	
	function initHolders(target) {
		var row, col, id, holder, ix, iy,
		sx = target.position().left - 1,
		sy = target.position().top - 1;
		for (row=0; row<rows; row++) {
			for (col=0; col<cols; col++) {
				id = "holder_" + col + "_" + row;
				target.append("<div id="+id+" class='item'></div>");
				holder = $("#"+id);
				holder.fadeOut(0);
				holder.css('background', 'rgba(0, 0, 0, 0.0)');
				holder.css('zIndex', zIndex++);
				holder.droppable({drop: onItemDroppedHandler});
				ix = col * itemWidth;
				iy = row * itemHeight;
				holder.animate({left: sx + ix, top: sy + iy}, 0);
				holders[id] = {obj: holder, ref: board, posX: ix, posY: iy};
			}
		}
	}
	
	function initItems(target) {
		var row, col, id, item, ix, iy;
		for (row=0; row<rows; row++) {
			for (col=0; col<cols; col++) {
				//if (col < cols - 1 || row < rows - 1) {
					id = "item_" + col + "_" + row;
					target.append("<div id="+id+" class='item'></div>");
					item = $("#"+id);
					item.fadeOut(0);
					item.css('background-image', 'url(' + src + ')');
					item.css('background-position', '-' + (col * itemWidth) + 'px -' + (row * itemHeight) + 'px');
					item.css('border-color', '#2391B4');
					item.css('zIndex', zIndex++);
					item.draggable({start: onItemDragStartHandler});
					item.draggable("option", "revertDuration", 100 );
					item.mousedown(function(){onItemMouseDownHandler($(this));});
					item.draggable('disable');
					items[id] = {obj: item, ref: board, posX: 0, posY: 0};
					itemsNum++;
				//}
			}
		}
	}
	
	function isLocalStorageAvailable() {
		return typeof(Storage) !== "undefined" && localStorage;
	}
	
	function saveSettings() {
		if (isLocalStorageAvailable()) {
			var settings = {minTime: timeBest};
			localStorage.setItem('JigsawPuzzleSettings', JSON.stringify(settings));
		}
	}
	
	function loadSettings() {
		if (isLocalStorageAvailable()) {
			var settings, data;
			data = localStorage.getItem('JigsawPuzzleSettings');
			if (data) {
				settings = JSON.parse(data);
			}
			settings ? timeBest = parseInt(settings.minTime, 10) : -1;
		}
	}
	
	function enable() {
		var row, col, id, draggable, droppable;
		for (row=0; row<rows; row++) {
			for (col=0; col<cols; col++) {
				id = col + "_" + row;
				droppable = $("#holder_"+id);
				if (droppable.attr('id')) {
					droppable.droppable('enable');
				}
				draggable = $("#item_"+id);
				if (draggable.attr('id')) {
					//draggable.css('zIndex', getRandomZ(draggable, z, z + 10));
					draggable.css('border-color','#BC3E2B');
					draggable.draggable({ revert: false });
					draggable.draggable('enable');
				}
			}
		}
	}
	
	function restart() {
		var row, col, id, draggable, z = 10;//getTopZ();
		correctItems = 0;
		timeStarted = 0;
		timeStopped = 0;
		for (row=0; row<rows; row++) {
			for (col=0; col<cols; col++) {
				id = col + "_" + row;
				draggable = $("#item_"+id);
				if (draggable.attr('id')) {
					draggable.css('zIndex', getRandomZ(draggable, z, z + 10));
				}
			}
		}
	}
	
	function fadeItems(target, duration, mode, onComplete) {
		var id,
		row = 0, col = 0, 
		ix = 0, 
		iy = 0,
		sx = target.position().left - 1,
		sy = target.position().top - 1,
		sw = target.width(),
		sh = target.height();
		if (!duration) duration = 500;
		if (!mode) mode = "fadeIn";
		for (row=0; row<rows; row++) {
			for (col=0; col<cols; col++) {
				id = col + "_" + row;
				switch(mode) {
				case "fadeOut":
					$("#item_"+id).fadeOut(duration);
					$("#holder_"+id).fadeOut(duration);
					break;
				case "fadeIn":
					$("#item_"+id).fadeIn(duration);
					$("#holder_"+id).fadeIn(duration);
					break;
				}
			}
		}
		if (onComplete) setTimeout(onComplete, duration);
	}
	
	function moveItems(target, duration, mode) {
		var id,
		row = 0, col = 0, 
		ix = 0, 
		iy = 0,
		sx = target.position().left - 1,
		sy = target.position().top - 1,
		sw = target.width(),
		sh = target.height();
		if (!duration) duration = 500;
		if (!mode) mode = "spread";
		for (row=0; row<rows; row++) {
			for (col=0; col<cols; col++) {
				id = "item_" + col + "_" + row;
				switch(mode) {
				case "spread":
					ix = Math.random() * (sw - itemWidth);
					iy = Math.random() * (sh - itemHeight);
					break;
				case "scope":
					ix = (sw - itemWidth) >> 1;
					iy = (sh - itemHeight) >> 1;
					break;
				case "sort":
					ix = col * itemWidth;
					iy = row * itemHeight;
					break;
				}
				if (items[id]) {
					items[id].posX = ix;
					items[id].posY = iy;
					items[id].ref = mode == "spread" ? queue : board;
					$("#"+id).animate({left: sx + ix, top: sy + iy}, duration);
				}
			}
		}
		this.target = target;
	}
	
	function validate() {
		if (correctItems == itemsNum) {
			timeStopped = new Date().getTime();
			var timeElapsed = Math.round(10 * (timeStopped - timeStarted) / 1000) / 10;
			timeBest = Math.min(timeElapsed, timeBest > 0 ? timeBest : timeElapsed);
			setTimeout(function() {
				saveSettings();
				start.fadeIn(500);
				showDialog("Congratulations!<br/>You solved the puzzle in " + timeElapsed + " seconds.<br/>The current best time is " + timeBest + " seconds.<br/>Can you beat it?");
			}, 300);
		}
	}
	
	function showDialog(message) {
		info.html(message);
		dialog.css('zIndex', getTopZ($('body')));
		dialog.dialog("open");
		dialog.dialog("moveToTop");
	}
	
	function getTopZ(target) {
		var id,
		row = 0, col = 0, 
		curZ = 0, maxZ = 0;
		for (row=0; row<rows; row++) {
			for (col=0; col<cols; col++) {
				id = "item_" + col + "_" + row;
				curZ = parseInt($("#"+id).css('zIndex'), 10);
				if (curZ > maxZ){
					maxZ = curZ;
				}
			}
		}
		return maxZ + 1;
	}
	
	function getRandomZ(target, from, to) {
		if (!from) from = 100;
		if (!to) to = from + 100;
		return from + Math.round(Math.random() * (to - from));
	}
	
	function getItemPos(item) {
		var result;
		if (item && item.attr('id')) {
			var parts = item.attr('id').split("_");
			result = {col: parts[1], row: parts[2]};
		}
		return result;
	}
	
	function isEqualPosition(item1, item2) {
		var pos1 = getItemPos(item1);
		var pos2 = getItemPos(item2);
		return pos1.col == pos2.col && pos1.row == pos2.row;
	}
	
	function onStartClickedHandler() {
		restart();
		setTimeout(enable, 1000);
		start.fadeOut(300);
		moveItems(queue, 1000, "spread");
		timeStarted = new Date().getTime();
	}
	
	function onItemMouseDownHandler(item) {
		item.css('zIndex', getTopZ(item));
	}
	
	function onItemDragStartHandler(event, ui) {
		var draggable = ui.helper;
		draggable.css('zIndex', getTopZ(draggable));
		draggable.draggable({ revert: true });
	}
	
	function onItemDroppedHandler(event, ui) {
		var draggable = ui.draggable;
		var droppable = $(this);
		var item = items[draggable.attr('id')];
		if (isEqualPosition(draggable, droppable)) {
			draggable.css('border-color','#2391B4');
			draggable.draggable({ revert: false });
			draggable.draggable('disable');
			droppable.droppable('disable');
			var 
			pos = getItemPos(draggable),
			sx = board.position().left - 1,
			sy = board.position().top - 1;
			item.ref = board;
			item.posX = pos.col * itemWidth;
			item.posY = pos.row * itemHeight;
			draggable.animate({left: sx + item.posX, top: sy + item.posY}, 100);
			correctItems++;
			validate();
		} else {
			draggable.draggable({ revert: true });
		}
	}
	
	function onWindowResizeHandler() {
		dialog.dialog("option", "position", "center");
		var id,
		boardX = board.position().left - 1,
		boardY = board.position().top - 1,
		queueX = target.position().left - 1,
		queueY = target.position().top - 1;
		for (id in items) {
			$("#"+id).animate({left: items[id].ref.position().left - 1 + items[id].posX, top: items[id].ref.position().top - 1 + items[id].posY}, 100);
		}
		for (id in holders) {
			$("#"+id).animate({left: board.position().left - 1 + holders[id].posX, top: board.position().top - 1 + holders[id].posY}, 100);
		}
	}
	
});