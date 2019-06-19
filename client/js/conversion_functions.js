var convert_progress_id = null;
var convert_prev_state = 0;
var convert_curr_state = 0;
var convert_prev_state_text = "";
var convert_curr_state_text = "";
var svg_loaded = false;

function check_for_conversion_on_start() {
	convert_prev_state = 0;
	convert_curr_state = 0;
	convert_prev_state_text = ""
	convert_curr_state_text = ""
	svg_loaded = false
	convert_progress_id = setInterval(get_convert_progress_frame, 500);
}

function get_convert_progress_frame() {
	$.ajax({
		type: "GET",
		url: "convert_progress",
		success: function(data) {
			convert_curr_state_text = data.text;
			if (convert_prev_state_text != convert_curr_state_text) {
				convert_curr_state = 100 / data.of * data.step;
				move(convert_prev_state, convert_curr_state, convert_curr_state_text);
				convert_prev_state = convert_curr_state;

				convert_prev_state_text = convert_curr_state_text;

				if (data.load_svg && !svg_loaded) {
					load_svg();
					svg_loaded = true;
				}
			}

			if (convert_curr_state >= 100) {
				clearInterval(convert_progress_id);
			}
		},
		error: function() {
			clearInterval(convert_progress_id);
		}
	})
}

function invalid(elem_id) {
	$("#" + elem_id).css('background', 'var(--invalid-color)');
}

function valid(elem_id) {
	$("#" + elem_id).css('background', '');
}

function convert() {
	// Send form to server
	convert_info = {
		rapid_feedrate: +$('#rapid_feedrate').val(),
		pass_feedrate: +$('#pass_feedrate').val(),
		plunge_feedrate: +$('#plunge_feedrate').val(),
		plunge_depth: +$('#plunge_depth').val(),
		safe_height: +$('#safe_height').val(),
		contour_spindle: +$('#contour_spindle').val(),
		drill_spindle: +$('#drill_spindle').val(),
		contour_distance: +$('#contour_distance').val(),
		contour_count: +$('#contour_count').val(),
		contour_step: +$('#contour_step').val(),
		resolution: +$("#resolution").val(),
		buffer_resolution: +$("#buffer_resolution").val()
	};

	// Validate inputs (All values are good for contour_distance)
	error_messages = "";
	if (!(convert_info.rapid_feedrate > 0)) {
		error_messages += "Invalid rapid feedrate: must be a value greater than 0\n";
		invalid('rapid_feedrate');
	} else {
		valid('rapid_feedrate');
	}
	if (!(convert_info.pass_feedrate > 0)) {
		error_messages += "Invalid pass feedrate: must be a value greater than 0\n";
		invalid('pass_feedrate');
	} else {
		valid('pass_feedrate');
	}
	if (!(convert_info.plunge_feedrate > 0)) {
		error_messages += "Invalid plunge feedrate: must be a value greater than 0\n";
		invalid('plunge_feedrate');
	} else {
		valid('plunge_feedrate');
	}
	if (!(convert_info.plunge_depth < 0)) {
		error_messages += "Invalid plunge depth: must be a value less than 0\n";
		invalid('plunge_depth');
	} else {
		valid('plunge_depth');
	}
	if (!(convert_info.safe_height > 0)) {
		error_messages += "Invalid safe height: must be a value greater than or equal to 0\n";
		invalid('safe_height');
	} else {
		valid('safe_height');
	}
	if (!(convert_info.contour_spindle > 0 && convert_info.contour_spindle < 1024)) {
		error_messages += "Invalid contour spindle speed: must be a value greater than 0 and less than 1024\n";
		invalid('contour_spindle');
	} else {
		valid('contour_spindle');
	}
	if (!(convert_info.drill_spindle > 0 && convert_info.drill_spindle < 1024)) {
		error_messages += "Invalid drill spindle speed: must be a value greater than 0 and less than 1024\n";
		invalid('drill_spindle');
	} else {
		valid('drill_spindle');
	}
	if (!(convert_info.contour_distance >= 0)) {
		error_messages += "Invalid contour distance: must be a value greater than or equal to 0\n";
		invalid('contour_distance');
	} else {
		valid('contour_distance');
	}
	if (!(convert_info.contour_count >= 0 && Number.isInteger(convert_info.contour_count))) {
		error_messages += "Invalid contour count: must be an integer greater than or equal to 0\n";
		invalid('contour_count');
	} else {
		valid('contour_count');
	}
	if (!(convert_info.contour_step > 0)) {
		error_messages += "Invalid contour step: must be a value greater than 0\n";
		invalid('contour_step');
	} else {
		valid('contour_step');
	}
	if (!(convert_info.resolution > 0 && Number.isInteger(convert_info.resolution))) {
		error_messages += "Invalid resolution: must be an integer greater than 0\n";
		invalid('resolution');
	} else {
		valid('resolution');
	}
	if (!(convert_info.buffer_resolution > 0 && Number.isInteger(convert_info.buffer_resolution))) {
		error_messages += "Invalid buffer resolution: must be an integer greater than 0\n";
		invalid('buffer_resolution');
	} else {
		valid('buffer_resolution');
	}

	// Warn the user if there were any errors
	if (error_messages !== "") {
		alert(error_messages.substring(0, error_messages.length-1)); // Truncate the last \n
		return;
	}

	convert_prev_state = 0;
	convert_curr_state = 0;
	convert_prev_state_text = ""
	convert_curr_state_text = ""
	svg_loaded = false
	convert_progress_id = setInterval(get_convert_progress_frame, 500);

	var contours = $.ajax({
		type: "POST",
		url: "convert",
		data: convert_info,
		success: function() {
			load_gcodes();
		},
		error: function(err) {
			clearInterval(convert_progress_id);
			if (err.status === 409) {
				alert("Conversion already in progress");
			}
		}
	});
}

function move(start, stop, status) {
	var elem = document.getElementById("convert_progress_bar");
	var text_elem = document.getElementById("convert_progress_text");
	var width = start;
	var id = setInterval(frame, 10);
	function frame() {
		if (width >= stop) {
			clearInterval(id);
		} else {
			width += (width - start) * (stop - width) / Math.pow((stop - start) / 2, 2) * 2 + 0.1;
			elem.style.width = width + '%';
		}
		text_elem.innerHTML = status
	}
}