var demoCss;
var tourFinished = false;
var trip;

$(document).ready(function() {
	demoCss = document.getElementById("demoCss");
	demoCss.disabled = true;

	$("#tryMe").on("click", () => {
		if (demoCss.disabled) {
			demoCss.disabled = false;
			$(this).html("End tour");
			$(this).html("Try me");
			if (!tourFinished) {
				trip = new Trip([
					{
						sel: $("#Tour1"),
						content: "The font is changed to OpenDyslexic that is a award winning font for people who have dyslexia",
						expose: true
					},
					{
						sel: $("#Tour2"),
						content: "",
						expose: true
					}
				], {
					showNavigation: true,
					showCloseBox: true,
					delay: -1,
					tripTheme: "white"
				});
				trip.start();
				tourFinished = true;
			}
		} else {
			demoCss.disabled = true;
		}
	});
});