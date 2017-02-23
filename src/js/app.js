import $ from 'jquery';
import 'bootstrap/tab';
import 'bootstrap/tooltip';
import 'bootstrap-hover-dropdown/bootstrap-hover-dropdown';
import 'bootstrap/modal';
import 'bootstrap/collapse';

$(function() {
	var isTouchDevice = (function() {
  	return 'ontouchstart' in window;
	}());
	var isNarrowDisplay = window.matchMedia('only screen and (max-width: 760px)').matches;
	var strip = $('<script></script>');
	if (!isNarrowDisplay) {
		window.stripType = 1;
		window.stripGlExtraCode = 47;
		strip.attr('src', 'https://gambrinusliga.s3-external-3.amazonaws.com/strip/strip-utf8.js');
		$('body').addClass('strip').append(strip);
		$('#Interstitial').modal('show');
	}
	if (!isTouchDevice) {
  	$('[data-toggle="tooltip"]').tooltip();
	}

	function isElementInViewport(elem) {
	    var $elem = $(elem);

	    // Get the scroll position of the page.
	    var scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html');
	    var viewportTop = $(scrollElem).scrollTop();
	    var viewportBottom = viewportTop + $(window).height();

	    // Get the position of the element on the page.
			console.log($elem, $elem.offset());
	    var elemTop = Math.round( $elem.offset().top );
	    var elemBottom = elemTop + $elem.height();

	    return ((elemTop < viewportBottom) && (elemBottom > viewportTop));
	}

	// Check if it's time to start the animation.
	function checkAnimation() {
	    var $elem = $('[data-toggle-class]');

	    // If the animation has already been started
	    if (!$elem.length || $elem.hasClass('isInViewport')) return;

	    if (isElementInViewport($elem)) {
	        // Start the animation
	        $elem.addClass('isInViewport');
	    }
	}

	// Capture scroll events
	$(window).scroll(function(){
	    checkAnimation();
	});

});
