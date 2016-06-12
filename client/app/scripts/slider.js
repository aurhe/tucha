(function (window, document) {
    'use strict';

    $(document).ready(function () {
        $('.slider').slick({
            //dots: true,
            autoplay: true,
            autoplaySpeed: 5000,
            fade: true,
            cssEase: 'linear',
            asNavFor: '.nav-slider',
            lazyLoad: 'ondemand',
            adaptiveHeight: false,
            variableWidth: false
        });
        $('.nav-slider').slick({
            arrows: false,
            slidesToShow: 5,
            slidesToScroll: 1,
            centerMode: true,
            focusOnSelect: true,
            draggable: false,
            asNavFor: '.slider',
            lazyLoad: 'ondemand'
        });

        $.get('/r/adoptableAnimals', null, function (data) {
            var html = '';
            for (var i = 0; i < data.length; i++) {
                html += '<div><img data-lazy="r/animal/' + data[i].id + '/picture"/></div>';
            }
            $('.slider').slick('slickAdd', html);
            $('.nav-slider').slick('slickAdd', html);

            function fixTextSize() {
                $('.dog-name').textfill({
                    maxFontPixels: 200
                });
            }

            function fillDogName(index) {
                if (data[index].gender === 1) {
                    $('.adopt-text').text('Adopte a');
                } else {
                    $('.adopt-text').text('Adopte o');
                }

                $('.dog-name span').text(data[index].name);
                fixTextSize();
            }

            $('.slider').on('afterChange', function (event, slick, currentSlide) {
                fillDogName(currentSlide);
            });
            fillDogName(0);

            window.onresize = fixTextSize;

            $('.slider').slick('slickPlay');

        }, 'json');

    });
}(window, document));
