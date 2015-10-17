'use strict';

angular.module('tucha')
    .constant('states', [
        {name: 'animal', title: 'Animais', icon: 'glyphicon-star', active: true},
        {name: 'adoption', title: 'Adopções', icon: 'glyphicon-heart'},
        {name: 'person', title: 'Pessoas', icon: 'glyphicon-user'},
        {name: 'volunteer', title: 'Voluntários', icon: 'glyphicon-user'},
        {name: 'aggressivityReport', title: 'Relatórios Agressividade', icon: 'glyphicon-alert'},
        {name: 'escapeReport', title: 'Relatórios de Fuga', icon: 'glyphicon-sunglasses'},
        {name: 'supplier', title: 'Fornecedores', icon: 'glyphicon-euro'},
        {name: 'donation', title: 'Doações', icon: 'glyphicon-thumbs-up'},
        {name: 'devolution', title: 'Devoluções', icon: 'glyphicon-thumbs-down'},
        {name: 'veterinary', title: 'Veterinários', icon: 'glyphicon-plus'},
        {name: 'medicalExam', title: 'Exames Médicos', icon: 'glyphicon-check'},
        {name: 'vaccination', title: 'Vacinações', icon: 'glyphicon-check'},
        {name: 'deparasitation', title: 'Desparasitações', icon: 'glyphicon-check'},
        {name: 'medicalTreatment', title: 'Tratamento Médico', icon: 'glyphicon-check'},
        {name: 'medicamentPrescription', title: 'Receitas Méicas', icon: 'glyphicon-check'},
        {name: 'medicament', title: 'Medicamentos', icon: 'glyphicon-ice-lolly-tasted'},
        {name: 'medicamentUnit', title: 'Stock de Medicamentos', icon: 'glyphicon-equalizer'},
        {name: 'medicamentUsed', title: 'Medicamentos Usados', icon: 'glyphicon-minus'},
        //{name: 'medicamentSupplier', title: 'Fornecedores Medicamentos', icon: 'glyphicon-th-list'},
        {name: 'host', title: 'Família de Acolhimento', icon: 'glyphicon-home'},
        {name: 'state', title: 'Estados', icon: 'glyphicon-th-list'}
        //{name: 'user', title: 'Users', icon: 'glyphicon-th-list'}
    ]);
