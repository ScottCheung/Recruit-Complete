/*
|--------------------------------------------------------------------------
	Contact Form 7 Popup Alert Message WordPress Addon JS
	Author: MGScoder
	Author URL: https://codecanyon.net/user/mgscoder
|--------------------------------------------------------------------------
*/
document.addEventListener("touchstart", function() {},false);
(function ($) {
	"use strict";
	
/*
|--------------------------------------------------------------------------
	Floating Quick Contact Form Process
|--------------------------------------------------------------------------
*/
	$(document).ready(function(){
		
		$(".wpcf7-submit").on("click", function (event) {
			
			var wpcf7id  = $(this).closest('form').find('input[name=_wpcf7]').val();
			var ajax_url = mgscfspaajaxurl;
			
			$.post(
				ajax_url,
				{
					action:'wpcf7mgscfspalertenable'  ,
					data:wpcf7id
				}, 
				function(response){
					var json = $.parseJSON(response);
					if(json.wpcf7mgscfspalertenable == 1) {
						if(json.wpcf7mgscfspalerthidedmsg == 1) {
							$(".wpcf7-response-output").hide();
						}
						$( document ).ajaxComplete(function() {
							
							setTimeout(function(){
							
								if(json.wpcf7mgscfspalerthidedmsg == 1) {
									$(".wpcf7-response-output").hide();
								}	
								var wpcf7mgscfspalertmsg = $(".wpcf7-response-output").html();
								if( $(".wpcf7-form").hasClass("invalid") || $(".wpcf7-form").hasClass("failed") || $(".wpcf7-form").hasClass("unaccepted")) {
									sweetAlert(json.wpcf7mgscfspalertoopstxt, wpcf7mgscfspalertmsg, "error");
								}
								else {
									if( !$(".wpcf7-form").hasClass("invalid") && !$(".wpcf7-form").hasClass("failed") && !$(".wpcf7-form").hasClass("unaccepted")) {
										swal({title: json.wpcf7mgscfspalertgoodjobtxt, text: wpcf7mgscfspalertmsg, type: "success"}, function() {
											if(json.wpcf7mgscfspalertrefreshpage == 1) {
												location.reload();
											}
										});
									}
								}
							
							},500);
							
						});
					}	
								
				}
			);
			
		});
		
	});
	
	
})(jQuery);

/*
|--------------------------------------------------------------------------
	End
|--------------------------------------------------------------------------
*/