//TODO find a way to avoid using global variables
/* exported cellFormatters */
var cellFormatters = {
    editButtonHtml: function(value) {
        'use strict';
        return '<a class="btn btn-primary" href="#animal/' + value + '" role="button">' +
            '<i class="glyphicon glyphicon-pencil"></i> Editar</a>';
    },
    thumbnailHtml: function() {
        'use strict';
        return '<img src="images/1.jpg"/>';
    },
    genderHtml: function(value) {
        'use strict';
        if (value === 0) {
            return 'Macho';
        } else {
            return 'Fêmea';
        }
    },
    truthyHtml: function(value) {
        'use strict';
        if (value === 0) {
            return 'Não';
        } else {
            return 'Sim';
        }
    }
};

(function() {
    'use strict';

    function loadAnimals() {

        $.get('/partials/animals.html', null, function(data) {
            $('#content').html(data);
            $.get('/partials/animalsList.html', null, function(data) {
                $('#section-content').html(data);

                $.get('/r/animals', null, function(data) {

                    $('#table').bootstrapTable({
                        data: data
                    });
                }, 'json');
            }, 'html');
        }, 'html');

    }

    function loadAnimal(id) {
        $.get('/partials/animal.html', null, function(data) {
            $('#content').html(data);

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

    $(document).ready(function() {
        $(window).on('hashchange', route);
        route();
    });

}(window, document));