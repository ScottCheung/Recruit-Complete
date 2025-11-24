// $(document).ready(function() {
jQuery(document).ready(function($) {
   $('form#login').on('submit', function (e) {
        var username = $('form#login #tg_username').val();
        var password = $('form#login #tg_password').val();
        var security = $('form#login #security').val();
        $('form#login input').removeClass('invalid')
        if ( username == '' ) {
            $('form#login #tg_username').addClass('invalid');
            $('form#login #tg_username').attr('placeholder', 'Please input username');
            return false;
        }

        if ( password == '' ) {
            $('form#login #tg_password').addClass('invalid');
            $('form#login #tg_password').attr('placeholder', 'Please input password');
            return false;
        }

         $.ajax({
			type: 'POST',
			dataType: 'json',
			url: ajax_auth_object.ajaxurl,
			data: {
				'action': 'ajaxlogin',
				'username': username,
				'password': password,
				'security': security
			},
			success: function (data) {
				if ( data.success == false ) {
					if ( data.data == 'Wrong ID' ) {
						$('form#login #tg_username').val('');
						$('form#login #tg_username').addClass('invalid');
						$('form#login #tg_username').attr('placeholder', 'Wrong ID');
						return false;
					} else {
						$('form#login #tg_password').val('');
						$('form#login #tg_password').addClass('invalid');
						$('form#login #tg_password').attr('placeholder', 'Wrong Password');
						return false;
					}
				} else {
					document.location.href = ajax_auth_object.redirecturl;
				}
					
			}
        });
        e.preventDefault();
    });
	   
	// Show the first tab by default
	$('.tabs-stage-wrapper div.tab-wrapper-change').hide();
	$('.tabs-stage-wrapper div.tab-wrapper-change:last').show();
	$('.user-logged-tabs-nav li:last').addClass('tab-active');
	// Change tab class and display content
	
	$('.user-logged-tabs-nav a').on('click', function(event){
		event.preventDefault();
		$('.user-logged-tabs-nav li').removeClass('tab-active');
		$(this).parent().addClass('tab-active');
		$('.tabs-stage-wrapper div.tab-wrapper-change').hide();
		$($(this).attr('href')).show();
	});
	
	// Show the first tab by default
	$('.tabs-stage div.tabs-change').hide();
	$('.tabs-stage div.tabs-change:first').show();
	$('.tabs-nav li:first').addClass('tab-active');

	// Change tab class and display content
	$('.tabs-nav a').on('click', function(event){
		event.preventDefault();
		$('.tabs-nav li').removeClass('tab-active');
		$(this).parent().addClass('tab-active');
		$('.tabs-stage div.tabs-change').hide();
		$($(this).attr('href')).show();
	});
	   
	$("#document_filter").keyup(function() {

		// Retrieve the input field text and reset the count to zero
		var filter = $(this).val(),
		count = 0;

		// Loop through the comment list
		$('#document-results .results').each(function() {


		// If the list item does not contain the text phrase fade it out
		if ($(this).text().search(new RegExp(filter, "i")) < 0) {
			$(this).hide();  // MY CHANGE

			// Show the list item if the phrase matches and increase the count by 1
		} else {
			$(this).show(); // MY CHANGE
			count++;
		}

		});

	}); // end filter
	   
	  
	$('#searchfield').keyup(filter);
		function filter() {
			var rex = new RegExp($('#searchfield').val(), 'i');
			var rows = $('.searchable tr.results');

			rows.hide();

			rows.filter(function() {

				var tester = true;

				tester = rex.test($(this).text());

				tester = tester && filterOnDays(this);

				return tester;
			}).show();
		}

	function filterOnDays(selector) {
		var tester = true;
		var all = $('#days .pressable-day.active');

		for (var i = 0; i < all.length; i++) {
			var day = $(selector).find('[data-schedule="' + all[i].id + '"]');

			if (!day.hasClass('active')) {
			tester = false;
			}
		}
		return tester;
	}
		
	// Open consent download popup
	//open popup
// 	$('.cd-popup-trigger').on('click', function(event){
// 		event.preventDefault();
// 		$(this).addClass('download-popup-visible');
// 	});
	
	//close popup
// 	$('.cd-popup').on('click', function(event){
// 		if( $(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') ) {
// 			event.preventDefault();
// 			$(this).removeClass('is-visible');
// 		}
// 	});
	
	//close popup when clicking the esc keyboard button
// 	$(document).keyup(function(event){
//     	if(event.which=='27'){
//     		$('.cd-popup-trigger').removeClass('download-popup-visible');
// 	    }
//     });
	   
});