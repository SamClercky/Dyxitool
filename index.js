let demoCss;
let tourFinished = false;
let trip;

$(document).ready(function() {
	demoCss = $("#demoCss");
	demoCss.prop("disabled", true);

	$("#tryMe").on("click", () => {
		if (demoCss.prop("disabled")) {
			demoCss.prop("disabled", false);
			$("#tryMe").html("Stop demo");

			if (!tourFinished) {
				trip = new Trip([
					{
						sel: $("#Tour1"),
						content: "The font has been changed to OpenDyslexic which is an award winning font for people who have dyslexia",
						expose: true
					},
					{
						sel: $("#Tour2"),
						content: "When you hold your mouse on or touch some text, a special overlay will help you read the text better.",
						expose: true
					}, {
						sel: $("#tryMeWrapper"),
						content: "If you want to stop the experience, click this button and everything will go back to normal",
						expose: true
					}
				], {
					showNavigation: true,
					showCloseBox: true,
					showSteps: true,
					delay: -1,
					tripTheme: "dark",
					onTripChange: (tripIndex, tripObject) => {
						console.log("Trip changed: ", tripIndex, tripObject);
						$(".trip-block")[0].scrollIntoView();
					}
				});
				trip.start();
				$("#tryMe").html("Stop demo");
				tourFinished = true;
			}
		} else {
			demoCss.prop("disabled", true);
			$("#tryMe").html("Try me");
		}
	});
});