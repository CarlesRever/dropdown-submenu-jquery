jQuery(document).ready(function($) {
	
    // Usage:
    $( ".demo1_wrap select" ).dropdownSubmenu({
        watchChangeVal:  true,
        customClass :    'demo1',
		minScreenWidth:  0
    });
    $( ".demo2_wrap select" ).dropdownSubmenu();

    // Demo stuff
    // all changes will be made over the HTML select, 
    // and tunned select will be synchronized by the drop-down submenu library

    $('#bt_hide').click( function () {
        if ( $('#select_1').attr('hidden') ) {
            $('#select_1').removeAttr('hidden');
            $(this).removeClass('sel');
        } else {
            $('#select_1').prop('hidden', true);
            $(this).addClass('sel');
        }
        return false;
    });

    $('#bt_disable').click( function () {
        if ( $('#select_1').attr('disabled') ) {
            $('#select_1').removeAttr('disabled');
            $(this).removeClass('sel');
        } else {
            $('#select_1').prop('disabled', true);
            $(this).addClass('sel');
        }
        return false;
    });

    $('#bt_change_sel').click( function () {

        sel_index = $('#select_1 option').index( $('#select_1 option:selected') ) + 1;
        if (  sel_index >= $('#select_1 option').length ) sel_index = 0;
        newval = $('#select_1 option').eq(sel_index).val();
        jQuery('#select_1').val(newval);
        //return false;
    });

    // Loading/restoring new options (i.e. AJAX simulation)
    var oldOptions = '';
    var newOptions = {
                        "Cars" : { 
                                    "Audi"       : "audi-value", 
                                    "Opel"       : "opel-value",
                                    "Renault"    : "renault-value",
                                    "Volvo"      : "volvo-value"
                        },
                        "Motorcycles" : { 
                                    "Yamaha"     : "yamaha-value",
                                    "Harley"     : "harley-value",
                                    "Moto Guzzi" : "moto-guzzi-value",
                        },

                        "Train"     : "train-value",
                        "Airplane"  : "airplane-value"
                     };

    $('#bt_load_content').click( function () {

        if ( oldOptions == '' )
        {
            var $el = $("#select_1");

            // Save initial HTML to restore on next click before empty:
            oldOptions = $el.html(); 
            $el.empty();

            $.each(newOptions, function (key,value)
            {
                if ( typeof(value) == 'string' )
                {
                    $el.append($("<option></option>").attr("value", value).text(key));
                } 
                else
                {
                    optgroup = $( "<optgroup/>" ).attr("label", key);

                    $.each(value, function (childkey,childvalue)
                    {
                        optgroup.append($("<option></option>").attr("value", childvalue).text(childkey));
                    });

                    $el.append(optgroup);
                } 
            });

            /*
            $.each(newOptions, function(key,value) {
              $el.append($("<option></option>")
                 .attr("value", value).text(key));
            });*/

        }
        else
        {
            // Simly restore first load content
            $("#select_1").html( oldOptions ); 
            oldOptions = '';
        }
    });

    $('#bt_simulate_validation').click( function () {
        if ( $('#select_1').hasClass('error') ) {
            $('#select_1').removeClass('error');
            $(this).removeClass('sel');
        } else {
            $('#select_1').addClass('error', true);
            $(this).addClass('sel');
        }
        return false;
    });
    
    $('#bt_set').click( function () {
        $( ".demo1_wrap select" ).dropdownSubmenu({
            watchChangeVal:  true,
            customClass :    'demo1',
        });
    });

    $('#bt_destroy').click( function () {
        $( ".demo1_wrap select" ).dropdownSubmenu( 'destroy' );
    });

});
