(function($P) {
	'use strict';

	$P.D3.Listitem = $P.defineClass(
		null,
		function D3Listitem(config) {
			if (!(this instanceof D3Listitem)) {return new D3Listitem(config);}

			this.parent = config.parentSelection || d3.select(config.parent);
			this.width = 70;
			this.height = 15;
			this.text = config.text;
			this.y = config.y;
			this.x = config.x;
			this.parentList = config.parentList;

			var round = config.round || 2;
			var stroke = config.stroke || 'grey';
			var strokeWidth = config.strokeWidth || 1;
			var fill = config.fill || 'white';

			this.base = this.parent.append('g')
				.attr("class", "listitem")
				.style('pointer-events', 'all')
				.on('click', this.onClick.bind(this))
				.on('mouseover', this.onMouseOver.bind(this))
				.on('mouseout', this.onMouseOut.bind(this));

			this.rect = this.base.append('rect')
				.attr('width', this.width).attr('height', this.height)
				.attr('x', this.x).attr('y', this.y)
				.attr('stroke', stroke)
				.attr('stroke-width', strokeWidth)
				.attr('fill', fill);

            this.base.append('text')
                            .style('font-size', '12px')
                            .attr('fill', 'black')
                            .attr('x', this.x + this.width/2 -2)
                            .attr('y', this.y + 12 )
                            .text(this.text);


			this.state = config.state;
			this.callback = config.parentList.callback;
			this.options = [];

			return this;},
		{
			getText: function() {
				return this.text;
			},
			deselect: function() {
				this.rect.attr('fill', 'white');
				this.state = false;
			},
			giveAnswer: function() {
				this.state = true;
				this.rect.attr('fill','cyan');
				this.rect.attr('fill-opacity', 0.9)
			    this.parentList.receiveSelection(this.text);
			},
			onMouseOver: function(){
				if(!this.state) {
					this.rect.attr('fill','cyan');
					this.rect.attr('fill-opacity', 0.2)
				}

			},
			onMouseOut: function(){
				if(!this.state) this.rect.attr('fill','white');
			},
			onClick: function() {
				//this.state = !this.state;
				if(!this.state)
				{
					this.state = true;
					this.rect.attr('fill','cyan');
					this.rect.attr('fill-opacity', 0.9)
					this.parentList.receiveSelection(this.text);
				}
			}
		});

	$P.D3.Listitem.create = function(configCallback) {
		return function(d, i) {
			new $P.D3.Listitem(configCallback.call(this, d, i));};};

})(PATHBUBBLES);
