$(document).ready(function () {
	if (typeof SPG_FORM_ADAPTIVE === 'undefined' || !SPG_FORM_ADAPTIVE) {
		  return
	}
	var logo = $(".footer .cert-logo");
	logo.removeClass("visible-lg-block").removeClass("visible-md-block");
	logo.html(' \
					<div class="cert-logo-icon" id="mastercard-mono"></div> \
					<div class="cert-logo-icon" id="mastercard-securecode-mono"></div> \
					<div class="cert-logo-icon" id="maestro-mono"></div> \
          <div class="cert-logo-icon" id="visa-mono"></div> \
          <div class="cert-logo-icon" id="mir-mono"></div> \
          <div class="cert-logo-icon" id="pcidss-mono"></div> \
					<div class="cert-logo-icon" id="thawte-mono"></div> \
					');

	var cvcField = $('#PayForm_cvc2');
	cvcField.after('<div id="toggle-icon" class="eye-icon"></div>');

	var toggleIcon = $('.textinput #toggle-icon');
	var cvcFieldType = "number";
	try {
		if (window.matchMedia('(min-width: 992px)').matches) {
			cvcFieldType = "password";
		} else {
			cvcFieldType = "number";
			toggleIcon.removeClass("eye-icon").addClass("eye-blocked-icon");
		}
	} catch (error) {
		console.error(error);
	}

	cvcField.prop("type", cvcFieldType);
	cvcField.prop("pattern", "[0-9]*");
	cvcField.prop("inputmode", "numeric");

	toggleIcon.on('click', function(e) {
		var type = cvcField.prop("type");
		if (type === "password") {
			e.target.className = "eye-blocked-icon";
			cvcField.prop("type", "number");
		} else {
			e.target.className = "eye-icon";
			cvcField.prop("type", "password");
		}
	})

	var cardField = $('#PayForm_card');
	cardField.prop("inputmode", "numeric");

	var monthField = $('#PayForm_exp_month');
	monthField.prop("type", "number");
	monthField.prop("pattern", "[0-9]*");
	monthField.prop("inputmode", "numeric");
	
	var yearField = $('#PayForm_exp_year');
	yearField.prop("type", "number");
	yearField.prop("pattern", "[0-9]*");
	yearField.prop("inputmode", "numeric");

});
