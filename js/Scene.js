(function($P){
	'use strict';

	// The top level object container.
	$P.Scene = $P.defineClass(
		null,
		function Scene() {
			this.children = [];
			/**
			 * @member {$P.HtmlObject[]} htmlObjects - List of all created html objects.
			 */
			this.htmlObjects = [];
			/**
			 * @member {$P.HtmlObject[]} disabledPointerHtmlObjects - List of html objects which have had
			 * their pointer events disabled.
			 */
			this.disabledPointerHtmlObjects = [];
			/**
			 * @member links - List of all links between objects.
			 */
			this.links = [];

			this.hints = [];

			this.logfile = 'log';
		},
		{
			pausecomp: function (ms) {
							ms += new Date().getTime();
							while (new Date() < ms){}
							},
			/**
			 * Draws the scene to a canvas.
			 * @param {CanvasRenderingContext2D} context - the canvas context
			 * @param {number} scale - a scaling constant
			 * @param {Object} args - additional arguments to pass to children
			 */
			draw: function(context, scale, args) {
				var i;
				for (i = this.children.length - 1; i >= 0; --i) {
					this.children[i].draw(context, scale, args || {});}},

			/**
			 * Draws the links to a canvas.
			 * @param {CanvasRenderingContext2D} context - the canvas context
			 * @param {number} scale - a scaling constant
			 */
			drawLinks: function(context, scale, args) {
				var i;
				for (i = this.links.length - 1; i >= 0; --i) {
					this.links[i].draw(context, scale, args || {});}},

			drawHints: function(context, scale, args) {
				var i;
				for (i = this.hints.length - 1; i >= 0; --i) {
					this.hints[i].draw(context, scale, args || {});}},

			/**
			 * Adds a link to the scene.
			 */
			addLink: function(link) {
				this.links.push(link);
				$P.state.markDirty();},

			/**
			 * Adds an object to this scene.
			 * @param {$P.Object2D} child - the added object
			 */
			add: function (child) {
				if (!(child instanceof $P.Object2D)) {
					console.error('$P.Object2D#add(', child, '): not an instance of Object2D');
					return;}
				child.removeFromParent();
				this.children.push(child);
				child.parent = this;
				child.onAdded(this);},

			/**
			 * Removes an object from the scene.
			 * @param {$P.Object2D} child - the child to remove
			 */
			remove: function (child) {
				var index = this.children.indexOf(child);
				if (-1 == index) {return;}

				child.onRemoved(this);
				this.children.splice(index, 1);
				child.parent = null;},

			/**
			 * Moves the specified child to the beginning of the children list.
			 * @param {PATHBUBBLES.Object2D} child - the child to move
			 */
			bringChildToFront: function(child) {
				var index = this.children.indexOf(child);
				if (-1 == index) {return;}
				this.children.splice(index, 1);
				this.children.splice(0, 0, child);
			},

			/**
			 * Moves the specified child to the end of the children list.
			 * @param {PATHBUBBLES.Object2D} child - the child to move
			 */
			sendChildToBack: function(child) {
				var index = this.children.indexOf(child);
				if (-1 == index) {return;}
				this.children.splice(index, 1);
				this.children.push(child);},

			/**
			 * Sends an event to every object.
			 * @see $P.Object2D#handleEvent
			 * @param {*} event - The event type. Usually a string.
			 * @param {number} x - the x coordinate
			 * @param {number} y - the y coordinate
			 * @returns {?*} - the value returned by the event handler
			 */
			sendEvent: function(event) {
				this.recordEvent(event);
				var result = $P.or(this.children, $P.method('receiveEvent', event));
				return result;},

			recordEvent: function(event) {
				if (!this.recording) {return;}
				event.timestamp = Date.now();
				event.__event = true;
				this.recording.push(event);
				if (this.recording.length > 50) {
					this.flushLog();}},

			flushLog: function() {
				var log = this.recording;
				this.recording = [];
				var text = '';
				function logger(key, value) {
					if (value instanceof $P.Object2D) {
						return {type: 'object',
										name: value.name,
										id: value.id,
										class: value.constructor && value.constructor.name};}
					if ('object' === typeof value && value.__event) {
						return value;}
					if ('object' === typeof value && !value.__event) {
						return {
							__type: 'object',
							id: value.id,
							name: value.name,
							class: value.construcor && value.constructor.name};}
					return value;}
				log.forEach(function(line) {
					text += JSON.stringify(line, logger);
					text += '\n';});
				$.ajax({
					type: 'GET',
					dataType: 'text',
					url: './php/write_log.php',
					data: {
						logfile: this.logfile,
						entry: text}});},


			record: function(event) {return this.recordEvent(event);},

			/**
			 * Removes and deletes all children.
			 */
			deleteAll: function() {
				this.children.slice(0).forEach(function(child) {child.delete();});
				this.children = [];
				this.links.slice(0).forEach(function(link) {link.delete();});
				this.links = [];},

			/**
			 * Adds an HtmlObject to the list.
			 * @param {$P.HtmlObject} object - the objcet to register.
			 */
			registerHtmlObject: function(object) {
				this.htmlObjects.push(object);},

			/**
			 * Removes an HtmlObject from the list.
			 * @param {$P.HtmlObject} object - the objcet to register.
			 */
			unregisterHtmlObject: function(object) {
				var i = this.htmlObjects.indexOf(object);
				if (-1 !== i) {this.htmlObjects.splice(i, 1);}},

			/**
			 * Disables pointer events for registered html objects.
			 */
			disableHtmlPointerEvents: function() {
				this.htmlObjects.forEach(function(object) {
					if (object.arePointerEventsEnabled()) {
						this.disabledPointerHtmlObjects.push(object);
						object.setPointerEventsEnabled(false);}}.bind(this));},

			/**
			 * Re-enables pointer events for objects which have previously been disabled.
			 */
			enableHtmlPointerEvents: function() {
				this.disabledPointerHtmlObjects.forEach(function(object) {
					if (!object.arePointerEventsEnabled()) {
						object.setPointerEventsEnabled(true);}}.bind(this));
				this.disabledPointerHtmlObjects = [];},

			/**
			 * Return the first child satisfying predicate.
			 * @param {Function} predicate
			 * @returns {?Object2D}
			 */
			findChild: function(predicate) {
				return $P.or(this.children, function(child) {
					if (predicate(child)) {return child;}
					return child.findChild(predicate);});},

			saveKeys: [
				'children',
				'links'
			],

			getPersistObject: function() {
				var persist = [], info = {bubbles: {}};
				this.children.forEach(function(child) {
					if (child.getPersistObject) {
						persist.push(child.getPersistObject(info));}});
				console.log('persist:', persist);
				return persist;},

			loadPersistObject: function(persist) {
				var self = this;
				this.deleteAll();
				persist.forEach(function(p) {
					var config = p.config;
					config.fromPersist = true;
					config.parent = self;
					var object = $P[p.class].call(null, config);
					if (object.loadPersistObject) {
						object.loadPersistObject(p);}
				});
			},

			printInfo: function() {
				console.log(this.links);
			}
		});

	$P.Scene.loader = function(load, id, data) {
		load.objects[id] = $P.state.scene;

		$P.state.scene.deleteAll();
		$P.state.scene.children = load.loadObject(data.children);
		$P.state.scene.links = load.loadObject(data.links);

		return $P.state.scene;};

})(PATHBUBBLES);
