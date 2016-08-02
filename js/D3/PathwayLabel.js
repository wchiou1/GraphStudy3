(function($P) {
	'use strict';

	$P.D3.PathwayLabel = $P.defineClass(
		$P.D3.Element,
		function D3PathwayLabel(config) {
			if (!(this instanceof D3PathwayLabel)) {return new D3PathwayLabel(config);}
			config.elementType = 'g';
			$P.D3.Element.call(this, config);
			var self = this;
			self.graphSize = config.graphSize || 20;
			self.fontSize = 14; // (self.graphSize === 20)? 14 : (self.graphSize === 50)? 28 : 36;
			self.selection.classed('pathway-label', true);

			function set(key, normal) {
				if (undefined !== config[key]) {
					self[key] = config[key];}
				else {
					self[key] = normal;}

				if (self[key] instanceof Function) {
					self[key] = self[key].call(config.parent, config.datum, config.index);}}

			set('text');
			set('index');
			set('view');

			set('fontSize', self.fontSize);
			set('fontWeight', 'bold');
			set('strokeWidth', 1);
			set('fill', 'white');
			set('opacity', 0.6);
			//set('x', 0);
			//set('y', 0);
			//this.selection.attr('transform', 'translate('+this.x+','+this.y+')');
			this.selection.background = this.selection.append('rect')
				.attr('stroke', 'black')
				.attr('stroke-width', 2)
				.attr('fill', this.fill)
				.attr('opacity', 0.8);
			this.selection.text = this.selection.append('text')
				.style('font-size', this.fontSize + 'px')
				.style('font-weight', this.fontWeight)
				.style('stroke-wdith', this.strokeWidth)
				.attr('fill', 'black')
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.text(this.text);

			config.datum.manager = this;

			return this;},
		{
			onShapeChange: function(shape) {
				var center = shape.getLabelPosition(this.view, this.fontSize, this.index),
						angle = center.rotation || 0,
						font = Math.min(this.fontSize, center.length / this.text.length * 1.5);

				this.selection.attr('transform', 'translate(' + center.x + ',' + center.y + ')rotate(' + angle + ')');
				this.selection.background
					.attr('width', (center.length + 4) + 'px')
					.attr('x', (-center.length / 2 - 2) + 'px')
					.attr('height', (font + 4) + 'px')
					.attr('y', (-font / 2 - 2) + 'px');
				this.selection.text.style('font-size', font + 'px');}

		});
	$P.D3.PathwayLabel.appender = $P.D3.Element.appender.bind(undefined, $P.D3.PathwayLabel);

})(PATHBUBBLES);
