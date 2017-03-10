(function($P){
    'use strict';
    $P.Bubble.RandForceContent = $P.defineClass(
        $P.HtmlObject,
        function RandBubbleContent(config){
            var self = this;
            self.starLoad = false; 

			$P.HtmlObject.call(self, {
				parent: '#bubble',
				type: 'div',
				pointer: 'all',
				objectConfig: config});

			//self.N = 200;
			
			if(config.sizeParam)
			  {
			  	self.N = config.sizeParam.N;
				self.internal = config.sizeParam.internal;
				self.external = config.sizeParam.external;
				self.possible = config.sizeParam.possible;
				self.percentFixed = config.sizeParam.percentFixed;

				var ncomp = self.possible.length;
				var combinations = self.factorial(ncomp) / (2 * self.factorial(ncomp - 2));
			 	var targetWithin = Math.round(self.internal * self.internal * self.N * self.N / ncomp) ;
			 	var targetCross = Math.round(self.external * self.external * self.N * self.N / combinations); 
				
				//console.log('possible combinations = '+ combinations);
				console.log(' targetWithin / compartment = '+targetWithin);
				console.log(' targetCross = '+ targetCross);
				self.maxLinks = targetWithin * ncomp + targetCross; 
				console.log('Max links = '+ self.maxLinks); 
			  }

			else
				{
				self.N = 5;
				self.possible = ['A'];
				}
			self.scenCount = config.scenario || 1;
			self.NG = config.totalGs || 1;
			self.qID = config.question || 0;
			self.legendWidth = config.legendWidth || 170;
			self.qlegendHeight = config.qlegendHeight || 100;
			self.fNodes = [];     // nodes saved in file
			self.fLinks = [];	 // links saved in file
			self.fLocations = [];
			self.fLabels = [];
			self.fdelNodes = [];
			self.fdelAtGraph = [];
			self.fDelLinks = [];
			self.fDelLinkAtGraph = [];
			self.override_timeout = false;
			self.generate1 = config.generate1;
			self.generate2 = config.generate2;
			self.generate3 = config.generate3;
			self.star = config.star; 
			self.brain = config.brain; 
			self.numViews =0; 


			/////////////////////////////////////////////////////////////////////////////////////////////////////////
			// Utility random generation functions
			////////////////////////////////////////////////////////////////////////////////////////////////////////
				function randAdj(N)
				{
					var result = [];
					for( var i=0; i < N; i++) {
						result[i] = [];
						var count = 0;
						for(var j = 0; j < N; j++)
						{
						  //if(count < 18)
						   {
						   count++;
							var index = Math.floor(Math.random() * self.N);				// random index between 1 and N
							result[i][index] = Math.floor((Math.random() * 2)) ;	   // the selected index is randomly assigned a 0 or 1
							}
						}
					}
					for(var i =0; i < N; i++) {
						result[i][i] = 0;
						for(var j =0; j < N; j++) {
							if (result[i][j] > 0)  result[j][i] = 0;
							}
						}
				return result;
				}
				function genAlphabet()
				{
					var ascii = '';
					// String of all possible ascii characters
					for(var i = 65; i <= 90; i++)
					{
						ascii += String.fromCharCode( i );
					}
					return ascii;
				}
				function genPool(ascii, numL)
				{
					var pool = [];
					for(var i =0; i < numL; i++)
					{
						pool[i] = ascii.charAt(Math.floor(Math.random() * ascii.length));
					}
					return pool;
				}
				function genRandLocation(possible, nodes)
				{
					 var index = Math.floor(Math.random() * possible.length);
                    return possible[index];
				}
				function genBalancedLocations(possible, nodes, thresh)
				{
					var assigned = [];
					var result = [];
					var meanInComp = nodes.length/possible.length;
					var maxAllowed = Math.floor(meanInComp); // + thresh * meanInComp;
					var minAllowed = Math.floor(meanInComp - thresh * meanInComp); 



					for(var i=0; i < nodes.length; i++)
						result[i] = nodes[i];

					for(var l = 0; l < possible.length-1; l++)
					{
						var count = 0;
						var N = (l%2)? maxAllowed : minAllowed;
						console.log(' Compartment ' + possible[l] + ' , ' + N);
						while(count < N)
						{
							var index = Math.floor(Math.random() * nodes.length);
							if(assigned.indexOf(index) < 0)
							{
								assigned.push(index);
								result[index].location = possible[l];
								count++;
							}
						}
					}

					// assign whatever nodes left to the last compartment
					for(var i =0; i < nodes.length; i++)
					{
						if(assigned.indexOf(i) < 0 )
							result[i].location = possible[possible.length-1];
					}
					return result;
				}
				function getNodesWithin(loc, nodes)
				{
					var result = [];
					for(var i=0; i < nodes.length; i++)
					{
						if(nodes[i].location === loc)
							result.push(nodes[i].id);
					}
					return result;
				}
				function genLocations(possible, nodes, locationCounts)
				{
					var assigned = [];
					var result = [];
					
					for(var i=0; i < nodes.length; i++)
						result[i] = nodes[i];

					for(var l = 0; l < possible.length-1; l++)
					{
						var count = 0;
						var index = 0;
						var N = locationCounts[l];
						console.log(' Compartment ' + possible[l] + ' , ' + N);
						while(count < N)
						{
							index = (index+1)%nodes.length; //Math.floor(Math.random() * nodes.length);
							if(assigned.indexOf(index) < 0)
							{
								assigned.push(index);
								result[index].location = possible[l];
								count++;
							}
						}
					}

					// assign whatever nodes left to the last compartment
					for(var i =0; i < nodes.length; i++)
					{
						if(assigned.indexOf(i) < 0 )
							result[i].location = possible[possible.length-1];
					}
					return result;

				}
			/////////////////////////////////////////////////////////////////////////////////////////////////////////
			// End of utility functions
			////////////////////////////////////////////////////////////////////////////////////////////////////////


			// Generate Random adjacency matrix for N nodes
			var N = self.N;
			var numL = 3;
			var adjacency = randAdj(N);

			self.root = 3;
			adjacency[self.root][1] = 1;
			self.adjacency = adjacency;



			self.delNodes = [];
			self.delAtGraph = [];

			var randLinks = [];
			self.maxLinks =  self.maxLinks; //41 + 20; //356; //Math.floor(Math.random() * self.N) + (self.N * 0.5);
			
			// Generate nodes
			 var randNodes = [];
			 // possible locations
			 var alphabet = genAlphabet();
			 var possible = self.possible;			//genPool(alphabet, numL);
			 for(var i = 0; i < N; i++)
			 {
				randNodes[i] = {
								"id" : i+1,
								"location": possible[0], //genRandLocation(possible, randNodes, i, self),
								"type": 'protein',
								"graphs": i % 2
								};
				//console.log('Node '+ randNodes[i].id + ' location ' + randNodes[i].location );
			 }
			 //randNodes = genBalancedLocations(possible, randNodes, 0.1);

			 var locationCounts = [2, 20, 1, 1];

			 randNodes = genLocations(possible, randNodes, locationCounts);

			 // generate random links while maintaining density parameters 
			 var thresh = 0.1; 
			 var internal = self.internal;
			 var external = self.external;
			 var ncomp = possible.length;
			 var combinations = self.factorial(ncomp) / (2 * self.factorial(ncomp - 2));
			 var targetWithin = Math.round(internal * internal * self.N * self.N / ncomp) ;
			 var targetCross = Math.round(external * external * self.N * self.N / combinations); 
			 // within compartment links
			 var meanPerComp = 0; 
			 var maxWithin = targetWithin + thresh * targetWithin;
			 var minWithin = targetWithin - thresh * targetWithin; 
			 var countWithin =0; 

			 for(var c=0; c < ncomp - 1; c++)
			 {
			 	var maxAllowed = (c%2)? maxWithin : minWithin;			 	
			 	var nodesWithin = getNodesWithin(possible[c], randNodes);
			 	
			 	var N = nodesWithin.length;
			 	var adjacency = randAdj(N);
			 	var numLinks = 0;

			 	console.log('Compartment ' + possible[c] + ' has' + N + ' nodes');
			 	console.log(' and can have up to '+ maxAllowed + ' links');


			 	for(var i = 0; i <  N; i++)
				{
					for (var j=0; j < N; j++)
					{
						if (adjacency[i][j] > 0 && numLinks < maxAllowed )
						{
						numLinks++;
						countWithin++; 
						randLinks.push( { "target" : nodesWithin[j],
									 	"source" : nodesWithin[i]
										});
						}
					}
				}
			 }

			 console.log('count =' + countWithin);

			 // put the rest in the last compartment
			 var nodesWithin = getNodesWithin(possible[ncomp-1], randNodes);
			 var maxAllowed = targetWithin * ncomp - countWithin;
			 var N = nodesWithin.length;
			 var adjacency = randAdj(N);
			 var numLinks = 0;

			 	
			console.log('Compartment ' + possible[ncomp-1] + ' has' + N + ' nodes');
			console.log(' and can have up to '+ maxAllowed + ' links');
			
			for(var i = 0; i <  N; i++)
				{
					for (var j=0; j < N; j++)
					{
						if (adjacency[i][j] > 0 && numLinks < maxAllowed )
						{
						numLinks++;
						randLinks.push( { "target" : nodesWithin[j],
									 	"source" : nodesWithin[i]
										});
						}
					}
				}




			 // Generate cross compartment links
			 var crossCount = getCrossCount();
			 while(crossCount < targetCross)
			 {
			 	// select random source and destinaiton compartments
				var randSrc = Math.floor(Math.random() * (possible.length));
			 	var randDst = Math.floor(Math.random() * (possible.length));
			 	if(randSrc === randDst) randDst = (randSrc+1)%possible.length;
			 	var srcSet = getNodesWithin(possible[randSrc], randNodes);
			 	var dstSet = getNodesWithin(possible[randDst], randNodes);

			 	// pick a random node from source set
			 	var srcNode = Math.floor(Math.random() * srcSet.length);
			 	// pick a random node from dest set
			 	var dstNode = Math.floor(Math.random() * dstSet.length);
			 	// connect the two
			 	randLinks.push({ "target" : dstSet[dstNode],
								 "source" : srcSet[srcNode]
										});

			 	crossCount = getCrossCount(); 

			}



			 function getCrossCount()
			 {
			 	var crossCount = 0;
			 	for(var l = 0; l < randLinks.length; l++)
			 	{
			 		var srcId = (randLinks[l].source > 0)? randLinks[l].source-1 : 0; 
			 		var dstId = (randLinks[l].target > 0)? randLinks[l].target-1 : 0;
			 		var srcLoc = randNodes[srcId].location; 
			 		var dstLoc = randNodes[dstId].location;
			 		if(srcLoc !== dstLoc) crossCount++;
			 		//console.log('Source ' + randLinks[l].source + ' has location ' + srcLoc);
			 		//console.log('Dest ' + randLinks[l].target + ' has location ' + dstLoc);
			 	}
			 	//console.log('Cross count = ' + crossCount); 
			 	var withinCount = randLinks.length - crossCount;
			 	//console.log('Within count = ' + withinCount); 
			 	
			 	return crossCount;

			 }

			 function getWithinNodeCount(loc)
			 {
			 	var count = 0;
			 	for(var i = 0; i < randNodes.length; i++)
			 	{
			 		if(randNodes[i].location === loc)
			 			count++;
			 	}
			 	return count;
			 }
			 // Modify connections to adjust to within and cross-compartment densities
			 function adjustCrossing(internal, external)
			 {
			 	var targetWithin = Math.round(internal * internal * self.N * self.N);
			 	var targetCross = Math.round(external * external * self.N * self.N); 

			 	// count the current within and crossings in the generated data
			 	var crossCount = getCrossCount();

			 	while(crossCount > targetCross)
			 	{
			 		// pick a random link 
			 		var index = Math.floor(Math.random() * randLinks.length);
			 		var srcId = (randLinks[index].source > 0)? randLinks[index].source-1 : 0; 
			 		var dstId = (randLinks[index].target > 0)? randLinks[index].target-1 : 0;
			 		var srcLoc = randNodes[srcId].location; 
			 		var dstLoc = randNodes[dstId].location;
			 		if(srcLoc !== dstLoc)
			 		{
			 			// choose between source and destination
			 			var updateTarget; 
			 			var withinSrc = getWithinNodeCount(srcLoc);
			 			var withinDst = getWithinNodeCount(dstLoc);
			 			var which = Math.floor(Math.random() * 2); 
			 			if(which === 1)
			 				randNodes[srcId].location = randNodes[dstId].location;
			 			else 
			 				randNodes[dstId].location = randNodes[srcId].location;
			 				
			 		}
			 		crossCount = getCrossCount();	
			 	}
			 	console.log('final Cross count = ' + crossCount); 
			 	var withinCount = randLinks.length - crossCount;
			 	console.log('Within count = ' + withinCount); 

			 	crossCount = getCrossCount();
			 }


			 //adjustCrossing(0.08, 0.05);
			 // Generate expression values
			 var exp = [];
			 for(var i =0; i < N+1; i++)
			 {
			 	// Generate random binary value (0 or 1)
			 	var bin = Math.floor(Math.random() * 2);
			 	if(bin > 0)
			 	{
			 		exp[i] = 'up';
			 	}
			 	else
			 	{
			 		exp[i] = 'down';
			 	}
			 }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Write random data to files
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
			 $P.getJSON('./php/save_graph_nodes.php',
			 			function(jsonData) {},
			 			{
			 				type: 'GET',
						    data: {
								node: randNodes
								}
			 			}
			 );



*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////// Read random JSON data
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			self.loadRandData(self.qID,  './graph-data');
			if(self.generate1)
			{
				self.fNodes = randNodes;
				self.fLinks = randLinks;
			}
			else if(self.star && self.generate2)
			{
				for(var i =0; i < randNodes.length; i++)
				{
					self.fNodes[i] = randNodes[i];
				 	self.fNodes[i].g1exp = Math.random();
				 	self.fNodes[i].g2exp = Math.random();
				}

				for(var i =0; i < randLinks.length; i++)
				{
					self.fLinks[i] = randLinks[i];
					self.fLinks[i].log2 = Math.random(); 
				}
			}
			else if(self.star)
			{
				self.loadRetPineal(); 
			}
			else if(self.brain)
			{
				self.loadBrainData(); 
			}
			else if(self.generate3)
			{
				self.loadRealData("196836");	
					
			}
		
			  // default to read from files
			self.graph = {
		   					 "nodes": self.fNodes,
							 "links" : self.fLinks
           					 //"expression" : exp  //['up', 'up','up','up','up','up','up','up','up','up','up','up','up','up','up','up','up','up', 'down']
    						};

			var nodes = self.graph.nodes;
			var links = self.graph.links;
			self.numGraphs = 0;


			self.svg = d3.select(self.element).append('svg').attr('class', 'svg')
							.attr('width', config.w)
							.attr('height', config.h );
			self.svg.main = self.svg.append('g');
			self.layout = config.layout || new $P.RandForceLayout(self);

			self.layout.registerDisplayListener(self.onTick.bind(self));
			self.layout.force.gravity(0);
			self.layout.gravity = 0.03;

			if (config.translate || config.scale) {
				self.zoomBase = {
					translate: function() {return config.translate || [0, 0];},
					scale: function() {return config.scale || 1;}};}

			self.graphs = [];			// equivalent to self.pathways

			if (config.graphs) {
				self.setGraphs(config.graphs, function() {}, config.viewNotes);
			}

			var percentChange = 0.7; 
			
			/*
			while(self.generate1 && (self.delNodes.length < percentChange*self.N))
			//for(var i =0; i < 10; i++)
			{
				var g = Math.floor(Math.random() * 2);
				var root = Math.floor(Math.random() * self.N);
				console.log('root = '+ root);
				self.nodesToDelete(root, g);
				console.log('how many deleted '+ self.delNodes.length);
			}
			*/
		
			self.modifyGraph(self.percentFixed, randLinks);
			//self.genTask1(self.N, true);
		
			self.mode =  config.mode || 'sm';

			self.updateSvgPosition();

        },
        {
        	factorial: function(n)
			{
				var self = this;
				if(n <= 1) return 1;
				return n * self.factorial(n-1);
			},

        	loadBrainData: function() {
        		var self = this;
        		self.fdelNodes = [];
        		self.fdelAtGraph = [];
        		self.fNodes = [];
        		self.fLinks = [];

        		$P.getJSON('./php/load_brain_nodes.php',
			 			function(jsonData) {
							self.fNodes = jsonData;

							for(var i=0; i < jsonData.length; i++)
							 {
							 	self.fNodes[i].id = jsonData[i].id;
							 	self.fNodes[i].type = 'protein';
							 
							 	self.fNodes[i].graphs.forEach(function(g, gid) { self.fNodes[i].graphs[gid] = parseInt(g);} ); 
							 	self.fNodes[i].x = parseFloat(jsonData[i].x)*5;
							 	self.fNodes[i].y = parseFloat(jsonData[i].y)*5;

							 }
							
			 			},
			 			{
			 				type: 'GET',
						    data: {
									index: self.qID
								}
			 			}
			 		);
        			$P.getJSON('./php/load_brain_links.php',
			 			function(jsonData) {
							self.fLinks = jsonData;

							for(var i=0; i < jsonData.length; i++)
							 {
							 	self.fLinks[i].target = jsonData[i].target;
							 	self.fLinks[i].source = jsonData[i].source;
							 	
							 	self.fLinks[i].graphs.forEach(function(g, gid) { self.fLinks[i].graphs[gid] = parseInt(g);} );

							 }
			 			},
			 			{
			 				type: 'GET',
						    data: {
									index: self.qID
								}
			 			}
			 	);
        	},
        	loadRetPineal: function() {
        		var self = this;
        		self.fdelNodes = [];
        		self.fdelAtGraph = [];
        		self.fNodes = [];
        		self.fLinks = [];

        		$P.getJSON('./php/load_ret_nodes.php',
			 			function(jsonData) {
							self.fNodes = jsonData;

							for(var i=0; i < jsonData.length; i++)
							 {
							 	self.fNodes[i].id = jsonData[i].id;
							 	self.fNodes[i].type = 'protein';
							 	self.fNodes[i].location = jsonData[i].location;
							 	self.fNodes[i].graphs.forEach(function(g, gid) { self.fNodes[i].graphs[gid] = parseInt(g);} ); 
							 	self.fNodes[i].g1exp = parseFloat(jsonData[i].g1);
							 	self.fNodes[i].g2exp = parseFloat(jsonData[i].g2);
							 	//self.fNodes[i].x = parseFloat(jsonData[i].x);
							 	//self.fNodes[i].y = parseFloat(jsonData[i].y);

							 }
							// console.log('inside getJSON ');
							//console.log(self.fNodes[40]);
							//console.log(jsonData[40]);
							//console.log('end getJSON');

			 			},
			 			{
			 				type: 'GET',
						    data: {
									index: self.qID
								}
			 			}
			 		);
        			$P.getJSON('./php/load_ret_links.php',
			 			function(jsonData) {
							self.fLinks = jsonData;

							for(var i=0; i < jsonData.length; i++)
							 {
							 	self.fLinks[i].target = jsonData[i].target;
							 	self.fLinks[i].source = jsonData[i].source;
							 	self.fLinks[i].log2 = parseFloat(jsonData[i].log2);
							 	//self.fLinks[i].graphs.forEach(function(g, gid) { self.fLinks[i].graphs[gid] = parseInt(g);} );

							 }
				//			 console.log('inside getJSON 2');
				//			console.log(self.fLinks[4]);
				//			console.log(jsonData[4]);
				//			console.log('end getJSON 2');

			 			},
			 			{
			 				type: 'GET',
						    data: {
									index: self.qID
								}
			 			}
			 	);
        	},
        	loadRealData: function(pathwayId) {
        		$P.getJSON('./php/get_entities.php',
							function (jsonData) {
									self.fNodes = jsonData.entities;
									},
									{type: 'GET', data: {
													mode: 'reactome_pathway_id',
													id: pathwayId
													}
									});

        	},
        	loadRandData: function(id, parentFolder, anonymize) {
        		var self = this;
				window.qID=id;
        		function genAlphabet()
				{
					var ascii = '';
					// String of all possible ascii characters
					for(var i = 65; i <= 90; i++)
					{
						ascii += String.fromCharCode( i );
					}
					return ascii;
				}
				function genPool(ascii, numL)
				{
					var pool = [];
					for(var i =0; i < numL; i++)
					{
						var newChar = ascii.charAt(Math.floor(Math.random() * ascii.length));
						while(pool.indexOf(newChar) >= 0)
						{
							newChar = ascii.charAt(Math.floor(Math.random() * ascii.length));
						}
						pool[i] = newChar;
					}
					return pool;
				}
				var alphabet = genAlphabet();
				var possible ; //= genPool(alphabet, self.fLocations.length);
				var mapLocations = {};
				var mapNodes = {};
				

        		self.fdelNodes = [];
        		self.fdelAtGraph = [];
				var filename;

				  filename = parentFolder + id +'/graph-locs.txt';
				 $P.getJSON('./php/load_graph.php',
			 			function(jsonData) {
							self.fLocations = jsonData;
							possible = genPool(alphabet, self.fLocations.length);
							for(var i=0; i < jsonData.length; i++)
							 {
							 	var newLoc = possible[i];
								mapLocations[self.fLocations[i].id] = newLoc;
					
							 	self.fLocations[i].id = anonymize?  newLoc : jsonData[i].id;
							 	self.fLocations[i].x = parseFloat(jsonData[i].x);
							 	self.fLocations[i].y = parseFloat(jsonData[i].y);
							 }
			 			},
			 			{
			 				type: 'GET',
						    data: {
									index: id,
									file: filename
								}
			 			});

				  filename = parentFolder + id +'/graph-nodes.txt';
				  $P.getJSON('./php/load_graph.php',
			 			function(jsonData) {
							self.fNodes = jsonData;
							
							for(var i=0; i < jsonData.length; i++)
							 {
							 	//if(self.fNodes[i].id)
							 	if(anonymize) { mapNodes[jsonData[i].id] = i+1;  }
							 	self.fNodes[i].id = anonymize? (i+1) : parseInt(jsonData[i].id);
							 	self.fNodes[i].type = jsonData[i].type;
							 	self.fNodes[i].location = anonymize?  mapLocations[jsonData[i].location] : jsonData[i].location;
							 	//self.fNodes[i].graphs.forEach(function(g, gid) { self.fNodes[i].graphs[gid] = parseInt(g);} );
							 	self.fNodes[i].x = parseFloat(jsonData[i].x);
							 	self.fNodes[i].y = parseFloat(jsonData[i].y);
				
							 	if(self.qID > 217)
							 	{
							 		self.fNodes[i].g1exp = parseFloat(jsonData[i].g1);
							 		self.fNodes[i].g2exp = parseFloat(jsonData[i].g2);
							 	}
							 }
			 			},
			 			{
			 				type: 'GET',
						    data: {
									index: id,
									file: filename
								}
			 			});

				  filename = parentFolder + id +'/graph-labels.txt';
				  $P.getJSON('./php/load_graph.php',
			 			function(jsonData) {
							self.fLabels = jsonData;
							for(var i=0; i < jsonData.length; i++)
							 {
							 	self.fLabels[i].id = anonymize? (mapNodes[jsonData[i].id]+'') : jsonData[i].id;
							 	self.fLabels[i].x = parseFloat(jsonData[i].x);
							 	self.fLabels[i].y = parseFloat(jsonData[i].y);
							 }
							 
			 			},
			 			{
			 				type: 'GET',
						    data: {
									index: id,
									file: filename
								}
			 			});


				
				
 				filename = parentFolder + id +'/graph-links.txt';
 				$P.getJSON('./php/load_graph.php',
			 			function(jsonData) {
							self.fLinks = jsonData;
							for(var i=0; i < jsonData.length; i++)
							 {
							 	self.fLinks[i].target = anonymize? mapNodes[jsonData[i].target] :  parseInt(jsonData[i].target);
							 	self.fLinks[i].source = anonymize? mapNodes[jsonData[i].source] : parseInt(jsonData[i].source);

							 }
			 			},
			 			{
			 				type: 'GET',
						    data: {
									index: id,
									file: filename
								}
			 			});

			 	filename =parentFolder + id +'/graph-delNodes.txt';
			 	$P.getJSON('./php/load_graph.php',
			 				function(jsonData) {
								for(var i=0; i < jsonData.length; i++)
							 	{
							 		self.fdelNodes[i] = anonymize? mapNodes[jsonData[i]] : parseInt(jsonData[i]);
							 	}
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: id,
									file: filename
								}
			 				});

				filename = parentFolder + id +'/graph-delAtGraph.txt';
				$P.getJSON('./php/load_graph.php',
			 				function(jsonData) {
								for(var i=0; i < jsonData.length; i++)
							 	{
							 		self.fdelAtGraph[i] = parseInt(jsonData[i]);
							 	}
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: id,
									file: filename
								}
			 				});

			 	filename = parentFolder + id +'/graph-delLinks.txt';
			 	$P.getJSON('./php/load_graph.php',
			 				function(jsonData) {
								for(var i=0; i < jsonData.length; i++)
							 	{
							 		self.fDelLinks[i] = jsonData[i];
							 	}
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: id,
									file: filename
								}
			 				});

				filename = parentFolder + id +'/graph-delLinks.txt';
				$P.getJSON('./php/load_graph.php',
			 				function(jsonData) {
								for(var i=0; i < jsonData.length; i++)
							 	{
							 		self.fDelLinkAtGraph[i] = parseInt(jsonData[i]);
							 	}
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: id,
									file: filename
								}
			 				});
				console.log('Number of nodes: '+ self.fNodes.length);
				console.log('Number of links: '+ self.fLinks.length);
				console.log('Number of compartments: '+ self.fLocations.length);
				
        	},
			addViewNotes: function(viewNotes) {
				var i, layoutId, notes, view, self = this;
				for (i = 0; i < viewNotes.length; ++i) {
					view = this.display.views[i];
					for (layoutId in viewNotes[i]) {
						var text = viewNotes[i][layoutId];
						var element = $P.findFirst(view.entities[0], function(entity) {
							return entity.__data__.layoutId == layoutId;});
						console.log('LAYOUT-ID', layoutId);
						console.log('ELEMENT', element);
						console.log('DATA', element.__data__);
						var note = new $P.NoteFrame({
							w:200, h:100,
							follow: element, followLayoutId: layoutId,
							text: text,
							parent: self.parent});
						view.notes[note.id] = note;
					}
				}
			},
			getGraphColor: function(graph) {
				var i;
				for (i = 0; i < this.graphs.length; ++i) {
					if (graph.id === this.graphs[i].id) {
						return this.graphs[i].color;}}
				return graph.color || graph.strokeStyle || null;
			},

			renewDisplay: function() {
				if ('split' === this.mode) {this.layoutSplit();}
				else if ('soup' === this.mode) {this.layoutSoup();}
			},
        	updateSearch: function() {
				var key = $(this.element).find('#search_text').val();
				this.parent.getAllNeighbors().forEach(function(neighbor) {
					if (neighbor.onSearch) {
						neighbor.onSearch(key);}});
			},
			onAdded: function(parent) {
				$P.HtmlObject.prototype.onAdded.call(this, parent);
			},
			drawSelf: function(context, scale, args) {
				$P.HtmlObject.prototype.drawSelf.call(this, context, scale, args);
			},
			updateLegend: function(timeoutEvent) {

				var self = this;
				self.numViews++;

				if (self.legend) {self.legend.remove();}
				
				self.legend = self.display.viewConstructor.makeLegend(
					self, d3.select(self.element), self.w, 120, self.numViews, timeoutEvent);

				/*
				self.qlegend = self.display.viewConstructor.makeQuestionLegend(
					self.svg, self.w, self.h,
					function(id, state) {}
					);
					*/

			},
			reportSelection: function(values, type) {
				var self = this; 
				if(this.report) this.report.remove();

				if(type === 102 || type === 2 || type === 104 || type === 4)
				{
					this.report = this.svg.append('text')
						.style('font-size', '16px')
		  				.attr('fill', 'black')
		  				.attr('x', this.w * 0.625)
		  				.attr('y', this.h - 140  )
		  				.style('font-weight', 'bold')
		  				.text(function() {
		  					var nodelist = '';
		  					self.fNodes.forEach(function(node, nodeId){
		  						if(values['entity:'+node.id]) 
		  						{
		  							nodelist += node.id + ', ';
		  						}
		  						
		  						});
		  					var t = 'Selected Nodes: ' + nodelist;
		  					return t; 
		  				});
		  					

				}

			},
			
			giveAnswer: function(id)
			{
				var practice_answers = [{'entity:22': 1, 'entity:11': 1, 'entity:8': 1} ,
										{'entity:152': 1, 'entity:86': 1, 'entity:128': 1} ,
										{'entity:62': 1, 'entity:53': 1, 'entity:71': 1, 'entity:47': 1},
										{'entity:10': 1, 'entity:27': 1, 'entity:44': 1 } ,
										{'entity:9': 1, 'entity:44': 1, 'entity:29': 1, 'entity:32': 1},
										{'entity:53': 1, 'entity:58': 1, 'entity:42': 1, 'entity:68': 1},

										{'entity:25': 1, 'entity:69': 1, 'entity:73': 1},
										{'entity:38': 1, 'entity:114': 1, 'entity:28': 1 },
										{'entity:28': 1, 'entity:40': 1, 'entity:22': 1, 'entity:17': 1} ,
										{'entity:89': 1, 'entity:84': 1, 'entity:42': 1 },
										{'entity:86': 1, 'entity:57': 1, 'entity:94': 1 },  
										{'entity:96': 1, 'entity:74': 1, 'entity:101': 1, 'entity:7': 1},
										
										{'entity:8': 1, 'entity:25': 1, 'entity:26': 1 },
										{'entity:100': 1} ,
										{'entity:51': 1, 'entity:74': 1, 'entity:42':1} ,
										{'entity:35': 1, 'entity:11': 1},
										{'entity:75': 1, 'entity:57': 1, 'entity:60': 1, 'entity:94': 1},
										{'entity:7': 1},
										
										//{'entity:25': 1, 'entity:28': 1}
										];
				var answer = practice_answers[id - 203];
				var self = this;
				self.display.views.forEach(function(view){
					view.giveAnswer(answer);
				});
			},

			reportAnswer: function(id, value){

				function objectEquals(x, y) {
   				
					if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    				// after this just checking type of one would be enough
    				if (x.constructor !== y.constructor) { return false; }
    				// if they are functions, they should exactly refer to same one (because of closures)
    				if (x instanceof Function) { return x === y; }
    				// if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    				if (x instanceof RegExp) { return x === y; }
    				if (x === y || x.valueOf() === y.valueOf()) { return true; }
    				if (Array.isArray(x) && x.length !== y.length) { return false; }

    				// if they are dates, they must had equal valueOf
    				if (x instanceof Date) { return false; }

    				// if they are strictly equal, they both need to be object at least
    				if (!(x instanceof Object)) { return false; }
    				if (!(y instanceof Object)) { return false; }

    				// recursive object equality check
    				var p = Object.keys(x);
    				return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
        				p.every(function (i) { return objectEquals(x[i], y[i]); });
				}

				var self = this; 
				var practice_answers = [{'entity:22': 1, 'entity:11': 1, 'entity:8': 1} ,
										{'entity:152': 1, 'entity:86': 1, 'entity:128': 1} ,
										{'entity:62': 1, 'entity:53': 1, 'entity:71': 1, 'entity:47': 1},
										{'entity:10': 1, 'entity:27': 1, 'entity:44': 1 } ,
										{'entity:9': 1, 'entity:44': 1, 'entity:29': 1, 'entity:32': 1},
										{'entity:53': 1, 'entity:58': 1, 'entity:42': 1, 'entity:68': 1},
										//{'entity:7': 1, 'entity:34': 1, 'entity:36': 1, 'entity:62': 1, 'entity:70': 1, 'entity:75': 1, 'entity:77': 1, 'entity:110': 1},
										{'entity:25': 1, 'entity:69': 1, 'entity:73': 1},
										{'entity:38': 1, 'entity:114': 1, 'entity:28': 1 },
										{'entity:28': 1, 'entity:40': 1, 'entity:22': 1, 'entity:17': 1} ,
										{'entity:89': 1, 'entity:84': 1, 'entity:42': 1 },
										{'entity:86': 1, 'entity:57': 1, 'entity:94': 1 },  
										{'entity:96': 1, 'entity:74': 1, 'entity:101': 1, 'entity:7': 1},
										3, 0, 3, 2, 4, 1
										//"g2", "g3", "g2", "g1", "g2","g1"
										];
				var correct = ['Nodes: 8, 11 and 22',
								'Nodes: 156, 157 and 160',
								'Nodes: 47, 53, 62 and 71',
								'Nodes: 10, 27 and 44',
								'Nodes: 9, 29, 32 and 44',
								'Nodes: 42, 53, 58 and 68',
								 'Nodes: 25, 69 and 73',
								 'Node: 28, 38 and 114',
								 'Nodes: 17, 22, 28 and 40',
								 'Nodes: 42, 84 and 89',
								 'Nodes: 57, 86 and 94',
								 'Nodes: 7, 74, 96 and 101',
								  '3 nodes', '0 nodes', '3 nodes', '2 nodes', '4 nodes', '1 node'
								 ];
				var myText; 
				var equal = false;
				if(typeof value === typeof {}) {
					equal = objectEquals(value, practice_answers[id-203]);
				}
				else
				{
					equal = practice_answers[id-203] === value;
				}
				if( equal )
					{
					//myText = 'Your answer is correct.';
					//self.display.viewConstructor.makeDialog(d3.select(self.element), myText, 400, 300, 'Perfect', id, self);
					/*
					new $P.HintBox({
						parent: this,
						text: 'Your answer is\n Correct!',
						x: this.w * 0.5 - 120,
						y: this.h * 0.5 - 35,
						w: 240,
						h: 95,
						fadeStart: 300,
						target: {x: this.x + this.svg.radius + 125,
									 y: this.y + this.svg.radius - 62}
						});*/

					return true;
					}
				else
				    {
				    	//myText = 'The correct answer is: ' + correct[id - 203];
				    	//self.display.viewConstructor.makeDialog(d3.select(self.element), myText, 400, 300, 'Correction', id, self);
				    	//self.parent.resetPCount(); 

				    	//alert('The correct answer is: ' + correct[id - 101]);
				    	//this.display.viewConstructor.showDialog('Correction', d3.select(self.element),'Ok', '',null);
				    	return false;
				    }


			},
			updateSvgPosition: function() {
			    var self = this;
				if (this.svg) { this.svg.attr('width', self.w )
							.attr('height', self.h - self.qlegendHeight)
							.attr('x', 0).attr('y', 0)
							//.attr('viewBox', '0 0 1200 1200')
							.attr('preserveAspectRatio', "none");
							self.svg.selectAll('*').on("contextmenu", function(d, i) { d3.event.preventDefault(); });
							}
				if (this.display) {this.display.size = [this.w, this.h - self.qlegendHeight ];}

				if (this.legend) {
					this.legend
						.attr('x', 0 )
						.attr('width', this.w)
						.attr('y', this.h - self.qlegendHeight)
						.attr('height', self.qlegendHeight);}
/*
				if (this.qlegend) {
					this.qlegend
						//.style("float", "bottom")
						.attr('x', 20)
						.attr('y', 40)
						.attr('width', this.w )
						.attr('height', this.qlegendHeight);}
						*/


			},
			getGraphNodeNumber: function() {
				var l = this.fNodes.length;
				var diff = Math.abs(l - 50);
				if(diff < 5) return 50;
				return this.fNodes.length;
			},
			getGraphEdgeNumber: function() {
				return this.fLinks.length; 
			},
			getNodeDragTime: function() {
				return this.layout.getNodeDragTime();
			},
			setNodeTypeHidden: function(nodeType, hidden) {
				this.display.views.forEach(function(view) {
					view.setNodeTypeHidden(nodeType, hidden);});
			},
			deleteNodeSelection: function(nodeID) {
				this.display.views.forEach(function(view) {
					view.deleteNodeSelection(nodeID);
				});
			},
			getXpos: function(nodeIDs)
			{
				var self = this; 
				var nodesInGraph = self.fNodes;
				var result = [];
				for(var i =0; i < nodesInGraph.length; i++)
				{
					for(var j = 0; j < nodeIDs.length; j++)
					{
						var node = parseInt(nodeIDs[j]);
						if(nodesInGraph[i].id === node)
							result.push(nodesInGraph[i].x);
					}
				}
				return result; 
			},
			setGraphs: function(graphs, finish, viewNotes){
					var self = this;
					//self.onGraphsChanged = function() {};
					var index = 0;
					function add() {
						if(index < graphs.length){
							self.addGraph(graphs[index], undefined, add);
							++index;
							}
						else{
							//delete self.onGraphsChanged();
							self.onGraphsChanged();
							if(viewNotes) {self.addViewNotes(viewNotes);}
							if(finish) {finish();}
							}
					}
					add();
			},
			getZoomTime: function() {
				var maxT = 0;
				this.display.views.forEach(function(view){
					var t = view.getZoomTime(); 
					if(t > maxT) maxT = t; 
				});
				return maxT;
			},
			getRemaining: function(){
					var start = this.parent.getStartT();
					var elapsed = Date.now() - start;
					return this.getThreshold()-elapsed;
			},
			getThreshold: function(){
				var qi = this.parent.getQid();
				var threshold = (qi%3 === 0)? 20000  : (qi%3 === 1)? 35000   :  80000 ;
				return threshold;
			},
			onGraphsChanged: function(){
			   var self = this;
			   if(self.svg) {self.svg.remove();}
			   self.svg = d3.select(self.element).append('svg').attr('class', 'svg');
			   self.svg.main = self.svg.append('g').attr('id', 'main');
			   self.svg.main.append('rect')
			   			.attr('width', '100%')
			   			.attr('height', '100%')
			   			.attr('fill', 'white');
			   self.svg.defs = self.svg.append('defs');
			   self.override_timeout = false;
			   self.layout.setGraphs(self.graphs, function() {
			   							self.renewDisplay();
			   							self.updateSvgPosition();
			   						} );
				 self.svg.append('rect')
				  		.attr('x', 0)
						.attr('y', 0)
						.attr('width', 25)
						.attr('height', 10)
						.attr('stroke-width', 1)
						.attr('stroke', 'white')
						.attr('fill', 'white');

				  var qi = this.parent.getQid();
				  var threshold = (qi%3 === 0)? 20000  : (qi%3 === 1)? 50000   :  80000 ;

				function hideGraph() {


				  var start = self.parent.getStartT();
				  var elapsed = Date.now() - start;
				   if(elapsed > threshold && !self.override_timeout)
				   {
				    self.svg.append('rect')
				  		.attr('x', 0)
						.attr('y', 0)
						.attr('width', self.w)
						.attr('height', self.h)
						.attr('stroke-width', 1)
						.attr('stroke', 'white')
						.attr('fill', 'white');

					self.svg.append('text')
							.style('font-size', '24px')
							.style('font-weight', 'bold')
							.style('font-decoration', 'underline')
							.attr('fill', 'black')
							.attr('x', self.w/2 - 100)
							.attr('y', self.h/2 - 20)
							.attr('dominant-baseline', 'middle')
							.text('Please select answer');

					self.parent.answerReady = true;
					//self.updateLegend(true);
			   		self.updateSvgPosition();
			   		self.parent.setEndT();

					}

				}

				var qType = self.parent.getQtype();
				//if(qType === 103 || qType === 3)
			   		//setTimeout(hideGraph, threshold);
			},
			onPositionChanged: function(dx, dy, dw, dh) {
				$P.HtmlObject.prototype.onPositionChanged.call(this, dx, dy, dw, dh);
				//if ((dw && dw !== 0) || (dh && dh !== 0)) {this.layout.force.start();}
				this.updateSvgPosition();
			},
			hideGraph: function(text, task) {
			  		 var self = this;
					var hider= self.svg.append('rect')
						.attr('x', 0)
						.attr('y', 0)
						.attr('width', self.w)
						.attr('height', self.h)
						.attr('stroke-width', 1)
						.attr('stroke', 'white')
						.attr('fill', 'white');
					var itext = self.svg.append('text')
						.style('font-size', '24px')
						.style('font-weight', 'bold')
						.style('font-decoration', 'underline')
						.attr('fill', 'black')
						.attr('x', self.w/2 - text.length*5.5)
						.attr('y', self.h/2 - 20)
						.attr('dominant-baseline', 'middle')
						.text(text);
					if(task)
					{
					var x;
					var qi = self.parent.getQid();
					if(qi === 215) x = 660;
					else if(qi < 34 || qi === 200) x = 220;
					else x = 440;
					var strings = task.split('\n');
					self.svg.append('text')
						.style('font-size', '26px')
						.style('font-weight', 'bold')
						.style('font-decoration', 'underline')
						.attr('fill', 'black')
						.attr('x', self.w/2 - strings[0].length*6.5)
						.attr('y', 200)
						.attr('dominant-baseline', 'middle')
						.text(strings[0]);
					if(task.includes('\n')){
						self.svg.append('text')
							.style('font-size', '26px')
							.style('font-weight', 'bold')
							.style('font-decoration', 'underline')
							.attr('fill', 'black')
							.attr('x', self.w/2 - strings[1].length*6.5)
							.attr('y', 200+25)
							.attr('dominant-baseline', 'middle')
							.text(strings[1]);
					}
					}
			},
			onTick: function() {
				var self = this;
				this.svg.selectAll('.node').attr('transform', function(d) {
					var y = d.y; // + (self.N % 3) * 350 ;
					var x = d.x; // + (self.N % 3) * 200;
					return 'translate(' + x + ',' + y + ')';});
				this.svg.selectAll('.follower').attr('transform', function(d) {
					var follow = d3.select(this).attr('follow-id');
					var node = self.layout.getNode(follow);
					return 'translate(' + node.x + ',' + node.y + ')';});
				// Undirected Links.
				this.svg.selectAll('.link line')
					.attr('x1', function(link) {return link.source.x;})
					.attr('y1', function(link) {return link.source.y;})
					.attr('x2', function(link) {return link.target.x;})
					.attr('y2', function(link) {return link.target.y;});
				this.svg.selectAll('.update-displays').each(function(d, i) {
					if (d && d.displays) {
						d.displays.forEach(function(display) {
							display.update(self.layout);});}});
			},
			layoutPrep: function() {
				if (this.display) {this.display.delete();}
				if (this.display && this.display.viewCount > 0) {
					this.zoomBase = this.display.getZoomBase();}
			},
			layoutFinish: function() {
				if (!this.display || !this.display.layout || !this.display.layout.force) {return;}
				this.onTick();
				this.updateLegend();
			},
			layoutSM: function(){
				this.layoutPrep();
				this.display = new $P.ForceDisplay(
					{
						svg: this.svg,
						parent:this.svg.main,
						parentBubble: this.parent,
						layout: this.layout,
						shape: new $P.ForceShape.Grid({w: this.w, h: this.h, count: this.graphs.length }),
						zoomBase: this.zoomBase,
						viewArgs: {type: 'graphs', list: this.graphs, generate: this.generate1 || this.generate2 || this.generate3},
						viewNodes: {toDelete: this.delNodes, exitAt: this.delAtGraph, toDeleteLinks: this.delLinks, exitLink: this.delLinkAtGraph  },
						collapsedLocations: this.display && this.display.collapsedLocations,
						viewConstructor: $P.GraphForceView
					}
				);
				this.layoutFinish();
			},
			layoutSoup: function() {
				this.layoutPrep();
				this.display = new $P.ForceDisplay({
					svg: this.svg,
					parent: this.svg.main,
					parentBubble: this.parent,
					layout: this.layout,
					shape: new $P.ForceShape.Centered({w: this.w, h: this.h, count: 1}),
					zoomBase: this.zoomBase,
					viewArgs: {type: 'graphs', list: this.graphs, totalGs: this.NG, gID: this.i, generate: this.generate1 || this.generate2 || this.generate3},
					viewNodes: {toDelete: this.delNodes, exitAt: this.delAtGraph, toDeleteLinks: this.delLinks, exitLink: this.delLinkAtGraph },
					collapsedLocations: this.display && this.display.collapsedLocations,
					viewConstructor: $P.RandSoupForceView});
				this.layoutFinish();
			},

			layoutSingle: function() {
				this.display = new $P.ForceDisplay({
					svg: this.svg,
					parent: this.svg.main,
					parentBubble: this.parent,
					layout: this.layout,
					shape: new $P.ForceShape.Centered({w: this.w, h: this.h, count: 1}),
					zoomBase: this.zoomBase,
					viewArgs: this.graphs,
					viewNodes: {toDelete: this.delNodes, exitAt: this.delAtGraph, toDeleteLinks: this.delLinks, exitLink: this.delLinkAtGraph },
					collapsedLocations: this.display && this.display.collapsedLocations,
					viewConstructor: $P.GraphForceView});
					},

			layoutMirror: function() {
				this.display = new $P.ForceDisplay({
					svg: this.svg,
					parent: this.svg.main,
					parentBubble: this.parent,
					layout: this.layout,
					shape: new $P.ForceShape.Mirror({w: this.w * 0.5, h: this.h, count: 2}),
					zoomBase: this.zoomBase,
					viewArgs: {type: 'graphs', list: this.graphs, generate: this.generate1 || this.generate2 || this.generate3},
					mirrorArgs: 'graphs',
					viewNodes: {toDelete: this.delNodes, exitAt: this.delAtGraph, toDeleteLinks: this.delLinks, exitLink: this.delLinkAtGraph },
					collapsedLocations: this.display && this.display.collapsedLocations,
					viewConstructor: $P.GraphForceView});
					},

			layoutRadial: function() {
				this.display = new $P.ForceDisplay({
					svg: this.svg,
					parent: this.svg.main,
					parentBubble: this.parent,
					layout: this.layout,
					shape: new $P.ForceShape.Radial({
						count: this.graphs.length,
						radius: Math.max(this.w, this.h)}),
					zoomBase: this.zoomBase,
					viewArgs: {type: 'graphs', list: this.graphs, generate: this.generate1 || this.generate2 || this.generate3},
					viewNodes: {toDelete: this.delNodes, exitAt: this.delAtGraph, toDeleteLinks: this.delLinks, exitLink: this.delLinkAtGraph  },
					collapsedLocations: this.display && this.display.collapsedLocations,
					viewConstructor: $P.GraphForceView});
					},

			layoutSplit: function() {
				this.layoutPrep();
				if (1 === this.graphs.length) {this.layoutSingle();}
				if (2 === this.graphs.length) {this.layoutMirror();}
				if (2 < this.graphs.length) {this.layoutRadial();}
				this.layoutFinish();
			},
			renewDisplay: function() {

				if('split' === this.mode) {this.layoutSplit();}
				else if('soup' === this.mode ) {this.layoutSoup();}
				else if('sm' === this.mode) {this.layoutSM();}
			},

			modifyExpression: function(graph){
				var newExpr = $.extend(true, {}, graph.expression);
				for(var i=0; i < (graph.expression.length / 5); i++)   // modify 20% of expression data
				{
					// pick a random index
					var index = Math.floor((Math.random() * newExpr.length));
					// modify expression at that index
					if('up' === graph.expression[index])
						{
							newExpr[index] = 'down';
						}
					else
						{
							newExpr[index] = 'up';
						}

				}
				//graph.expression = newExpr;
				return newExpr;
			},
			saveNewGraph: function(locationNodes) {
				var self = this;
				function getNodeLocation(id, nodes){
										for(var n=0; n < nodes.length; n++)
										{ if(nodes[n].id === id)
											{return nodes[n].location;}
										}
								  }
				var nodesToSave = self.fNodes;
				var linksToSave = self.fLinks;
				var labelsToSave = self.fLabels;
				var locationsToSave = self.fLocations;

				if(nodesToSave.length > 100)
				{
					var mid = Math.floor(nodesToSave.length/2);
					var halfNodes = [];
					for(var i =0; i < mid; i++ )
				 	{
				 		halfNodes[i] = nodesToSave[i];
					}

					$P.getJSON('./php/save_graph_nodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: halfNodes
								}
			 				}
			 			 );

					halfNodes = [];
					var length = nodesToSave.length - mid;
					for(var i =0; i < length; i++)
					{
						halfNodes[i] = nodesToSave[mid+i];
					}

					$P.getJSON('./php/save_graph_nodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: halfNodes
								}
			 				}
			 			 );

				}

				else {

						$P.getJSON('./php/save_graph_nodes.php',
									function(jsonData) {},
									{
									type: 'POST',
									data: {
										node: nodesToSave
										}
									}
								 );
				}



					$P.getJSON('./php/save_graph_locs.php',
									function(jsonData) {},
									{
									type: 'POST',
									data: {
										node: locationsToSave
										}
									}
								 );

					$P.getJSON('./php/save_graph_labels.php',
									function(jsonData) {},
									{
									type: 'POST',
									data: {
										node: labelsToSave
										}
									}
								 );

				if(linksToSave.length > 100)
			 	{
			 		var mid = Math.floor(linksToSave.length/2);
					var halfLinks = [];
					for(var i =0; i < mid; i++ )
				 	{
				 		halfLinks[i] = linksToSave[i];
					}

					$P.getJSON('./php/save_graph_links.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								link: halfLinks
								}
			 				}
			 			 );

					halfLinks = [];
					var length = linksToSave.length - mid;
					for(var i =0; i < length; i++)
					{
						halfLinks[i] = linksToSave[mid+i];
					}

					$P.getJSON('./php/save_graph_links.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								link: halfLinks
								}
			 				}
			 			 );

			 	}
			 	else {
			 	$P.getJSON('./php/save_graph_links.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								link: linksToSave
								}
			 				}
			 			 );
			 		}


			 		 $P.getJSON('./php/save_delNodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: self.delNodes
								}
			 				}
			 			 );

				 $P.getJSON('./php/save_delAtGraph.php',
				 			function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: self.delAtGraph
								}
			 				}
			 			 );


			 	 $P.getJSON('./php/save_delLinks.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: self.delLinks
								}
			 				}
			 			 );

				 $P.getJSON('./php/save_delLinkAtGraph.php',
				 			function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: self.delLinkAtGraph
								}
			 				}
			 			 );

				 var answerToSave = [];
				 // for Task 1: find the largest compartment
				 var key0 = Object.keys(locationNodes)[0];
				 var max = locationNodes[key0].value;
				 var maxLoc = key0;
				 for(var key in locationNodes)
				 {
				 	if(locationNodes[key].value > max)
				 	{
				 		maxLoc = key;
				 		max = locationNodes[key].value;
				 	}
				 }
				 console.log('The largest compartment is: ' + maxLoc);
				 for(var i =0; i < self.delNodes.length; i++)
				 {
				 	var loc = getNodeLocation(self.delNodes[i], self.fNodes);
				 	if(loc === maxLoc)
				 		answerToSave.push(self.delNodes[i]);
				 }

				 console.log(answerToSave);
				 $P.getJSON('./php/save_answer.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: answerToSave
								}
			 				}
			 			 );

			},
			saveNodeLocations: function()
			{
				var self = this;
				var nodesInGraph = self.layout.force.nodes();
				var nodesInLayout = self.layout.getNodes(); 
				var linksInGraph = self.layout.force.links();

				//console.log(nodesToSave);
				var nodesToSave = [];
				var locationsToSave = [];
				var labelsToSave = [];
				var linksToSave = [];

				//self.genTask1(self.N, true);  // true = rightmost

				for(var i=0; i < nodesInGraph.length; i++)
				{
					 if(nodesInGraph[i].klass === 'entity')
					 {
					 	//console.log(i);
					 	var nodeToSave;
					 	if(self.star && self.generate2)
					 	{
					 		nodeToSave = {
									"id" : nodesInGraph[i].id,
									"location": nodesInGraph[i].location,
									"type": nodesInGraph[i].type,
									"graphs": nodesInGraph[i].graphs,
									"x": nodesInGraph[i].x,
									"y": nodesInGraph[i].y,
									"g1": nodesInLayout[i].magnitudes[0],
									"g2": nodesInLayout[i].magnitudes[1]
									};
					 	}
					 	else
					 	{
					 		nodeToSave = {
									"id" : nodesInGraph[i].id,
									"location": nodesInGraph[i].location,
									"type": nodesInGraph[i].type,
									"graphs": nodesInGraph[i].graphs,
									"x": nodesInGraph[i].x,
									"y": nodesInGraph[i].y
									};
						 }
						nodesToSave.push(nodeToSave);

					 }
					 else if (nodesInGraph[i].klass === 'location')
					 {
					 	var locToSave = {
					 				"id": nodesInGraph[i].id,
					 				"x": nodesInGraph[i].x,
					 				"y": nodesInGraph[i].y
					 				};
					 	locationsToSave.push(locToSave);
					 }
					 else if (nodesInGraph[i].klass === 'entitylabel')
					 {
					 	var labelToSave = {
					 			"id": nodesInGraph[i].id,
					 			"x": nodesInGraph[i].x,
					 			"y": nodesInGraph[i].y
					 			};
					 	labelsToSave.push(labelToSave);

					 }

				}

				

				if(nodesToSave.length > 100)
				{
					var mid = Math.floor(nodesToSave.length/2);
					var halfNodes = [];
					for(var i =0; i < mid; i++ )
				 	{
				 		halfNodes[i] = nodesToSave[i];
					}

					$P.getJSON('./php/save_graph_nodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: halfNodes
								}
			 				}
			 			 );

					halfNodes = [];
					var length = nodesToSave.length - mid; 
					for(var i =0; i < length; i++)
					{
						halfNodes[i] = nodesToSave[mid+i];
					}

					$P.getJSON('./php/save_graph_nodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: halfNodes
								}
			 				}
			 			 );

				}

				else {

				$P.getJSON('./php/save_graph_nodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: nodesToSave
								}
			 				}
			 			 );
					}

				
				
				$P.getJSON('./php/save_graph_locs.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: locationsToSave
								}
			 				}
			 			 );

			 	$P.getJSON('./php/save_graph_labels.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: labelsToSave
								}
			 				}
			 			 );

			 	if(self.generate1 || self.generate2 || this.generate3) 
			 		linksToSave = self.graph.links;
			 	else
			 	 {
			 		for(var i=0; i < linksInGraph.length; i++)
                	{
                 	if(linksInGraph[i].source.klass === 'entity' && linksInGraph[i].target.klass === 'entity')
                    	{
	                    var linkToSave = {
	                                        "target": linksInGraph[i].target.id,
	                                        "source": linksInGraph[i].source.id
	                                    };
	                    linksToSave.push(linkToSave);
	                    }
	                }
	            }

			 	if(linksToSave.length > 100)
			 	{
			 		var mid = Math.floor(linksToSave.length/2);
					var halfLinks = [];
					for(var i =0; i < mid; i++ )
				 	{
				 		halfLinks[i] = linksToSave[i];
					}

					$P.getJSON('./php/save_graph_links.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								link: halfLinks
								}
			 				}
			 			 );

					halfLinks = [];
					var length = linksToSave.length - mid; 
					for(var i =0; i < length; i++)
					{
						halfLinks[i] = linksToSave[mid+i];
					}

					$P.getJSON('./php/save_graph_links.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								link: halfLinks
								}
			 				}
			 			 );

			 	}
			 	else {
			 	$P.getJSON('./php/save_graph_links.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								link: linksToSave
								}
			 				}
			 			 );
			 		}
						/////////////////////////////////////
						// write deleted nodes info to files
						////////////////////////////////////

						 $P.getJSON('./php/save_delNodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'GET',
						    data: {
								node: self.delNodes
								}
			 				}
			 			 );

						 $P.getJSON('./php/save_delAtGraph.php',
				 			function(jsonData) {},
			 				{
			 				type: 'GET',
						    data: {
								node: self.delAtGraph
								}
			 				}
			 			 );


			 			  $P.getJSON('./php/save_delLinks.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: self.delLinks
								}
			 				}
			 			 );

				 		$P.getJSON('./php/save_delLinkAtGraph.php',
				 			function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								node: self.delLinkAtGraph
								}
			 				}
			 			 );
						// save answer for task 1
						 $P.getJSON('./php/save_answer.php',
			 				function(jsonData) {},
			 				{
			 				type: 'GET',
						    data: {
								node: self.ansIDs
								}
			 				}
			 			 );

				 		// save answer to quantitative questions
				 		function findMinID(array)
				 		{
				 			var min = array[0];
				 			var id = 0;
				 			for(var i =0; i < array.length; i++)
				 			{
				 				if(array[i] < min)
				 				{
				 					min = array[i];
				 					id = i; 
				 				}
				 			}
				 			return id; 
				 		}
				 		if(self.star && self.generate2)
				 		{
				 			var diffs = [];
				 			var entityIds = []; 
				 			var entities = self.layout.getNodes('entity'); 
				 			var ansIDs = [];
				 			for(var i = 0; i < entities.length; i++)
				 			{
				 				var diff = Math.abs(entities[i].magnitudes[0] - entities[i].magnitudes[1]);
				 				entityIds.push(entities[i].id);
				 				diffs.push(diff);
				 			}
				 			for(var i =0; i < 3; i++)
				 			{
				 				var minID = findMinID(diffs);
				 				ansIDs.push(entityIds[minID]);
				 				diffs[minID] = 10000000;   // make sure this number won't get selected again
				 			}
				 			$P.getJSON('./php/save_numericalAns.php',
				 				function(jsonData) {},
			 						{
			 						type: 'POST',
						    		data: {
										node: ansIDs
										}
			 						}
			 			 		);

				 		}

			},
			graphSize: function() {
				return this.fNodes.length;
			},
			loadOriginalNodes: function(i){
				var fNodes = [];
				$P.getJSON('./php/load_origNodes.php',
							function(jsonData) {
								fNodes = jsonData;

								for(var i=0; i < jsonData.length; i++)
								 {
									fNodes[i].id = parseInt(jsonData[i].id);
									fNodes[i].type = jsonData[i].type;
									fNodes[i].location = jsonData[i].location;
									fNodes[i].x = parseFloat(jsonData[i].x);
									fNodes[i].y = parseFloat(jsonData[i].y);
								 }
								},
								{
								type: 'GET',
								data: {
										index: i
									}
								}
							);
				return fNodes;
			},


			adjustNodes: function(targetN, density, targetCross, targetWithin) {
					var self = this;
						function getNodesWithin(loc, nodes)
									{
										var result = [];
										for(var i=0; i < nodes.length; i++)
										{
											if(nodes[i].location === loc)
												result.push(nodes[i].id);
										}
										return result;
									}
						function getNodeLinks(node, links)
									{
										var nodeLinks = [];
										for(var l = 0; l < links.length; l++)
										{

											if(links[l].source === node || links[l].target === node )
												nodeLinks.push(links[l]);
										}
										return nodeLinks;
									}
						function getNodeLocation(id, nodes){
										for(var n=0; n < nodes.length; n++)
										{ if(nodes[n].id === id)
											{return nodes[n].location;}
										}
								  }
						function getLabelID(id, labels){
										for(var n=0; n < labels.length; n++)
										{ if(labels[n].id === id)
											{return n;}
										}
								  }
				var deletePercent = Math.floor((self.fNodes.length - targetN)/self.fNodes.length * 100)/100;
				var crossCount = density[2];
				var locationNodes = density[3];
				var locationEdges = density[4];

				var nodesToSave = self.fNodes;
				var linksToSave = self.fLinks;
				var labelsToSave = self.fLabels;
				var locationsToSave = self.fLocations;
				var nodesToDelete = [];
				var crossD = Math.sqrt(crossCount/(nodesToSave.length * nodesToSave.length));
					console.log('Across density left = '+ crossD);

				if(crossD < targetCross)
				{
					for(var l=0; l < locationsToSave.length; l++)
					{
						var numDeleted = 0;
						var index =0;
						var nodesWithin = getNodesWithin(locationsToSave[l].id, self.fNodes);
						var number = locationNodes[locationsToSave[l].id]? locationNodes[locationsToSave[l].id].value : 0;
						while(numDeleted < (deletePercent * number) && index < nodesWithin.length && nodesWithin.length > 1)
						{
							// delete nodes that do not have crossing edges
							var node = nodesWithin[index];
							var links = getNodeLinks(node, linksToSave);
							var toDelete = true;
							for(var i=0; i < links.length; i++)
							{
								var srcLoc = getNodeLocation(links[i].source, nodesToSave);
								var dstLoc = getNodeLocation(links[i].target, nodesToSave);
								if(srcLoc !== dstLoc)
								   toDelete = false;
							}
							if(toDelete)
							{
								nodesToDelete.push(node);
								numDeleted++;
							}
							index++;

						}
						console.log('compartment '+ locationsToSave[l].id + ' will lose '+ numDeleted);
					}
				}
				else {
					for(var l=0; l < locationsToSave.length; l++)
					{
						var numDeleted = 0;
						var index =0;
						var nodesWithin = getNodesWithin(locationsToSave[l].id, nodesToSave);
						var number = locationNodes[locationsToSave[l].id]? locationNodes[locationsToSave[l].id].value : 0;
						while(numDeleted < (deletePercent * number) && index < nodesWithin.length && nodesWithin.length > 1)
						{
							// delete nodes that do not have crossing edges
							var node = nodesWithin[index];
							var links = getNodeLinks(node, linksToSave);
							var toDelete = true;
							if(toDelete)
							{
								nodesToDelete.push(node);
								numDeleted++;
							}
							index++;

						}
						console.log('Compartment '+ locationsToSave[l].id + ' will lose '+ numDeleted);
					}
				}

				console.log('Found '+ nodesToDelete.length + ' nodes to delete ');
					var diff = nodesToSave.length - targetN;
					if(nodesToDelete.length > diff)
					{
						var tempNodes = [];
						for(var i=0; i < diff; i++)
						{
							tempNodes[i] = nodesToDelete[i];
						}
						nodesToDelete = [];
						nodesToDelete = tempNodes;
					}
					else
					{
						while  (nodesToDelete.length < diff)
						{
							// select random nodes to delete
							var rand = Math.floor(Math.random() * nodesToSave.length);
							var loc = getNodeLocation(nodesToSave[rand].id, nodesToSave);
							var nodesWithin = getNodesWithin(loc, nodesToSave);
							if(nodesToDelete.indexOf(nodesToSave[rand].id) < 0 && nodesWithin.length > 1)
							{ nodesToDelete.push(nodesToSave[rand].id); }
						}

					}
					console.log('Will actually delete '+ nodesToDelete);

					// perform node deletion
					var tempNodes = [];
					var tempLabels = [];
					for(var k=0; k < nodesToSave.length; k++)
					{
						if(nodesToDelete.indexOf(nodesToSave[k].id) < 0)
							{ tempNodes.push(nodesToSave[k]);
							  var label = nodesToSave[k].id+'';
							  var labelID = getLabelID(label, labelsToSave);
							  tempLabels.push(labelsToSave[labelID]);
							}
					}
					nodesToSave = [];
					nodesToSave = tempNodes;
					labelsToSave = [];
					labelsToSave = tempLabels;

					console.log('Number of nodes left in graph = '+ nodesToSave.length);

					// delete edges
					var tempLinks = [];
					for(var l =0; l < linksToSave.length; l++)
					{
						if(nodesToDelete.indexOf(linksToSave[l].source) < 0  && nodesToDelete.indexOf(linksToSave[l].target) < 0)
							{
							  tempLinks.push(linksToSave[l]);
							 }
					}
					linksToSave = [];
					linksToSave = tempLinks;
					console.log(' Number of edges left in graph = '+ linksToSave.length);

					self.fNodes = nodesToSave;
					self.fLinks = linksToSave;
					self.fLabels = labelsToSave;

			},
			adjustEdges: function(density, targetCross, targetWithin ){
					var self = this;
					function getNodesWithin(loc, nodes)
									{
										var result = [];
										for(var i=0; i < nodes.length; i++)
										{
											if(nodes[i].location === loc)
												result.push(nodes[i].id);
										}
										return result;
									}
					function getAvgWithin(withinD)
									{
										var avg =0;
										for(var i=0; i < withinD.length; i++)
											{ avg += withinD[i];}
										return (avg/withinD.length);
									}
					function getNodeLocation(id, nodes){
										for(var n=0; n < nodes.length; n++)
										{ if(nodes[n].id === id)
											{return nodes[n].location;}
										}
								  }
					function getNodesNearby(node, nodes, range)
								{
									var result = [];
									for(var i =0; i < nodes.length; i++)
									{
										var n = getNodeById(node, nodes);
										var difX = nodes[i].x - n.x;
										var difY = nodes[i].y - n.y;
										var dist = Math.sqrt(difX * difX + difY * difY);
										if(dist <= range)
											result.push(nodes[i].id);
									}
									return result;
								}

				function getCrossNodesNearby(root, nodes, range)
								{
									var result = [];
									for(var i =0; i < nodes.length; i++)
									{
										var n = getNodeById(root, nodes);
										var difX = nodes[i].x - n.x;
										var difY = nodes[i].y - n.y;
										var dist = Math.sqrt(difX * difX + difY * difY);

										if(dist <= range &&  (n.location !== nodes[i].location))
											result.push(nodes[i].id);
									}
									return result;

								}

				function getLinksWithin(loc)
								{
									var result = [];
									for(var i =0; i < linksToSave.length; i++)
									{
										 var srcLoc = getNodeLocation(linksToSave[i].source, nodesToSave);
										 var dstLoc = getNodeLocation(linksToSave[i].target, nodesToSave);
										 if((srcLoc === loc) && (dstLoc === loc))
											{result.push(linksToSave[i]);}
									}
									return result;
								}

				function getNodeById(node, nodes)
						{
							for(var n=0; n < nodesToSave.length; n++)
							{
								if(nodesToSave[n].id === node)
								{
									return nodesToSave[n];
								 }
							}
						}
				function isNewLink(id1, id2)
						{
							if(!id1 || !id2) return false;
							for(var i =0; i < linksToSave.length; i++)
							{
								var link = linksToSave[i];
								if(link.target === id1 && link.source === id2) return false;
								if(link.target === id2 && link.source === id1) return false;
							}
							return true;
						}
				function linkToKeep(link, badLinks)
								{
									for(var i=0; i < badLinks.length; i++)
									{
										if( ((badLinks[i].source === link.source) && ( badLinks[i].target === link.target)) )
											return false;
									}
									return true;
								}
				function modifyGraph2(keepPercent, nodes, links, locations)
				{

			 		 	self.delNodes = [];
						self.delAtGraph = [];
						self.delLinks = [];
						self.delLinkAtGraph = [];
						var root = Math.floor(Math.random() * nodes.length);

						var toKeep = [];

						while(toKeep.length < (keepPercent * nodes.length))
						{
							root = Math.floor(Math.random() * nodes.length);
							var set = self.getDownstreamNodes(root, 6, links, nodes); // keep this group of nodes intact
							set.forEach(function(el){
								if(toKeep.indexOf(el) < 0)
									toKeep.push(el);
							   });
						}

						// get candidate nodes for modification
						var candids = [];
						for(var i=0; i < nodes.length; i++)
						{
						 if(toKeep.indexOf(i) < 0 )
						 	{
						 	  candids.push(i);
						 	}
						}
						// delete

						//var numToDelete = (targetN === 20)? 1 : ((targetN === 50)? 2 : 4);
						var numToDelete = 2 + Math.floor(Math.random() * 2);   // 2 or 3 for medium graphs
						var maxToDelete = (nodes.length === 20)? 1 : ((nodes.length === 50)? 2 : 4);  // sets maximum for task 2
						//var maxToDelete = Math.floor(Math.random() * 4);  // sets maximum for task 3
						var deleted = 0;
						for(var i = 0; i < locations.length; i++)
						{
						 	 var nodesToModify = [];
						 	 //if(deleted >= maxToDelete) break;
						 	 for(var n = 0; n < nodes.length; n++)
						 	 {
						 	 	if(nodes[n].location === locations[i].id)
						 	 	  nodesToModify.push(nodes[n].id);
						 	 }
							for(var j =0; j < numToDelete; j++)
							{
								var index = Math.floor(Math.random() * nodesToModify.length);
								var n = getNodeById(nodesToModify[index]);
								console.log('n.x '+n.x);
								if(self.delNodes.indexOf(nodesToModify[index]) < 0 && (nodesToModify.length > 2))
								   {
								   	self.delNodes.push(nodesToModify[index]);
								   	index = Math.floor(Math.random() * 2 + 1 )  ;
			 						self.delAtGraph.push(index);
			 						deleted++;
								   }
							}
						}

						if(self.delNodes.length === 0)
						   {self.delNodes.push(nodes[0].id);
						    self.delAtGraph.push(1);
						   }


						console.log(self.delNodes);
						for(var i=0; i < 1; i++)
						{
							var index = Math.floor(Math.random() * (links.length-1));
							var srcId = (links[index].source > 0)? links[index].source-1 : 0;
			 				var dstId = (links[index].target > 0)? links[index].target-1 : 0;
			 				if(candids.indexOf(srcId) >= 0 && candids.indexOf(dstId) >= 0 && self.delNodes.indexOf(srcId) < 0 && self.delNodes.indexOf(dstId) < 0 )
			 				{
			 					var link = 'entity:entity:'+links[index].source+':'+links[index].target;
								self.delLinks.push(link);
								// toss a coin
								var g = Math.floor(Math.random() * 2+ 1)  ;
			 					self.delLinkAtGraph.push(g);
			 					console.log('deleting link ' + links[index].source + ' --> ' + links[index].target + ' from graph ' + g);
			 				}
						}
						if(self.delLinks.length === 0)  // catch to prevent empty list
							{
								var link = 'entity:entity:'+links[0].source+':'+links[0].target;
								self.delLinks.push(link);
								// toss a coin
								var g = Math.floor(Math.random() * 2+ 1)  ;
			 					self.delLinkAtGraph.push(g);
							}
				} // end function modifyGraph2()

					var crossTarget = targetCross * targetCross * self.fNodes.length * self.fNodes.length;
					var range = 80;
					var crossCount = density[2];
					var locationNodes = density[3];
					var locationEdges = density[4];

					var nodesToSave = self.fNodes;
					var linksToSave = self.fLinks;
					//var labelsToSave = self.fLabels;
					var locationsToSave = self.fLocations;

					// cleanup compartments
					var tempLocs = [];
					for(var i =0; i < locationsToSave.length; i++)
					{
					  var nodes = getNodesWithin(locationsToSave[i].id, nodesToSave);
					  if(nodes.length > 0)
					    tempLocs.push(locationsToSave[i]);
					}
					locationsToSave = [];
					locationsToSave = tempLocs;

					while(crossCount < crossTarget)
					{
						// pick a random compartment
						var compID = Math.floor(Math.random() * locationsToSave.length);
						var comp = locationsToSave[compID];

						// pick a random node in the compartment
						var nodes = getNodesWithin(comp.id, nodesToSave);
						var id = Math.floor(Math.random() * nodes.length);

						var root = nodes[id];

						var found = false;
						var neighbors = getCrossNodesNearby(root, nodesToSave, range);

						// find nearby nodes from other compartments
						if(neighbors.length > 0) {
										// pick a random neighbor
										var index = Math.floor(Math.random() * neighbors.length);
										// insert edge here
										var link = {target: neighbors[index], source: root };
										if(isNewLink(link.source, link.target))
										{
											linksToSave.push(link);
											crossCount++;
											found = true;
										}
									}
									if(!found)
										{range += 20; }
					}

					var linksToDelete = [];
					while(crossCount > crossTarget)
					{
						// pick a random link
						var linkID = Math.floor(Math.random() * linksToSave.length);
						var srcLoc = getNodeLocation(linksToSave[linkID].source, nodesToSave);
						var dstLoc = getNodeLocation(linksToSave[linkID].target, nodesToSave);
						if(srcLoc !== dstLoc)
						{
							linksToDelete.push(linkID);
							crossCount--;
						}
					}

					var tempLinks = [];
					for(var i =0; i < linksToSave.length; i++)
					{
						if(linksToDelete.indexOf(i) < 0)
						   tempLinks.push(linksToSave[i]);
					}
					linksToSave = [];
					linksToSave = tempLinks;


					// now recalculate the density information after adjusting cross density
					var den = self.getDensityInfo();
					 crossCount = density[2];
					 locationNodes = density[3];
					 locationEdges = density[4];

					 // density within each compartment
					var withinD = [];
					var withinDnew = [];

					for(var l=0; l < locationsToSave.length; l++)
					{
						console.log('Compartment: '+ locationsToSave[l].id);
						// number of nodes in this compartment
						var numNodes = locationNodes[locationsToSave[l].id]? locationNodes[locationsToSave[l].id].value: 0;
						// number of edges within this compartment
						var numEdges = locationEdges[locationsToSave[l].id]? locationEdges[locationsToSave[l].id].value: 0;

						console.log('Nodes within left: '+ numNodes);
						console.log('Edges within left: '+ numEdges);

						var dWithin = Math.sqrt(numEdges/(numNodes*numNodes));
						console.log('density within after node deletion: '+ dWithin);
						withinD[l] = dWithin;
						withinDnew[l] = dWithin;

					}

					var avgWithin = getAvgWithin(withinD);
					console.log('Average within density before edge adjustment = '+ avgWithin);

					for(var l=0; l < locationsToSave.length; l++)
					{
						// number of nodes in this compartment
						var numNodes = locationNodes[locationsToSave[l].id]?locationNodes[locationsToSave[l].id].value: 0;
						// number of edges within this compartment
						var numEdges = locationEdges[locationsToSave[l].id]? locationEdges[locationsToSave[l].id].value: 0;

						var targetWithinCount = Math.floor( targetWithin * targetWithin * numNodes * numNodes);
						var dWithinTarget = Math.sqrt(targetWithin/(numNodes*numNodes));

						withinDnew[l] = dWithinTarget;

						var avgTarget = getAvgWithin(withinDnew);

						var stepAway = Math.abs(avgWithin - targetWithin);
						var stepAwayTarget = Math.abs(avgTarget - targetWithin);

						console.log('Compartment: '+ locationsToSave[l].id);
						console.log(withinD);
						console.log(withinDnew);
						console.log(avgWithin);
						console.log(avgTarget);


						// only adjust if adjusting this compartment's edges will bring the average closer to the target
						if(stepAwayTarget < stepAway)
						{

							console.log(' Will adjust edges');
							if(numEdges < targetWithinCount)
							{
								console.log('must increase '+numEdges+ ' to ' + targetWithinCount);
								// get nodes in location
								var nodes = getNodesWithin(locationsToSave[l].id, nodesToSave);
								var range = 20;
								var found = false;
								while(numEdges < targetWithinCount)
								{
									// pick a random node
									var root = Math.floor(Math.random() * nodes.length);
									// find nearby nodes
									var neighbors = getNodesNearby(nodes[root], nodesToSave, range);
									if(neighbors) {
										// pick a random neighbor
										var index = Math.floor(Math.random() * neighbors.length);
										// insert edge here
										var link = {target: neighbors[index], source: nodes[root] };
										if(isNewLink(link.source, link.target))
										{
											linksToSave.push(link);
											numEdges++;
											found = true;
										}
									}
									if(!found)
										{range += 10; }
								}

								console.log('Now we have '+ numEdges + ' here');
								console.log(' Current total edges in graph = '+ linksToSave.length);
							}
							else
							{
								console.log('must decrease '+numEdges+ ' to ' + targetWithinCount);
								var links = getLinksWithin(locationsToSave[l].id);
								var tempLinks = [];
								var badLinks = [];
								var badLinkIDs = [];
								while(numEdges > targetWithinCount)
								{
									// pick a random link to remove
									var index = Math.floor(Math.random() * links.length);
									if(badLinkIDs.indexOf(index) < 0)
									{
										badLinkIDs.push(index);
										badLinks.push(links[index]);
										numEdges--;
									}
								}

								console.log(' Now we have '+ numEdges + ' here');

								for(var i=0; i < linksToSave.length; i++)
								{
									if(linkToKeep(linksToSave[i], badLinks))
									{
										tempLinks.push(linksToSave[i]);

									}
								}
								linksToSave = [];
								linksToSave = tempLinks;
								console.log(' and now we have total edges: '+ linksToSave.length);

							}
							// Within density after updating numEdges
							dWithin = Math.sqrt(numEdges/(numNodes*numNodes));
							console.log('density within after edge adjustment: '+ dWithin);
							withinD[l] = dWithin;

							//avgWithin += dWithin;
						}
					}

					avgWithin = getAvgWithin(withinD);
					console.log('Average within density left = '+ avgWithin);

					var crossD = Math.sqrt(crossCount/(nodesToSave.length * nodesToSave.length));
					console.log('Across density left = '+ crossD);

					self.fNodes = nodesToSave;
					self.fLinks = linksToSave;
					self.fLocations = locationsToSave;

					modifyGraph2(0.3, nodesToSave, linksToSave, locationsToSave);


			},
			genGraph: function(targetN, targetWithin, targetCross ) {
				var self = this;
				var fNodes = [];
				var graphID;
				console.log('Generating medium graph..');
				// find a medium graph
				var start = 150;
				for(var i =start; i < 247; i++)
				{
					fNodes = self.loadOriginalNodes(i);
					if(fNodes.length > targetN && fNodes.length < (3 * targetN))
					  {
					  	graphID = i;
					  	break;
					  }
				}
				console.log('found graph: '+ graphID + ' has ' + fNodes.length);
				self.loadRandData(graphID, './Original/graph-data', true);
				console.log('Number of nodes: '+ self.fNodes.length);
				console.log('Number of links: '+ self.fLinks.length);
				console.log('Number of compartments: '+ self.fLocations.length);
				
				//self.anonymizeLabels();
				var den = self.getDensityInfo();
				console.log('Number of crossings before node removal: ' + den[2]);

				if(self.fNodes.length > targetN )
				 	self.adjustNodes(targetN, den, targetCross, targetWithin);

				den = self.getDensityInfo();
				console.log('Number of crossings after node removal: ' + den[2]);
				var locationNodes = den[3];
				self.adjustEdges(den, targetCross, targetWithin);
				
				self.saveNewGraph(locationNodes);
			},
			anonymizeLabels(){
				var self = this;
				function genAlphabet()
				{
					var ascii = '';
					// String of all possible ascii characters
					for(var i = 65; i <= 90; i++)
					{
						ascii += String.fromCharCode( i );
					}
					return ascii;
				}
				function genPool(ascii, numL)
				{
					var pool = [];
					for(var i =0; i < numL; i++)
					{
						var newChar = ascii.charAt(Math.floor(Math.random() * ascii.length));
						while(pool.indexOf(newChar) >= 0)
						{
							newChar = ascii.charAt(Math.floor(Math.random() * ascii.length));
						}
						pool[i] = newChar;
					}
					return pool;
				}
				var alphabet = genAlphabet();
				var possible = genPool(alphabet, self.fLocations.length);
				var mapLocations = {};
				var mapNodes = {};
				
				for(var i =0; i < self.fLocations.length; i++)
				{
					var newLoc = possible[i];
					mapLocations[self.fLocations[i].id] = newLoc;
					self.fLocations[i].id = newLoc;
				}
				for(var i=0; i < self.fNodes.length; i++)
				{
					var id = i+1; 
					mapNodes[self.fNodes[i].id] = i + 1; 
					self.fNodes[i].id = i+1;
					self.fNodes[i].location = mapLocations[self.fNodes[i].location];
					self.fLabels[i].id = ''+ id;

				}
				// cleanup fLabels
				var tempLabels = [];
				if(self.fLabels.length > self.fNodes.length)
				{
					for(var i =0; i < self.fNodes.length; i++)
					{
						tempLabels.push(self.fLabels[i]);
					}
					self.fLabels = tempLabels;
				}

				for(var i = 0; i < self.fLinks.length; i++)
				{
					self.fLinks[i].source = mapNodes[self.fLinks[i].source];
					self.fLinks[i].target = mapNodes[self.fLinks[i].target];
				} 
			},
			saveMetaFile: function(){
				var self = this;
				console.log('Creating meta file..');
				var fNodes = [];
				var smallID = [];
				var mediumID = [];
				var largeID = [];
				var small = [];
				var medium = [];
				var large = [];
				for(var i=0; i < 247; i++ )
				{
				 console.log('Graph ID:'+ i);
				 fNodes = self.loadOriginalNodes(i);
			 	 console.log('size = '+ fNodes.length);
			 	 if(fNodes.length < 50) {
			 	    	small.push(fNodes.length);
			 	    	smallID.push(i);
			 	    }
			 	 else if(fNodes.length < 200)
			 	   {
			 	   		medium.push(fNodes.length);
			 	    	mediumID.push(i);
			 	   }
			 	 else{
			 	   		large.push(fNodes.length);
			 	    	largeID.push(i);
			 	   }
				}

				console.log('Number of smalls = '+ small.length);
				console.log('Number of mediums = '+ medium.length);
				console.log('Number of larges = '+ large.length);
				var sCount = 0;
				var mCount = 0;
				var lCount = 0;
				for(var i =0; i < 108; i += 3)
				{
					// pick a small graph
					var sg = smallID[sCount];

					 $P.getJSON('./php/copy_files.php',
			 			function(jsonData) {},
			 				{
			 				type: 'GET',
						    data: {
						    		src: sg,
									dst: i
								}
			 				}
			 			);
					sCount = (sCount+1)%smallID.length;


					// pick a medium graph
					var mg = mediumID[mCount];

					 $P.getJSON('./php/copy_files.php',
			 			function(jsonData) {},
			 				{
			 				type: 'GET',
						    data: {
						    		src: mg,
									dst: i+1
								}
			 				}
			 			);
					mCount = (mCount+1)%mediumID.length;

					// pick a large graph
					var lg = largeID[lCount];

					 $P.getJSON('./php/copy_files.php',
			 			function(jsonData) {},
			 				{
			 				type: 'GET',
						    data: {
						    		src: lg,
									dst: i+2
								}
			 				}
			 			);
					mCount = (mCount+1)%largeID.length;


				}
			},

			saveAnswerFile: function() {
				var self = this; 
				console.log('creating answer file...');

				for(var i =0; i < 36; i++)
				{
				console.log('Graph ID:'+ i);
					var ans = [];
					var mod = i%9; 

					var ansLength = (mod < 3)? 1 : ((mod >= 3 && mod < 6 ) ? 2 : 4); 
					$P.getJSON('./php/load_graphAnswer.php',
			 			function(jsonData) {
							var index = 0; 
							for(var j = 0; j < jsonData.length; j++)
							 {
							 	ans.push(jsonData[j]);
							 }
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: i
								}
			 				}
			 			);
					console.log(ans);
					var answer = {};
					answer[i] = ans;
					console.log(answer); 

					$P.getJSON('./php/save_correct_answers.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								data: answer
								}
			 				}
			 			 );


				}

				/*for(var i =36; i < 72; i++)
				{
					console.log('Graph ID:'+ i);
					var ans = [];
					$P.getJSON('./php/load_delNodes.php',
			 			function(jsonData) {
							var index = 0; 
							for(var j = 0; j < jsonData.length; j++)
							 {
							 	ans[index] = jsonData[j];
							 	index++;
							 }
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: i
								}
			 				}
			 			);
					console.log(ans);
					var answer = {};
					answer[i] = ans;
					console.log(answer); 

					$P.getJSON('./php/save_correct_answers.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								data: answer
								}
			 				}
			 			 );


				}*/

				//for(var i =72; i < 108; i++)
				for(var i =36; i < 72; i++)
				{
					console.log('Graph ID:'+ i);
					var ans = [];
					$P.getJSON('./php/load_delNodes.php',
			 			function(jsonData) {
							var index = 0; 
							for(var j = 0; j < jsonData.length; j++)
							 {
							 	ans[j] = jsonData[j];
							 	//index++;
							 }
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: i
								}
			 				}
			 			);
					
					//var ansl = (ans.length < 2)? "1" : "2" ; 
					var ansl = ans.length;
					if(ansl === 1 && ans[0] === '500')
						ansl = 0;
					var answer = {};
					answer[i] = ansl; 
					console.log(answer); 
					$P.getJSON('./php/save_correct_answers.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								data: answer
								}
			 				}
			 			 );
				}
				for(var i = 203; i < 209; i++)
				{
					console.log('Graph ID:'+ i);
					var ans = [];
					var ansLength;
					if( i === 203 || i === 204)
						ansLength = 1;
					else if (i === 204 || 205)
						ansLength = 2;
					else if (i === 207)
						ansLength = 4;

					$P.getJSON('./php/load_graphAnswer.php',
			 			function(jsonData) {
							var index = 0; 
							for(var j = 0; j < jsonData.length; j++)
							 {
							 	ans[j] = jsonData[j];
							 }
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: i
								}
			 				}
			 			);
					console.log(ans);
					var answer = {};
					answer[i] = ans;
					console.log(answer); 

					$P.getJSON('./php/save_correct_answers.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								data: answer
								}
			 				}
			 			 );
				}

				/*for(var i =209; i < 215; i++)
				{
					console.log('Graph ID:'+ i);
					var ans = [];
					$P.getJSON('./php/load_delNodes.php',
			 			function(jsonData) {
							var index = 0; 
							for(var j = 0; j < jsonData.length; j++)
							 {
							 	ans[index] = jsonData[j];
							 	index++;
							 }
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: i
								}
			 				}
			 			);
					console.log(ans);
					var answer = {};
					answer[i] = ans;
					console.log(answer); 

					$P.getJSON('./php/save_correct_answers.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								data: answer
								}
			 				}
			 			 );


				}*/

			//for(var i =215; i < 221; i++)
			for(var i =209; i < 215; i++)
				{
					console.log('Graph ID:'+ i);
					var ans = [];
					$P.getJSON('./php/load_delNodes.php',
			 			function(jsonData) {
							var index = 0; 
							for(var j = 0; j < jsonData.length; j++)
							 {
							 	ans[index] = jsonData[j];
							 	index++;
							 }
			 				},
			 				{
			 				type: 'GET',
						    data: {
									index: i
								}
			 				}
			 			);
					
					var ansl = (ans.length < 2)? "1" : "2" ; 
					var answer = {};
					answer[i] = ansl; 
					console.log(answer); 
					$P.getJSON('./php/save_correct_answers.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
								data: answer
								}
			 				}
			 			 );
				}

			},
			saveData: function(index)
			{
				var self = this;
				var nodesInGraph = self.layout.force.nodes();
				var linksInGraph = self.layout.force.links();

				
				var nodesToSave = [];
				var locationsToSave = [];
				var labelsToSave = [];
				var linksToSave = [];

				for(var i=0; i < nodesInGraph.length; i++)
				{
					 if(nodesInGraph[i].klass === 'entity')
					 {
					 		var nodeToSave = {
									"id" : nodesInGraph[i].id,
									"location": nodesInGraph[i].location,
									"type": nodesInGraph[i].type,
									"graphs": nodesInGraph[i].graphs,
									"x": nodesInGraph[i].x,
									"y": nodesInGraph[i].y
									};

							nodesToSave.push(nodeToSave);

					 }
					 else if (nodesInGraph[i].klass === 'location')
					 {
					 	var locToSave = {
					 				"id": nodesInGraph[i].id,
					 				"x": nodesInGraph[i].x,
					 				"y": nodesInGraph[i].y
					 				};
					 	locationsToSave.push(locToSave);
					 }
					 else if (nodesInGraph[i].klass === 'entitylabel')
					 {
					 	var labelToSave = {
					 			"id": nodesInGraph[i].id,
					 			"x": nodesInGraph[i].x,
					 			"y": nodesInGraph[i].y
					 			};
					 	labelsToSave.push(labelToSave);

					 }

				}
				/*
				for(var i=0; i < linksInGraph.length; i++)
				{
				 if(linksInGraph[i].source.klass === 'entity' && linksInGraph[i].target.klass === 'entity')
				 	{
					var linkToSave = {
								 		"target": linksInGraph[i].target.id,
								 		"source": linksInGraph[i].source.id
									};
					linksToSave.push(linkToSave);
					}
				}*/

				linksToSave = self.graph.links; 
				
				if(nodesToSave.length > 100)
				{
					var mid = Math.floor(nodesToSave.length/2);
					var halfNodes = [];
					for(var i =0; i < mid; i++ )
				 	{
				 		halfNodes[i] = nodesToSave[i];
					}

				 //console.log(nodesToSave);
					$P.getJSON('./php/save_data_nodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
						    	id: index,
								node: halfNodes
								}
			 				}
			 			 );
					halfNodes = [];
					var length = nodesToSave.length - mid; 
					for(var i =0; i < length; i++)
					{
						halfNodes[i] = nodesToSave[mid+i];
					}
					$P.getJSON('./php/save_data_nodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
						    	id: index,
								node: halfNodes
								}
			 				}
			 			 );
				}
				else
				{
					$P.getJSON('./php/save_data_nodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
						    	id: index,
								node: nodesToSave
								}
			 				}
			 			 );

				}

				$P.getJSON('./php/save_data_locs.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
						    	id: index, 
								node: locationsToSave
								}
			 				}
			 			 );

				$P.getJSON('./php/save_data_labels.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
						    	id: index, 
								node: labelsToSave
								}
			 				}
			 			 );

			 	
			 	$P.getJSON('./php/save_data_links.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
						    	id: index,
								link: linksToSave
								}
			 				}
			 			 );
						/////////////////////////////////////
						// write deleted nodes info to files
						////////////////////////////////////
						//console.log(self.delNodes);
						//console.log(self.delAtGraph);

				 $P.getJSON('./php/save_data_delNodes.php',
			 				function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
						    	id: index, 
								node: self.delNodes
								}
			 				}
			 			 );

				 $P.getJSON('./php/save_data_delAtGraph.php',
				 			function(jsonData) {},
			 				{
			 				type: 'POST',
						    data: {
						    	id: index,
								node: self.delAtGraph
								}
			 				}
			 			 );


			},

		getXavg: function(){
			var self = this;
			var avgX = 0;
			if(self.delNodes.length === 1 && self.delNodes[0] === 500) return 0;
			var Xpos = self.getXpos(self.delNodes);
			Xpos.forEach(function(pos){
				avgX += pos;
			});
			avgX /= self.delNodes.length;
			return avgX;
		},
		saveCompStats: function() {
			var self = this;
			var erecords = [];
			var nrecords = [];
			function getNodeLocation(id, nodes){
					for(var n=0; n < nodes.length; n++)
					{
						if(nodes[n].id === id)
						{
						 	return nodes[n].location;
						 }
					}
				  }


			for(var i=0; i < 108; i++)
			{
				self.loadRandData(i, './graph-data');

				// get node information
				var locationNodes = {};
				for(var n =0; n < self.fNodes.length; n++)
				{
					var loc = self.fNodes[n].location;
					locationNodes[loc]? locationNodes[loc].value +=1 : locationNodes[loc] = {value: 1};
				}



				// get edge information

				var locationEdges = {};
				var crossingData = {};
				var withinCount =0;
				var crossCount = 0;
				for(var l=0; l < self.fLinks.length; l++)
				{
				  var srcLoc = getNodeLocation(self.fLinks[l].source, self.fNodes);
				  var dstLoc = getNodeLocation(self.fLinks[l].target, self.fNodes);
				  if(srcLoc === dstLoc)
				   {
				 	  withinCount++;
				 	  locationEdges[srcLoc]? locationEdges[srcLoc].value += 1: locationEdges[srcLoc] = {value: 1};
				   }
				  else {
				  	crossCount++;
				  	crossingData['cross']? crossingData['cross'].value += 1 : crossingData['cross'] = {value: 1};
				  	var newKey = srcLoc + ':' + dstLoc;
				  	crossingData[newKey]? crossingData[newKey].value += 1 : crossingData[newKey] = {value : 1};
				  }
				}

				if(i < 5)
				{
				 console.log(locationNodes);
				 console.log(crossingData);
				}

				var m =0;
				var n =0;
				for(var key1 in locationNodes)
				{
					m++;
					for(var key2 in locationNodes)
					{
						n++;
						if(key1 !== key2 && m < n)
						{
							var nodes1 = locationNodes[key1]? locationNodes[key1].value : 0;
							var nodes2 = locationNodes[key2]? locationNodes[key2].value : 0;
							var newKey = key1 + ':' + key2;
							var edges1 = crossingData[newKey]? crossingData[newKey].value : 0;
							var newKey2 = key2 + ':' + key1;
							var edges2 = crossingData[newKey2]? crossingData[newKey2].value : 0;

							var record = {
								id: i,
								crossName: newKey,
								edgeCount: edges1 + edges2,
								nodeCount: nodes1 + nodes2
							};
							erecords.push(record);
							$P.getJSON('./php/save_crossStats.php',
			 					function(jsonData) {},
			 					{
			 					type: 'POST',
								data: {
									nodes: record
									}
			 					});
						}
					}
					n =0;
				}

				for(var key in locationNodes)
				{
				  var record = {
				  				id: i,
				  				loc: key,
				  				nodesWithin: locationNodes[key]? locationNodes[key].value : 0,
				  				edgesWithin: locationEdges[key]? locationEdges[key].value : 0,
				  				totalN: self.fNodes.length,
				  				totalE: self.fLinks.length
				  			};
				  	nrecords.push(record);

				  	$P.getJSON('./php/save_withinStats.php',
			 		function(jsonData) {},
			 		{
			 			type: 'POST',
						data: {
							nodes: record
								}
			 		});
				}

			}








		},
		 modifyGraph: function(keepPercent, links)
			 		{
			 			var self = this;
			 		 	var numGs = self.graphs.length+1;
			 		 	self.delNodes = [];
						self.delAtGraph = [];
						self.delLinks = [];
						self.delLinkAtGraph = [];
						var root = Math.floor(Math.random() * self.N);

					if(self.generate1 || self.generate2 || this.generate3)
						{var toKeep = [];

						while(toKeep.length < (keepPercent * self.N))
						{
							root = Math.floor(Math.random() * self.N);
							var set = self.getDownstreamNodes(root, 6); // keep this group of nodes intact	
							set.forEach(function(el){
								if(toKeep.indexOf(el) < 0)
									toKeep.push(el);
							   });
						}
						
						// get candidate nodes for modification
						var candids = [];
						for(var i=0; i < self.N; i++)
						{
						 if(toKeep.indexOf(i) < 0 )
						 	{
						 		candids.push(i);
						 	}
						}
						// delete
						
						var numToDelete = (self.N === 20)? 1 : ((self.N === 50)? 2 : 4);
						//var maxToDelete = (self.N === 20)? 1 : ((self.N === 50)? 2 : 4);  // sets maximum for task 2
						var maxToDelete = Math.floor(Math.random() * 4);  // sets maximum for task 3
						var deleted = 0; 
						for(var i = 0; i < self.possible.length; i++)
						{
						 	 var nodes = [];
						 	 if(deleted >= maxToDelete) break; 
						 	 for(var n = 0; n < self.graph.nodes.length; n++)
						 	 {
						 	 	if(self.graph.nodes[n].location === self.possible[i])
						 	 	  nodes.push(self.graph.nodes[n].id);
						 	 }
							for(var j =0; j < numToDelete/4; j++)
							{
								var index = Math.floor(Math.random() * nodes.length);
								if(self.delNodes.indexOf(nodes[index]) < 0)
								   {
								   	self.delNodes.push(nodes[index]);
								   	index = Math.floor(Math.random() * 2 + 1 )  ;
			 						self.delAtGraph.push(index);
			 						deleted++;
								   }
							}
						}

						/*
						for(var i=0; i < candids.length/2; i++)
						{
							// pick a random index
			 				var index = Math.floor(Math.random() * (candids.length-1));
			 				if(self.delNodes.indexOf(candids[index]) < 0)
			 				{
			 					self.delNodes.push(candids[index]);
			 					// Pick a random graph index at which this node shall exit
			 					index = Math.floor(Math.random() * 2 + 1 )  ;
			 					self.delAtGraph.push(index);
			 				}
						}*/
						
						console.log(self.delNodes);
						for(var i=0; i < links.length/4; i++)
						{
							var index = Math.floor(Math.random() * (links.length-1));
							var srcId = (links[index].source > 0)? links[index].source-1 : 0; 
			 				var dstId = (links[index].target > 0)? links[index].target-1 : 0;
			 				if(candids.indexOf(srcId) >= 0 && candids.indexOf(dstId) >= 0 && self.delNodes.indexOf(srcId) < 0 && self.delNodes.indexOf(dstId) < 0 )
			 				{
			 					var link = 'entity:entity:'+links[index].source+':'+links[index].target;
								self.delLinks.push(link);
								// toss a coin
								var g = Math.floor(Math.random() * 2+ 1)  ;
			 					self.delLinkAtGraph.push(g);	
			 					console.log('deleting link ' + links[index].source + ' --> ' + links[index].target + ' from graph ' + g);
			 				}
						}
						if(self.delLinks.length === 0)  // catch to prevent empty list 
							{
								var link = 'entity:entity:'+links[0].source+':'+links[0].target;
								self.delLinks.push(link);
								// toss a coin
								var g = Math.floor(Math.random() * 2+ 1)  ;
			 					self.delLinkAtGraph.push(g);	
							}
						}
					 else {
					  	self.delNodes = self.fdelNodes;
						self.delAtGraph = self.fdelAtGraph;
						self.delLinks = self.fDelLinks;
						self.delLinkAtGraph = self.fDelLinkAtGraph;

					 }
			 		},
			getNumLocations: function() {
				return this.fLocations.length;
			},
			getDensityInfo: function() {
				var self = this; 
				function getNodeLocation(id){
					for(var n=0; n < self.fNodes.length; n++)
					{
						if(self.fNodes[n].id === id)
						{
						 	return self.fNodes[n].location;
						 }
					}
				  }

				var locationNodes = {};
				for(var i =0; i < self.fNodes.length; i++)
				{
					var loc = self.fNodes[i].location;
					locationNodes[loc]? locationNodes[loc].value +=1 : locationNodes[loc] = {value: 1};
				}

				var locationEdges = {};
				var withinCount =0;
				var crossCount = 0;
				for(var l=0; l < self.fLinks.length; l++)
				{
				  var srcLoc = getNodeLocation(self.fLinks[l].source);
				  var dstLoc = getNodeLocation(self.fLinks[l].target);
				  if(srcLoc === dstLoc)
				   {
				 	  withinCount++;
				 	  locationEdges[srcLoc]? locationEdges[srcLoc].value += 1: locationEdges[srcLoc] = {value: 1};
				   }
				  else {
				  	crossCount++;
				  }
				}

				var nodeStr = '';
				var edgeStr = '';
				for(var key in locationNodes)
				{
					nodeStr += locationNodes[key].value + ',';
				}
				for(var key in locationNodes)
				{
					edgeStr += locationEdges[key]? locationEdges[key].value : 0; 
					edgeStr += ',';
				}
				var result = [];
				result.push(nodeStr);
				result.push(edgeStr);
				result.push(crossCount);
				result.push(locationNodes);
				result.push(locationEdges);

				return result; 

			},
			genTask1: function(gsize, rightmost){
						var self = this;

						function nodesInComp(comp) {
							var result = [];
							var nodes = [];
							var nodesInGraph = self.layout.force.nodes();
							for(var i =0; i < nodesInGraph.length; i++)
							{
								if(nodesInGraph[i].klass === 'entity')
								 	nodes.push(nodesInGraph[i]);
							}
							for(var i =0; i < nodes.length; i++)
							{
								if(nodes[i].location === comp)
								  result.push(nodes[i]);
							}
							return result;
						}

						function findMinID(array)
				 		{
				 			var min = array[0];
				 			var id = 0;
				 			for(var i =0; i < array.length; i++)
				 			{
				 				if(array[i] < min)
				 				{
				 					min = array[i];
				 					id = i;
				 				}
				 			}
				 			return id;
				 		}

				 		function findMaxID(array)
				 		{
				 			var max = array[0];
				 			var id = 0;
				 			for(var i =0; i < array.length; i++)
				 			{
				 				if(array[i] > max)
				 				{
				 					max = array[i];
				 					id = i;
				 				}
				 			}
				 			return id;
				 		}

						function getRightMostInComp(nodes, num)
						{
							var result = [];
							var xlocs = [];
							var entityIds = [];

							for(var i =0; i < nodes.length; i++ )
							{
								xlocs.push(nodes[i].x);
								entityIds.push(nodes[i].id);
							}
							for(var i =0; i < num; i++)
							{
								// find max. X
								var maxID = findMaxID(xlocs);
								result.push(entityIds[maxID]);
								xlocs[maxID] = 0;   // to make sure it won't get selected again
							}
							return result;
						}


						function getLeftMostInComp(nodes, num)
						{
							var result = [];
							var xlocs = [];
							var entityIds = [];

							for(var i =0; i < nodes.length; i++ )
							{
								xlocs.push(nodes[i].x);
								entityIds.push(nodes[i].id);
							}
							for(var i =0; i < num; i++)
							{
								// find min. X
								var minID = findMinID(xlocs);
								result.push(entityIds[minID]);
								xlocs[minID] = 100000000;   // to make sure it won't get selected again
							}
							return result;
						}

			 		 	self.delNodes = [];
						self.delAtGraph = [];
						self.delLinks = [];
						self.delLinkAtGraph = [];
						self.ansIDs = [];

						var numToDelete = (gsize === 20)? 1 : (gsize === 50? 2 : 4);
						if(self.generate1 || self.generate2 || this.generate3)
						{
						  for(var i = 0; i < self.possible.length; i++ )
							{
								// get nodes in compartment
								var nodes = nodesInComp(self.possible[i]);
								var deleted = 0;
								var candids = [];
								if(rightmost){
									// get the rightmost node(s)
								    // candids = getRightMostInComp(nodes, numToDelete);

								    // get  a random node to delete
								    for(var i =0; i < numToDelete; i++)
								    {
								    	var index = Math.floor(Math.random() * nodes.length);
								    	candids.push(nodes[index].id);
								    }

								  }
								  else{
								  	// get the leftmost node(s)
								  	candids = getLeftMostInComp(nodes, numToDelete);
								  }
								  console.log(candids);
								  candids.forEach(function(candid){
								  			self.delNodes.push(candid);
								  			// toss a coin
								  			var toss = Math.floor(Math.random() * 2 + 1);
								  			self.delAtGraph.push(toss);
								  			var link = 'entity:entity:'+candid+':'+0;
								  			self.delLinks.push(link);
								  			self.delLinkAtGraph.push(toss);
								  			if(i === (self.possible.length-1))
								  				self.ansIDs.push(candid);
								  		});
							}
						}
						else {
								self.delNodes = self.fdelNodes;
								self.delAtGraph = self.fdelAtGraph;
								self.delLinks = self.fDelLinks;
								self.delLinkAtGraph = self.fDelLinkAtGraph;
						}
			},
			nodesToDelete: function(root, g)
			 		{
			 			var self = this;
			 			var percentChange = 0.7; 
			 			var numGs = self.graphs.length+1;

			 		 if(self.generate1)
			 		  {
						//self.delNodes = [];
						//self.delAtGraph = [];

						self.delNodes.push(root);
						self.delAtGraph.push(parseInt(numGs/2));

			 			var candids = self.getDownstreamNodes(root, 10);
			 			console.log('downstream: ' + candids);
			 			//var g =  Math.floor(Math.random() *2); //Math.floor(Math.random() * (numGs/2)+ (numGs/2))  ;
			 			for(var i=0; i < candids.length-1 && self.delNodes.length < (self.N/2) ; i++)  // 50% of downstream
			 			{
			 				// pick a random index
			 				var index = i; //Math.floor(Math.random() * (candids.length-1));
			 				if(self.delNodes.indexOf(candids[index]) < 0)
			 				{
			 					self.delNodes.push(candids[index]);
			 					// Pick a random graph index at which this node shall exit		
			 					self.delAtGraph.push(g);
			 				}
			 			}
			 			
			 			/*
			 			while(self.delNodes.length < percentChange*self.N)
			 			{
			 				// at this point just remove nodes randomly
			 				var index = Math.floor(Math.random() * (self.fNodes.length-1));
			 				if(self.delNodes.indexOf(index) < 0)
			 				{
			 					var neighbors = self.getDownstreamNodes(index, 1);
			 					var g =  Math.floor(Math.random() *2); //Math.floor(Math.random() * (numGs/2)+ (numGs/2))  ;

			 					// increase probability of deleting in the same graph as neighbors		
			 					neighbors.forEach(function(n){
			 						var ind = self.delNodes.indexOf(n);
			 						if(ind >= 0)
			 							g = self.delAtGraph[ind];
			 					  });
			 					self.delNodes.push(index);
			 					self.delAtGraph.push(g);
			 				}
			 			}*/
						
						console.log(self.delNodes);
						console.log(self.delAtGraph);

						// get some stats on link counts after deleting nodes
						var deletedLinks =0; 
						for(var k = 0; k < self.fLinks.length; k++)
							{
								var srcId = (self.fLinks[k].source > 0)? self.fLinks[k].source-1 : 0; 
			 					var dstId = (self.fLinks[k].target > 0)? self.fLinks[k].target-1 : 0;
			 					var srcDel = self.delNodes.indexOf(srcId);
			 					var dstDel = self.delNodes.indexOf(dstId);
			 					var e1 = (srcDel >= 0) && ( dstDel >= 0) && (self.delAtGraph[srcDel] !== self.delAtGraph[dstDel]);  
			 					if( e1 )
			 					{
			 						deletedLinks++;
			 					}
							}
						console.log('number of lost links = ' + deletedLinks);

						}


						else
						{
						////////////////////////////////
						// Read change information from files
						///////////////////////////////
						self.delNodes = self.fdelNodes;
						self.delAtGraph = self.fdelAtGraph;
						self.delLinks = self.fDelLinks;
						self.delLinkAtGraph = self.fDelLinkAtGraph;


					//	console.log('After Write/read');
					//	console.log(self.delNodes);
					//	console.log(self.delAtGraph);
					}
			 	},
			 	getDownstreamNodes: function(nodeId, jumps)
					{
						var self = this; 
						var data = [];
						var visited = [];
						for(var i = 0; i < self.N; i++)
						{
							visited[i] = false;
						}

						function getAdjacentNodes(node)
						{
					 	var adj = [];
						 self.graph.links.forEach(
						 			function(link, linkId)
						 			{
						 				if(link.source === node || link.target === node)
						 				  adj.push(link.target);
						 			}
						 		);
						  return adj;
						}

						function dfs(node, jumps)
						{
					 	visited[node] = true;
					 	data.push(node);
					 	var neighbors = getAdjacentNodes(node);
					 	if( neighbors === 'undefined' || jumps < 1) {return;}
					 	neighbors.forEach(function(n, nId) {
					 					if(!visited[n])
					 				 		dfs(n, jumps-1);
					 				});

						}
						dfs(nodeId, jumps);
					return data;
					},
			

			addGraph: function(graph, mode, qi, NG, i, finish)
			{
				var self = this;
				self.NG = NG;
				self.i = i-1;
				if(undefined !== mode) {this.mode = mode;}
				if (undefined === graph.color)
				{
					var colors = $P.BubbleBase.nodeColors.slice(0), color, p;
					for (p in self.graphs) {
						$P.removeFromList(colors, self.graphs[p].color);}
					if (0 === colors.length) {
						graph.color = '#666';}
					else if (-1 !== colors.indexOf(graph.strokeStyle)) {
						graph.color = graph.strokeStyle;}
					else {
						graph.color = colors[0];}
				}
			 	self.layout.getNodes().forEach(function(node) {delete node.displays;});

			 	/////////////////////////////////////////////////////////////////////
			 	// Utility functions for graph modification						  //
			 	////////////////////////////////////////////////////////////////////

					
			 	function nodesToModify(root)
			 		{
			 		 	self.delNodes = [];
						self.delAtGraph = [];

						var toKeep = self.getDownstreamNodes(root, 1); // keep this group of nodes intact through the healthy samples and slightly modify it in the disease samples
						// get candidate nodes for modification
						var candids = [];
						for(var i=0; i < self.N; i++)
						{
						 if(toKeep.indexOf(i) < 0 )
						 	{
						 		candids.push(i);
						 	}
						}
						// modify 50% of the rest of the graph
						for(var i=0; i < candids.length/2; i++)
						{
							// pick a random index
			 				var index = Math.floor(Math.random() * (candids.length-1));
			 				if(self.delNodes.indexOf(candids[index]) < 0)
			 				{
			 					self.delNodes.push(candids[index]);
			 					// Pick a random graph index at which this node shall exit
			 					index = Math.floor(Math.random() * (numGs/2)+ (numGs/2))  ;
			 					self.delAtGraph.push(index);
			 				}
						}
						// modify only 10% of the nodes in the toKeep group for disease samples
						for(var i= 0; i < toKeep.length/10; i++)
						{
							// pick a random index
			 				var index = Math.floor(Math.random() * (toKeep.length-1));
			 				if(self.delNodes.indexOf(toKeep[index]) < 0)
			 				{
			 					self.delNodes.push(toKeep[index]);
			 					// Pick a random graph index at which this node shall exit
			 					index = Math.floor(Math.random() * (numGs/2)+ (numGs/2))  ;
			 					self.delAtGraph.push(index);
			 				}
						}

			 		}

				function genStructures()
				{
					// find a random division of nodes
					var divider = Math.floor(Math.random() * (self.N/2) + (self.N/2));

					// create a hub in the upper left quadrant (above divider)
					var hub = Math.floor(Math.random() * (divider-1));
					for(var i =0; i < divider; i++ )
					{
						if( i !== hub)
						{
							self.adjacency[hub][i] = 1;
						}
					}
					// generate node connectivity in the lower quadrant (below divider)
					for( var i=divider+1; i < self.N; i++)
					{
						for(var j = divider+1; j < self.N; j++)
						{
							self.adjacency[i][j] = Math.floor((Math.random() * 2)) ;			// random number between 1 and N
						}
					}

					// fix the entire adjacency matrix to prevent self links and dual links
					for(var i =0; i < self.N; i++)
					{
						self.adjacency[i][i] = 0;
						for(var j =0; j < self.N; j++) {
							if (self.adjacency[i][j] > 0)  self.adjacency[j][i] = 0;
							}
					}
					// find a random node from the upper quadrant and a random node from the lower quadrant
					var upper = Math.floor(Math.random() * (divider - 1)); 			// this can be the hub or any other node
					var lower = Math.floor(Math.random() * (self.N - divider) + divider);
					// connect them to form a bridge
					self.adjacency[upper][lower] = 1;

					// now generate the links based on the new adjacency matrix
					for(var i = 0; i < self.N; i++)
					{
						for (var j=0; j < self.N; j++)
						{
							if (self.adjacency[i][j] > 0 )
							{
							self.graph.links.push( { "target" : j,
											 		"source" : i
													});
							}
						}
					}


				}

				function genRandom()
				{
					for( var i=0; i < self.N; i++) {
						for(var j = 0; j <self.N; j++)
						{
							self.adjacency[i][j] = Math.floor((Math.random() * 2)) ;			// random toss
						}
					}
					for(var i =0; i < self.N; i++) {
						self.adjacency[i][i] = 0;
						for(var j =0; j < self.N; j++) {
							if (self.adjacency[i][j] > 0)  self.adjacency[j][i] = 0;
							}
						}

					// now generate the links based on the new adjacency matrix
					var numLinks = 0;
					for(var i = 0; i < self.N; i++)
					{
						for (var j=0; j < self.N; j++)
						{
							if (self.adjacency[i][j] > 0 && numLinks < self.maxLinks )
							{
							numLinks++;
							self.graph.links.push( { "target" : j,
											 		"source" : i
													});
							}
						}
					}

				}
				////////////////////////////////////////////////////////////////////////
				//  End of utility function definition for modifying the added graph //
				///////////////////////////////////////////////////////////////////////

			 	var numGs = self.graphs.length+1;
			 	if(graph.reload)   // when switching from one scenario to another, we will reload the base graph
			 	{
			 		self.qID = qi;
			 		numGs = 1;
			 		self.graphs = [];
			 		//self.graph.nodes = [];
			 		self.graph.links = [];
			 		self.adjacency = [];
			 		self.delNodes = [];
			 		self.delAtGraph = [];
			 		self.delLinks = [];
			 		self.delLinkAtGraph = [];

					console.log('Reload request received in content, qi ='+ qi);
					$.post('./php/track_stages.php',
						{"id": window.userID, "log": ""+qi+": Question loaded in at "+Date.now()+"\n"}
					);
			 		// initialize self.adjacency
					for(var i=0; i < self.N; i++)
						self.adjacency[i] = [];

					  console.log('Question'+ self.qID);
						//genRandom();
						if(self.qID > 300) {
							self.starLoad = true; 
							self.parent.setStarDisplay(); 
						}

						self.loadRandData(self.qID, './graph-data');
						self.modifyGraph();
						//self.genTask1(self.N, true);

					if(self.qID == 3)
					{
						console.log('Question'+ self.qID);
						//genStructures();
						self.loadRandData(self.qID,  './graph-data');
					}

					self.layout = new $P.RandForceLayout(self);
					self.layout.registerDisplayListener(self.onTick.bind(self));
					self.layout.force.gravity(0);
					self.layout.gravity = 0.03;
			 	}

				if(self.scenCount == 1 )
				{
				 	//self.nodesToDelete(self.root);
				}
				else if(self.scenCount == 2)
				{
					nodesToModify(self.root);
				}
				else if (self.scenCount == 3)
				{

				}


				// deep copy of graph components:
				graph.nodes = $.extend(true, {}, self.fNodes);
				graph.links = $.extend(true, {}, self.fLinks);
				graph.expression = $.extend( true, {}, self.graph.expression);

				if (graph.graphId > 1)
			 		{
			 			//delete graph.nodes['16'];
			 			//delete graph.nodes['15'];

			 			for(var i=0; i < 5; i++)   // modify 20% of expression data
						{
							// pick a random index
							var index = Math.floor((Math.random() * 18));
							// modify expression at that index
							if('up' === graph.expression[index])
							{
								graph.expression[index] = 'none';
							}
						else
							{
								graph.expression[index] = 'none';
							}

						}

			 		}


			 		function linksToDelete(link)
			 		{
			 		  if((link.source == self.root)||(link.target == self.root)) return true;
			 		  else return false;
			 		}

			 		function badGraphArray(idDel) {
			 			var result =[];
			 			result[0] = self.delAtGraph[idDel];
			 			if (result[0] === 0) {result[0] = 2; self.delAtGraph[idDel] = 2;   }
			 			return result;
			 		}
			 		function isLinkCrossing(linkId)
			 		{
			 			var srcId = (graph.links[linkId].source > 0)? graph.links[linkId].source-1 : 0; 
			 			var dstId = (graph.links[linkId].target > 0)? graph.links[linkId].target-1 : 0;
			 			var srcLoc = graph.nodes[srcId].location; 
			 			var dstLoc = graph.nodes[dstId].location;
			 			if(srcLoc !== dstLoc) return true;
			 			else return false; 

			 		}

			 		//var downNodes = getDownstreamNodes(self.root,3);
			 	if(self.star && self.generate2 || self.starLoad)
			 	{
			 		$.each(graph.nodes, function( entityId, entity){
										entity.klass = 'entity';
										var idDel = self.delNodes.indexOf(entity.id);
										//entity.graphs =  ( idDel >= 0 )? Array.apply(0, Array(self.delAtGraph[idDel])).map(function (x, y) { return y + 1; }): Array.apply(0, Array(numGs)).map(function (x, y) { return y + 1; }) ;
										entity.graphs =  ( idDel >= 0 )? badGraphArray(idDel): Array.apply(0, Array(numGs)).map(function (x, y) { return y + 1; }) ;
										entity.graphId = graph.graphId;
										entity.magnitudes = [entity.g1exp, entity.g2exp];
										self.layout.addNode(entity);
										} );
					$.each(graph.links, function(linkId, link){
										link.klass = 'entity:entity';
										var exitAt= numGs;
										var linkToDelete = false;
										var badGraph;

										var idDel1 = self.delNodes.indexOf(link.source);
										var idDel2 = self.delNodes.indexOf(link.target);
										var idDel3 = -1;
										if(self.delLinks)
										  idDel3 = self.delLinks.indexOf(linkId);

										if(idDel1 >= 0 && self.delAtGraph[idDel1] <= exitAt)  {
												exitAt = self.delAtGraph[idDel1];
												badGraph = badGraphArray(idDel1);
												linkToDelete = true;
												}
										else if(idDel2 >= 0 && self.delAtGraph[idDel2] <= exitAt) {
												exitAt = self.delAtGraph[idDel2];
												badGraph = badGraphArray(idDel2);
												linkToDelete = true;
												}
										else if(idDel3 >= 0 && self.delLinkAtGraph[idDel3] <= exitAt)
												{
												exitAt = self.delLinkAtGraph[idDel3];
												badGraph = badGraphArray(idDel3);
												linkToDelete = true; 
												}

										//link.graphs = (linkToDelete)? Array.apply(0, Array(exitAt)).map(function (x, y) { return y + 1; }): Array.apply(0, Array(numGs)).map(function (x, y) { return y + 1; });
										link.graphs = (linkToDelete)? badGraph : Array.apply(0, Array(numGs)).map(function (x, y) { return y + 1; });
										link.graphId = graph.graphId;
										link.crossing = false; //isLinkCrossing(linkId);
										link.generate = self.generate1 || self.generate2;
										});


			 	}
			 	else if(self.star)
			 	{
			 		$.each(graph.nodes, function( entityId, entity){
										entity.klass = 'entity';
										entity.graphId = graph.graphId;
										entity.magnitudes = [entity.g1exp, entity.g2exp];
										self.layout.addNode(entity);
										} );
					$.each(graph.links, function(linkId, link){
										link.klass = 'entity:entity';						
										//link.graphs = (sourceNode.graphs.length <= targetNode.graphs.length)? sourceNode.graphs : targetNode.graphs; 
										link.graphs = [1, 2];
										link.graphId = graph.graphId;
										});

			 	}
			 	else if(self.brain)
			 	{
			 		$.each(graph.nodes, function( entityId, entity){
										entity.klass = 'entity';
										entity.graphId = graph.graphId;
										self.layout.addNode(entity);
										} );
					$.each(graph.links, function(linkId, link){
										link.klass = 'entity:entity';
															
										link.graphId = graph.graphId;
										});

			 	}
			 	else
			 	{
					$.each(graph.nodes, function( entityId, entity){
										entity.klass = 'entity';
										var idDel = self.delNodes.indexOf(entity.id);
										//entity.graphs =  ( idDel >= 0 )? Array.apply(0, Array(self.delAtGraph[idDel])).map(function (x, y) { return y + 1; }): Array.apply(0, Array(numGs)).map(function (x, y) { return y + 1; }) ;
										entity.graphs =  ( idDel >= 0 )? badGraphArray(idDel): Array.apply(0, Array(numGs)).map(function (x, y) { return y + 1; }) ;
										entity.graphId = graph.graphId;
										entity.magnitudes = [35, 40];
										self.layout.addNode(entity);
										} );
					$.each(graph.links, function(linkId, link){
										link.klass = 'entity:entity';
										var exitAt= numGs;
										var linkToDelete = false;
										var badGraph;

										var idDel1 = self.delNodes.indexOf(link.source);
										var idDel2 = self.delNodes.indexOf(link.target);
										var idDel3 = -1;
										if(self.delLinks)
										  idDel3 = self.delLinks.indexOf(linkId);

										if(idDel1 >= 0 && self.delAtGraph[idDel1] <= exitAt)  {
												exitAt = self.delAtGraph[idDel1];
												badGraph = badGraphArray(idDel1);
												linkToDelete = true;
												}
										else if(idDel2 >= 0 && self.delAtGraph[idDel2] <= exitAt) {
												exitAt = self.delAtGraph[idDel2];
												badGraph = badGraphArray(idDel2);
												linkToDelete = true;
												}
										else if(idDel3 >= 0 && self.delLinkAtGraph[idDel3] <= exitAt)
												{
												exitAt = self.delLinkAtGraph[idDel3];
												badGraph = badGraphArray(idDel3);
												linkToDelete = true; 
												}

										//link.graphs = (linkToDelete)? Array.apply(0, Array(exitAt)).map(function (x, y) { return y + 1; }): Array.apply(0, Array(numGs)).map(function (x, y) { return y + 1; });
										link.graphs = (linkToDelete)? badGraph : Array.apply(0, Array(numGs)).map(function (x, y) { return y + 1; });
										link.graphId = graph.graphId;
										link.crossing = false; // Crossing(linkId);
										link.generate = self.generate1 || self.generate2;
										});

				}

				self.layout.addMoreLinks(graph.links);

				function onGraphDataLoaded(){
			 		$P.state.scene.record({
						type: 'graph-added',
						id: graph.id,
						name: graph.name,
						bubble: self});
					self.layout.consolidateComposite();
			 	 // if(self.generate1)
			 	     	self.layout.force.start();
			 		self.numGraphs++;
			 		//graph.graphId = self.numGraphs;
			 		self.graphs.push(graph);
					self.onGraphsChanged();
					if(finish) {finish();}
					}
				onGraphDataLoaded();
			}

        }


    );


})(PATHBUBBLES);