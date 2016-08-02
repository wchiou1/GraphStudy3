(function($P) {
	'use strict';

	$P.D3.SoupSunEntity = $P.defineClass(
		$P.D3.Element,
		function D3SoupSunEntity(config) {
			if (!(this instanceof D3SoupSunEntity)) {return new D3SoupSunEntity(config);}
			config.elementType = 'g';
			$P.D3.Element.call(this, config);
			var self = this;

			this.datum = config.datum;
			this.graphs = config.graphs;
			self.viewID = config.view.index;

			if(this.graphs)
			{
				this.graphColors = this.graphs.map(function(graph){
					return graph.color;
					});
			}

			function set(key, normal) {
				if (undefined !== config[key]) {
					self[key] = config[key];}
				else {
					self[key] = normal;}

				if (self[key] instanceof Function) {
					self[key] = self[key].call(config.parent, config.datum, config.index);}}

			set('transform', '');
			set('stroke', 'black');
			set('fill', 'white');
			set('highlight', 'cyan');
			//set('size', 20);
			//this.size /= 20;
			//this.size = 1;
			//set('crosstalk', (config.datum.crosstalkCount || 0) > 1);
			set('crosstalk', ( 0 > 1) );
			set('highlighted', false);
			set('x', 0);
			set('y', 0);
			this.selection.attr('transform', 'translate('+this.x+','+this.y+')');

			var rad = 10; 
			var opac = 0.8; 

			if(self.graphColors)
			{
				var diminish = self.datum.graphs.indexOf(self.viewID + 1);
				if(diminish < 0)
				{
					//rad = 3; 
					//opac = 0.5; 
				}
					
			}
			this.circle = this.selection.append('circle')
				.attr('class', 'protein')
				.attr('stroke', this.stroke)
				.attr('fill', this.fill)
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', rad)
				.attr('stroke-width', 1.5)
				.attr('transform', this.transform);



			if(self.graphColors)
			{

			self.datum.graphs.forEach(function(graph, graphId) {
			 		var magnitude =  self.datum.magnitudes[graphId] * 100;   //Math.floor(Math.random()* 25 + 30);
			 		//var norm_mag = magnitude/190;
			 		//magnitude = norm_mag * 50 + 25; 
			 		var angle = Math.PI;

					var start = [ angle + Math.PI - 0.5, 0 ];
					var arc = d3.svg.arc()
                        .innerRadius(2)
                        .outerRadius(magnitude)
                        .startAngle( start[graph - 1] )
                        .endAngle( start[graph - 1] + 0.5);

             		self.selection.append('path')
                        .attr('d', arc)
                        .attr('stroke', 'white')
                        .attr('opacity',  opac)
                        .attr('fill', self.graphColors[graph-1])
                        .attr('transform', self.transform);

				});
			}
            /*
            var arc = d3.svg.arc()
                        .innerRadius(2)
                        .outerRadius(magnitude)
                        .startAngle( 5.5 )
                        .endAngle(6);

             this.selection.append('path')
                        .attr('d', arc)
                        .attr('stroke', 'white')
                        .attr('fill', self.graphColors[0])
                        .attr('transform', this.transform);

            magnitude = Math.floor(Math.random()* 25 + 30);

            var arc2 = d3.svg.arc()
                        .innerRadius(2)
                        .outerRadius(magnitude)
                        .startAngle( 0)
                        .endAngle(0.5);

             this.selection.append('path')
                        .attr('d', arc2)
                        .attr('stroke', 'white' )
                        .attr('fill', self.graphColors[1] )
                        .attr('transform', this.transform);
			*/
			if (config.collector) {
				config.collector[config.datum.layoutId] = self;}

			if (undefined === config.datum.displays) {
				config.datum.displays = [];
				config.datum.displays.__no_save__ = true;}
			config.datum.displays.push(this);

			return this;},
		{
			get searchMatch() {return this._searchMatch;},

			get crosstalk() {return this._crosstalk;},
			set crosstalk(value) {
				if (value === this._crosstalk) {return;}
				this._crosstalk = value;
				if (!value && this.crosstalkSelection) {
					this.crosstalkSelection.remove();
					this.crosstalkSelection = null;}
				if (value && !this.crosstalkSelection) {
					this.crosstalkSelection = this.selection.insert('rect', '.protein')
						.attr('class', 'crosstalk')
						.attr('stroke', this.stroke)
						.attr('fill', this.stroke)
						.attr('x', -this.size * 11)
						.attr('y', -this.size * 6)
						.attr('width', this.size * 22)
						.attr('height', this.size * 12)
						.attr('rx', this.size * 4)
						.attr('ry', this.size * 3);}},
			get highlighted() {return this._highlighted;},
			set highlighted(value) {
				if (value === this._highlighted) {return;}
				this._highlighted = value;
				if (!value && this.highlightedSelection) {
					this.highlightedSelection.remove();
					this.highlightedSelection = null;}
				if (value && !this.highlightedSelection) {
					this.highlightedSelection = this.selection.insert('rect', ':first-child')
						.attr('class', 'highlight')
						.attr('stroke', 'none')
						.attr('fill', this.highlight)
						.attr('opacity', 0.7)
						.attr('x', -this.size * (12 + value * 1.5))
						.attr('y', - this.size * (8 + value * 1.5))
						.attr('width', this.size * (24 + value * 3))
						.attr('height', this.size * (16 + value * 3))
						.attr('rx', this.size * 4)
						.attr('ry', this.size * 3);}
			}
		});
	$P.D3.SoupSunEntity.appender = $P.D3.Element.appender.bind(undefined, $P.D3.SoupSunEntity);

})(PATHBUBBLES);
