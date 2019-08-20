let demoCss;
let tourFinished = false;
let trip;

$(document).ready(function() {
	demoCss = $("#demoCss");
	demoCss.prop("disabled", true);

	$("#tryMe").on("click", () => {
		if (demoCss.prop("disabled")) {
			demoCss.prop("disabled", false);
			$("#tryMe").html("End tour");

			if (!tourFinished) {
				trip = new Trip([
					{
						sel: $("#Tour1"),
						content: "The font has been changed to OpenDyslexic which is an award winning font for people who have dyslexia",
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
				$("#tryMe").html("Stop trying");
				tourFinished = true;
			}
		} else {
			demoCss.prop("disabled", true);
			$("#tryMe").html("Try me");
		}
	});
});