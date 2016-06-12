'use strict';

angular.module('tucha')
    .constant('columns', {
        id: {field: 'id', name: 'Id', visible: false},
        code: {
            field: 'code', name: 'Código', width: 100, sort: {direction: 'asc'},
            sortingAlgorithm: function (a, b) {
                if (a === null || a === '') {
                    return 1;
                } else if (b === null || b === '') {
                    return -1;
                } else if (a.match(/\d+/) === null || b.match(/\d+/) === null) {
                    return a.localeCompare(b);
                } else {
                    return parseInt(a.match(/\d+/)[0], 10) > parseInt(b.match(/\d+/)[0], 10) ? 1 : -1;
                }
            }
        },
        name: {field: 'name', name: 'Nome', minWidth: 100},
        species: {field: 'species', name: 'Espécie', width: 50},
        gender: {
            field: 'gender', name: 'Sexo', visible: false,
            cellTemplate: '<span>{{row.entity.gender | tuchaBoolean:[\'Fêmea\', \'Macho\']}}</span>'
        },
        breed: {field: 'breed', name: 'Raça', visible: false},
        date_of_birth: {
            field: 'date_of_birth',
            name: 'Idade',
            width: 50,
            cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.date_of_birth | tuchaAge}}</div>'
        },
        size: {field: 'size', name: 'Tamanho', visible: false},
        color: {field: 'color', name: 'Cor', visible: false},
        details: {field: 'details', name: 'Detalhes'},
        is_adoptable: {
            field: 'is_adoptable',
            name: 'Adoptável',
            width: 50,
            cellTemplate: '<span>{{row.entity.is_adoptable | tuchaBoolean}}</span>'
        },
        is_adoptable_reason: {field: 'is_adoptable_reason', name: 'Motivo da não ser adoptável', visible: false},
        received_by: {field: 'received_by', name: 'Recebido por', visible: false},
        received_from: {field: 'received_from', name: 'Receido de', visible: false},
        received_date: {field: 'received_date', name: 'Recebido em', visible: false},
        chip_code: {field: 'chip_code', name: 'Código do Chip', visible: false},
        is_sterilizated: {
            field: 'is_sterilizated',
            name: 'Esterilizado',
            width: 50,
            cellTemplate: '<span>{{row.entity.is_sterilizated | tuchaBoolean}}</span>'
        },
        sterilization_date: {field: 'sterilization_date', name: 'Data do Esterelizamento', visible: false},
        sterilization_by: {field: 'sterilization_by', name: 'Esterlizado por', visible: false},
        sterilization_details: {field: 'sterilization_details', name: 'Detalhes do Esterelizamento', visible: false},
        current_situation: {
            field: 'current_situation', name: 'Situação Actual', minWidth: 300,
            cellTemplate: '<span>{{row.entity.current_situation | tuchaCurrentSituation}}</span>'
        },
        missing_details: {field: 'missing_details', name: 'Detalhes do Desaparecimento', visible: false},
        death_date: {field: 'death_date', name: 'Data do Falecimento', visible: false},
        death_reason: {field: 'death_reason', name: 'Motivo do Falecimento', visible: false},
        picture_thumbnail: {field: 'picture_thumbnail', name: 'Foto'},
        picture: {field: 'picture', name: 'Foto', visible: false},
        animal: {field: 'animal', name: 'Animal'},
        date: {field: 'date', name: 'Data'},
        adoptant: {field: 'adoptant', name: 'Adoptante'},
        reported_by: {field: 'reported_by', name: 'Reportado por'},
        veterinary: {field: 'veterinary', name: 'Veterinário'},
        reason: {field: 'reason', name: 'Motivo'},
        donated_by: {field: 'donated_by', name: 'Doado por'},
        returned_date: {field: 'returned_date', name: 'Data'},
        person: {field: 'person', name: 'Pessoa'},
        start_date: {field: 'start_date', name: 'Data de Início'},
        end_date: {field: 'end_date', name: 'Data de Fim'},
        supplier: {field: 'supplier', name: 'Fornecedor'},
        medicament: {field: 'medicament', name: 'Medicamento'},
        used: {field: 'used', name: 'Usado'},
        opening_date: {field: 'opening_date', name: 'Data de Abertura'},
        expiration_date: {field: 'expiration_date', name: 'Data de Expiração'},
        bought_in: {field: 'bought_in', name: 'Comprado em', visible: false},
        bought_by: {field: 'bought_by', name: 'Comprado por', visible: false},
        acquired_date: {field: 'acquired_date', name: 'Adquirido em', visible: false},
        unitary_price: {field: 'unitary_price', name: 'Preço Unitário'},
        initial_quantity: {field: 'initial_quantity', name: 'Quantidade inicial'},
        remaining_quantity: {field: 'remaining_quantity', name: 'Quantidade restante'},
        address: {field: 'address', name: 'Endereço', visible: false},
        city: {field: 'city', name: 'Localidade', visible: false},
        phone: {field: 'phone', name: 'Telefone'},
        email: {field: 'email', name: 'Email'},
        new_adoption_allowed: {field: 'new_adoption_allowed', name: 'Nova Adopção Permitida'},
        can_host: {field: 'can_host', name: 'Pode Acolher'},
        host_capacity: {field: 'host_capacity', name: 'Capacidade de Acolhimento'},
        host_details: {field: 'host_details', name: 'Detalhes', visible: false},
        host_species: {field: 'host_species', name: 'Que tipos de Animais Acolhe', visible: false},
        position: {field: 'position', name: 'Posição', visible: false},
        username: {field: 'username', name: 'Username'},
        role: {field: 'role', name: 'Funções'},
        disponibility: {field: 'disponibility', name: 'Disponibilidade'},
        activities: {field: 'activities', name: 'Actividades'},
        expertises: {field: 'expertises', name: 'Competências'},
        connections: {field: 'connections', name: 'Contactos'},
        administrator: {field: 'administrator', name: 'Administrador'},
        prescription: {field: 'prescription', name: 'Receita Médica'},
        quantity: {field: 'quantity', name: 'Quantidade'},
        quantity_unit: {field: 'quantity', name: 'Unidade da Quantidade'}
    });
