/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/16/2014
 * @name        main
 */
(function($P){
	'use strict';

	var viewpoint = null;
	var navInterection = null;
	var interection = null;
	var showLinks = true;
	var globalBubble = null;
	var index = 200; 
	$(document).ready(function () {
		$P.state = new $P.Context();

		var canvas = $('#bgCanvas')[0];
		var overlayCanvas = $('#overlayCanvas')[0];
		var navCanvas = $('#navCanvas')[0];
		window.addEventListener( 'keydown', function(event){
			if(event.keyCode === 70)
			{
				//screenfull.request();
			}
		}, false );
		// trigger the onchange() to set the initial values
		screenfull.onchange();
		//    THREEx.FullScreen.bindKey({ charCode: 'f'.charCodeAt(0) });
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		navCanvas.height = 50;
		navCanvas.width = window.innerWidth;

		$P.state.scene = new $P.Scene();
		$P.state.scrollX = 0;

		$P.state.mainCanvas = new $P.MainCanvas({element: canvas, scene: $P.state.scene});
		$P.state.overlayCanvas = new $P.OverlayCanvas({element: overlayCanvas, scene: $P.state.scene});
		$P.state.navCanvas = new $P.NavCanvas({element: navCanvas, scene: $P.state.scene});
		$P.state.markDirty = function() {
			this.mainCanvas.needsRedraw = true;
			this.overlayCanvas.needsRedraw = true;
			this.navCanvas.needsRedraw = true;};
		function render() {
			console.log("Main render");
			//$P.requestAnimationFrame(render);
			$P.state.mainCanvas.draw();
			$P.state.overlayCanvas.draw();
			$P.state.navCanvas.draw();
		}

		
		var bubble, state, objects, qbubble;
		var result, event;
		var bwidth = canvas.width-40;
		var bheight =  1100; // canvas.height- 80;//1100;
						event = {
							name: 'addGraph',
							x: mousePosX, y: mousePosY,
							strokeStyle: self.parent.strokeStyle,
							reload: false,
							question: 200
						};

						result = $P.state.scene.sendEvent(event);
						bubble = new $P.Bubble.RandForce({x: 10, y: 15, w: bwidth, h: bheight, generate1: false, qID: 200});
						globalBubble = bubble;
						$P.state.scene.add(bubble);
						result = bubble.receiveEvent(event);
		render();
/*
		$P.state.scene.add(new $P.TreeRing({
			x: 50, y: 50, w: 840, h: 700,
			dataName: 'human'}));
*/
		var mousePosX, mousePosY;

		$('#bgCanvas').on('contextmenu', function (e) {
			mousePosX = e.clientX;
			mousePosY = e.clientY;
		});
		function setContextMenu() {
			var timestamp = Date.now();
			var bwidth = canvas.width-40;
			var bheight = canvas.height-80;
			console.log('bwidth =' + bwidth);
			console.log('bheight =' + bheight);

			$('#bubble').contextMenu({
				selector: '#bgCanvas',
				show: function(opt) {
					timestamp = Date.now();
					},
				callback: function (key) {
					var bubble, state, objects, qbubble;
					// Don't react for a second to prevent misclicks.
					//if (Date.now() - timestamp < 2000) {return false;}

					if (key === 'search') {
						bubble = new $P.Bubble.Search({x: mousePosX + $P.state.scrollX, y: mousePosY, w: 300, h: 500});
						$P.state.scene.add(bubble);}
					if (key === 'experiment') {
						$('#bubble').contextMenu('close');
						var result, event;
						event = {
							name: 'addGraph',
							x: mousePosX, y: mousePosY,
							strokeStyle: self.parent.strokeStyle,
							reload: false,
							question: 200
						};
						result = $P.state.scene.sendEvent(event);
						bubble = new $P.Bubble.RandForce({x: 10, y: 15, w: bwidth, h: bheight, generate1: false, qID: 200});
						globalBubble = bubble;
						$P.state.scene.add(bubble);
						result = bubble.receiveEvent(event);


						//d3.select(this).attr('transform', null);
						//	_this.dragging = null;
						//	_this.dragOffset = null;



						}
					if (key === 'generate1') {
							
						//for(var i =0; i < 2; i++)
						//{
							function pickLocations(possible, start, length)
							{
							    var result = [];
								for(var i =0; i < length; i++)
								{
									result.push(possible[(start + i)%length]);
								}
								return result;
							}

							function create()
							{
								var result, event;
								var possible = ['L', 'M', 'N', 'P', 'Q', 'S', 'T', 'U'];
								event = {
									name: 'addGraph',
									x: mousePosX, y: mousePosY,
									strokeStyle: self.parent.strokeStyle,
									reload: false
									};
								var configSize = {
									N: 25,
									internal: 0.35,
									external: 0.3,
									possible: pickLocations(possible, 5 , 3 ),
									percentFixed: 0.3
								};
								result = $P.state.scene.sendEvent(event);
								bubble = new $P.Bubble.RandForce({x: 80+ $P.state.scrollX, y: 15, w: bwidth, h: bheight, generate1: true, qID: 7, qCount: 1, sizeParam: configSize});
								globalBubble = bubble;
								$P.state.scene.add(bubble);
								result = bubble.receiveEvent(event);
							}

							create();
							
							function trigger() { 
								index++;
								globalBubble.saveData(index); 
								//bubble.onDelete();
								bubble.delete();
								globalBubble = null;
								}

							//setTimeout(trigger, 15000);

						//}
						//d3.select(this).attr('transform', null);
						//	_this.dragging = null;
						//	_this.dragOffset = null;
						}
					if (key === 'generate2')
					{

						var result, event;
						event = {
							name: 'addGraph',
							x: mousePosX, y: mousePosY,
							strokeStyle: self.parent.strokeStyle,
							reload: false
						};
						var configSize = {
									N: 200,
									internal: 0.08,
									external: 0.05,
									possible: ['L', 'M', 'N','P', 'Q'],
									//maxLinks: 57, //19,
									percentFixed: 0.9
								};
						result = $P.state.scene.sendEvent(event);
						bubble = new $P.Bubble.RandForce({x: $P.state.scrollX, y: 15, w: bwidth, h: bheight, qID: 0, qCount: 0, generate2: true, star: true, sizeParam: configSize});
						globalBubble = bubble;
						$P.state.scene.add(bubble);
						result = bubble.receiveEvent(event);

						//d3.select(this).attr('transform', null);
						//	_this.dragging = null;
						//	_this.dragOffset = null;
						
					}
					if (key === 'generate3') {
							
							function create()
							{
								var result, event;
								event = {
									name: 'addGraph',
									x: mousePosX, y: mousePosY,
									strokeStyle: self.parent.strokeStyle,
									reload: false
									};
								
								result = $P.state.scene.sendEvent(event);
								bubble = new $P.Bubble.RandForce({x: 80+ $P.state.scrollX, y: 15, w: bwidth, h: bheight, 
																	generate1: false, generate2: false, generate3:true, 
																	qID: 7, qCount: 1, 
																	pID: "2022928"});
								globalBubble = bubble;
								$P.state.scene.add(bubble);
								result = bubble.receiveEvent(event);
							}

							create();
							
							function trigger() { 
								index++;
								globalBubble.saveData(index); 
								//bubble.onDelete();
								bubble.delete();
								globalBubble = null;
								}

							//setTimeout(trigger, 15000);

						//}
						//d3.select(this).attr('transform', null);
						//	_this.dragging = null;
						//	_this.dragOffset = null;
						}
					
					if (key === 'test') {
						var result, event;
						event = {
							name: 'addGraph',
							x: mousePosX, y: mousePosY,
							strokeStyle: self.parent.strokeStyle,
							reload: false,
							question: 218
						};
						result = $P.state.scene.sendEvent(event);
						bubble = new $P.Bubble.RandForce({x: 80+ $P.state.scrollX, y: 15, w: bwidth, h: bheight, qID: 69, qCount: 69});
						globalBubble = bubble;
						$P.state.scene.add(bubble);
						result = bubble.receiveEvent(event);

						//d3.select(this).attr('transform', null);
						//	_this.dragging = null;
						//	_this.dragOffset = null;
						}

					if (key === 'starburst') {
						var result, event;
						event = {
							name: 'addGraph',
							x: mousePosX, y: mousePosY,
							strokeStyle: self.parent.strokeStyle,
							reload: false
						};
						result = $P.state.scene.sendEvent(event);
						bubble = new $P.Bubble.RandForce({x: $P.state.scrollX, y: 15, w: bwidth, h: bheight, qID: 0, qCount: 0, generate1: false, star: true});
						globalBubble = bubble;
						$P.state.scene.add(bubble);
						result = bubble.receiveEvent(event);

						//d3.select(this).attr('transform', null);
						//	_this.dragging = null;
						//	_this.dragOffset = null;
						}

					if (key === 'treering') {
						$P.state.scene.add(new $P.TreeRing({
							x: mousePosX + $P.state.scrollX, y: mousePosY, w: 820, h: 700,
							dataName: 'human'}));}
					else if ('save' === key) {
						//$P.Save($P.state).write();
						globalBubble.saveNodes();
						}
					else if ('csv' === key) {
        					 $P.getJSON('./php/parse_file.php',
			 						function(jsonData) {

			 			    		},
			 					{
			 						type: 'GET',
						    		data: {
										id: 80
											}
			 					}
			 				);
					  }
					else if ('load' === key) {
						globalBubble.saveAnswerFile();
					  }
					else if ('meta' === key) {
						globalBubble.saveMetaFile();
					  }
					else if ('comp' === key) {
						globalBubble.saveCompStats();
					  }
					else if ('small' === key) {
						globalBubble.genSmall();
					 }
					else if ('med' === key) {
						globalBubble.genMedium();
					 }
					 else if ('large' === key) {
						globalBubble.genLarge();
					 }
					else if ('record' === key) {
						$P.state.scene.recording = [];}
					else if ('force' === key) {
						qbubble = new $P.Bubble.Pathway({x: mousePosX + $P.state.scrollX, y: mousePosY, w: 750, h: 600, graphBubble: globalBubble});
						$P.state.scene.add(qbubble);}
					else if ('brain' === key) {
						var result, event;
						event = {
							name: 'addGraph',
							x: mousePosX, y: mousePosY,
							strokeStyle: self.parent.strokeStyle,
							reload: false
						};
						result = $P.state.scene.sendEvent(event);
						bubble = new $P.Bubble.RandForce({x: 10, y: 15, w: bwidth, h: bheight, qID: 0, qCount: 0, generate1: false, brain: true});
						globalBubble = bubble;
						$P.state.scene.add(bubble);
						result = bubble.receiveEvent(event);

						//bubble = new $P.Bubble.Note({x: mousePosX + $P.state.scrollX, y: mousePosY, w: 300, h: 300});
						//$P.state.scene.add(bubble);
					}
					else if (key === 'Delete_All') {
						if (window.confirm('Delete all bubbles?')) {
							$P.state.scene.deleteAll();}}
					else if (key === 'help') {
						window.open('documents/manual.pdf');}
					else if (key === 'Toggle_Hints') {
						$P.state.hintsEnabled = !$P.state.hintsEnabled;
						if (!$P.state.hintsEnabled) {
							$P.state.scene.sendEvent({name: 'destroyHints'});}}
					else if (key === 'Toggle_Links') {
						$P.state.linksEnabled = !$P.state.linksEnabled;
						$P.state.markDirty();}
				},
				items: {
					search: {name: 'Open Search Bubble'},
					experiment: {name: 'Open Experiment Bubble'},
					generate1: {name: 'Generate Data Scenario'},
					generate2: {name: 'Generate Quantitative Data'},
					generate3: {name: 'Generate from Database'},
					test: {name: 'Test Task'},
					starburst: {name: 'Startburst'},
					save: {name: 'Save'},
					load: {name: 'Create Answer file'},
					meta: {name: 'Create Meta file'},
					comp: {name: 'Compartment stats file'},
					small: {name: 'Generate Small Graph'},
					med: {name: 'Generate Medium Graph'},
					large: {name: 'Generate Large Graph'},
					csv: {name: 'Create CSV file'},
					brain: {name: 'Load Brain Data'}
					/*
					record: {name: 'Start Recording'},
					'Delete_All': {name: 'Delete All'},
					'Toggle_Hints': {name: 'Toggle Hints'},
					'Toggle_Links': {name: 'Toggle Links'}*/
					}
			});}
		//setContextMenu();
	});
})(PATHBUBBLES);
