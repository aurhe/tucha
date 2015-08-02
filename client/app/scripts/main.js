//TODO find a way to avoid using global variables
/* exported cellFormatters */
var cellFormatters = {
    editButtonHtml: function (value) {
        'use strict';
        return '<a class="btn btn-primary" href="#animal/' + value + '" role="button">' +
            '<i class="glyphicon glyphicon-pencil"></i> Editar</a>';
    },
    thumbnailHtml: function (value) {
        'use strict';
        return '<img src="r/animal/' + value + '/picture"/>';
    },
    genderHtml: function (value) {
        'use strict';
        if (value === 0) {
            return 'Macho';
        } else {
            return 'Fêmea';
        }
    },
    truthyHtml: function (value) {
        'use strict';
        if (value === 0) {
            return 'Não';
        } else {
            return 'Sim';
        }
    },
    age: function (value) {
        'use strict';
        if (value && value !== 0) {
            return new Date().getUTCFullYear() - value;
        } else {
            return '';
        }
    }
};

(function () {
    'use strict';

    function loadAnimals() {
        $.get('/partials/animals.html', null, function (data) {
            $('#content').html(data);
            $.get('/partials/animalsList.html', null, function (data) {
                $('#section-content').html(data);

                $.get('/r/animals', null, function (data) {

                    $('#table').bootstrapTable({
                        data: data
                    });
                }, 'json');
            }, 'html');
        }, 'html');
    }

    function loadAnimal(id) {
        $.get('/partials/animal.html', null, function (data) {
            $('#content').html(data);

            $('#received_date').datepicker();
            $('#sterilization_date').datepicker();
            $('#death_date').datepicker();

            $('#is_adoptable_yes').change(function () {
                $('#is_adoptable_reason_related_inputs').hide();
            });
            $('#is_adoptable_no').change(function () {
                $('#is_adoptable_reason_related_inputs').show();
            });

            $('#is_sterilizated_yes').change(function () {
                $('#is_sterilizated_related_inputs').show();
            });
            $('#is_sterilizated_no').change(function () {
                $('#is_sterilizated_related_inputs').hide();
            });

            $('#is_dead_yes').change(function () {
                $('#is_dead_related_inputs').show();
            });
            $('#is_dead_no').change(function () {
                $('#is_dead_related_inputs').hide();
            });

            if (id === 'new') {
                // set defaults
                $('#species').val('Cão');
                $('#female').prop('checked', true);
                $('#is_adoptable_yes').prop('checked', true);
                $('#is_adoptable_reason_related_inputs').hide();
                $('#is_sterilizated_no').prop('checked', true);
                $('#is_sterilizated_related_inputs').hide();
                $('#is_dead_no').prop('checked', true);
                $('#is_dead_related_inputs').hide();
            } else {
                $.get('/r/animal/' + id, null, function (data) {
                    $('#name').val(data.name);
                    $('#species').val(data.species);
                    $(data.gender === 0 ? '#male' : '#female').prop('checked', true);
                    $('#breed').val(data.breed);
                    $('#year_of_birth').val(data.year_of_birth);
                    $('#size').val(data.size);
                    $('#color').val(data.color);
                    $('#physical_state').val(data.physical_state);
                    $('#emotional_state').val(data.emotional_state);
                    $('#details').val(data.details);

                    if (data.is_adoptable === 0) {
                        $('#is_adoptable_no').prop('checked', true);
                        $('#is_adoptable_reason_related_inputs').show();
                    } else {
                        $('#is_adoptable_yes').prop('checked', true);
                        $('#is_adoptable_reason_related_inputs').hide();
                    }
                    $('#is_adoptable_reason').val(data.is_adoptable_reason);

                    if (!isNaN(Date.parse(data.received_date))) {
                        $('#received_date').datepicker('setDate', new Date(data.received_date));
                    }
                    $('#received_reason').val(data.received_reason);
                    $('#received_details').val(data.received_details);
                    $('#chip_code').val(data.chip_code);

                    if (data.is_sterilizated === 0) {
                        $('#is_sterilizated_no').prop('checked', true);
                        $('#is_sterilizated_related_inputs').hide();
                    } else {
                        $('#is_sterilizated_yes').prop('checked', true);
                        $('#is_sterilizated_related_inputs').show();
                    }
                    if (!isNaN(Date.parse(data.sterilization_date))) {
                        $('#sterilization_date').datepicker('setDate', new Date(data.sterilization_date));
                    }
                    $('#sterilization_details').val(data.sterilization_details);

                    if (data.is_dead === 0) {
                        $('#is_dead_no').prop('checked', true);
                        $('#is_dead_related_inputs').hide();
                    } else {
                        $('#is_dead_yes').prop('checked', true);
                        $('#is_dead_related_inputs').show();
                    }
                    if (!isNaN(Date.parse(data.death_date))) {
                        $('#death_date').datepicker('setDate', new Date(data.death_date));
                    }
                    $('#death_reason').val(data.death_reason);
                }, 'json');
            }

            $('#animal').prop('action', '/r/animal/' + id);
        }, 'html');
    }

    function route() {
        var hash = window.location.hash;

        if (hash.indexOf('#animals/adoptions') !== -1) {
            // loadAnimalsAdoptions();
        } else if (hash.indexOf('#animals/devolutions') !== -1) {
            // loadAnimalsDevolutions();
        } else if (hash.indexOf('#animals/agressivity-reports') !== -1) {
            // loadAnimalsAgressivityReports();
        } else if (hash.indexOf('#animals/escape-reports') !== -1) {
            // loadAnimalsEscapeReports();
        } else if (hash.indexOf('#animal/') !== -1) {
            var id = window.location.hash.split('/')[1];
            loadAnimal(id);
        } else {
            loadAnimals();
        }
    }

    $(document).ready(function () {
        $(window).on('hashchange', route);
        route();
    });

}(window, document));
