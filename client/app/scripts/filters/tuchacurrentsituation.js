'use strict';

angular.module('tucha')
    .filter('tuchaCurrentSituation', function () {
        return function (input) {
            switch (input) {
                case 'IN_SHELTER':
                    return 'No abrigo';
                case 'MISSING_FROM_SHELTER':
                    return 'Desaparecido do abrigo';
                case 'MISSING_FROM_ADOPTER':
                    return 'Desaparecido do adoptante';
                case 'FAT':
                    return 'Família de Acolhimento Temporário (FAT)';
                case 'FAR':
                    return 'Família de Acolhimento Remunerado (FAR)';
                case 'ADOPTED':
                    return 'Adoptado';
                case 'OWNER':
                    return 'Entregue ao Dono';
                case 'DEAD':
                    return 'Falecido';
                default:
                    return '';
            }
        };
    });
