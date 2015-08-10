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
        return '<img src="r/animal/' + value + '/thumbnail"/>';
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
    currentSituationHtml: function (value) {
        'use strict';
        switch (value) {
            case "MISSING_FROM_SHELTER":
                return "Desaparecido do abrigo";
            case "MISSING_FROM_ADOPTER":
                return "Desaparecido do adoptante";
            case "FAT":
                return "Família de Acolhimento Temporário (FAT)";
            case "FAR":
                return "Família de Acolhimento Remunerado (FAR)";
            case "ADOPTED":
                return "Adoptado";
            case "DEAD":
                return "Falecido";
            case "IN_SHELTER":
            default:
                return "No abrigo";
        }
    },
    age: function (value) {
        'use strict';
        if (value && value !== '0000-00-00') {
            return new Date(new Date() - new Date(value)).getUTCFullYear() - 1970;
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

    function addState(state) {
        $('#state_container').append(
            '<div class="form-group">' +
            '<div class="col-sm-3"></div>' +
            '<div class="col-sm-3 date" id="state_' + state.position + '" data-provide="datepicker" data-date-format="yyyy-mm-dd">' +
            '<div class="input-group">' +
            '<input type="text" class="form-control" name="state_date_' + state.position + '">' +
            '<span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>' +
            '</div>' +
            '</div>' +
            '<div class="col-sm-6">' +
            '<input type="text" class="form-control" id="state_details_' + state.position + '" name="state_details_' + state.position + '">' +
            '</div>' +
            '</div>'
        );
        $('#state_' + state.position).datepicker('setDate', state.date);
        $('#state_details_' + state.position).val(state.details);
    }

    function currentSituationAction() {
        switch ($('#current_situation').val()) {
            case 'MISSING_FROM_SHELTER':
            case 'MISSING_FROM_ADOPTER':
                $('#is_missing_related_inputs').show();
                $('#is_dead_related_inputs').hide();
                break;
            case 'DEAD':
                $('#is_missing_related_inputs').hide();
                $('#is_dead_related_inputs').show();
                break;
            default:
                $('#is_missing_related_inputs').hide();
                $('#is_dead_related_inputs').hide();
        }
    }

    function loadAnimal(id) {
        var statesCount = 0;

        $.get('/partials/animal.html', null, function (data) {
            $('#content').html(data);

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

            $('#current_situation').change(currentSituationAction);

            if (id === 'new') {
                // set defaults
                $('#species').val('Cão');
                $('#female').prop('checked', true);
                $('#is_adoptable_yes').prop('checked', true);
                $('#is_adoptable_reason_related_inputs').hide();
                $('#is_sterilizated_no').prop('checked', true);
                $('#is_sterilizated_related_inputs').hide();

                currentSituationAction();
            } else {
                $.get('/r/animal/' + id, null, function (data) {
                    $('#name').val(data.name);
                    $('#species').val(data.species);
                    $(data.gender === 0 ? '#male' : '#female').prop('checked', true);
                    $('#breed').val(data.breed);
                    if (!isNaN(Date.parse(data.date_of_birth))) {
                        $('#date_of_birth').datepicker('setDate', new Date(data.date_of_birth));
                    }
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

                    $('#current_situation').val(data.current_situation);

                    $('#missing_details').val(data.missing_details);
                    if (!isNaN(Date.parse(data.death_date))) {
                        $('#death_date').datepicker('setDate', new Date(data.death_date));
                    }
                    $('#death_reason').val(data.death_reason);

                    currentSituationAction();
                }, 'json');

                $.get('/r/animal/' + id + '/states', null, function (data) {
                    statesCount = data.length;
                    for (var i = 0; i < data.length; i++) {
                        addState(data[i]);
                    }
                }, 'json');
            }

            $('#state_button').click(function () {
                addState({
                    position: statesCount,
                    date: new Date()
                });
                statesCount++;
                return false;
            });

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
