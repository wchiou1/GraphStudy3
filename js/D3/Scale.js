(function($P) {
	'use strict';

	$P.D3.Scale = $P.defineClass(
		null,
		function D3Scale(config) {
			if (!(this instanceof D3Scale)) {return new D3Scale(config);}

			var parent = config.parentSelection || d3.select(config.parent);
			var size = config.size || 10;
			var stroke = config.stroke || '#999999';
			var strokeWidth = config.strokeWidth || 1.5;
			var fill = config.fill || 'white';
			this.enabled = false;
			this.base = parent.append('g')
				.style('pointer-events', 'all')
				.on('click', this.onClick.bind(this))
				.attr('transform', 'translate('+config.x+','+config.y+')');

			this.circle = this.base.append('circle')
				.attr('r', 10)
				.attr('cx', -size/2).attr('cy', -size/2)
				.attr('stroke', stroke)
				.attr('stroke-width', strokeWidth)
				.attr('fill', 'white');

			this.filler = this.base.append('circle')
			                .attr('r', 6)
			                .attr('cx', -size/2).attr('cy', -size/2)
            				.attr('stroke', stroke)
			            	.attr('stroke-width', strokeWidth)
				            .attr('fill', '#999999');

			this.state = config.state;
			this.callback = config.callback;
           	return this;},
		{

			get state() {return this._state;},
			set state(value) {
				this._state = value;
				if (this.callback) {this.callback(value);}
				if (value) {
					this.filler.attr('opacity', 1);
				 }
				else {
			        this.filler.attr('opacity', 0);
				}
			},
			onClick: function() {

			 	if(!this.state && this.enabled)
					this.state = !this.state;
				},
			setEnabled: function() { this.enabled = true; }


		});

	$P.D3.Scale.create = function(configCallback) {
		return function(d, i) {
			new $P.D3.Scale(configCallback.call(this, d, i));};};

})(PATHBUBBLES);
