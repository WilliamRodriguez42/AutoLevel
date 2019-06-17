init();
animate();
load_svg();

$(".panel-top").resizable({
	handleSelector: ".splitter-horizontal",
	resizeWidth: false
});

$("#main_panel").resizable({
	handleSelector: "#main_vertical_splitter",
	resizeHeight: false
});

$("#svg_viewer_panel").resizable({
	handleSelector: "#view_panels_splitter",
	resizeHeight: false
});

$(window).resize(function() {
	custom_resize();
});

function move(start, stop, status) {
	var elem = document.getElementById("convert_progress_bar");
	var text_elem = document.getElementById("convert_progress_text");
	var width = start;
	var id = setInterval(frame, 10);
	function frame() {
		if (width >= stop) {
			clearInterval(id);
			text_elem.innerHTML = "Progress: " + status
		} else {
			width += (width - start) * (stop - width) / Math.pow((stop - start) / 2, 2) * 2 + 0.1;
			elem.style.width = width + '%';
			text_elem.innerHTML = "Progress: " + status
		}
	}
}

function load_svg() {
	$.ajax({
		type: 'GET',
		url: 'svg',
		success: function(data) {
			elem = document.getElementById('svg_viewer_div');
			elem.innerHTML = data;

			var svg_element = elem.getElementsByTagName('svg')[0]
			svg_element.id = "svg_element"
			svg_element.style = "width: 100%; height: 100%; will-change: transform;"

			window.svg_controller = svgPanZoom('#svg_element', {
        zoomEnabled: true,
			  panEnabled: true,
			  controlIconsEnabled: false,
      });
			window.svg_controller.fit();

			custom_resize();
		}
	});
}
