(function($P){
	'use strict';

	$P.RandSoupForceView = $P.defineClass(
		$P.GraphForceView,
		function RandSoupForceView(config) {
			var self = this;
			self.mode = 'soup';
			self.showStar = config.showStar || false;
			$P.GraphForceView.call(self, config);
		},
		{
			getExpression: function(node) {
				if (this.graph) {
					return this.graph.expression[node.name];}
				if (this.graphs) {
					return $P.or(this.graphs, function(graph) {
						return graph.expression[node.id];});}
				return null;
				},

			getExpressionColor: function(node) {
				var expression = this.getExpression(node);
				if ('up' === expression) {return '#f00';}
				if ('down' === expression) {return '#0f0';}
				return 'white';
				},

			entityBackgrounds: function() {
				var self = this;
				var radius;
				if(self.showStar)
					radius = 20;
				else
				 	radius = (self.parentBubble.graphSize() === 20) ? 8 : (self.parentBubble.graphSize() === 50)? 11 : 12.5;

				self.entities.selectAll('.pathway-arcs').remove();
				self.entities.graphs = self.entities.append('g').attr('class', 'pathway-arcs');
				self.entities.graphs
					.selectAll('.pathway-section')
					.data(function(d, i) {
						d.pathwayArc = this;
						var graphs = self.activeGraphs(d);
						var totalGs = self.NG;
						//if (d.id == 9){console.log(d, graphs);}
						var result = [];
						if(graphs.length === 1)
						{
							graphs.forEach(function(graph) {
								var r = Object.create(graph);
								r.entity = d;
								r.angle = Math.PI * 2;
								result.push(r);});
						
						}
						/*
						graphs.forEach(function(graph) {
							var r = Object.create(graph);
							r.entity = d;
							r.angle = Math.PI * 2 / totalGs;
							result.push(r);});
						*/
						return result;
					 })
					.enter().append('path')
					.attr('d', function(d, i) {
						return (d3.svg.arc()
										.innerRadius(0)
										.outerRadius(self.nodeSize(radius))
										.startAngle(0)
										.endAngle(d.angle)) ();})
					.attr('stroke', 'white')
					.attr('opacity', 0.8)
					.attr('stroke-width', self.nodeSize(1.5))
					.attr('fill', function(d, i) {return d.color;});
					},
			onShapeChange: function() {
				var self = this;
				$P.ForceView.prototype.onShapeChange.call(self);
				if (self.label) {
					self.label.onShapeChange(self.shape);}
				if (self.labels) {
					self.labels.each(function(d, i) {
						d.manager.onShapeChange(self.shape);});}},

			makeReactionLinks: function() {
				this.reactionLinks.each($P.D3.ReactionLink.appender({view: this}));
				},

			makeEntityLinks: function() {
				var self = this;
				var app;
				if(self.star)
					app = $P.D3.StarLink.appender({view:this});
				else
				   app = $P.D3.SoupEntityLink.appender({view:this});
				this.entityEntityLinks.each(app);
			}
		});

	$P.RandSoupForceView.makeLegend = function(content, parentSelection, width, height, viewID, timeoutEvent ) {
		return $P.GraphForceView.makeLegend(content, parentSelection, width, height, viewID, timeoutEvent);};

	$P.RandSoupForceView.makeQuestionLegend = function(parentSelection, width, height, callback) {
		return $P.GraphForceView.makeQuestionLegend(parentSelection, width, height, callback);
		};
	$P.RandSoupForceView.makeDialog = function(parentSelection, myText, width, height, title, correct, content) {
		return $P.GraphForceView.makeDialog(parentSelection, myText, width, height, title, correct, content);
		};

})(PATHBUBBLES);
