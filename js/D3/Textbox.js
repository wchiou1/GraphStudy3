(function($P) {
	'use strict';

	$P.D3.Textbox = $P.defineClass(
		null,
		function D3Textbox(config) {
			if (!(this instanceof D3Textbox)) {return new D3Textbox(config);}

			this.parent = config.parentSelection || d3.select(config.parent);
			this.width = 70;
			this.height = 25;
            this.options = [];
			var round = config.round || 2;
			var stroke = config.stroke || 'black';
			var strokeWidth = config.strokeWidth || 2;
			var fill = config.fill || 'white';
			this.base = this.parent.append('g')
				.style('pointer-events', 'all')
				.on('click', this.onClick.bind(this))
				.attr('transform', 'translate('+config.x+','+config.y+')');
            this.x = config.x - this.width/2;
            this.y = config.y - this.height/2;
			this.rect = this.base.append('rect')
				.attr('width', this.width).attr('height', this.height)
				.attr('x', -this.width/2).attr('y', -this.height/2)
				.attr('rx', round).attr('ry', round)
				.attr('stroke', stroke)
				.attr('stroke-width', strokeWidth)
				.attr('fill', fill);

            this.text =  this.base.append('text')
                            .style('font-size', '12px')
                            .attr('fill', 'grey')
                            .attr('x',  -this.width/2 + 10)
                            .attr('y',  -this.height/2 + 17 )
                            .text('Select');

            this.base.append('rect')
				.attr('width', this.height-4).attr('height', this.height-4)
				.attr('x', this.width/2- this.height+2).attr('y', -this.height/2+2)
				.attr('stroke', 'white')
				.attr('stroke-width', 0.1)
				.attr('fill', 'lightgrey');

			this.state = config.state;
			this.parentcallback = config.callback;



			return this;},
		{
			get state() {return this._state;},
			set state(value) {
				this._state = value;
				if (this.callback) {this.callback(value);}
				},
             receiveSelection: function(value) {
               //this.state = false;
                for(var i =0; i < this.options.length; i++)
                {
                    var id = this.options[i].getText();
                    if(id !== value)
                    {
                       this.options[i].deselect();
                    }
                }
                if(this.parentcallback) { this.parentcallback(value);}
                },

            giveAnswer: function(ans) {
					this.options = [];
					var y = 5;
				    this.state = true;
				    this.rect.attr('opacity', 0);
				    this.base.append('rect')
                        .attr('width', this.width).attr('height', 15*6 + 2)
                        .attr('x', -this.width/2).attr('y', -this.height/2 - 33 )
                        .attr('rx', 2).attr('ry', 2)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 3)
                        .attr('fill', 'white');

                    var length = 0;
                    for(var key in ans)
                    {
                    if(key !== 'entity:100') length++;
                    }

				    for(var i =0; i < 6; i++)
				    {
				       var item = new $P.D3.Listitem({
				          parentSelection: this.parent,
				          parentList: this,
				          text: i,
				          x:  this.x,
				          y: y,
				          state: false,
				          callback: this.callback
				       }) ;
				       y+= 15;
				       this.options.push(item);
				    }
				    this.options[length].giveAnswer();

            },
			onClick: function() {
				//this.state = !this.state;
				this.options = [];
				if(!this.state)
				{
				    var y = 5;
				    this.state = true;
				    this.rect.attr('opacity', 0);
				    this.base.append('rect')
                        .attr('width', this.width).attr('height', 15*6 + 2)
                        .attr('x', -this.width/2).attr('y', -this.height/2 - 33 )
                        .attr('rx', 2).attr('ry', 2)
                        .attr('stroke', 'black')
                        .attr('stroke-width', 3)
                        .attr('fill', 'white');

				    for(var i =0; i < 6; i++)
				    {
				       var item = new $P.D3.Listitem({
				          parentSelection: this.parent,
				          parentList: this,
				          text: i,
				          x:  this.x,
				          y: y,
				          state: false,
				          callback: this.callback
				       }) ;
				       y+= 15;
				       this.options.push(item);
				    }

				}
			}
		});

	$P.D3.Textbox.create = function(configCallback) {
		return function(d, i) {
			new $P.D3.Textbox(configCallback.call(this, d, i));};};

})(PATHBUBBLES);
