(function($P){
	'use strict';

	$P.RandForceLayout = $P.defineClass(
		$P.ForceLayout,
		function RandForceLayout(config) {
			var self = this;
			$P.ForceLayout.call(this, config);
			this.reactionEdgeCount = 0;
			this._mode = 'none';
			this.dragNode = 'none';
			this.dragChildren = [];
			//this.nodeState = false;
			this.startAction = 0;
			this.actionTime = 0;

			this.content = config;
			this.mode = this.content.parent.mode || 'soup';
			this.drag = this.force.drag()
				.on('dragstart', function(d) {
					/*
					self.startAction = Date.now();
					this.dragNode = d;
					self.dragChildren = [];
					if(!self.content.generate1 && !self.content.generate2)
					{
						if(d.klass === 'entity')
						{
							var labelNode = self.getNode('entitylabel:'+ d.id);
							self.dragChildren.push(labelNode);
							labelNode.fixed = true;
						}
						else if (d.klass === 'location')
						{
					    d.entities.forEach(function(child){
					    	var labelNode = self.getNode('entitylabel:'+ child.id);
					    	self.dragChildren.push(child);
					    	self.dragChildren.push(labelNode);
					    	labelNode.fixed = true;
					    });
						}
					}
					*/
					d3.event.sourceEvent.stopPropagation();
					})
				.on('drag.force', function(d) {
					/*
					var shiftX = d3.event.x - d.px;
					var shiftY = d3.event.y - d.py;

					d.px = d3.event.x;
					d.py = d3.event.y;

					var scale = (d.klass === 'location')? 0.5 : 1; 

					self.dragChildren.forEach(function(child, childId) {
						
						if(child.klass === 'entity')
						{
							child.px += shiftX;
							child.py += shiftY;	
						}
						else if(child.klass === 'entitylabel')
						{
							child.px += shiftX * scale;
							child.py += shiftY * scale;	
						}

					});


					self.force.alpha(0.05);
					*/
					//self.force.tick();
					//self.force.alpha(0);
				})
				.on('dragend', function(d) {
					d.fixed = true;
					self.dragChildren.forEach(function(child) {child.fixed = true; });
					self.actionTime += Date.now() - self.startAction;
					//console.log('actionTime: ' + self.actionTime);
					});

			this.nextLocationColor = 0;


			if(config.fLocations)
			{
			 	this.locData = config.fLocations;
			}
			if(config.fLabels)
			{
				this.labelData = config.fLabels;
			}

		},
		{

			locationColors: [
				
				'#bebada',
				'#fb8072',
				'#8dd3c7',
				'#ffffb3',
				'#80b1d3',
				'#fdb462',
				'#b3de69',
				'#fccde5',
				'#d9d9d9',
				'#bc80bd',
				'#ccebc5',
				'#ffed6f',
				
				
				// old ones
				'#fdc086',
				'#ffff99',
				'#b3de69',
				'#d8b365',
				'#a6dba0',
				'#c2a5cf',
				'#018571',
				'#fccde5',
				'#666666',
				'#bc80bd',
				'#ccebc5',
				'#ffed6f',
				'#8dd3c7',
				'#ffffb3',
				'#bebada',
				'#fb8072',



				'#d9d9d9'],
			get mode() {return this._mode;},
			set mode(value) {
				if (value === this._mode) {return;}
				this._mode = value;},
			addNode: function(node, override) {
			 if(node.graphId > 1) override = 1;
				if (!$P.ForceLayout.prototype.addNode.call(this, node, override)) {return null;}  // this is where the nodes, links, nodeData, and linkData arrays get populated
				if ('entity' === node.klass) {this.onAddEntity(node);}
				if ('reaction' === node.klass) {this.onAddReaction(node);}
				if ('paper' === node.klass) {this.onAddPaper(node);}
				if ('location' === node.klass) {this.onAddLocation(node);}
				if ('entitylabel' === node.klass) {this.onAddLabel(node);}
				return node;},
			addLink: function(link, override) {
				 if(link.graphId > 1) override = 1;
				 if (!$P.ForceLayout.prototype.addLink.call(this, link, override)) {return null;}  // this is where the nodes, links, nodeData, and linkData arrays get populated
			},
			getNodeDragTime: function() {
				return this.actionTime; 
			},

			onAddEntity: function(entity) {
				var self = this, node, link;
				function nodeSize(target, d) {
					var size = 1;
					if (d.componentNodes && d.componentNodes.length) {
						size = Math.pow(d.componentNodes.length, 0.4);}
					return target * size;
					}
				entity.charge = nodeSize(-200, entity);
				if(!this.content.generate1 &&  !this.content.star)
					entity.fixed = true;
				entity.reactions = [];
				// Add label.
				var myName;
				var questionID = this.content.parent.getQid();
				/*
				if( (questionID  === 0) && entity.id === 6) {myName = 'X';}
				else if ((questionID === 1) && entity.id === 4) {myName = 'X';}
				else if ((questionID === 2) && entity.id === 3) {myName = 'X';}
				else if ((questionID === 3) && entity.id === 3) {myName = 'X';}
				else if ((questionID === 4) && entity.id === 3) {myName = 'X';}
				else if ((questionID === 5) && entity.id === 31) {myName = 'X';}
				else if ((questionID === 6) && entity.id === 132) {myName = 'X';}
				else if ((questionID === 7) && entity.id === 3) {myName = 'X';}
				else if ((questionID === 8) && entity.id === 171) {myName = 'X';}
				// Adding a similar set of constraints for the newly added half of Task 1
				else if ((questionID === 9) && entity.id === 11) {myName = 'X';}
				else if ((questionID === 10) && entity.id === 9) {myName = 'X';}
				else if ((questionID === 11) && entity.id === 3) {myName = 'X';}
				else if ((questionID === 12) && entity.id === 24) {myName = 'X';}
				else if ((questionID === 13) && entity.id === 3) {myName = 'X';}
				else if ((questionID === 14) && entity.id === 29) {myName = 'X';}
				else if ((questionID === 15) && entity.id === 44) {myName = 'X';}
				else if ((questionID === 16) && entity.id === 130) {myName = 'X';}
				else if ((questionID === 17) && entity.id === 7) {myName = 'X';}

				// begin change IDs for Task 3 ( add 18 )
				else if ((questionID === 36) && entity.id === 6) {myName = 'H';}
				else if ((questionID === 37) && entity.id === 2) {myName = 'H';}
				else if ((questionID === 38) && entity.id === 9) {myName = 'H';}
				else if ((questionID === 39) && entity.id === 24) {myName = 'H';}
				else if ((questionID === 40) && entity.id === 18) {myName = 'H';}
				else if ((questionID === 41) && entity.id === 2) {myName = 'H';}
				else if ((questionID === 42) && entity.id === 65) {myName = 'H';}
				else if ((questionID === 43) && entity.id === 42) {myName = 'H';}
				else if ((questionID === 44) && entity.id === 22) {myName = 'H';}

				// Now add a similar set of constraints for the newly added half of Task 3
				else if ((questionID === 45) && entity.id === 4) {myName = 'H';}
				else if ((questionID === 46) && entity.id === 1) {myName = 'H';}
				else if ((questionID === 47) && entity.id === 9) {myName = 'H';}
				else if ((questionID === 48) && entity.id === 24) {myName = 'H';}
				else if ((questionID === 49) && entity.id === 32) {myName = 'H';}
				else if ((questionID === 50) && entity.id === 24) {myName = 'H';}
				else if ((questionID === 51) && entity.id === 41) {myName = 'H';}
				else if ((questionID === 52) && entity.id === 45) {myName = 'H';}
				else if ((questionID === 53) && entity.id === 51) {myName = 'H';}
				// end of changes for task 3

				else if ((questionID === 101) && entity.id === 1) {myName = 'X';}
				else if ((questionID === 102) && entity.id === 47) {myName = 'X';}
				else if ((questionID === 103) && entity.id === 24) {myName = 'X';}
				else if ((questionID === 104) && entity.id === 116) {myName = 'X';}
				else if ((questionID === 105) && entity.id === 52) {myName = 'X';}
				//else if ((questionID === 106) && entity.id === 62) {myName = 'X';}
				else if ((questionID === 111) && entity.id === 2) {myName = 'H';}
				else if ((questionID === 112) && entity.id === 31) {myName = 'H';}
				else if ((questionID === 113) && entity.id === 47) {myName = 'H';}
				else if ((questionID === 114) && entity.id === 26) {myName = 'H';}
				else if ((questionID === 115) && entity.id === 1) {myName = 'H';}
				//else if ((questionID === 116) && entity.id === 48) {myName = 'H';}
				//else if ((questionID === 118) && entity.id === 27) {myName = 'H';}
				
				//else if((questionID === 12 || questionID === 13 || questionID === 14) && entity.id === 59) { myName = 'A';}
				
				else */
				{myName = entity.id;}


				node = this.addNode({
					name: myName,
					id: entity.id,
					klass: 'entitylabel',
					charge: -1});
				if (node) {
					this.addLink({
						source: entity, target: node,
						id: entity.id,
						klass: 'entity:label',
						linkDistance: 5,
						linkStrength: 2});}

				if (entity.location) {
					// Ensure Location.
					node = this.getNode('location:' + entity.location);
					if (!node) {
						var locColor = self.locationColors[self.nextLocationColor++ % self.locationColors.length];
						if('Pineal' === entity.location)
							locColor = '#386cb0';
						else if('Retina' === entity.location)
							locColor = '#f0027f'; 
						node = {
							name: entity.location,
							id: entity.location,
							klass: 'location',
							entities: [],
							color: locColor,
							gravityMultiplier: 0.8,  // 1.2
							charge: -120};   // -220
						self.addNode(node);
						// Inter-location links for positioning.
						/*
						self.getNodes('location').forEach(function(location) {
							if (node === location) {return;}
							
							self.addLink({
								source: location,
								target: node,
								linkDistance: 200,
								linkStrength: 0.01
							    });
						    });*/
					    }
					node.entities.push(entity);
					// Add link from location to entity.
					
					link = {
						source: entity, target: node,
						id: entity.id,
						klass: 'entity:location',
						linkDistance: 260,
						linkStrength: 1
						};

					this.addLink(link);

					}                   // end if(entity.location)
			},                      // end onAddEntity
			onAddLocation: function(location) {
				var self = this;
			    if(self.content)
			    {
			       self.locData = self.content.fLocations;
			    	self.locData.forEach(function(loc){
			    		if(location.id === loc.id)
			    		{
			    		 location.x = parseFloat(loc.x);
			    		 location.y = parseFloat(loc.y);
			    		 if(!self.content.generate1 && !self.content.generate2)
			    		 	location.fixed = true;
			    		}
			    	});
			    }
			},
			onAddLabel: function (label) {
			   var self = this;
			   if(self.content)
			   {
			   	self.labelData = self.content.fLabels; self.labelData.forEach(function(lab) {

			   		if(label.id === parseInt(lab.id))
			   		{
			   			label.x = parseFloat(lab.x);
			   			label.y = parseFloat(lab.y);
			   			if(!self.content.generate1 && !self.content.generate2) 
			   				label.fixed = true;
	
			   		}

			   	});
			   }
			},
            setGraphs: function(graphs, finish) {
				this.getNodes('entity').forEach(function(entity) {
					var count = entity.graphs.length;
					//graphs.forEach(function(graph) {
					//	if (entity.graphId) {++count;}});
					entity.crosstalkCount = entity.graphs.length;
					entity.gravityMultiplier = Math.max(1, (count - 1) * 3);
					});
				if (finish) {finish();}
			},

			consolidateComposite: function() {
				var self = this;
				self.getNodes('entity').forEach(function(entity) {
					var components = [];
					if (entity.components) {
						$.each(entity.components, function(component_id, component_type) {
							components.push('entity:' + component_id);});
						self.groupNodes(entity, components, false);
						self.getLinks('entity:location')
							.filter(function(link) {return link.source === entity || link.target === entity;})
							.slice(1).forEach(function(link) {self.removeLink(link.layoutId);});}
				});
			},
			addMoreLinks: function(moreLinks){
			    var self = this;
			    $.each(moreLinks, function(linkId, link){
			            var nodeS, nodeD;
			            var log2 = link.log2 || 0;
			            if (0 === link.source ) {
			            	if(1 !== link.target)
			            		nodeS = self.getNode('entity:1');
			            	else
			            		nodeS = self.getNode('entity:2');
			            	}
			            else { nodeS = self.getNode('entity:'+ link.source);}
			            if (0 === link.target ) {
			            	if(1 !== link.source)
			            		nodeD = self.getNode('entity:1');
			            	else
			            	 	nodeD = self.getNode('entity:2');
			            	}
			            else {nodeD = self.getNode('entity:'+ link.target);}
			            //console.log(nodeS);
			            //console.log(nodeD);
			            if(nodeS === nodeD) return; 
			            var cond = (nodeS.graphs.length === 1) && (nodeD.graphs.length === 1) && (nodeS.graphs[0] !== nodeD.graphs[0]);
			          if(!cond)
			            {
			           	 if(link.generate)
			            	{
			            		var reaction = {
			            		 	klass: 'reaction',
			            		 	crossing: link.crossing,
			            			layoutId: 'reaction:'+link.source+':'+link.target,
			            			entities: {input: link.source, output: link.target}
			            		};
			   					self.addNode(reaction);
			           		 }
			            else
			           		 {
			            	self.addLink({
			                	source: nodeS, target: nodeD,
			                	id: link.source+ ':'+ link.target,
			                	klass: 'entity:entity',
			                	graphs: link.graphs,
			                	graphId: link.graphId,
			                	layoutId: 'entity:entity:'+link.source+ ':'+ link.target,
			                	linkDistance: link.crossing? 40 : 40,
			                	linkStrength: link.crossing? 0.1: 0.1,
			                	log2: log2
			                });
			              	}
			        	}  // end if cond
			        });
					/*
			        self.getNodes('location').forEach(function(location)
			        	{	console.log(location);
			        		for(var i =0; i < location.entities.length; i++)
			        		{
			        			for(var j = i+1; j < location.entities.length; j++)
			        			{
			        			if(i !== j)
			        			 {
			        					self.addLink({
											source: location.entities[i],
											target: location.entities[j],
											linkDistance: 1800,
											linkStrength: 2
							    		});
			        			 }

			        			}
			        		}
			       		 });
			       		 */

			},

			onAddReaction: function(reaction) {
				var self = this;
				reaction.charge = -90;
				var toss =0;
				if (reaction.entities) {
					// Add links to entities.
					$.each(reaction.entities, function(direction, entityId) {
						var link;
						var entity = self.getNode();
						toss++;
						self.applyToNode('entity:'+entityId, function(entity) {
							var src = direction === 'input' ? entity : reaction;
							var dst = direction === 'input' ? reaction : entity;
							var srcId = (toss%2)? reaction.entities.input: reaction.entities.output;
							var dstId = (toss%2)? reaction.entities.output: reaction.entities.input;
							link = {
								layoutId: 'reaction:entity:'+srcId+':'+dstId,
								source: src,
								target: dst,
								reaction: reaction,
								entity: entity,
								klass: 'reaction:entity',
								linkDistance: reaction.crossing? 30: 30,
								linkStrength: 1,
								id: self.reactionEdgeCount++};
							self.addLink(link);

							if (!entity.reactions) {entity.reactions = [];}
							entity.reactions.push(reaction);

							// Mark as being an input or output.
							if ('output' === direction) {entity.is_output = true;}
							if ('input' === direction) {entity.is_input = true;}
						});});}
				if (reaction.papers) {
					reaction.papers.forEach(function(paper_id) {
						var node, link;
						node = self.getNode('paper:' + paper_id);
						if (!node) {
							node = {
								name: paper_id,
								id: paper_id,
								klass: 'paper',
								charge: -50,
								reactions: [reaction]};
							self.addNode(node);}
						else {
							node.reactions.push(reaction);}
						link = {
							source: reaction,
							target: node,
							klass: 'reaction:paper',
							linkDistance: 40,
							linkStrength: 0.5,
							id: self.reactionEdgeCount++};
						self.addLink(link);
					});}
			},

				/*
			consolidateReactions: function() {
				var self = this,
						reactions = this.getNodes('reaction'),
						consolidated = $P.MultiMap();
				function hash(reaction) {
					var value = [];
					Object.keys(reaction.entities).sort().forEach(function(key) {
						value.push(key);
						value.push(reaction.entities[key]);});
					return value.join('|');}
				reactions.forEach(function(reaction) {
					consolidated.add(hash(reaction), reaction);});
				consolidated.forEach(function(hash, reactions) {
					var first = reactions.splice(0, 1)[0],
							rest = reactions.map($P.getter('layoutId'));
					self.groupNodes(first, rest, false);});
			},
        */
        	
			getAdjacentNodes: function(node, jumps) {
				var self = this;
				var data = {};

				function f(node, jumpsLeft) {
					if (undefined !== data[node.layoutId] && jumpsLeft <= data[node.layoutId]) {return;}

					data[node.layoutId] = jumpsLeft;

					if (jumpsLeft <= 0) {return;}

					if ('entity' === node.klass) {
						node.reactions.forEach(function(reaction) {
							f(reaction, jumpsLeft - 1);});
						node.links.forEach(function(link){
							if(link.klass === 'entity:entity')
							 {
							 	if(link.source.id === node.id)
								 	f(link.target, jumpsLeft - 1);
							 }
						});
					}

					else if ('reaction' === node.klass) {
						Object.keys(node.entities).forEach(function(entityId) {
							f(self.getNode('entity:' + entityId), jumpsLeft - 1);});}
				}

				f(node, jumps);

				return data;}

				});

	$P.RandForceLayout.loader = function(load, id, data) {
		var config = {};
		config.size = load.loadObject(data.size);
		config.nodes = load.loadObject(data.nodes);
		config.links = load.loadObject(data.links);
		config.shape = load.loadObject(data.shape);
		config.alpha = data.alpha;

		var layout = new $P.RandForceLayout(config);

		return layout;};

})(PATHBUBBLES);
