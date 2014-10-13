
$.fn.rundial = function(a1,a2) {

	return this.each(function(i, domElm) {
		var elm = $(domElm),
			action = a1 || 'create',
			rundial = elm.data('rundial');

		// Constructor
		if (!rundial || (action == 'create')) {
			var cfg = a2 || {};

			// Setup rundial config
			rundial = {
				'input'			: $(elm),
				'min'			: cfg.min || 0,
				'max'			: cfg.max || 100,
				'width'			: cfg.width || Math.max( elm.width(), 64 ),
				'height'		: cfg.height || Math.max( elm.height(), 64 ),
				'step'			: cfg.step || 1,
				'value'			: cfg.value || parseInt(elm.attr('value')) || cfg.min,
				'overflowText'	: cfg.overflowText || '(!)',
				'underflowText'	: cfg.underflowText || '(!)',
			};

			// Update value on the element
			elm.attr('value', rundial.value);

			// Create & Next UI components
			var e = $('<div class="rundial"></div>'),
				h = $('<div class="rundial-host"></div>').appendTo(e),
				i1= $('<div class="rundial-indicator"></div>').appendTo(h),
				i2= $('<div class="rundial-indicator rundial-indicator-right"></div>').appendTo(h),
				v = [
					$('<div class="rundial-value">-1</div>').appendTo(h),
					$('<div class="rundial-value">0</div>').appendTo(h).css({'font-weight':'bold'}),
					$('<div class="rundial-value">1</div>').appendTo(h)
				];

			// Style input
			e.css({
				'width': rundial.width,
				'height': rundial.height
			});

			// Update rundial data
			rundial.container = e;
			rundial.host = h;
			rundial.valueElements = v;

			
			rundial.wrapStep = function(v) {
				if (v > this.max) v = this.max;
				if (v < this.min) v = this.min;
				return Math.round(v / this.step) * this.step;
			}
			rundial.setValue = function(v) {

				// Bounce underflows
				if (v < this.min) {
					v = this.min - ((this.min - v) / (this.max - this.min)) * this.step/2;
					if (v < this.min - this.step/2) v = this.min - this.step/2;
					rundial.host.addClass("rundial-underrun");
				} else {
					rundial.host.removeClass("rundial-underrun");
				}

				// Bounce overflows
				if (v > this.max) {
					v = this.max + ((v - this.max) / (this.max - this.min)) * this.step/2;
					if (v > this.max + this.step/2) v = this.max + this.step/2;
					rundial.host.addClass("rundial-overrun");
				} else {
					rundial.host.removeClass("rundial-overrun");
				}

				var scale_factor = 0.5,
					v_curr   = this.wrapStep(v),
					v_before = v_curr - this.step,
					v_after  = v_curr + this.step,
					ofs = this.height*( 1 - scale_factor*(1 - 2*v_curr + 2*v) )/2;
					
				// Set texts
				if (v_before < this.min) {
					if (v < this.min) {
						this.valueElements[0].html( this.underflowText );
						this.valueElements[0].addClass("rundial-warn");
					} else {
						this.valueElements[0].text("");
						this.valueElements[0].removeClass("rundial-warn");
					}
				} else {
					this.valueElements[0].text(v_before);
					this.valueElements[0].removeClass("rundial-warn");
				}
				this.valueElements[1].text(v_curr);
				if (v_after > this.max) {
					if (v > this.max) {
						this.valueElements[2].html( this.overflowText );
						this.valueElements[2].addClass("rundial-warn");
					} else {
						this.valueElements[2].text("");
						this.valueElements[2].removeClass("rundial-warn");
					}
				} else {
					this.valueElements[2].text(v_after);
					this.valueElements[2].removeClass("rundial-warn");
				}

				this.valueElements[0].css({ top: ofs - this.height*scale_factor });
				this.valueElements[1].css({ top: ofs });
				this.valueElements[2].css({ top: ofs + this.height*scale_factor });

			}
			rundial.tick = function() {
				var targetVal = parseInt(elm.attr('value'));
				if (Math.abs(targetVal - this.value) > 0.01) {
					this.value += (targetVal - this.value) / 20;
					rundial.setValue(this.value);
				} else if (targetVal != this.value) {
					this.value = targetVal;
					rundial.setValue(this.value);
				}
			}

			setInterval(function() { rundial.tick(); }, 25);
			rundial.setValue( rundial.value );

			// Store rundial data
			elm.data('rundial', rundial);

			// Replace input
			e.insertBefore(elm);
			elm.hide();

		}


	});
};