(function($P){
    'use strict';

    $P.Bubble.RandForce = $P.defineClass(
        $P.Bubble,      // parent
        function RandForceBubble(config){
            var self = this;
            config.closeMenu = true;
			config.groupMenu = true;
			$P.BubbleBase.call(this, config);
			self.graphs = [];
			self.numGraphs = 0;
			self.transition = true;
			self.answerReady = false;
			self.mode = config.mode || 'soup';
			self.contentConfig = config.contentConfig || {};
			self.contentConfig.graphs = self.graphs.slice();
			self.contentConfig.generate1 = config.generate1;
			self.contentConfig.generate2 = config.generate2;
			self.contentConfig.generate3 = config.generate3;
			self.contentConfig.sizeParam = config.sizeParam;
			self.contentConfig.pID = config.pID;
			self.contentConfig.star = config.star || false; 
			self.contentConfig.brain = config.brain || false; 
			self.qCount = config.qCount || 0;
			self.pCount = 0;
			//self.qID = 101;
      		self.qID = config.qID;
			self.contentConfig.question = self.qID;
			self.userAnswers = [];
			self.answered = [];
			self.userActions = [];
			self.numTrials = 72; 			// disregard graph variation for now ( 6 tasks x 3 vis. x 2 graph sizes)
			self.numPractice = 12;
			self.userID = 1; // = Math.floor(Math.random()*100);
			self.N = config.N || 1;
			self.nodeSelection;
			self.star = config.star || false;
      self.brain = config.brain || false; 
      self.startT = Date.now(); 
	    self.initT = Date.now();
	    self.endT;

        self.questionsInTask = 18;
        self.startPracticeID = 202;
        self.practiceCounter = 203; 

      self.latin = []; 
      for(var i =0; i < 3; i++)
        self.latin[i] = [];


      self.latin2 = [];    // this is for the reverse implementation in getLatinID2 which decides the graph size order depending on the participant ID
      for(var i =0; i < 6; i++)
        self.latin2[i] = [];


      self.latinCounter = -1;

			
     

      var record = {
              id: 'user',
              value: self.userID
              };

      //self.userAnswers.push(record);




			if(undefined !== config.text) {this.text = config.text;}
            /*
			self.add($P.ActionButton.create({
				name: 'switch',
				text: 'S',
				action: function(canvas, x, y) {
					self.mode = 'split' === self.mode ? 'soup' : 'split';
					if ('split' === self.mode) {self.content.layoutSplit();}
					if ('soup' === self.mode) {self.content.layoutSoup();}
					self.content.updateSvgPosition();}}));

			self.add($P.ActionButton.create({
				name: 'mult',
				text: 'M',
				action: function(canvas, x, y) {
					self.mode = 'sm';
					if ('sm' === self.mode) {self.content.layoutSM();}
					self.content.updateSvgPosition();}}));
			*/
			self.repositionMenus();


        },
        {

          giveAnswer: function() {
            this.content.giveAnswer(this.qID);
          },

          setStarDisplay: function() {
            var self = this;
            self.star = true; 
          },
        	isStarDisplay: function() {
        	  var self = this;
        	  return self.star;
        	},
          isBrainDisplay: function() { 
            return this.brain; 
          },
          addGraph: function(graph, i) {
				
                var self = this;
                var gr;

                if( i > 1 ){   // this is not the first graph to be added, so create a new event object for it
                   gr = {		name: 'addGraph',
								ignore_xy: true,
								graphName: 'Graph'+i,
								symbols: [],
								strokeStyle: self.parent.strokeStyle
								 };
				   gr.graphId = i;
				   gr.name = 'Graph'+i;
				   gr.id = i;
				   gr.reload = false;
				   var colors = $P.BubbleBase.nodeColors.slice(0), color, p;
					for (p in self.graphs) {
						$P.removeFromList(colors, self.graphs[p].color);}
					if (0 === colors.length) {
						gr.color = '#666';}
					else if (-1 !== colors.indexOf(graph.strokeStyle)) {
						gr.color = graph.strokeStyle;}
					else {
						gr.color = colors[0];} //}

					this.graphs.push(gr);

					if (this.content) {
						this.content.addGraph(gr, this.mode, this.qID, this.N, i);}


                }
                else{
                    // Strip active colors.
					var colors = $P.BubbleBase.nodeColors.slice(0), color, p;
					for (p in self.graphs) {
						$P.removeFromList(colors, self.graphs[p].color);}
					if (0 === colors.length) {
						graph.color = '#666';}
					else if (-1 !== colors.indexOf(graph.strokeStyle)) {
						graph.color = graph.strokeStyle;}
					else {
						graph.color = colors[0];}

				this.graphs.push(graph);
				if (this.content) {
					this.content.addGraph(graph, this.mode, this.qID, this.N, i );
				    }
                }
            },
            onAdded: function(parent){
                $P.BubbleBase.prototype.onAdded.call(this, parent);
				var self = this;
				var config;
				if (!this.content) {
					config = this.contentConfig || {};
					config.parent = this;
					config.mode = this.mode;
					config = $.extend(config, this.getInteriorDimensions());
					this.content = new $P.Bubble.RandForceContent(config);
				}

             },
             getAnswerReady: function() { return this.answerReady; },
             saveNodes: function(){
               this.content.saveNodeLocations();
             },
             saveAnswerFile: function() {
                this.content.saveAnswerFile();
             },
              saveMetaFile: function() {
                this.content.saveMetaFile();
             },
             saveCompStats: function() {
                this.content.saveCompStats();
             },
             genMedium: function() {
                this.content.genGraph(50, 0.1, 0.08);
             },
             genSmall: function() {
                this.content.genGraph(20, 0.2, 0.13);
             },
             genLarge: function() {
                this.content.genGraph(200, 0.08, 0.05);
             },
             saveData: function(index) {
              this.content.saveData(index);
             },
             onDelete: function() {
              //this.content.onDelete();
              //this.content.delete();
             },
             getTransition: function() { return this.transition;},
             resetTransition: function() { this.transition = false;},
             getNewID: function(start) {
                        var newID; 
                        var repetition = ((start / 9)%2)? 2 : 1;   // odd or even multiple of 9
                        // distinguish between 1st vis, 2nd vis or 3rd vis 
                        var vis = Math.floor((this.qCount-start)/3);  // either 0, 1, or 2

                      if(repetition === 1)
                      {
                        if(this.qCount%3 === 0)
                            {
                              this.latin[vis] = [];    // init row in latin square 
                              var rand = Math.floor(Math.random() * 3);
                              newID = start + this.qCount%3 + rand*3; 
                              this.latin[vis][0] = rand; 
                              this.latinCounter = rand; 
                            }
                            else {
                              this.latinCounter++; 
                              var r = (this.latinCounter)%3; 
                              newID = start + this.qCount%3 + r*3; 
                              this.latin[vis][this.qCount%3] = r;
                            }
                        }
                      else {  // second repitition: follow the same previous order
                          r = this.latin[vis][this.qCount%3];
                          newID = start + this.qCount%3 + r*3; 
                      }
                      return newID;
             },
             getLatinID: function(start)
             {
               var newID; 
               var repetition = ((start / 9)%2)? 2 : 1;   // odd or even multiple of 9
               if(repetition === 1)
               {
                 this.latin[0][0] = 0;
                 this.latin[0][1] = 1;
                 this.latin[0][2] = 2; 

                 this.latin[1][0] = 2;
                 this.latin[1][1] = 0;
                 this.latin[1][2] = 1;

                 this.latin[2][0] = 1;
                 this.latin[2][1] = 2;
                 this.latin[2][2] = 0;

               }
               else
               {
                 this.latin[0][0] = 0;
                 this.latin[0][1] = 2;
                 this.latin[0][2] = 1; 

                 this.latin[1][0] = 1;
                 this.latin[1][1] = 0;
                 this.latin[1][2] = 2;

                 this.latin[2][0] = 2;
                 this.latin[2][1] = 1;
                 this.latin[2][2] = 0;                

               }
               var vis = Math.floor((this.qCount-start)/3);
                var r = this.latin[vis][this.qCount%3];
                newID = start + this.qCount%3 + r*3;
                
                return newID;        
             },
             getLatinID2: function(start)
             {
                var newID;
                 this.latin2[0][0] = 0;
                 this.latin2[0][1] = 1;
                 this.latin2[0][2] = 2;

                 this.latin2[1][0] = 2;
                 this.latin2[1][1] = 0;
                 this.latin2[1][2] = 1;

                 this.latin2[2][0] = 1;
                 this.latin2[2][1] = 2;
                 this.latin2[2][2] = 0;

                 this.latin2[3][0] = 0;
                 this.latin2[3][1] = 2;
                 this.latin2[3][2] = 1;

                 this.latin2[4][0] = 1;
                 this.latin2[4][1] = 0;
                 this.latin2[4][2] = 2;

                 this.latin2[5][0] = 2;
                 this.latin2[5][1] = 1;
                 this.latin2[5][2] = 0;

                var row;
                if(this.userID > 0)
                  row = (this.userID-1)%6;
                else
                  row = 0;
                 var col = Math.floor((this.qCount-start)/3);

                 newID = start + this.latin2[row][col] * 3 + (this.qCount%3);
                 return newID;

             },
             getLatinPracticeID2: function(start)
             {
                var newID;
                 this.latin2[0][0] = 0;
                 this.latin2[0][1] = 1;
                 this.latin2[0][2] = 2;

                 this.latin2[1][0] = 2;
                 this.latin2[1][1] = 0;
                 this.latin2[1][2] = 1;

                 this.latin2[2][0] = 1;
                 this.latin2[2][1] = 2;
                 this.latin2[2][2] = 0;

                 this.latin2[3][0] = 0;
                 this.latin2[3][1] = 2;
                 this.latin2[3][2] = 1;

                 this.latin2[4][0] = 1;
                 this.latin2[4][1] = 0;
                 this.latin2[4][2] = 2;

                 this.latin2[5][0] = 2;
                 this.latin2[5][1] = 1;
                 this.latin2[5][2] = 0;

                var row;
                if(this.userID > 0)
                  row = (this.userID-1)%6;
                else
                  row = 0;
                 var col = Math.floor(this.pCount/2)%3;

                 newID = start + this.latin2[row][col] * 2 + this.pCount%2; 
                 return newID;

             },
             newQuestion: function() {
                       this.answerReady = false;
              		 if(this.qCount < this.numTrials && this.qID < this.numTrials)
                    {
                        this.qCount++ ;
                        this.pCount++;
                        var start = Math.floor(this.qCount/9) * 9;
                        /*
                        if(this.userID%2 === 0)
                        {
                          if(start === 0) start = 18;
                          else if(start === 9) start = 27;
                          else if(start === 18) start = 0;
                          else if(start === 27) start = 9;
                          else if(start === 36) start = 54;
                          else if(start === 45) start = 63;
                          else if(start === 54) start = 36;
                          else if(start === 63) start = 45;
                          else if(start === 72) start = 90;
                          else if(start === 81) start = 99;
                          else if(start === 90) start = 72;
                          else if(start === 99) start = 81; 
                        }*/
                        var end = start + 9;

                      
                        if(this.qCount < (end - 1))
                        {
 
                            //var newID = Math.floor(Math.random() * (end-start) + start);
                           /*
                            var newID = this.getLatinID2(start);
                            var index = this.answered.map(function(e) {return e.qid}).indexOf(newID);
                            while(index >= 0)
                            {
                                //newID = Math.floor(Math.random() * (end-start) + start);
                                this.qCount++;   // TODO: make sure this doesn't happen in experiment
                                newID = this.getLatinID2(start);
                                index = this.answered.map(function(e) {return e.qid}).indexOf(newID);
                            }
                            */
                           // this.qID = newID;
                           this.qID = this.qCount;
                         }
                         else
                         {
                         /*
                            var lastQ=-1;
                            for (var i = start; i < end ; i++ )
                            {
                                index = this.answered.map(function(e) {return e.qid}).indexOf(i);
                                if(index < 0 ) lastQ = i;
                            }*/
                           // this.qID = lastQ;
                         }
                        this.qID = this.qCount;
                        if(this.qID === 36 && this.transition) {this.qID--; this.qCount--; }
                    }
                    else if(this.pCount <= (this.numPractice+1) && this.qID >= 202)   // practice questions
                    {
                       
                        var start = 203 + Math.floor(this.pCount/6)*6;
                        //this.qID = this.getLatinPracticeID2(start);
                        this.qID++;
                        //this.practiceCounter++;
                        console.log('Practice count: '+ this.pCount);
                        console.log('Practice ID: '+ this.qID);
                         this.pCount++;
                    }

                    /*
                    else if(this.pCount <= (this.numPractice+1) && this.qID >= 200)   // training questions
                    {
                      console.log(this.pCount);
                        //this.pCount++;
                        this.qID++;
                    } */

                    else if(this.qID === 200)
                    {
                        this.qID = 0;
                    }


             },
             printSelection: function() {console.log(this.nodeSelection);},
             getQcount: function() {return this.qCount; },
             getPcount: function() {return this.pCount; },
             resetPCount: function() { this.pCount--; },
             getQid:    function() {return this.qID;},
             getQlabel: function() {return this.qCount+1; },
             getQtype: function() {
              	if(this.qID < 36) return 2;
              	else if (this.qID >=36 && this.qID < 72) return 3;
              	//else if (this.qID >=72  && this.qID < 108) return 3;
              	//else if (this.qID >= 54 && this.qID < 72) return 4;
              	//else if (this.qID === 20) return 6;
              	// else if (this.qID >= 21 && this.qID <= 24 ) return 2;
              	else if (this.qID >= 203 && this.qID <= 208 ) return 102;  // practice task
              	else if (this.qID >= 209 && this.qID <= 214) return 102;
              	else if (this.qID >= 215 && this.qID <= 220) return 103;
              	//else if (this.qID >= 116 && this.qID <= 120) return 104;
                else if (this.qID >= 200) return 200;
              	},
              setQid: function (id) { this.qID = id; },
              resetNodeSelection: function() { var undef; this.nodeSelection = undef; },
              setNodeSelection: function(values) {
                var self = this; 
                if(self.nodeSelection)
                {
                  for(var key in values)
                  {
                    if(!self.nodeSelection[key]) {
                        self.nodeSelection[key] = 1;
                      }
                  }
                }
                  else
                  		{
                        self.nodeSelection = {};
                       //self.nodeSelection   = values; 
                       for(var key in values)
                       {
                            self.nodeSelection[key] = 1;
                       }
                      }
              		self.content.reportSelection(self.nodeSelection, this.getQtype());
              },
              c: function() { var undef; this.nodeSelection = undef; },
              deleteNodeSelection: function(k) {
                var self = this;
                if (self.nodeSelection[k]) delete self.nodeSelection[k];
                self.content.deleteNodeSelection(k);

              },
              getNodeSelection: function() { return this.nodeSelection; },
              isHighlighted: function(d) {
              	var self = this;
              	var allHighlights = self.getNodeSelection();
              	for(var k in allHighlights)
              	{
              	 if(d === k) return true;
              	}
              	return false;
              },
              getDirection: function(avgX, qt) {
                var self = this;
                var dir;                 
                 if(qt === 3) {
                    avgX = self.content.getXavg();
                    if(avgX === 0) return 'N';
                 }
                 dir = (avgX > 0)? 'R': 'L';
                return dir;
              },
              recordAnswer: function(aid) {
                    //var endT = Date.now();
                   
                    var count = 0;
                    var chosen; 
                    var certain; 
                    var self = this; 
                    var measures = [9999, 9999, 9999];

                     var totalT = self.endT - self.startT;

                    //console.log(aid);

                    for(var key in aid['answer'])
                    {
                      count++; 
                      //console.log('key: ' + key);
                      
                    }
                    var qt = self.getQtype();
                    var correctStr;

                   //console.log('count = ' + count);
                    if(qt === 1 || qt === 3 || qt === 101 || qt === 103)
                    {
                        //chosen = aid['answer'][1];
                        chosen = aid['answer'];
                       //console.log('answer: ' + chosen);
                       certain = aid['certainty'][1];
                       chosenStr = ''+ chosen;
                      // console.log('certainty: ' + certain);
                       //correctStr = this.correctAns[this.qID];
                       $P.getJSON('./php/load_correct_answers.php',
                                function(jsonData) {
                                        correctStr = jsonData[self.qID];
                                      },
                                    { 
                                    type: 'GET',
                                    data: {
                                       "id": this.qID
                                      }
                                    });


                    }
                    
                    else
                    {
                      chosen = [];
                      for(var key in aid['answer'])
                      {
                        var strings = key.split(":");
                        var index = parseInt(strings[1]);
                        chosen.push(index);
                      }
                      
                      measures = self.correctness(chosen);
                      //console.log('false positive = ' + measures[1]);
                      //console.log('false negative = ' + measures[2]);
                      //console.log('Percect correct:' + measures[0]);
                      var chosenStr = '';
                      for(var i =0; i < chosen.length; i++)
                      {
                        chosenStr += chosen[i];
                        if(i < (chosen.length-1)) chosenStr += ',';
                      }
                      correctStr = measures[4];

                    }

                     certain = aid['certainty'].substring(1);
                     qt = (self.qID < 36)? 1: 3;
                     //qt = (qt > 200)? (qt - 200): qt;
                     //qt = (qt > 100)? (qt - 100): qt;
                     var qNumber = this.qID%18;
                     if(this.qID > 200)
            		    	{
            		    	    qNumber = (this.qID-202) % 6;
            		            qt = (this.qID < 209)? 1 : (this.qID < 215)? 2 : 3;
            		    	}

                    var rep = self.getRepeat(self.qID);
                    var nComps = self.content.getNumLocations();
                    var den = self.content.getDensityInfo(); 


             		var answer = {
                        graphID: this.qID ,
                        user: this.userID,
                        qNumber: qNumber,
                        repeat: rep,
                        direction: self.getDirection(measures[3], qt),
                        taskID: qt,
                        vtype: this.mode,
                        graphNodes: this.content.getGraphNodeNumber(),
                        graphEdges: this.content.getGraphEdgeNumber(),
                        graphCompartments: nComps,
                        compartmentNodes: den[0],
                        compartmentEdges: den[1],
                        crossEdges: den[2],
             			answer: chosenStr,
                        correctAnswer: correctStr,
                        percentCorrect: measures[0], 
                        falsePos: measures[1],
                        falseNeg: measures[2],
                        avgX: (qt === 3 || qt === 103)? self.content.getXavg() : measures[3],
                        certainty: certain,
             			startT: this.startT - this.initT,
                        endT: this.endT - this.initT,
                        totalT: totalT,
                        //dragT: this.content.getNodeDragTime(),
                        panT: this.content.getZoomTime()

             						};

             		var type = this.getQtype();
					console.log("Typechicken:"+type);
             		if(type > 100)
             		{
                    this.userAnswers.push(answer);
                    this.submitPractice();
                    this.userAnswers = [];
             			return this.content.reportAnswer(this.qID, aid.answer);
             		}
             		else { 				//log experimental tasks only
             			this.userAnswers.push(answer);
             			this.answered.push({qid: this.qID});
             			this.submitAnswers();
             			this.userActions = [];
             			this.userAnswers = [];
             		}
             },

          correctness: function(chosen){
            var measures = [];
            var self = this; 
            $P.getJSON('./php/load_correct_answers.php',
                    function(jsonData) {
                      var correct = jsonData[self.qID];
                      var numCorrect = 0;
                      for(var i in correct)
                      {
                        var ref = parseInt(correct[i]);
                        if(chosen.indexOf(ref) >= 0) numCorrect++; 
                      }
                      // for rate calculation see: https://himmelfarb.gwu.edu/tutorials/studydesign101/formulas.html

                      // false positive = c/(c+d)
                      var c = chosen.length - numCorrect;                               // not part of answer but selected by user
                      var cd = self.content.getGraphNodeNumber() - correct.length;      // (c+d) total of not part of answer (whether or not selected by user)
                      var falsePos = c /cd;

                      // false negative = b/(a+b)
                      var b = correct.length - numCorrect;                            // part of answer but not selected by user
                      var ab = correct.length;                                        // total part of answer (whether or not selected by user)
                      var falseNeg = b / ab;

                      var percentCorrect = numCorrect / correct.length * 100; 

                      var ansX = self.content.getXpos(correct);
                      var avgX =0;
                      var viewWidth = self.content.w/4;
                      for(var i = 0; i < ansX.length; i++)
                        avgX += ansX[i];
                      avgX = avgX/ansX.length;

                      //if(self.mode === 'soup')
                        //avgX = 99999; 
                      var correctStr = '';
                      for(var i =0; i < correct.length; i++)
                      {
                        correctStr += correct[i];
                        if(i < (correct.length-1)) correctStr += ',';
                      }


                      measures = [percentCorrect, falsePos, falseNeg, avgX, correctStr];
                    },
                    { 
                    type: 'GET',
                    data: {
                       "id": this.qID
                      }
                    }
                 );
              return measures; 
          },
          recordAction: function(type){
             	var d = Date.now();
             	var action = {
             			type: type,
             			time: d
             		};

				      this.userActions.push(action);
             },
             getRepeat: function(i){
                if ( i > 200) return 0;
                else if((i < 18) || (i >= 36 && i < 54) || (i >= 72 && i < 90) ) return 1;
                else return 2;

             },
             submitPractice: function() {
                 $P.getJSON('./php/submit_practice.php',
                    function(jsonData) {},
                    { 
                    type: 'POST',
                    data: {
                       "id": this.userID , "answers": this.userAnswers
                      }
                    }
                 );
             },
             submitAnswers: function() {
             		//$.post('./php/submit_answers.php', {"id": this.userID , "answers": this.userAnswers });
             		 $P.getJSON('./php/submit_answers.php',
			 				      function(jsonData) {},
			 				      { 
			 				      type: 'POST',
						        data: {
									     "id": this.userID , "answers": this.userAnswers
								      }
			 				      }
			 			     );
             },
             getLatinPracticeMode: function(question)
             {
              var latinMode; 
              var latinUserGroups = [];
                for(var i =0; i < 6; i++)
                {
                  latinUserGroups[i] = [];
                }

                latinUserGroups[0][0] = 'soup';
                latinUserGroups[0][1] = 'split';
                latinUserGroups[0][2] = 'sm';

                latinUserGroups[1][0] = 'sm';
                latinUserGroups[1][1] = 'soup';
                latinUserGroups[1][2] = 'split';

                latinUserGroups[2][0] = 'split';
                latinUserGroups[2][1] = 'sm';
                latinUserGroups[2][2] = 'soup';

                latinUserGroups[3][0] = 'soup';
                latinUserGroups[3][1] = 'sm';
                latinUserGroups[3][2] = 'split';

                latinUserGroups[4][0] = 'split';
                latinUserGroups[4][1] = 'soup';
                latinUserGroups[4][2] = 'sm';

                latinUserGroups[5][0] = 'sm';
                latinUserGroups[5][1] = 'split';
                latinUserGroups[5][2] = 'soup';               

                var row; 
                if(this.userID > 0)
                  row = (this.userID-1)%6;
                else
                  row = 0; 

                 var col = this.pCount % 3;
                this.mode = latinUserGroups[row][col];

                //return latinMode;
                /*
                if(question === 101 || question === 102 || question === 107 || question === 108 || question === 113 || question === 114  || question === 119 || question === 120    )
                    this.mode = latinUserGroups[row][0];
                else if(question === 103 || question === 104 || question === 109 || question === 110 || question === 115  || question === 116 || question === 121  || question === 122  )
                  this.mode = latinUserGroups[row][1];
                else if(question === 105 || question === 106 || question === 111 || question === 112 || question === 117 || question === 118 || question === 123  || question === 124   )
                  this.mode = latinUserGroups[row][2];
                    */

 
             },
             graphSize: function(){
                return this.content.graphSize();
             },
              getLatinPracticeMode2: function(question)
             {
              var latinMode;
              var latinUserGroups = [];
                for(var i =0; i < 6; i++)
                {
                  latinUserGroups[i] = [];
                }

                latinUserGroups[0][0] = 'soup';
                latinUserGroups[0][1] = 'split';
                latinUserGroups[0][2] = 'sm';

                latinUserGroups[1][0] = 'sm';
                latinUserGroups[1][1] = 'soup';
                latinUserGroups[1][2] = 'split';

                latinUserGroups[2][0] = 'split';
                latinUserGroups[2][1] = 'sm';
                latinUserGroups[2][2] = 'soup';

                
                var row;
                row = Math.floor((question-203)/3)%3;
                var col = (question-203)%3;
                console.log('question: ' + question);
                console.log('latin row: '+ row);
                console.log('latin col: '+ col);
                console.log('mode = '+ latinUserGroups[row][col]);

                this.mode = latinUserGroups[row][col];

             },
             getLatinMode: function(){
                var latinMode; 
                var latinUserGroups = [];
                for(var i =0; i < 6; i++)
                {
                  latinUserGroups[i] = [];
                }

                latinUserGroups[0][0] = 'soup';
                latinUserGroups[0][1] = 'split';
                latinUserGroups[0][2] = 'sm';

                latinUserGroups[1][0] = 'sm';
                latinUserGroups[1][1] = 'soup';
                latinUserGroups[1][2] = 'split';

                latinUserGroups[2][0] = 'split';
                latinUserGroups[2][1] = 'sm';
                latinUserGroups[2][2] = 'soup';

                latinUserGroups[3][0] = 'soup';
                latinUserGroups[3][1] = 'sm';
                latinUserGroups[3][2] = 'split';

                latinUserGroups[4][0] = 'split';
                latinUserGroups[4][1] = 'soup';
                latinUserGroups[4][2] = 'sm';

                latinUserGroups[5][0] = 'sm';
                latinUserGroups[5][1] = 'split';
                latinUserGroups[5][2] = 'soup';

                var start = Math.floor(this.qCount/9) * 9;
                var row; 

                if(this.userID > 0)
                 row = (this.userID-1)%6;
                else
                  row = 0; 
                
                var col = Math.floor((this.qCount-start)/3);

                latinMode = latinUserGroups[row][col];

                return latinMode; 
             },

             getLatinMode2: function(){
                var latinMode;
                var latinUserGroups = [];
                for(var i =0; i < 6; i++)
                {
                  latinUserGroups[i] = [];
                }

                latinUserGroups[0][0] = 'soup';
                latinUserGroups[0][1] = 'split';
                latinUserGroups[0][2] = 'sm';

                latinUserGroups[1][0] = 'sm';
                latinUserGroups[1][1] = 'soup';
                latinUserGroups[1][2] = 'split';

                latinUserGroups[2][0] = 'split';
                latinUserGroups[2][1] = 'sm';
                latinUserGroups[2][2] = 'soup';

                latinUserGroups[3][0] = 'soup';
                latinUserGroups[3][1] = 'sm';
                latinUserGroups[3][2] = 'split';

                latinUserGroups[4][0] = 'split';
                latinUserGroups[4][1] = 'soup';
                latinUserGroups[4][2] = 'sm';

                latinUserGroups[5][0] = 'sm';
                latinUserGroups[5][1] = 'split';
                latinUserGroups[5][2] = 'soup';

                if(this.qCount < 0) this.qCount++; 

                var row = Math.floor(this.qCount/3)%6;
                var col = this.qCount%3;

                latinMode = latinUserGroups[row][col];

                return latinMode;
             },
             getStartT: function() {
                return this.startT;
             },
             setEndT: function() {
                this.endT = Date.now();
             },
             receiveEvent: function(event){
                var result;
                var self = this;
                var N = 2;
               /*
                if(self.contentConfig.generate1) N = 2;
                else {
                	if(this.qID < 6 || this.qID > 106) N = 4;
                	else N = 2;
                }*/

                self.graphs = [];
                self.numGraphs = 0;
                self.N = N;
                //else if (event.question %3 === 0) this.mode = 'soup';
                //else if (event.question %3 === 1) this.mode = 'split';
                //else if (event.question %3 === 2) this.mode = 'sm';
                /*
                else if (latin_selector < 3 ) this.mode = 'soup';
                else if (latin_selector >=3 && latin_selector < 6 ) this.mode = 'split';
                else if (latin_selector >=6 && latin_selector < 9 ) this.mode = 'sm';
                */



                if('addGraph' == event.name) { // && (this.contains(event.x, event.y) || event.ignore_xy)){
                     
                  if(event.question === 0)
                  {
                     $P.getJSON('./php/get_user_id.php',
                       function(jsonData) {
                       self.userID = jsonData + 1;
					   window.userID=self.userID;
                         },
                        { 
                         type: 'GET',
                         data: {
                         }
                      }
                     );
					(function(){
						var graphElement=$P.state.scene.htmlObjects[0].element;
						var graphStyle=window.getComputedStyle(graphElement);
						var childStyle=window.getComputedStyle(graphElement.children[0]);
						var graphTop=graphStyle.getPropertyValue("top");
						var graphLeft=graphStyle.getPropertyValue("left");
						var graphWidth=childStyle.getPropertyValue("width");
						var graphHeight=childStyle.getPropertyValue("height");
						var w=window,d=document,e=d.documentElement,g=d.body;
						var x=w.innerWidth||e.clientWidth||g.clientWidth;
						var y=w.innerHeight||e.clientHeight||g.clientHeight;


						//console.log(graphLeft+"\t"+graphTop+"\t"+graphWidth+"\t"+graphHeight);
						$.post('./php/track_graph.php',
							{"id": window.userID, "log": graphLeft+"\t"+graphTop+"\t"+graphWidth+"\t"+graphHeight+"\t"+x+"\t"+y+"\n"}
						);
					})();
                  }
                	var latin_selector = self.qCount%9;

                 if(event.question === 200)
                  this.mode = 'soup';
                 else if(event.question === 201)
                  this.mode = 'split';
                  else if(event.question === 202)
                   this.mode = 'sm';
                  else if(event.question > 202 )
                    this.getLatinPracticeMode(event.question);
                 else
                  this.mode = this.getLatinMode();

                 // this.mode = 'split';

                    if(!this.name) {this.name = event.name || 'Graph1';}

                    for( var i=0; i < N; i++)
                    {	var ev = $.extend(true, {}, event);
                    	self.numGraphs++;
                    	ev.name = 'Graph'+ self.numGraphs;
                    	ev.id = self.numGraphs;
                        this.addGraph(ev, i+1);
                    }
					self.startT = Date.now();
                	console.log(self.startT);
					if(window.userID!=null){
						var transforms="";
						window.zooms.forEach(function(zoom,i) {
							transforms+="\t"+zoom.view.element.attr('transform');
						});
						$.post('./php/track_graph.php',
											 {"id": window.userID, "log": window.qID+"\t"+self.startT+transforms+"\n"}
						);
					}
                    if(self.contentConfig.generate1 || self.contentConfig.generate2 || self.contentConfig.generate3 )
                    	this.content.layout.force.start();
                    return{ target: this, addLink: {color:this.content.getGraphColor(event)},
                            name: 'addedGraph', graphId: event.id
                           }
                 }
                result = $P.Bubble.prototype.receiveEvent.call(this, event);
                if(result) {return result;}
                return false;
             }
        }
    );

    $P.Bubble.RandForce.loader = function(load, id, data) {
        var config = {};
        $P.Bubble.RandForce.prototype.saveKeys.forEach(function(key) {
            config[key] = load.loadObject(data[key]);});
        return new $P.Bubble.RandForce(config);
     };

})(PATHBUBBLES);