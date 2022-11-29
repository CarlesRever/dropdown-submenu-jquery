# Dropdown Submenu Plugin for jQuery

### Turn the native HTML select into a fancy dropdown with floating submenus

Customise the native HTML select turning it into a Dropdown Combo-box widh Floating Submenus,

Demo: https://carlesrever.com/dropdown-submenu-jquery/

### Dropdown Submenu Combo-box Features:
- Every group of options become a floating submenu
- Hide the native HTML select & creates a new tuned one out of the box
- Fully compatible with your current scripts / other libraries
- Full synchronization between the native and the tuned selects: Catch programmatically changes on native select and refresh the tuned one.
- Easy style customisation.

## Usage

1. You can simply add the minfied distribution CSS file, which includes engine + skin CSS:

```
<link rel="stylesheet" type="text/css" href="dropdown-submenu-dist.css"/>
```

...or you can add only engine CSS, and your own version of skin CSS:

```
<link rel="stylesheet" type="text/css" href="dropdown-submenu-engine.css"/>
<!--<link rel="stylesheet" type="text/css" href="dropdown-submenu-skin.css"/>-->
<link rel="stylesheet" type="text/css" href="my-customized-dropdown-submenu-skin.css"/>
```

2. Add jQuery and the script file, just before close body tag:

```
<script src="https://code.jquery.com/jquery-3.6.1.min.js"></script>
<script src="dropdown-submenu.js"></script>
```

3. Tune your selects with me!

```
$(document).ready(function() {
    $( "select" ).dropdownSubmenu();
}
```

## HTML Attributes

#### data-html-option

Native HTML select doesn't support HTML into option tag, but you can set it, in this way:

```
<option value="high-sierra" data-html-option="High%20%3Cstrong%3ESierra%3C%2Fstrong%3E%20%28HTML%29">High Sierra (HTML)</option>
```

You must URL encode the HTML inside the attribute.

- On PHP you can use the urlencode() function.
- On ASP.net you can use the HttpUtility.UrlEncode() function.
- On JavaScript you can use the encodeURI() function.
- There is a few online tools to encode it easily

#### data-icon

set a relative or absolute path to an image (better PNG), using this attribute:

```
<option value="yosemite" data-icon="demo_stuff/mac.png">Yosemite (icon)</option>
```

...but you can set it also using a class and your own CSS styles (see next section) or through data-html-option attribute (see previous one).

### Customise options through custom CSS class

Native HTML select support classes into option tag and optgroup tag, and Dropdown Submenu copies it to tuned select (see the ```copyOptionClasses``` setting).

In our example:

```
<option value="catalina" class="css_tune_1">Catalina (CSS class)</option>
```

Use the ```accent-hover``` class to set the rollover / selected style:

```
	.demo1 .css_tune_1 {
		color: #00ac1c;
		background: #eaf2eb;
	}
	.demo1 .css_tune_1.accent-hover {
		color: #fff;
		background: #1e90ff;
	}
```

## Syncing settings

Here the way to set the settings:

```
    $( ".demo1_wrap select" ).dropdownSubmenu({
        watchChangeVal:  true,
        customClass :    'demo1',
		minScreenWidth:  0
    });
```

#### watchDisabled

Type: boolean

Default: true

The "disabled" attribute on the native HTML select will be synced on the tuned select.

#### watchHidden

Type: boolean

Default: true

The "hidden" attribute on the native HTML select will be synced on the tuned select (this script hides the select wrapping into layer), keeping it "visble".

#### watchChangeVal

Type: boolean

Default: false

Programmatically changes on the selected option of the native HTML select doesn't trigger jQuery change event.

So if you need to listen this kind of change, set this option to true (will get a bit of performance)

#### watchSelectClasses

Type: boolean

Default: true

The CSS classes on the native HTML select will be synced on the tuned select. Useful on form validations (error class will be applied).

## Other settings

#### minScreenWidth

Type: integer

Default: 500

Acts as CSS breakpoint: When screen width is below this value, the native HTML select will remain visible and not tuned.

Most mobile devices manage by itself the native selects, and maybe the floating submenus goes out of screen.

On each window resize the selects will be updated.

This feature can be de-activated setting it to 0.

#### copyOptionClasses

Type: boolean

Default: true

Copy classes of the options (OPTION and OPTGROUP tag) to the tuned select (LI tags). Useful for CSS customisation.

#### tuneClass

Type: string

Default: dropdown-submenu-skin

Skin CSS will be applied through this class. Change it to set full customisation of look & feel, without need to override any CSS skin class.

#### customClass

Type: string

Default: (empty)

Will add a custom class. Useful to customise the tuned selects, without writting/versionate all the skin classes. Useful also to keep distinct select styles, giving a distinct classname to each.

#### wrapClass

Type: string

Default: dropdown-submenu-wrapper

Wrap for everything, engine CSS will be applied through this class. You only should change it if you want to transverse deeply the CSS engine styles and you know what you're doing.

## Actions

Here the way to call the actions, on previously tuned select:

```
    $( ".demo1_wrap select" ).dropdownSubmenu('destroy');
```

#### refresh

Will restart/refresh the tuned select, based on the native HTML select. Unnecesary if you keep the synced settings.

#### refresh-width

Will set again the width of the tuned select, based on the native HTML select width.

#### destroy

Remove the tuned select, keeping the original HTML select untouched and visible.

After that, you can set it again in the same way: $("select").dropdownSubmenu();.

## How to... Ajax

Simply replace the options on the native HTML select, and this script will do the rest :)

What about if my script delete the native select and create a new one?

In this case, you must set it again, in the same way: ```$("select").dropdownSubmenu();.```

## Check if Dropdown Submenu script is loaded

As any other jQuery plugin:

```
	$(document).ready(function() {

		if ( $.fn.dropdownSubmenu ) {
			console.log('loaded!');
		} else {
			console.log('not loaded!');
		}
	});
```

## Customise: CSS override

If you want to override the CSS for all the tuned selects, use the class ```.dropdown-submenu-skin```

But if you want to override only some of the tuned selects, use the setting ```customClass``` to set your own class as scope.

```
.dropdown-submenu-skin {
	font-family: times, serif;
}
.dropdown-submenu-skin .dropdown-field-watch {
	border-color: green;
}
.dropdown-submenu-skin .dropdown-main-list {
	border-color: red;
}
.dropdown-submenu-skin .dropdown-submenu {
	border-color: blue;
}
.dropdown-submenu-skin .accent-hover {
	background: green;
}
```

## Full skin replacement
Please, read first the upper "Usage" section.

You can copy the file ```dropdown-submenu-skin.less``` into your project folder, and change the upper variables, or whatever:

```
@color: #2c3338;
@bgColor: #fff;

@accentColor: #fff;
@accentBgColor: #1e90ff;

@accentBgColorRemember: lighten(@accentBgColor, 40%);
@fatherBgColor: #eee;

@fontFamily: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
@fontSize: 14px;

.dropdown-submenu-skin {
```

If you want to load also the default skin, change the scope class in your skin file: ```.dropdown-submenu-skin``` for any other, and then set this new class in the ```customClass``` setting (read about in settings section).

## About Dropdown Submenu Plugin

As the Fish and Ships shipping plugin for WooCommerce (https://www.wp-centrics.com) grew in options, the interface started to become messy.

We sorted the selection options into groups, but the combo-box was still too long. I couldn't find any jQuery-based option that solved this problem, so I decided to write my own code.

After that, I decided to release it as a jQuery plugin... enjoy! ;)
