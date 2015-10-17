'use strict';

angular.module('tucha')
    .constant('states', [
        {name: 'animal', title: 'Animais', icon: 'glyphicon-th-list', active: true},
        {name: 'adoption', title: 'Adopções', icon: 'glyphicon-th-list'},
        {name: 'person', title: 'Pessoas', icon: 'glyphicon-th-list'},
        {name: 'volunteer', title: 'Voluntários', icon: 'glyphicon-th-list'},
        {name: 'veterinary', title: 'Veterinários', icon: 'glyphicon-th-list'},
        {name: 'medicalExam', title: 'Exames Médicos', icon: 'glyphicon-th-list'},
        {name: 'vaccination', title: 'Vacinações', icon: 'glyphicon-th-list'},
        {name: 'deparasitation', title: 'Desparasitações', icon: 'glyphicon-th-list'},
        {name: 'medicalTreatment', title: 'Tratamento Médico', icon: 'glyphicon-th-list'},
        {name: 'medicamentPrescription', title: 'Receitas Méicas', icon: 'glyphicon-th-list'},
        {name: 'aggressivityReport', title: 'Relatórios Agressividade', icon: 'glyphicon-th-list'},
        {name: 'escapeReport', title: 'Relatórios de Fuga', icon: 'glyphicon-th-list'},
        {name: 'medicament', title: 'Medicamentos', icon: 'glyphicon-th-list'},
        {name: 'supplier', title: 'Fornecedores', icon: 'glyphicon-th-list'},
        {name: 'donation', title: 'Doações', icon: 'glyphicon-th-list'},
        {name: 'medicamentUnit', title: 'Stock de Medicamentos', icon: 'glyphicon-th-list'},
        {name: 'devolution', title: 'Devoluções', icon: 'glyphicon-th-list'},
        {name: 'medicamentUsed', title: 'Medicamentos Usados', icon: 'glyphicon-th-list'},
        //{name: 'medicamentSupplier', title: 'Fornecedores Medicamentos', icon: 'glyphicon-th-list'},
        {name: 'host', title: 'Anfitriões', icon: 'glyphicon-th-list'},
        {name: 'state', title: 'Estados', icon: 'glyphicon-th-list'}
        //{name: 'user', title: 'Users', icon: 'glyphicon-th-list'}
    ]);
