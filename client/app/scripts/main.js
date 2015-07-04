//TODO find a way to avoid using global variables
/* exported cellFormatters */
var cellFormatters = {
    editButtonHtml: function (value) {
        'use strict';
        return '<a class="btn btn-primary" href="#animal/' + value + '" role="button">' +
            '<i class="glyphicon glyphicon-pencil"></i> Editar</a>';
    },
    thumbnailHtml: function () {
        'use strict';
        return '<img src="images/1.jpg"/>';
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

    function setAdoptable(value) {
        if (value) {
            $('#is_adoptable_reason').prop('disabled', true);
        } else {
            $('#is_adoptable_reason').prop('disabled', false);
        }
    }

    function setSterilizated(value) {
        if (value) {
            $('#sterilization_date input').prop('disabled', false);
            $('#sterilization_date').datepicker();
            $('#sterilization_details').prop('disabled', false);
        } else {
            $('#sterilization_date input').prop('disabled', true);
            $('#sterilization_date').datepicker('remove');
            $('#sterilization_details').prop('disabled', true);
        }
    }

    function setDead(value) {
        if (value) {
            $('#death_date input').prop('disabled', false);
            $('#death_date').datepicker();
            $('#death_reason').prop('disabled', false);
        } else {
            $('#death_date input').prop('disabled', true);
            $('#death_date').datepicker('remove');
            $('#death_reason').prop('disabled', true);
        }
    }

    function loadAnimal(id) {
        $.get('/partials/animal.html', null, function (data) {
            $('#content').html(data);

            $('#is_adoptable_yes').change(function () {
                setAdoptable(true);
            });
            $('#is_adoptable_no').change(function () {
                setAdoptable(false);
            });

            $('#is_sterilizated_yes').change(function () {
                setSterilizated(true);
            });
            $('#is_sterilizated_no').change(function () {
                setSterilizated(false);
            });

            $('#is_dead_yes').change(function () {
                setDead(true);
            });
            $('#is_dead_no').change(function () {
                setDead(false);
            });

            $('#received_date').datepicker();

            if (id === 'new') {
                // set defaults
                $('#species').val("Cão");
                $('#female').prop('checked', true);
                $('#is_adoptable_yes').prop('checked', true);
                setAdoptable(true);
                $('#is_sterilizated_no').prop('checked', true);
                setSterilizated(false);
                $('#is_dead_no').prop('checked', true);
                setDead(false);
            } else {
                $.get('/r/animal/' + id, null, function (data) {
                    $('#name').val(data.name);
                    $('#species').val(data.species);
                    $(data.gender === 0 ? '#male' : '#female').prop('checked', true);
                    $('#breed').val(data.breed);
                    $('#extimated_age').val(data.extimated_age);
                    $('#size').val(data.size);
                    $('#color').val(data.color);
                    $('#physical_state').val(data.physical_state);
                    $('#emotional_state').val(data.emotional_state);
                    $('#details').val(data.details);
                    $(data.is_adoptable === 0 ? '#is_adoptable_no' : '#is_adoptable_yes').prop('checked', true);
                    setAdoptable(data.is_adoptable === 1);
                    $('#is_adoptable_reason').val(data.is_adoptable_reason);
                    $('#received_date input').val(data.received_date);
                    $('#received_reason').val(data.received_reason);
                    $('#received_details').val(data.received_details);
                    $('#chip_code').val(data.chip_code);
                    $(data.is_sterilizated === 0 ? '#is_sterilizated_no' : '#is_sterilizated_yes').prop('checked', true);
                    setSterilizated(data.is_sterilizated === 1);
                    $('#sterilization_date input').val(data.sterilization_date);
                    $('#sterilization_details').val(data.sterilization_details);
                    $(data.is_dead === 0 ? '#is_dead_no' : '#is_dead_yes').prop('checked', true);
                    setDead(data.is_dead === 1);
                    $('#death_date input').val(data.death_date);
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
