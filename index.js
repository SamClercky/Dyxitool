let demoCss;
let tourFinished = false;
let trip;

$(document).ready(function() {
	demoCss = $("#demoCss");
	demoCss.prop("disabled", true);

	$("#tryMe").on("click", () => {
		if (demoCss.prop("disabled")) {
			demoCss.prop("disabled", false);
			$("#tryMe").html("Stop tour");

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
						content: "If you want to stop, click this button.",
						expose: true
					}
				], {
					showNavigation: true,
					showCloseBox: true,
					showSteps: true,
					delay: -1,
					tripTheme: "dark"
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