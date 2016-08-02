(function($P){
	'use strict';

	$P.Bubble.PathwayContent = $P.defineClass(
		$P.HtmlObject,
		function  PathwayBubbleContent(config) {
			var self = this;

			$P.HtmlObject.call(self, {
				parent: '#bubble',
				type: 'div',
				pointer: 'all',
				objectConfig: config});

			self.N = 6;
			self.graphBubble = config.graphBubble;

			var root = $(this.element);
			/*
			//root.append('<div id="drag" style="width: 50px; height: 50px; background-color: red;"/>');
			root.append('<style> .top-half {margin-top: .5cm; margin-bottom: .5cm} </style>');
			root.append('<hr>');
			root.append('<p class="top-half"><big> Scenario 1: A series of lab samples was taken from a healthy individual A over the course of 6 months, and another series of samples was taken from a sick individual B over the same period </big></p>');
			root.append('<big> Half the graphs shown correspond to individual A and the second half belongs to individual B </big>');
			root.append('<hr/>');
			root.append('<hr/>');
			root.append('<style> .question {margin-top: 1cm; margin-bottom: 1cm; } </style>');
			root.append('<form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">');
			root.append('<p class="question"> Question 1: Which graph has the lowest overall expression?  </p>');

			for(var i=0; i< self.N; i++)
				root.append('<input type="radio" name="graph" <?php if(isset($graph) && $graph=="'+i+'") echo "checked" ;?> > Graph '+ i +'<br>');


			root.append('<style> .submit {margin-top: 1cm; margin-bottom: 1cm; margin-left: 3cm; } </style>');
			root.append('<input type="submit" class="submit" value="Submit">');
			root.append('</form>');
			*/

			var qcount = 0;  // keep track of which question is displayed
			var scount = 1;
			var reload = false;
			var ch1, ch2, ch3;
			ch1 = [''];
			ch2 = [''];
			ch3 = [''];

			root.append('<style> .choices {position: relative; left: 30px; margin-top: 0.1com; } </style>');
			for(var i=1; i<= self.N; i++)
				ch1[i] = '<div><input type="radio" class="choices" name="graph" id="r'+i+'"> Graph '+ i +'</div><br>';
				///ch1[i] = '<div><input type="radio" class="choices" name="graph" <?php if(isset($graph) && $graph=="'+i+'") echo "checked" ;?> > Graph '+ i +'</div><br>';

			for(var i=1; i<= 4; i++)
				ch2[i] = '<div><input type="radio" class="choices" name="answer"> Name '+ i +'</div><br>';

			ch3[1] = '<div><input type="radio" class="choices" name="change"> Increased expression and no change in network structure </div><br>';
			ch3[2] = '<div><input type="radio" class="choices" name="change"> Decreased expression and no change in network structure </div><br>';
			ch3[3] = '<div><input type="radio" class="choices" name="change"> Increased expression and increased connectivity </div><br>';
			ch3[4] = '<div><input type="radio" class="choices" name="change"> Decreased expression and increased connectivity </div><br>';
			ch3[5] = '<div><input type="radio" class="choices" name="change"> Increased expression and decreased connectivity </div><br>';
			ch3[6] = '<div><input type="radio" class="choices" name="change"> Decreased expression and decreased connectivity </div><br>';

			root.append('<style> .scenario {margin-top: .5cm; margin-bottom: .5cm} </style>');
			var qscens = ['<div id="s1" class="scenario"> <p><big> Problem 1: A series of lab samples was taken from a healthy individual A over the course of 6 months, and another series of samples was taken from a sick individual B over the same period, each sample is displayed as one graph </big></p> </div>',
						  '<div id="s2" class="scenario"> <p><big> Problem 2: A series of lab samples was taken from a healthy individual A over the course of 6 months, and another series of samples was taken from a sick individual B over the same period, each sample is displayed as one graph </big></p> </div>',
						  '<div id="s3" class="scenario"> <p><big> Problem 3: A series of lab samples was taken from a healthy individual A over the course of 6 months, and another series of samples was taken from a sick individual B over the same period, each sample is displayed as one graph </big></p> </div>'
						 ];

			root.append('<style> .question {margin-top: .5cm; margin-bottom: .5cm } </style>');
			var qdivs = ['<div id="q1" class="question"> <p>  Question 1: Which graph has the lowest overall expression? </p> </div>',
						 '<div id="q2" class="question"> <p>  Question 2:  Find the first node that becomes down expressed (red) in the graphs of subject B  </p> </div>',
						 '<div id="q3" class="question"> <p>  Question 3:  When the highlighted node changed from up to down (expression), several changes occurred in the sub-network reachable from it. How would you best describe these changes? </p> </div>',
						 '<div id="q4" class="question"> <p>  Question 4:  Find the group of nodes that never changes across the graphs of sample A (same expression values and same network structure). Please select the node that highlights this group? </p> </div>',
						 '<div id="q5" class="question"> <p>  Question 5:  From sample B graphs, please locate the group of nodes  that is most similar to the group you extracted in the previous question (i.e. similar expression pattern, and similar network structure, but may not be exactly the same). </p> </div>',
						 '<div id="q6" class="question"> <p>  Question 6:  In the selected group of interest, please highlight the node marked X. How would you describe the change that the highlighted node X undergoes from sample A to sample B?  </p> </div>',
						 '<div id="q7" class="question"> <p>  Question 6:  In the selected group of interest, please highlight the node marked X. How would you describe the change that the highlighted node X undergoes from sample A to sample B?  </p> </div>',
						 '<div id="q6" class="question"> <p>  Question 6:  In the selected group of interest, please highlight the node marked X. How would you describe the change that the highlighted node X undergoes from sample A to sample B?  </p> </div>',
						 '<div id="q6" class="question"> <p>  Question 6:  In the selected group of interest, please highlight the node marked X. How would you describe the change that the highlighted node X undergoes from sample A to sample B?  </p> </div>',
						 '<div id="q6" class="question"> <p>  Question 6:  In the selected group of interest, please highlight the node marked X. How would you describe the change that the highlighted node X undergoes from sample A to sample B?  </p> </div>',

						];

			var achoices = [ch1, ch2, ch3];
			root.append('<div id="radioPost" class="dataEntry">\
			 				<input type="radio" id="radioEntire" name="radioClass" value="Entire class" checked="checked" />Entire class\
			 				<input type="radio" id="radioIndividual" name="radioClass" value="Individual Student" check="false" />Individual Student(s) / Instructor(s)\
			 			 </div>');

			//root.append('<form action="saveselect.php" method="post" id="formid1"></form>')
			//var buttonPost = '<form action="saveselect.php" method="post" id="formid1"> <button type="submit" id="buttonPost"> Start </button>';

			var form = '<form  action="saveselect.php" method="post" id="formid1"></form>';
			root.append(form);
			var buttonPost = '<button name="send" type="submit" id="buttonPost"> Start </button>';
			root.append(buttonPost);

			/*
			root.find('#formid1').append('<input type="text" name="name" id="name" form="formid1" />');
			root.find('#formid1').append('<input type="text" name="email" id="email" form="formid1" />');
			root.find('#formid1').append(buttonPost);
			*/

			root.on("click", 'button', function(){
									var input = '';
									if(reload) {
										event = {
												name: 'addGraph',
												scenario: scount,
												reload: true
												};

										self.graphBubble.receiveEvent(event);
									}

									if(qcount > 0 ){
										root.find('.choices').each(function(index){
																	if($(this).checked)
																		input = 'r'+index;
																	});
									}

									$P.getJSON('./php/saveselect.php',
									function (jsonData) {
										root.empty().append(buttonPost).clone();
										root.find('#buttonPost').html("Submit and Display Next Question");
										root.append('<style> .scenario {margin-top: .5cm; margin-bottom: .5cm} </style>');
										root.append('<style> .question {margin-top: .5cm; margin-bottom: .5cm } </style>');
										root.append('<style> .choices {position: relative; margin-top: 0.1com; } </style>');
										root.append(qscens[scount-1]);
										root.append('<hr/>');
										root.append(qdivs[qcount]);
										if(qcount == 0)
										{
											for(var i= 0; i < ch1.length;  i++)
											{
												root.append(ch1[i]);
											}

										}
										else if(qcount == 1)
										{
											root.append('<input type="text" name="nodeNumber" >');
										}
										else if(qcount == 2)
										{
											for(var i = 0; i <  ch3.length; i++)
											{
												root.append(ch3[i]);
											}
										}

										//root.append('<button id="buttonPost"> Submit and Display Next Question </button>');
										qcount++;
										if(qcount === 3) {
										   scount=2;
										   reload = true;
										}
										else if(qcount === 6){
											scount = 3;
											reload = true;
										}

									},
										{type: 'GET',
										 data: {
												name: input,
												}
										});
								});

/*
			root.find('button').click(function(){
								//root.find("div").remove();
								//root.find("input").remove();
								//root.find("hr").remove();
								root.empty().append(buttonPost).clone();
								root.append(qscens[0]);
								//root.append('<hr/>');
								root.append(qdivs[qcount]);
								for(var i = ch1.length; i> 0; i--)
								{
									root.append(ch1[i]);
								}
								//root.append('<button id="buttonPost"> Submit and Display Next Question </button>');
								qcount++;



								/*$.post("demo.asp",
										{
										name: "Mai",
										city: "Ismailia"
										},
										function(data, status){
											alert("Data: " + data + "\n Status: "+ status);
											}
										);
							});*/






			root.find('#drag').draggable({
				revert: true,
				revertDuration: 0,
				scroll: false,
				stop: function(event, ui) {
					var force;

					if (self.contains(mouse.x, mouse.y)) {return;}

					var mouse = $P.state.mainCanvas.getMouseLocation(event);
					mouse.x += $P.state.scrollX;

					var send = {
						name: 'dragPathway',
						x: mouse.x, y: mouse.y,
						//pathwayId: d.dbId,
						//pathwayName: d.name,
						//symbols: d.symbols,
						strokeStyle: 'gray',
						expression: null};
					var result = $P.state.scene.sendEvent(send);

					if (!result) {
						force = new $P.Bubble.Force({x: mouse.x, y: mouse.y, w: 750, h: 600});
						$P.state.scene.add(force);
						result = force.receiveEvent(event);}

					if (result && result.addLink) {
						// Add Link Here.
					}

			}});

			root.find('#search_run').click(function(event) {
				self.updateSearch();});
		},
		{
			printForm: function() {
				console.log("Hello!");
			},

			updateSearch: function() {
				var key = $(this.element).find('#search_text').val();

				this.parent.getAllNeighbors().forEach(function(neighbor) {
					if (neighbor.onSearch) {
						neighbor.onSearch(key);}});},

			onAdded: function(parent) {
				$P.HtmlObject.prototype.onAdded.call(this, parent);
			},


			drawSelf: function(context, scale, args) {
				$P.HtmlObject.prototype.drawSelf.call(this, context, scale, args);}

		});

})(PATHBUBBLES);
