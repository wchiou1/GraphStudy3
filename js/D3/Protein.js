(function($P) {
	'use strict';

	$P.D3.Protein = $P.defineClass(
		$P.D3.Element,
		function D3Protein(config) {
			if (!(this instanceof D3Protein)) {return new D3Protein(config);}
			config.elementType = 'g';
			$P.D3.Element.call(this, config);
			var self = this;

			this.datum = config.datum;
			var locColor = this.datum.location;
			self.viewID = config.viewID;
			self.N = config.graphSize;
			self.length = (self.N === 20)? 13  : (self.N === 50)? 19 : 22  ;
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
			set('lowlight', 'red');
			set('size', self.length);
			this.size /= 20;
			//set('crosstalk', (config.datum.crosstalkCount || 0) > 1);
			set('crosstalk', ( 0 > 1) );
			set('highlighted', false);
			set('lowlighted', false);
			set('x', 0);
			set('y', 0);
			this.selection.attr('transform', 'translate('+this.x+','+this.y+')');
			this.rectSelection = this.selection.append('rect')
				.attr('class', 'protein')
				.attr('stroke', this.stroke)
				.attr('fill', 'white')
				.attr('opacity', 0.9)
				.attr('x', -this.length/2 )
				.attr('y', -this.length/2 )
				.attr('width', self.length)
				.attr('height', self.length)
				.attr('rx', this.size * 4)
				.attr('ry', this.size * 3)
				.attr('transform', this.transform);

			if (config.collector) {
				config.collector[config.datum.layoutId] = self;}

			if (undefined === config.datum.displays) {
				config.datum.displays = [];
				config.datum.displays.__no_save__ = true;}
			config.datum.displays.push(this);

			return this;},
		{
			get searchMatch() {return this._searchMatch;},
			set searchMatch(value) {
				if (value === this._searchMatch) {return;}
				this._searchMatch = value;
				if (value && !this.searchSelection) {
					this.searchSelection = this.selection.insert('rect', '.protein')
						.attr('class', 'search')
						.attr('stroke', null)
						.attr('fill', 'yellow')
						.attr('opacity', 0.7)
						.attr('x', -this.size * 30)
						.attr('y', -this.size * 40)
						.attr('width', this.size * 60)
						.attr('height', this.size * 60)
						.attr('rx', this.size * 12)
						.attr('ry', this.size * 6);}
				if (!value && this.searchSelection) {
					this.searchSelection.remove();
					this.searchSelection = null;}
			},
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
			get lowlighted() {return this._lowlighted;},
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
						.attr('x', -this.length/2 - 4 - value * 1.5)
						.attr('y', - this.length/2 - 4 - value * 1.5)
						.attr('width', this.size * (this.length + 8 + value * 3))
						.attr('height', this.size * (this.length + 8  + value * 3))
						.attr('rx', this.size * 4)
						.attr('ry', this.size * 3);}
			},
			set lowlighted(value) {
				if (value === this._lowlighted) {return;}
				this._lowlighted = value;
				if (!value && this.lowlightedSelection) {
					this.lowlightedSelection.remove();
					this.lowlightedSelection = null;}
				if (value && !this.lowlightedSelection) {
					this.lowlightedSelection = this.selection.insert('rect', ':first-child')
						.attr('class', 'lowlight')
						.attr('stroke', 'none')
						.attr('fill', this.lowlight)
						.attr('opacity', 0.7)
						.attr('x', -this.size * (12 + value * 1.5))
						.attr('y', - this.size * (8 + value * 1.5))
						.attr('width', this.size * (24 + value * 3))
						.attr('height', this.size * (16 + value * 3))
						.attr('rx', this.size * 4)
						.attr('ry', this.size * 3);}
			}
		});
	$P.D3.Protein.appender = $P.D3.Element.appender.bind(undefined, $P.D3.Protein);

})(PATHBUBBLES);
