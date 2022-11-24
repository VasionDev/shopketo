var productInfoJS = function () {
  if ($('.flavor-select').length) {
    $('.flavor-select').change(function () {
      var targetTableId = $(this).val();
      if ($('#' + targetTableId).length) {
        $('#' + targetTableId).siblings().removeClass('show').addClass('hide');
        $('#' + targetTableId).removeClass('hide').addClass('show');
      }
    });
  }

  if ($('.ketoUp-canImg').length && $(window).width() > 767) {
    var mn = $('.ketoUp-canImg');
    var mns = "ketoUp-canImg-sticky";
    var hdr = mn.offset().top;
    var hdrTollerate = hdr * 1;
    $(window).scroll(function () {
      if ($(this).scrollTop() > hdrTollerate - 10) {
        $('.ketoUp-canImg').addClass(mns);
      } else {
        $('.ketoUp-canImg').removeClass(mns);
      }
    });
  }

  // Js for reboot-iteam-slider-for
  $('.reboot-iteam-slider-for').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.reboot-iteam-slider-nav'
  });

  // Js for reboot-iteam-slider-nav
  var $rebootItemsSlickNavElement = $('.reboot-iteam-slider-nav');

  $rebootItemsSlickNavElement.on('init beforeChange', function (event, slick, currentSlide, nextSlide) {
    if (!nextSlide || nextSlide < 1) {
      $(slick.$slideTrack[0]).addClass('slick-track-first');

    } else {
      $(slick.$slideTrack[0]).removeClass('slick-track-first');
    }

  });


  $rebootItemsSlickNavElement.slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    asNavFor: '.reboot-iteam-slider-for',
    dots: false,
    centerMode: true,
    focusOnSelect: true,
    centerPadding: "130px",
    infinite: false,
    arrows: false,

    responsive: [{
        breakpoint: 2400,
        settings: {
          centerPadding: "200px"
        }
      },
      {
        breakpoint: 1380,
        settings: {
          centerPadding: "130px"
        }
      },
      {
        breakpoint: 1120,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 780,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerPadding: "100px"
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "0px",
          arrows: true,
          centerMode: false,
          focusOnSelect: false
        }
      }
    ]
  });

}


$(document).on('click', '.mvp-flavor-select', function() {
  $('.mvpflavor').addClass('hide');
  var productid = $(this).data('productid');
  $('.mvp-flavor-select').removeClass('active');
  // $('#mvpflavor-'+$(this).data('productid')).removeClass('hide');
  $('.product-lineup-items').find('#mvpflavor-'+$(this).data('productid')).removeClass('hide');
  $('.flavor-btn').find("[data-productid='" + productid + "']").addClass('active');
});

if ($('.flavor-select').length) {
  $('.flavor-select').change(function() {
      prodFlavorSelAction.change($, $(this));
  });
}
