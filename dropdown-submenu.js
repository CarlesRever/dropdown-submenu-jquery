/*
 * Dropdown Submenu Plugin for jQuery
 *
 * Turn a select with optgroup ordenation into a fancy dropdown menu with floating submenu for each grouped options.
 *
 * @version 1.2
 * https://www.carlesrever.com/dropdown-submenu-jquery
 *
 */
  
(function( $ ) {

	// every select can have different settings
	var settings = [];
	
	// For performance on programmatically change detection loop
	var watchers = [];
 
    $.fn.dropdownSubmenu = function( options ) {
		
		// Default options
		var def_settings = {
			
			minScreenWidth:      500,   // Below this value, we will leave native HTML select (don't do nothing)

			watchDisabled:       true,  // Watch programmatic changes
			watchSelectClasses:  true,
			watchHidden:         true,  
			watchChangeVal:      false, // (takes a bit of performance)
			
			copyOptionClasses:   true,
			
			wrapClass:            "dropdown-submenu-wrapper", // Wrap for everything, engine CSS will be applied through this class
			tuneClass:            "dropdown-submenu-skin",    // Skin for select with submenus, skin CSS will be applied through this class
			customClass:          "",                         // Custom class for CSS customization
		};

		var instanceUid = 0;
		
		var external_action = '';
		
		
		if (typeof options == 'string') {
			external_action = options;
			options = {};
		}

		// Selects looping for tuning
        this.filter( "select" ).each(function() {
			
			if ( external_action == '' ) {				
			
				// Prevent double tuning, refresh in this case
				if ( is_tuned_select(this) ) {
					
					refresh (this);
					return true;
				}

				var remember_this = this; // remember object
				
				var this_settings = $.extend( def_settings, options ); 
				
				// store this settings for this select
				instanceUid++;
				settings[instanceUid] = this_settings;
				
				var wrap_class = this_settings.wrapClass + ' ' + this_settings.tuneClass + ' ' + this_settings.customClass;

				if ( this_settings.minScreenWidth > $( window ).width() ) {
					wrap_class += ' not-fit';
				} else {
					wrap_class += ' fits-well';
				}
				
				if ( this_settings.watchDisabled ) {
					wrap_class += $(this).attr('disabled') ? ' is-disabled' : '';
				}

				if ( this_settings.watchHidden ) {
					wrap_class += $(this).attr('hidden') ? ' is-hidden' : '';
				}
								
				// Add classes, instanceUid and wrap everything
				$(this)
					.addClass('dropdown-submenu-tuned').attr('data-dropdown-submenu-id', instanceUid)
					.wrap( '<div class="' + wrap_class + '"><div class="dropdown-submenu-hidden"></div></div>' );

				// Add watcher (if needed)
				update_watcher( this );

				// MutationObserver
				var observer = new MutationObserver( function () {
					select_changed( remember_this );
				});
				observer.observe(this, {
					attributes: true,
					childList: false,
					subtree: false,
				});

				// Create the list dropdown, events, etc
				tune(this);
			
			} else if ( external_action == 'refresh' ) {
				
				refresh (this);

			} else if ( external_action == 'refresh-width' ) {

				// Prevent if there isn't a tuned select
				if ( !is_tuned_select(this) ) return false;
				
				var wrapper = $(this).parent().parent();

				refresh_width(wrapper, this);
				
			} else if ( external_action == 'destroy' ) {
				
				// Prevent if there isn't a tuned select
				if ( !is_tuned_select(this) ) return false;

				var wrapper = $(this).parent().parent();
				
				// Remove MutationObserver
				if (typeof observer !== typeof undefined && observer !== false) {
					observer.disconnect();
				}

				// Remove field
				$('.dropdown-field', wrapper).remove();
				
				// Remove tune class & unwrap HTML select
				$(this).removeClass('dropdown-submenu-tuned').unwrap('div').unwrap('div');
				
			} else {
				
				console.error('[dropdown-submenu] Unknown action: ' + external_action);
			}
        });
 
        return this;
		
    };

	
	// Here the private functions loaded once

	// Listen for changes on real HTML select (one instance only)
	$(document).on('change', 'select.dropdown-submenu-tuned', function() {
		select_changed( this );
	});
	
	
	/*function watchField(selector, callback) {
		var input = $(selector);
		var oldvalue = input.val();*/
	
	setInterval( function() {
		jQuery( watchers ).each( function(idx, w) {

			// non-watcher element or non-watching change val?
			if ( typeof w == typeof undefined || w == false || !w.watchChangeVal ) return;
						
			if ( $(w.object).val() != w.currentValue ) select_changed( w.object );
		});
	}, 100);

	
	// Listen document click to close dropdowns (one instance only)
	$(document).on('click', function() {
		
		$('.dropdown-submenu-open').removeClass('dropdown-submenu-open');
	});

	function select_changed ( select_el ) {

		var current_hash  = select_2_hashCode( select_el, $(select_el).val() );
		var previous_hash = $(select_el).attr('data-dropdown-changes-control');
		
		if ( current_hash == previous_hash ) {
			return;
		}
		
		refresh (select_el);
	}
	
	// Refresh a dropdown submenu select, must previously tuned
	function refresh ( select_el ) {
		
		// Prevent if there isn't a tuned select
		if ( !is_tuned_select(select_el) ) return false;
					
		var wrapper = $(select_el).parent().parent();

		var this_settings = get_select_settings( select_el );
		
		// Remove temporary classes
		$(wrapper).removeClass('dropdown-submenu-flag dropdown-submenu-open is-disabled is-hidden');

		// Add disabled if needed
		if ( this_settings.watchDisabled ) {
			if ( $(select_el).attr('disabled') ) $(wrapper).addClass('is-disabled');
		}

		// Add hidden if needed
		if ( this_settings.watchHidden ) {
			if ( $(select_el).attr('hidden') ) $(wrapper).addClass('is-hidden');
		}
		
		// Refresh field & dropdown lists
		$('.dropdown-field', wrapper).remove();
		tune( select_el );
		
		// Update watcher (if needed)
		update_watcher( select_el );

	}

	function refresh_width(wrapper, select_el) {
		$(wrapper).css( 'width', $(select_el).outerWidth() );
	}

	// Mark ancestor if there is one (only inside the wrapper!)
	function mark_ancestor(wrapper) {
		maybe_ancestor = $('.dropdown-selected', wrapper).parent().closest('li');
		if ( $(wrapper).has(maybe_ancestor).length) $(maybe_ancestor).addClass('dropdown-ancestor-selected');
	}
	
	
	// The way to catch all the changes in the real HTML select, 
	// prevent looping from our changes at same time & double refresh for performance reasons: 
	// generate a hash using the inner select HTML code + some select attributes + the expected selected option value
	function select_2_hashCode( select_el, value ) {
		
		// Get cloned code without selected option:
		var cloned = $(select_el).clone();
		$('cloned').find('option:selected').prop( 'selected', false );
		var code = $(cloned).html();
		cloned = null;
		
		var this_settings = get_select_settings( select_el );
		
		if ( this_settings.watchDisabled ) {
			code += 'disabled:' + ( $(select_el).attr('disabled') ? '1' : '0' );
		}

		if ( this_settings.watchHidden ) {
			code += 'hidden:' + ( $(select_el).attr('hidden') ? '1' : '0' );
		}

		if ( this_settings.watchSelectClasses ) {
			classes = $(select_el).attr('class');
			classes = classes.replace('dropdown-submenu-tuned', ''); // Our own class will be ignored
			if (classes != '') code += 'classes:' + classes;
		}
		
		return hashCode( code + value );
	}

	
	// That is the way of implementation in Java (bitwise operator).
	function hashCode(string) {
		var hash = 0;
		for (var i = 0; i < string.length; i++) {
			var code = string.charCodeAt(i);
			hash = ((hash<<5)-hash)+code;
			hash = hash & hash; // Convert to 32bit integer
		}
		return hash;
	}
	
	function is_tuned_select( check_el ) {
		
		if ( 'SELECT' != $(check_el).prop("tagName") ) return false;
		
		return $(check_el).hasClass('dropdown-submenu-tuned');
	}
	
	function get_select_settings ( select_el ) {
		
		var id = $( select_el ).attr('data-dropdown-submenu-id');
		
		return settings[id] ? settings[id] : def_settings;
	}
	
	// Support for HTML options & icons
	function get_element_caption(el) {
		
		text = 'Unknown';
		
		if ( $(el).attr('data-html-option') && $(el).attr('data-html-option') != '' )
		{
			text = $(el).attr('data-html-option');
		}
		else if ( 'OPTGROUP' == $(el).prop("tagName") )
		{
			text = $(el).attr("label");
		}
		else
		{
			text = $(el).text();
		}
		
		try {
			try_text = decodeURIComponent(text);
			text = try_text;
		} catch (e) {
			console.error(e);
		}
		
		icon = '';
		
		if ( $(el).attr('data-icon') && $(el).attr('data-icon') != '' )
		{
			icon = '<span class="icon"><img src="' + $(el).attr('data-icon') + '" /></span>';
		}
				
		return icon + text;
	}
	
	// Set or update watcher, for performance
	function update_watcher ( select_el )
	{
		var id = $( select_el ).attr('data-dropdown-submenu-id');
		
		watchers[id] = { 
							object:          select_el, 
							currentValue:    $(select_el).val(),
							watchChangeVal:  settings[id].watchChangeVal,
							minScreenWidth:  settings[id].minScreenWidth
						}
	}
		
	// Tune function: used first time and after every HTML select refresh (Ajax, dynamic elements change, etc)
	// This create the list menu dropdown, events on change, etc.
	function tune( select_el ) {
		
		var this_settings  = get_select_settings ( select_el );
		var value          = $(select_el).val();
		var wrapper        = $(select_el).parent().parent();

		refresh_width( wrapper, select_el );

        // The full new field wrapper
		var newfield = $("<div/>", {
			class: "dropdown-field",
		}).appendTo(wrapper);

		// The classes on the native HTML select must be synced?
		if ( this_settings.watchSelectClasses ) {
			classes = $(select_el).attr('class');
			classes = classes.replace('dropdown-submenu-tuned', ''); // Our own class will be ignored
			if (classes != '') $(newfield).addClass( classes );
		}

        		
		// Selected field (closed dropdown)
		var watch = $("<div/>", {
			//html: get_element_caption( $(':selected', select_el) ),
			class: "dropdown-field-watch",
		}).appendTo(newfield);

		// Content watch
		$("<div/>", {
			html: get_element_caption( $(':selected', select_el) ),
			class: "content",
		}).appendTo(watch);

		// Open arrow
		$("<div/>", {
			class: "dropdown-arrow",
		}).appendTo(watch);

		// Empty list
		list = $("<ul/>", {
			class: "dropdown-main-list",
		});
		
		// Populate it
		$(select_el).children().each(function(index, child) {
			
			if ( 'OPTGROUP' == $(child).prop("tagName") ) {

				// Empty child list
				child_list = $("<ul/>", {
					class: "dropdown-submenu",
				});
				
				// Populate child list
				$(child).children().each(function(idx, grandson) {
					
					var this_value = $(grandson).val();
					
					var classes = "dropdown-submenu-item" + ( this_value == value ? ' dropdown-selected' : '' );
					
					if ( this_settings.copyOptionClasses && $(grandson).attr('class') ) classes += ' ' + $(grandson).attr('class');
					
					$("<li/>", {
						html: get_element_caption(grandson),
						'data-value': $(grandson).val(),
						class: classes,
					}).appendTo(child_list);
				});

				var classes = "dropdown-main-item dropdown-has-childs";
				if ( this_settings.copyOptionClasses && $(child).attr('class') ) classes += ' ' + $(child).attr('class');
				
				// Append child list to main list
				ancor = $("<li/>", {
					//html: get_element_caption(child),
					class: classes,
				}).appendTo(list);

				// Content watch
				$("<div/>", {
					html: get_element_caption(child),
					class: "content",
				}).appendTo(ancor);

				// Open arrow
				$("<div/>", {
					class: "dropdown-arrow",
				}).appendTo(ancor);

				
				$(child_list).appendTo(ancor);
			}

			if ( 'OPTION' == $(child).prop("tagName") ) {

				var this_value = $(child).val();

				var classes = "dropdown-main-item dropdown-no-childs" + ( this_value == value ? ' dropdown-selected' : '' );
				if ( this_settings.copyOptionClasses && $(child).attr('class') ) classes += ' ' + $(child).attr('class');

				// Append 1st level option to main list, no childs
				$("<li/>", {
					html: get_element_caption(child),
					'data-value': $(child).val(),
					class: classes,
				}).appendTo(list);
			}
		});
		
		// Append list to wrapper
		$(list).appendTo(newfield);
		
		// Mark ancestor if needed
		mark_ancestor( newfield );

		// Set/Update changes control, preventing looping
		var current_hash  = select_2_hashCode( select_el, value );
		$(select_el).attr('data-dropdown-changes-control', current_hash);
		
		/***************** Listen events *******************/

		// Watch screen resize
		$(window).resize(function ()
		{
			var windowWidth = $( window ).width();
						
			jQuery( watchers ).each( function(idx, w) {

				// non-watcher element?
				if (typeof w == typeof undefined || w == false) return;
								
				var wrapper = $( w.object ).parent().parent();

				if ( w.minScreenWidth > windowWidth )
				{
					$( wrapper ).addClass('not-fit').removeClass('fits-well');
				} else {
					$( wrapper ).addClass('fits-well').removeClass('not-fit');
				}
			});
		});

		// Mouseover
		$('.dropdown-no-childs, .dropdown-submenu-item')
			.mouseover( function() {
				$('.dropdown-selected', wrapper).removeClass('accent-hover');
				$(this).addClass('accent-hover');
			})
			.mouseout( function() {
				$(this).removeClass('accent-hover');
				$('.dropdown-selected', wrapper).addClass('accent-hover');
			});
				
		// Open / close
		$('.dropdown-field-watch', wrapper).mousedown( function(e)
		{	
			if ('1' != e.which) return; // Only left button open combo box
			if( $(wrapper).hasClass('is-disabled') ) return false;
			
			$(wrapper).toggleClass('dropdown-submenu-open');
			$('.dropdown-submenu-open').not(wrapper).removeClass('dropdown-submenu-open');
		});
		
		// Prevent close after button release
		$('.dropdown-field, .dropdown-has-childs', wrapper).click( function() {
			return false;
		});
		
		// Value selected
		$('.dropdown-submenu-item, .dropdown-no-childs', wrapper).click(function() {

			// Get new value & maybe class
			var value = $(this).attr('data-value');
			
			var classes = 'dropdown-field-watch ' + $(this).attr('class');
			classes = classes.replace('dropdown-submenu-item', ''); // Item defalut class will be ignored
			classes = classes.replace('dropdown-selected', ''); // Item selected class will be ignored
			classes = classes.replace('accent-hover', ''); // Item accent and / or hover class will be ignored
			
			// Mark new selection
			$('.dropdown-selected, .dropdown-ancestor-selected', wrapper).removeClass('dropdown-selected dropdown-ancestor-selected');
			$(this).addClass('dropdown-selected');
			mark_ancestor(wrapper);
			
			// Update changes control, preventing looping
			var current_hash  = select_2_hashCode( select_el, value );
			$(select_el).attr('data-dropdown-changes-control', current_hash);
			
			// Update field & real HTML select
			$('.dropdown-field-watch .content', wrapper).html( $(this).html() );
			$('.dropdown-field-watch', wrapper).attr('class', classes);
			$('select', wrapper).val(value);
			
			// Close
			$(wrapper).removeClass('dropdown-submenu-open');
			
			// Trigger real HTML select events
			$('select', wrapper).trigger('change');
			
			return false;
		});
	} // end function tune()
 
}( jQuery ));
 
