function editButtonHtml(value) {
	return '<a class="btn btn-primary" href="#animal/' + value + '" role="button">' +
		'<i class="glyphicon glyphicon-pencil"></i> Editar</a>';
}

function genderHtml(value) {
	if (value === 0) {
		return 'Male';
	} else {
		return 'Female';
	}
}

function loadAnimals() {

	$.get('/partials/animals.html', null, function(data) {
		$('#content').html(data);

		$.get('/r/animals', null, function(data) {

			$('#table').bootstrapTable({
				data: data
			});
		}, 'json');
	}, 'html');

}

function loadAnimal() {
	$.get('/partials/animal.html', null, function(data) {
		$('#content').html(data);

		var id = window.location.hash.split('/')[1];

		$.get('/r/animal/' + id, null, function(data) {
			$('#name').val(data.name);
			$('#species').val(data.species);
			if (data.gender === 0) {
				$('#male').prop('checked', true);
			} else {
				$('#female').prop('checked', true);
			}
			$('#breed').val(data.breed);
			$('#details').val(data.details);
			$('#animal').prop('action', '/r/animal/' + id);
		}, 'json');
	}, 'html');
}

function route() {
	var hash = window.location.hash;

	if (hash.substr(0, 8) === '#animal/') {
		loadAnimal();
	} else {
		loadAnimals();
	}
}

$(document).ready(function() {
	$(window).on('hashchange', route);
	route();
});
