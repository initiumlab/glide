/*!
 * Glide.js
 * Version: 2.0.0
 * Simple, lightweight and fast jQuery slider
 * Author: @jedrzejchalubek
 * Site: http://http://glide.jedrzejchalubek.com/
 * Licensed under the MIT license
 */

;(function($, window, document, undefined){
/**
 * --------------------------------
 * Glide Animation
 * --------------------------------
 * Animation functions
 * @return {Glide.Animation}
 */

var Animation = function (Glide, Core) {


	function Module() {}


	/**
	 * Make specifed animation type
	 * @return {[type]} [description]
	 */
	Module.prototype.make = function() {

		// Animation actual translate animation
		this[Glide.options.type]();
		return this;

	};


	/**
	 * After transition callback
	 * @param  {Function} callback
	 * @return {Int}
	 */
	Module.prototype.after = function(callback) {
		return setTimeout(function(){
			callback();
		}, Glide.options.animationDuration + 20);
	};


	/**
	 * Animation slider animation type
	 * @param {string} direction
	 */
	Module.prototype.slider = function () {

		var translate = (Glide.current * Glide.width) - Glide.width;

		Glide.wrapper.css({
			'transition': Core.Transition.get('all'),
			'transform': Core.Translate.set('x', translate)
		});

		if (Glide.current === 1) Core.Arrows.hide('prev');
		else if (Glide.current === Glide.length) Core.Arrows.hide('next');
		else Core.Arrows.show();

	};


	/**
	 * Animation carousel animation type
	 * @param {string} direction
	 */
	Module.prototype.carousel = function () {

		// Translate container
		var translate;

		/**
		 * The flag is set and direction is prev,
		 * so we're on the first slide
		 * and need to make offset translate
		 */
		if (Core.Run.flag && Core.Run.direction === '<') {

			// Translate is 0 (left edge of wrapper)
			translate = 0;
			// Reset flag
			Core.Run.flag = false;

			// After offset animation is done,
			this.after(function() {

				// clear transition and jump to last slide
				Glide.wrapper.css({
					'transition': Core.Transition.clear('all'),
					'transform': Core.Translate.set('x', Glide.length * Glide.width)
				});

			});

		}


		/**
		 * The flag is set and direction is next,
		 * so we're on the last slide
		 * and need to make offset translate
		 */
		else if (Core.Run.flag && Core.Run.direction === '>') {

			// Translate is euqal wrapper width with offset
			translate = (Glide.length * Glide.width) + Glide.width;
			// Reset flag
			Core.Run.flag = false;

			// After offset animation is done,
			this.after(function() {

				// Clear transition and jump to first slide
				Glide.wrapper.css({
					'transition': Core.Transition.clear('all'),
					'transform': Core.Translate.set('x', Glide.width)
				});

			});

		}


		/**
		 * While flag is not set
		 * make normal translate
		 */
		else {
			translate = (Glide.current * Glide.width);
		}

		/**
		 * Actual translate apply to wrapper
		 * overwrite transition (can be pre-cleared)
		 */
		Glide.wrapper.css({
			'transition': Core.Transition.get('all'),
			'transform': Core.Translate.set('x', translate)
		});

	};


	/**
	 * Animation slideshow animation type
	 * @param {string} direction
	 */
	Module.prototype.slideshow = function (direction) {

		Glide.slides.css({
			'transition': Core.Transition.get('opacity'),
		}).eq(Glide.current - 1).css({
			'opacity': '1'
		}).siblings().css('opacity', 0);

	};

	return new Module();

};
;/**
 * --------------------------------
 * Glide Api
 * --------------------------------
 * Plugin api module
 * @return {Glide.Api}
 */

var Api = function (Glide, Core) {

	/**
	 * Construnct modules
	 * and inject Glide and Core as dependency
	 */
	function Module() {}

	/**
	 * Api instance
	 * @return {object}
	 */
	Module.prototype.instance = function () {

		return {


			/**
			 * Get current slide index
			 * @return {int}
			 */
			current: function() {
				return Glide.current;
			},


			/**
			 * Go to specifed slide
			 * @param  {String}   distance
			 * @param  {Function} callback
			 * @return {Core.Run}
			 */
			go: function(distance, callback) {
				return Core.Run.make(distance, callback);
			},


			/**
			 * Jump without animation to specifed slide
			 * @param  {String}   distance
			 * @param  {Function} callback
			 * @return {Core.Run}
			 */
			jump: function(distance, callback) {
				// Let know that we want jumping
				Core.Transition.jumping = true;
				Core.Animation.after(function () {
					// Jumping done, take down flag
					Core.Transition.jumping = false;
				});
				return Core.Run.make(distance, callback);
			},


			/**
			 * Start autoplay
			 * @return {Core.Run}
			 */
			start: function(interval) {
				// We want running
				Core.Run.running = true;
				Glide.options.autoplay = parseInt(interval);
				return Core.Run.play();
			},


			/**
			 * Play autoplay
			 * @return {Core.Run}
			 */
			play: function(){
				return Core.Run.play();
			},


			/**
			 * Pause autoplay
			 * @return {Core.Run}
			 */
			pause: function() {
				return Core.Run.pause();
			},


			/**
			 * Destroy
			 * @return {Glide.slider}
			 */
			destroy: function() {

				Core.Events.unbind();
				Core.Touch.unbind();
				Core.Arrows.unbind();
				Core.Bullets.unbind();
				Glide.slider.removeData('glide_api');

				delete Glide.slider;
				delete Glide.wrapper;
				delete Glide.slides;
				delete Glide.width;
				delete Glide.length;

			},


			/**
			 * Refresh slider
			 * @return {Core.Run}
			 */
			refresh: function() {
				Core.Build.removeClones();
				Glide.collect();
				Glide.init();
				Core.Build.init();
			},


		};

	};

	// @return Module
	return new Module();

};
;/**
 * --------------------------------
 * Glide Arrows
 * --------------------------------
 * Arrows navigation module
 * @return {Glide.Arrows}
 */

var Arrows = function (Glide, Core) {


	function Module() {

		this.build();
		this.bind();

	}


	/**
	 * Build
	 * arrows DOM
	 */
	Module.prototype.build = function () {

		this.wrapper = Glide.slider.children('.' + Glide.options.classes.arrows);
		this.items = this.wrapper.children();

	};


	/**
	 * Hide arrow
	 */
	Module.prototype.hide = function (type) {

		return this.items.filter('.' + Glide.options.classes['arrow' + Core.Helper.capitalise(type)])
			.css({ opacity: 0, visibility: 'hidden' })
			.siblings().css({ opacity: 1, visibility: 'visible' })
			.end();

	};


	/**
	 * Show arrows
	 */
	Module.prototype.show = function () {

		return this.items.css({ opacity: 1, visibility: 'visible' });

	};


	/**
	 * Bind
	 * arrows events
	 */
	Module.prototype.bind = function () {

		return this.items.on('click.glide touchstart.glide', function(event){
			event.preventDefault();
			if (!Core.Events.disabled) {
				Core.Run.make($(this).data('glide-dir'));
			}
		});

	};


	/**
	 * Unbind
	 * arrows events
	 */
	Module.prototype.unbind = function () {
		return this.items.unbind('click.glide touchstart.glide');
	};

	return new Module();

};
;/**
 * --------------------------------
 * Glide Build
 * --------------------------------
 * Build slider DOM
 * @param {Glide} Glide
 * @param {Core} Core
 * @return {Module}
 */

var Build = function (Glide, Core) {

	function Module() {
		this.clones = [];
		this.init();
	}


	Module.prototype.init = function() {
		this[Glide.options.type]();
		this.active();
		Core.Bullets.active();
	};


	Module.prototype.removeClones = function() {
		return Glide.wrapper.find('.clone').remove();
	};


	Module.prototype.slider = function() {

		if (Glide.current === Glide.length) Core.Arrows.hide('next');
		if (Glide.current === 1) Core.Arrows.hide('prev');

		Glide.wrapper.css({
			'width': Glide.width * Glide.length,
			'transform': Core.Translate.set('x', Glide.width * (Glide.current - 1)),
		});

		Glide.slides.width(Glide.width);

	};


	Module.prototype.carousel = function() {

		var firstClone = Glide.slides.filter(':first-child')
			.clone().addClass('clone');
		var lastClone = Glide.slides.filter(':last-child')
			.clone().addClass('clone');

		Glide.wrapper
			.append(firstClone.width(Glide.width))
			.prepend(lastClone.width(Glide.width))
			.css({
				'width': (Glide.width * Glide.length) + (Glide.width * 2),
				'transform': Core.Translate.set('x', Glide.width * Glide.current),
			});

		Glide.slides.width(Glide.width);

	};


	Module.prototype.slideshow = function () {

		Glide.slides.eq(Glide.current - 1)
			.css({
				'opacity': 1,
				'z-index': 1
			})
			.siblings().css('opacity', 0);

	};


	Module.prototype.active = function () {

		Glide.slides
			.eq(Glide.current - 1).addClass('active')
			.siblings().removeClass('active');

	};

	return new Module();

};
;/**
 * --------------------------------
 * Glide Bullets
 * --------------------------------
 * Bullets navigation module
 * @return {Glide.Bullets}
 */

var Bullets = function (Glide, Core) {

	function Module() {

		this.build();
		this.bind();

	}

	/**
	 * Build
	 * bullets DOM
	 */
	Module.prototype.build = function () {

		this.wrapper = Glide.slider.children('.' + Glide.options.classes.bullets);

		for(var i = 1; i <= Glide.length; i++) {
			$('<li>', {
				'class': Glide.options.classes.bullet,
				'data-glide-dir': '=' + i
			}).appendTo(this.wrapper);
		}

		this.items = this.wrapper.children();

	};


	Module.prototype.active = function () {

		Core.Bullets.items
			.eq(Glide.current - 1).addClass('active')
			.siblings().removeClass('active');

	};


	/**
	 * Bind
	 * bullets events
	 */
	Module.prototype.bind = function () {

		this.items.on('click.glide touchstart.glide', function(event){
			event.preventDefault();
			if (!Core.Events.disabled) {
				Core.Run.make($(this).data('glide-dir'));
			}
		});

	};


	/**
	 * Unbind
	 * bullets events
	 */
	Module.prototype.unbind = function () {
		this.items.unbind('click.glide touchstart.glide');
	};


	return new Module();

};
;/**
 * --------------------------------
 * Glide Core
 * --------------------------------
 * @param {Glide} Glide	Slider Class
 * @param {array} Modules	Modules list to construct
 * @return {Module}
 */

var Core = function (Glide, Modules) {

	/**
	 * Construnct modules
	 * and inject Glide and Core as dependency
	 */
	function Module() {

		for(var module in Modules) {
			this[module] = new Modules[module](Glide, this);
		}

	}

	// @return Module
	return new Module();

};
;/**
 * --------------------------------
 * Glide Events
 * --------------------------------
 * Events functions
 * @return {Glide.Events}
 */

var Events = function (Glide, Core) {


	function Module() {
		this.disabled = false;
		this.keyboard();
		this.hoverpause();
		this.resize();
	}


	Module.prototype.keyboard = function() {
		if (Glide.options.keyboard) {
			$(window).on('keyup.glide', function(event){
				if (event.keyCode === 39) Core.Run.make('>');
				if (event.keyCode === 37) Core.Run.make('<');
			});
		}
	};


	Module.prototype.hoverpause = function() {

		if (Glide.options.hoverpause) {

			Glide.slider
				.on('mouseover.glide', function(){
					Core.Run.pause();
				})
				.on('mouseout.glide', function(){
					Core.Run.play();
				});

		}

	};


	Module.prototype.resize = function() {
		$(window).on('resize.glide', this.throttle(function() {
			Core.Transition.jumping = true;
			Core.Run.pause();
			Glide.init();
			Core.Build.init();
			Core.Run.make('=' + Glide.current);
			Core.Run.play();
			Core.Transition.jumping = false;
		}, Glide.options.throttle));
	};


	/**
	 * Disable all events
	 * @return {Glide.Events}
	 */
	Module.prototype.disable = function () {
		this.disabled = true;
		return this;
	};


	/**
	 * Enable all events
	 * @return {Glide.Events}
	 */
	Module.prototype.enable = function () {
		this.disabled = false;
		return this;
	};


	/*
	 * Call function
	 * @param {Function} func
	 * @return {Glide.Events}
	 */
	Module.prototype.call = function (func) {
		if ( (func !== 'undefined') && (typeof func === 'function') ) func(Glide.current, Glide.slides.eq(Glide.current - 1));
		return this;
	};


	/*
	 * Call function
	 * @param {Function} func
	 * @return {Glide.Events}
	 */
	Module.prototype.unbind = function (func) {

		Glide.slider
			.unbind('keyup.glide')
			.unbind('mouseover.glide')
			.unbind('mouseout.glide');

		$(window)
			.unbind('keyup.glide')
			.unbind('resize.glide');

	};


	/**
	 * Throttle
	 * @source http://underscorejs.org/
	 */
	Module.prototype.throttle = function(func, wait, options) {
		var that = this;
		var context, args, result;
		var timeout = null;
		var previous = 0;
		if (!options) options = {};
		var later = function() {
			previous = options.leading === false ? 0 : that.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		};
		return function() {
			var now = that.now();
			if (!previous && options.leading === false) previous = now;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	};


	/**
	 * Get time
	 * @source http://underscorejs.org/
	 */
	Module.prototype.now = Date.now || function() {
		return new Date().getTime();
	};


	return new Module();

};
;/**
 * --------------------------------
 * Glide Helper
 * --------------------------------
 * Helper functions
 * @return {Glide.Helper}
 */

var Helper = function (Glide, Core) {

	function Module() {}

	/**
	 * Capitalise string
	 * @param  {string} s
	 * @return {string}
	 */
	Module.prototype.capitalise = function (s) {
		return s.charAt(0).toUpperCase() + s.slice(1);
	};

	return new Module();

};
;/**
 * --------------------------------
 * Glide Run
 * --------------------------------
 * Run logic module
 * @return {Module}
 */

var Run = function (Glide, Core) {


	function Module() {
		this.running = false;
		this.flag = false;
		this.play();
	}


	/**
	 * Start autoplay animation
	 * Setup interval
	 */
	Module.prototype.play = function() {

		var that = this;

		if (Glide.options.autoplay || this.running) {

			if (typeof this.interval === 'undefined') {
				this.interval = setInterval(function() {
					that.make('>');
				}, Glide.options.autoplay);
			}

		}

		return this.interval;

	};


	/**
	 * Pasue autoplay animation
	 * Clear interval
	 */
	Module.prototype.pause = function() {

		if (Glide.options.autoplay  || this.running) {
			if (this.interval >= 0) this.interval = clearInterval(this.interval);
		}

		return this.interval;

	};


	/**
	 * Run move animation
	 * @param  {string} move Code in pattern {direction}{steps} eq. ">3"
	 */
	Module.prototype.make = function (move, callback) {

		var that = this;
		// Extract move direction
		this.direction = move.substr(0, 1);
		// Extract move steps
		this.steps = (move.substr(1)) ? move.substr(1) : 0;

		// Stop autoplay until hoverpause is not set
		if(!Glide.options.hoverpause) this.pause();
		// Disable events and call before transition callback
		Core.Events.disable().call(Glide.options.beforeTransition);

		// Based on direction
		switch(this.direction) {

			case '>':
				// When we at last slide and move forward and steps are number
				// Set flag and current slide to first
				if (Glide.current == Glide.length) Glide.current = 1, this.flag = true;
				// When steps is not number, but '>'
				// scroll slider to end
				else if (this.steps === '>') Glide.current = Glide.length;
				// Otherwise change normally
				else Glide.current = Glide.current + 1;
				break;

			case '<':
				// When we at first slide and move backward and steps are number
				// Set flag and current slide to last
				if(Glide.current == 1) Glide.current = Glide.length, this.flag = true;
				// When steps is not number, but '<'
				// scroll slider to start
				else if (this.steps === '<') Glide.current = 1;
				// Otherwise change normally
				else Glide.current = Glide.current - 1;
				break;

			case '=':
				// Jump to specifed slide
				Glide.current = parseInt(this.steps);
				break;

		}

		// Set active bullet
		Core.Bullets.active();

		// Run actual translate animation
		Core.Animation.make().after(function(){
			// Set active flags
			Core.Build.active();
			// Enable events and call callbacks
			Core.Events.enable().call(callback).call(Glide.options.afterTransition);
			// Start autoplay until hoverpause is not set
			if(!Glide.options.hoverpause) that.play();
		});

	};


	return new Module();

};
;var Touch = function (Glide, Core) {


	function Module() {

		this.dragging = false;

		if (Glide.options.touchDistance) {
			Glide.slider.on({
				'touchstart.glide': Core.Events.throttle(this.start, Glide.options.throttle),
				'touchmove.glide': Core.Events.throttle(this.move, Glide.options.throttle),
				'touchend.glide': Core.Events.throttle(this.end, Glide.options.throttle)
			});
		}

	}

	Module.prototype.unbind = function() {
		Glide.slider
			.unbind('touchstart.glide')
			.unbind('touchmove.glide')
			.unbind('touchend.glide');
	};

	Module.prototype.start = function(event) {

		// Escape if events disabled
		if (!Core.Events.disabled && !this.dragging) {

			// Cache event
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];

			// Get touch start points
			this.touchStartX = parseInt(touch.pageX);
			this.touchStartY = parseInt(touch.pageY);
			this.touchSin = null;
			this.translate = Core.Translate.get();

			this.dragging = true;

		}

	};


	Module.prototype.move = function(event) {

		// Escape if events disabled
		if (!Core.Events.disabled && this.dragging) {

			if(Glide.options.autoplay) Core.Run.pause();

			// Cache event
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];

			// Calculate start, end points
			var subExSx = parseInt(touch.pageX) - this.touchStartX;
			var subEySy = parseInt(touch.pageY) - this.touchStartY;
			// Bitwise subExSx pow
			var powEX = Math.abs( subExSx << 2 );
			// Bitwise subEySy pow
			var powEY = Math.abs( subEySy << 2 );
			// Calculate the length of the hypotenuse segment
			var touchHypotenuse = Math.sqrt( powEX + powEY );
			// Calculate the length of the cathetus segment
			var touchCathetus = Math.sqrt( powEY );

			// Calculate the sine of the angle
			this.touchSin = Math.asin( touchCathetus/touchHypotenuse );

			if ( (this.touchSin * (180 / Math.PI)) < 45 ) event.preventDefault();
			else return;

			if (Glide.options.type !== 'slideshow') {
				// Move slider with swipe distance
				Glide.wrapper.css({
					transform: Core.Translate.set('x',
						(Glide.width * (Glide.current - 1 + Core.Build.clones.length/2)) - subExSx/2
					)
				});
			}

		}

	};


	Module.prototype.end = function(event) {

		// Escape if events disabled
		if (!Core.Events.disabled && this.dragging) {

			this.dragging = false;
			Core.Events.disable();

			// Cache event
			var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
			// Calculate touch distance
			var touchDistance = touch.pageX - this.touchStartX;
			// Calculate degree
			var touchDeg = this.touchSin * (180 / Math.PI);

			// While touch is positive and greater than distance set in options
			if (touchDistance > Glide.options.touchDistance && touchDeg < 45) Core.Run.make('<');
			// While touch is negative and lower than negative distance set in options
			else if (touchDistance < -Glide.options.touchDistance && touchDeg < 45) Core.Run.make('>');
			// While swipe don't reach distance appy previous transform
			else {

				if (Glide.options.type !== 'slideshow') {
					Glide.wrapper.css({
						transition: Core.Transition.get('all'),
						transform: Core.Translate.set('x',
							(Glide.width * (Glide.current - 1 + Core.Build.clones.length/2)))
					});
				}

			}

			Core.Animation.after(function(){
				Core.Events.enable();
				if(Glide.options.autoplay) Core.Run.play();
			});

		}

	};


	// @return Module
	return new Module();

};
;var Transition = function (Glide, Core) {

	function Module() {
		this.jumping = false;
	}

	/**
	 * Get transition settings
	 * @param  {string} property
	 * @return {string}
	 */
	Module.prototype.get = function(property) {
		if (!this.jumping) {
			return property + ' ' + Glide.options.animationDuration + 'ms ' + Glide.options.animationTimingFunc;
		} else {
			return this.clear();
		}
	};


	/**
	 * Clear transition settings
	 * @param  {string} property
	 * @return {string}
	 */
	Module.prototype.clear = function(property) {
		return property + ' 0ms ' + Glide.options.animationTimingFunc;
	};


	return new Module();


};
;var Translate = function (Glide, Core) {


	function Module() {

		this.axes = {
			x: 0,
			y: 0,
			z: 0
		};

	}


	/**
	 * Get translate
	 * @return {string}
	 */
	Module.prototype.get = function() {
		var matrix = Glide.wrapper.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
		return parseInt(matrix[12] || matrix[4]);
	};


	/**
	 * Set translate
	 * @param  {string} axis
	 * @param  {int} value
	 * @return {string}
	 */
	Module.prototype.set = function(axis, value) {
		this.axes[axis] = parseInt(value);
		return 'translate3d(' + -1*this.axes.x + 'px, ' + this.axes.y + 'px, ' + this.axes.z + 'px)';
	};


	return new Module();


};
;/**
 * --------------------------------
 * Glide Main
 * --------------------------------
 * Responsible for slider initiation,
 * extending defaults, returning public api
 * @param {jQuery} element Root element
 * @param {Object} options Plugin init options
 * @return {Glide}
 */

var Glide = function (element, options) {

	/**
	 * Default options
	 * @type {Object}
	 */
	var defaults = {
		autoplay: 2000,
		type: 'carousel',
		startAt: 1,
		hoverpause: true,
		keyboard: true,
		touchDistance: 60,
		animationDuration: 300,
		animationTimingFunc: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
		throttle: 29.97,
		classes: {
			base: 'glide',
			wrapper: 'glide__wrapper',
			slide: 'glide__slide',
			arrows: 'glide__arrows',
			arrow: 'glide__arrow',
			arrowNext: 'next',
			arrowPrev: 'prev',
			bullets: 'glide__bullets',
			bullet: 'glide__bullet'
		},
		beforeInit: function(el) {},
		afterInit: function(el) {},
		beforeTransition: function(i, el) {},
		afterTransition: function(i, el) {},
	};

	// Extend options
	this.options = $.extend({}, defaults, options);
	this.current = parseInt(this.options.startAt);
	this.element = element;

	this.collect();
	this.init();

	// Call before init callback
	this.options.beforeInit(this.slider);

	/**
	 * Construct Core with modules
	 * @type {Core}
	 */
	var core = new Core(this, {
		Helper: Helper,
		Translate: Translate,
		Transition: Transition,
		Events: Events,
		Arrows: Arrows,
		Bullets: Bullets,
		Build: Build,
		Run: Run,
		Animation: Animation,
		Touch: Touch,
		Api: Api
	});

	// Call after init callback
	this.options.afterInit(this.slider);

	// api return
	return core.Api.instance();

};


Glide.prototype.collect = function() {
	this.slider = this.element.addClass(this.options.classes.base + '--' + this.options.type);
	this.wrapper = this.slider.children('.' + this.options.classes.wrapper);
	this.slides = this.wrapper.children('.' + this.options.classes.slide);
};


Glide.prototype.init = function() {
	this.width = this.slider.width();
	this.length = this.slides.length;
};
;/**
 * Wire Glide to jQuery
 * @param  {object} options Plugin options
 * @return {object}
 */

$.fn.glide = function (options) {

	return this.each(function () {
		if ( !$.data(this, 'glide_api') ) {
			$.data(this, 'glide_api',
				new Glide($(this), options)
			);
		}
	});

};

})(jQuery, window, document);