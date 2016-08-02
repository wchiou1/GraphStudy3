/**
 * @author Alexander Garbarino
 * @name PathBubble_ActionButton
 */

var $P = PATHBUBBLES;

/**
 * The action performed by an action button.
 * @callback
 * @param {PATHBUBBLES.Interaction} interaction - the global interaction object
 */

/**
 * Creates a new action button.
 * @constructor
 */
$P.ActionButton = $P.defineClass(
	$P.Shape.Circle,
	function (config) {
		var base, text;

		// Copy over a base definition if specified.
		if (config.base) {base = $P.ActionButton.definitions[config.base];}
		if (!base) {base = {};}

		config.fillStyle = 'white';
		config.strokeStyle = 'black';
		$P.Shape.Circle.call(this, config);

		this.name = config.name || base.name || '';
		/** @member {Function} action - action to perform when the button is pressed */
		this.action = config.action || base.action || function(){};
		this.setHighlighted = config.setHighlighted || base.setHighlighted || function(){};

		if (undefined !== config.tooltip) {this.tooltip = config.tooltip;}

		text = config.text || '';
		if (text instanceof $P.Text) {text = text.text;}
		this.canPress = config.canPress || base.canPress || function() {return true;};
		this.text = new $P.Text({
			x: this.x,
			y: this.y - 5,
			r: 5,
			text: text,
			fontSize: config.fontSize || base.fontSize || 9,
			parent: this});
	},
	{
		clone: function() {return new $P.ActionButton(this);},
		receiveEvent: function(event) {
			if ('mousemove' === event.name && this.canPress() && this.contains(event.x, event.y)) {
				$P.state.mainCanvas.setCursor('pointer');
				return true;}
			if ('mousedown' === event.name && this.contains(event.x, event.y)) {
				return this.action($P.state.mainCanvas, event.x, event.y);};
			return false;},
		draw: function(context, scale, args) {
			if (args.noButtons) {return;}
			$P.Shape.Circle.prototype.draw.call(this, context, scale, args);}
	});

// Define a commonly used action.
$P.ActionButton.definitions = {};
// base.name is the key used to identify it.
$P.ActionButton.defineBase = function(base) {
	$P.ActionButton.definitions[base.name] = new $P.ActionButton(base);
};

/**
 * Creates a new action button.
 * @param {(string|object)} config - Either the name of a predefined
 * action button, or a parameter table for the new action button.
 */
$P.ActionButton.create = function(config) {
	if ('string' == typeof(config) || config instanceof String) {
		return $P.ActionButton.definitions[config].clone();}
	return new $P.ActionButton(config);
};

$P.ActionButton.defineBase({
	name: 'menu',
	text: 'M',
	action: function(canvas, x, y) {
		this.parent.parent.bringToFront();
		if (this.parent.menu) {
			this.parent.menu.delete();
			this.parent.menu = null;
			this.highlighted = false;}
		else {
			this.parent.createMenu();
			this.highlighted = true;}
		return true;}
});

$P.ActionButton.defineBase({
	name: 'close',
	text: 'X',
	action: function() {
		if (window.confirm('Delete bubble?')) {
			this.parent.delete();}
		return true;}
});

$P.ActionButton.defineBase({
	name: 'group',
	text: 'U',
	canPress: function() {return this.highlighted;},
	action: function(canvas, x, y) {
		if (this.parent.parent.children.length > 1) {
			this.parent.inMotion = true;
			this.parent.ungroup();
			this.parent.parent.bringToFront();
			this.parent.inMotion = false;
			canvas.beginDrag(this.parent.parent, x, y);
			return true;}
		return false;},
	setHighlighted: function(state) {
		this.highlighted = state;}
});

$P.ActionButton.defineBase({
	name: 'mirror',
	text: '||',
	action: function(canvas, x, y) {
		var bubble = this.parent,
				d3 = bubble.svg,
				pathways = $P.values(bubble.pathways),
				ids = [];
		$.each(d3.entities, function(k, entity) {
			ids.push(entity.id);
		});
		var force = new $P.MirrorForce({
			x: bubble.parent.x + bubble.parent.w + 10,
			w: 800, h: 400,
			ids: ids,
			leftPathway: pathways[0],
			rightPathway: pathways[1]
		});
		$P.state.scene.add(force);
		return true;}
});

$P.ActionButton.defineBase({
	name: 'reset',
	text: 'R',
	action: function() {
		interaction.selection[0] = this.parent;
		this.highlighted = true;;
		interaction.dragging = true;
		scene.moveObjectToFront(this.parent);
		interaction.renderer.valid = false;
	}
});
