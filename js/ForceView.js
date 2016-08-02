(function($P){

	$P.ForceView = $P.defineClass(
		null,
		function ForceView(config) {
			var self = this, defs, clipId;
			self.id = $P.ForceView.nextId++;
			clipId = 'forceview' + self.id + '_clip';

			self.index = config.index || 0;
			self.zoomStart = 0;
			self.zoomTime = 0;
			self.mousedown = false;
			self.svg = config.svg;
			if (!self.svg) {
				console.error('ForceView('+config+'): missing svg');
				return;}

			self.svg.on('mousedown', function() {
				self.mousedown = true;
			});
			self.svg.on('mouseup', function() {
				self.mousedown = false;
			});

			self.parent = config.parent || self.svg;
			self.parentBubble = config.parentBubble || null;
			self.display = config.display || null;

			self.layout = config.layout;
			if (!self.layout) {
				console.error('ForceView('+config+'): missing layout');
				return;}
			//self.layout.registerTickListener(self.onTick.bind(self));

			self.shape = config.shape;
			if (!self.shape) {
				console.error('ForceView('+config+'): missing shape');
				return;}

			defs = self.svg.select('defs');
			if (!defs) {defs = self.svg.append('defs');}
			self.clip = defs.append('svg:clipPath').attr('id', clipId);
			var zoomBase;
			self.zoom = self.shape.makeZoom(self.layout, self, zoomBase);
			self.root = self.parent.append('g')
				.attr('class', 'view')
				.attr('clip-path', 'url(#' + clipId + ')');

			self.background = self.root.append('rect')
				.attr('class', 'background')
				.attr('fill', 'none')
				.attr('stroke', 'none')
				.attr('pointer-events', 'all')
				.style('cursor', 'inherit')
				.call(self.zoom)
				.on('mousemove', function() {
					self.zoom.center(
						self.shape.getZoomCenter(self.index, d3.mouse(this)));});

			self.element = self.root.append('g');
			window.setTimeout(
				function() {
					self.onShapeChange();},
				0);},
		{
			onShapeChange: function() {
				this.background
					.attr('width', this.shape.w)
					.attr('height', this.shape.h);
				this.shape.updateClip(this);
				this.onZoom();},

			onZoomStart: function() {
				var self = this;
				self.zoomStart = Date.now();
				//console.log('zoom: ' + self.zoomTime);
				self.parentBubble.recordAction('zoom');
				//console.log('zoom event');

			},
			onZoom: function() {
			    var self = this;
				var trans = this.shape.transform(this);
				var zoomTrans = this.zoom.translate();
				var zoomScale = this.zoom.scale();

				this.element.attr('transform',
													trans
													+ 'translate(' + zoomTrans + ')'
													+ 'scale(' + zoomScale + ')');
				//this.onTick();   //  useless call that was slowing down performance-- as was discovered by profiling
				},
			onZoomEnd: function() {
				this.zoomTime += Date.now() - this.zoomStart;
				//console.log('view: ' + this.id + ', zoomTime = ' + d);
			},
			onTick: function() {
				this.element.selectAll('.node')
					.attr('transform', function(d, i) {
						return 'translate(' + d.x + ',' + d.y + ')';});

				this.element.selectAll('.link line')
					.attr('x1', function (link) {return link.source.x;})
					.attr('y1', function(link) {return link.source.y;})
					.attr('x2', function(link) {return link.target.x;})
					.attr('y2', function(link) {return link.target.y;});

				this.element.selectAll('*').each(function(d, i) {
					if (this.onTick) {this.onTick(d, i);}});
			},
			getZoomTime: function(){
				return this.zoomTime; 
			},

			delete: function() {
				this.element.remove();
				this.background.remove();}

		});

	$P.ForceView.nextId = 0;

})(PATHBUBBLES);
