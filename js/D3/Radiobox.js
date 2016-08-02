(function($P) {
	'use strict';

	$P.D3.Radiobox = $P.defineClass(
		null,
		function D3Radiobox(config) {
			if (!(this instanceof D3Radiobox)) {return new D3Radiobox(config);}

			var parent = config.parentSelection || d3.select(config.parent);
			var size = config.size || 16;
			var round = config.round || 2;
			var stroke = config.stroke || 'black';
			var strokeWidth = config.strokeWidth || 1;
			var fill = config.fill || 'white';
			//this.qType = config.parentBubble.getQtype();
			//this.nodeSelection = config.parentBubble.getNodeSelection();
			this.base = parent.append('g')
				.style('pointer-events', 'all')
				.on('click', this.onClick.bind(this))
				.attr('transform', 'translate('+config.x+','+config.y+')');

			this.rect = this.base.append('rect')
				.attr('width', size).attr('height', size)
				.attr('x', -size/2).attr('y', -size/2)
				.attr('rx', round).attr('ry', round)
				.attr('stroke', stroke)
				.attr('stroke-width', strokeWidth)
				.attr('fill', fill);

			//this.rect.on('selection-change', function(e) {this.nodeSelection = 1;});

			var edge = size * 0.3;
			this.x1 = this.base.append('line')
				.attr('stroke', stroke)
				.attr('stroke-width', strokeWidth)
				.attr('x1', -edge).attr('y1', -edge)
				.attr('x2', edge).attr('y2', edge);
			this.x2 = this.base.append('line')
				.attr('stroke', stroke)
				.attr('stroke-width', strokeWidth)
				.attr('x1', -edge).attr('y1', edge)
				.attr('x2', edge).attr('y2', -edge);

			this.radioGroup = config.radioGroup;
			this.state = config.state;
			this.callback = config.callback;

			return this;},
		{

			get state() {return this._state;},
			set state(value) {
				this._state = value;
				if (this.callback) {this.callback(value);}
				if (value) {
					this.x1.attr('opacity', 1);
					this.x2.attr('opacity', 1);}
				else {
					this.x1.attr('opacity', 0);
					this.x2.attr('opacity', 0);}},

			onClick: function() {

			 	if(!this.state)
					this.state = !this.state;
				}


		});

	$P.D3.Radiobox.create = function(configCallback) {
		return function(d, i) {
			new $P.D3.Radiobox(configCallback.call(this, d, i));};};

})(PATHBUBBLES);
