// ----------------- Product Details -----------------
var productTabsJS = function () {
  // jquery for content navigation
  $(".sk-product__info-btn").click(function () {
    $(".sk-product__info-btn").removeClass("active");
    $(this).addClass("active");
  });

  $("#sk-product__info-list li button").on("click", function (e) {
    e.preventDefault();
    var page = $(this).data("page");

    $("#sk-product__info-details .sk-product__item-info:not('.display-none')")
      .stop()
      .fadeOut("fast", function () {
        $(this).addClass("display-none");

        $(
          '#sk-product__info-details .sk-product__item-info[data-page="' +
            page +
            '"]'
        )
          .fadeIn("slow")
          .removeClass("display-none");
      });
  });
};

// ----------------- Main Slick Slider  -----------------
var bannerSliderJS = function (dotsStatus) {
  $(".sk-main__banner-slider")
    .not(".slick-initialized")
    .slick({
      speed: 800,
      autoplay: true,
      autoplaySpeed: 3000,
      centerMode: true,
      dots: dotsStatus,
      centerPadding: "0px",
      infinite: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            arrows: true,
            centerMode: true,
            centerPadding: "20px",
            slidesToShow: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            arrows: true,
            centerMode: true,
            centerPadding: "0px",
            slidesToShow: 1,
          },
        },
      ],
    });
};

// ---------- product details slider ------------
var gallerySliderJS = function (sliderLength) {
  $(".sk-product-slider-for").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: false,
    adaptiveHeight: true,
    infinite: false,
    useTransform: true,
    speed: 300,
  });

  $(".sk-product-slider-nav")
    .on("init", function (event, slick) {
      $(".sk-product-slider-nav .slick-slide.slick-current").addClass("active");
    })
    .slick({
      slidesToShow: sliderLength,
      slidesToScroll: 2,
      dots: false,
      focusOnSelect: false,
      infinite: false,
    });

  $(".sk-product-slider-for").on(
    "afterChange",
    function (event, slick, currentSlide) {
      $(".sk-product-slider-nav").slick("slickGoTo", currentSlide);
      var currrentNavSlideElem =
        '.sk-product-slider-nav .slick-slide[data-slick-index="' +
        currentSlide +
        '"]';
      $(".sk-product-slider-nav .slick-slide.active").removeClass("active");
      $(currrentNavSlideElem).addClass("active");
    }
  );

  $(".sk-product-slider-nav").on("click", ".slick-slide", function (event) {
    event.preventDefault();
    var goToSingleSlide = $(this).data("slick-index");

    $(".sk-product-slider-for").slick("slickGoTo", goToSingleSlide);
  });
};

var videoSliderJS = function () {
  $(".sk-video-slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: false,
    adaptiveHeight: true,
    infinite: false,
    useTransform: true,
    speed: 300,
  });

  $(".sk-video-slider-nav")
    .on("init", function (event, slick) {
      $(".sk-video-slider-nav .slick-slide.slick-current").addClass("active");
    })
    .slick({
      slidesToShow: 4,
      slidesToScroll: 2,
      dots: false,
      focusOnSelect: false,
      infinite: false,
    });

  $(".sk-video-slider").on(
    "afterChange",
    function (event, slick, currentSlide) {
      $(".sk-video-slider-nav").slick("slickGoTo", currentSlide);
      var currrentNavSlideElem =
        '.sk-video-slider-nav .slick-slide[data-slick-index="' +
        currentSlide +
        '"]';
      $(".sk-video-slider-nav .slick-slide.active").removeClass("active");
      $(currrentNavSlideElem).addClass("active");
    }
  );

  $(".sk-video-slider-nav").on("click", ".slick-slide", function (event) {
    event.preventDefault();
    var goToSingleSlide = $(this).data("slick-index");

    $(".sk-video-slider").slick("slickGoTo", goToSingleSlide);
  });
};

// ----------- privacy policy scroll js ------------
$(window).scroll(function () {
  if ($("#provitNowDocScrollspy").length) {
    let mainNavLinks = document.querySelectorAll(
      "nav#provitNowDocScrollspy ul.provitNowDoc_sidenav li a"
    );

    let fromTop = window.scrollY;

    let endSelect = document.querySelector("#addendums");
    if (endSelect.offsetTop - 400 <= fromTop) {
      let topFixed = endSelect.offsetTop - 400;
      document
        .querySelector(".provitNowDoc_sidenav")
        .setAttribute("style", "position:absolute; top: " + topFixed + "px;");
    } else {
      document
        .querySelector(".provitNowDoc_sidenav")
        .setAttribute("style", "position:fixed; top: 190px;");
    }

    mainNavLinks.forEach((link) => {
      if (link.hash != "") {
        let section = document.querySelector(link.hash);
        if (section != null) {
          let prntList = link.parentNode;
          if (
            section.offsetTop <= fromTop &&
            section.offsetTop + section.offsetHeight > fromTop
          ) {
            if (!prntList.classList.contains("active")) {
              prntList.classList.add("active");
              if (prntList.classList.contains("parent-list")) {
                $(".provitNowDoc_sidenav").scrollTop(prntList.offsetTop);
              }
            }
          } else {
            if (prntList.classList.contains("active")) {
              prntList.classList.remove("active");
            }
          }
        }
      }
    });
  }
});

/*-------------better trips-------------*/
var betterTripsSliderJs = () => {
  //js for better-trips-photo-slider
  $(".better-trips-photo-slider").slick({
    speed: 8000,
    autoplay: true,
    autoplaySpeed: 0,
    centerMode: false,
    cssEase: "linear",
    slidesToShow: 1,
    draggable:false,
    focusOnSelect:false,
    pauseOnFocus:false,
    pauseOnHover:false,
    slidesToScroll: 1,
    variableWidth: true,
    infinite: true,
    initialSlide: 1,
    arrows: false,
    buttons: false,
  });

  //js for experienced-community-slider
  $(".experienced-community-slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    dots: false,
    infinite: false,
  });
};

/* ----------- tag slider ------------ */
var tagSliderJS = function (tagSlug, sliderLength) {
  let finalSlides = sliderLength >= 3 ? 3 : sliderLength;
  $(".sk-category__products." + tagSlug).not(".slick-initialized").slick({
    infinite: false,
    slidesToShow: finalSlides,
    slidesToScroll: 1,
    autoplay: false,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 768,

        settings: {
          slidesToShow: 2,
        },
      },
    ],
  });
};

var leaderBoardJS = function () {
  var default_size = {
    w: 20,
    h: 15,
  };

  function calcPos(letter, size) {
    return -(letter.toLowerCase().charCodeAt(0) - 97) * size;
  }

  $.fn.setFlagPosition = function (iso, size) {
    size || (size = default_size);

    var x = calcPos(iso[1], size.w),
      y = calcPos(iso[0], size.h);

    return $(this).css("background-position", [x, "px ", y, "px"].join(""));
  };

  $(function () {
    $(".promo-country-flag").each(function (i, obj) {
      $(obj).find("i").setFlagPosition($(obj).data("code"));
    });

    $(".pruvit-leaderborad a").each(function (i, obj) {
      let hrefAttr = $(obj).attr("href");

      $(obj).attr("href", "#" + hrefAttr);
    });
  });
};

//js for tooltip
var tooltipJS = function () {
  $('[data-toggle="tooltip"]').tooltip();
};

// slick slider for header-slider
const headerSliderJS = () => {
  $(".offer-slider").not(".slick-initialized").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    arrows: true,
    dots: false,
    autoplay: true,
    speed: 300,
    autoplaySpeed: 4000,
    pauseOnHover: true,
  });
};

//js for marquee slide
const foodLandSlide = () => {
  $(".ultimate-marquee-slide").slick({
    speed: 7800,
    autoplay: true,
    autoplaySpeed: 0,
    centerMode: true,
    cssEase: "linear",
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    infinite: true,
    initialSlide: 1,
    arrows: false,
    buttons: false,
  });
};

function loadTypeText() {
  var app = document.getElementById("typeWrite");

  var typewriter = new Typewriter(app, {
    loop: true,
  });

  typewriter
    .typeString("ketones")
    .pauseFor(1500)
    .deleteAll()
    .typeString("food")
    .pauseFor(1500)
    .deleteAll()
    .typeString("community")
    .pauseFor(1500)
    .start();
}

const foodLandTestimonial = () => {
  $(".foodLand-testimonial-slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    dots: false,
    infinite: true,
    autoplaySpeed: 4000,
    pauseOnFocus: false,
    pauseOnHover: true,
  });
};

const referrerHomeJS = () => {
  $(document).on('click', '.slick-dots li', function() {
    var selectedSlide = $(this).attr('data-index');
    $('.shopketo-me-slider').slick("slickGoTo", selectedSlide);
    $('.show-text-btn').text($(this).find('button').text());
  });

  $(document).on('swipe', '.shopketo-me-slider', function(event, slick, direction){
    $('.show-text-btn').text($('.slick-dots li[class="slick-active"]').find('button').text());
  });
  
  $(document).on('click', '.slick-arrow', function() {
    $('.show-text-btn').text($('.slick-dots li[class="slick-active"]').find('button').text());
  });
  
  $('.shopketo-me-slider').on('init', function(event, slick){
    
    const bottomWrapperHeight = window.matchMedia("(max-width: 767px)").matches ? 80 : 98;
    const sliderHeight = $(window).height() - (bottomWrapperHeight + $('header').height());
    $('.me-item').css('height', sliderHeight + 'px');

    var dots = $( '.slick-dots li' );
    dots.each( function( k, v){
      $(this).find( 'button' ).addClass( 'heading'+ k );
      $(this).attr('data-index', k);
    });

    var dropdown = '<div class="btn-group dropup slider-dropdown"><button type="button" class="btn btn-secondary dropdown-toggle show-text-btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">About me</button><div class="dropdown-menu">'+$( '.slick-dots' ).html()+'</div></div>';
    $( '.slick-dots' ).html(dropdown);
    
    var items = slick.$slides;
    items.each( function( k, v){
        var text = $(this).find( '.page-title' ).text();
        $( '.heading' + k ).text(text);
    });

  });
  
  $(".shopketo-me-slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    focusOnSelect: true,
    infinite: false,
    centerMode: true,
    centerPadding: '0',
    arrows: true,
    dots: true,
    speed: 600
  });
};
const togglePasswordJS = () => {
  //js for Toggle Password type 
  $(document).on('click' , ".toggle-password-btn", function() {
    $(this).toggleClass("fa-eye fa-eye-slash");
    var input = $($(this).attr("toggle"));
    if (input.attr("type") == "password") {
      input.attr("type", "text");
    } else {
      input.attr("type", "password");
    }
  });
}

const addToCalenderJS = () => {
  const config = {
    name: "Phoenix Rise-Up Virtual Event",
    startDate: "2023-01-18",
    endDate: "2023-01-18",
    startTime:"18:00",
    endTime:"21:00",
    timeZone:"America/New_York",
    options: [ 
      "Apple",
      "Google",
      "iCal",
      "Outlook.com",
      "Yahoo"
    ],
    trigger: "click",
    iCalFileName: "Phoenix Rise-Up Virtual Event",
  };
  const button = document.getElementById('addToCalenderBtn');
  atcb_action(config, button);
}

const inviteModalJS = () => {
  // $("#shareVIModal").on("hidden.bs.modal", function() {
  //   $(window).scrollTop(0);
  // });
};

const ladybossHomeJS = () => {
  $('.ladyBoss-product-slider-for').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    asNavFor: '.ladyBoss-product-slider-thumb'
  });
  $('.ladyBoss-product-slider-thumb').slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: '.ladyBoss-product-slider-for',
    dots: false,
    focusOnSelect: true
  });
};
const aboutSliderJs = () => {
  //js for our-story-slider
  $(".our-story-slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    autoplay: true,
    autoplaySpeed: 2500,
    infinite: false,
    centerMode: true,
    centerPadding: '29%',
    responsive: [
      {
        breakpoint: 1466,
        settings: {
          centerPadding: '22%'
        },
      },
      {
        breakpoint: 1023,
        settings: {
          centerPadding: '14%'
        },
      },
      {
        breakpoint: 640,
        settings: {
          centerPadding: '6%'
        },
      },
    ],
  });
  setTimeout(() => {
    //js for brand-cards-slider
    $(".brand-cards-slider.left-move").slick({
      speed: 8000,
      autoplay: true,
      autoplaySpeed: 0,
      centerMode: false,
      cssEase: "linear",
      slidesToShow: 1,
      draggable:false,
      focusOnSelect:false,
      pauseOnFocus:false,
      pauseOnHover:false,
      slidesToScroll: 1,
      variableWidth: true,
      infinite: true,
      initialSlide: 1,
      arrows: false,
      buttons: false,
    });
    //js for brand-cards-slider
    $(".brand-cards-slider.right-move").slick({
      speed: 8000,
      autoplay: true,
      autoplaySpeed: 0,
      centerMode: false,
      cssEase: "linear",
      slidesToShow: 1,
      draggable:false,
      focusOnSelect:false,
      pauseOnFocus:false,
      pauseOnHover:false,
      slidesToScroll: 1,
      variableWidth: true,
      infinite: true,
      initialSlide: 1,
      arrows: false,
      buttons: false,
      rtl: true
    });

    }, 800);
}

const viLimitedProdSliderJs = () => {
  setTimeout(() => {
    //js for limited-product-slider
    $(".limited-product-slider.left-move").slick({
      speed: 8000,
      autoplay: true,
      autoplaySpeed: 0,
      centerMode: false,
      cssEase: "linear",
      slidesToShow: 1,
      draggable:false,
      focusOnSelect:false,
      pauseOnFocus:false,
      pauseOnHover:false,
      slidesToScroll: 1,
      variableWidth: true,
      infinite: true,
      initialSlide: 1,
      arrows: false,
      buttons: false,
    });
    //js for limited-product-slider
    $(".limited-product-slider.right-move").slick({
      speed: 8000,
      autoplay: true,
      autoplaySpeed: 0,
      centerMode: false,
      cssEase: "linear",
      slidesToShow: 1,
      draggable:false,
      focusOnSelect:false,
      pauseOnFocus:false,
      pauseOnHover:false,
      slidesToScroll: 1,
      variableWidth: true,
      infinite: true,
      initialSlide: 1,
      arrows: false,
      buttons: false,
      rtl: true
    });

  }, 800);
}

const bonusOfferSliderJS = () => {
  if($('.dashboard-offer-slider').children().length > 2) {
    $(".dashboard-offer-slider").not(".slick-initialized").slick({
      slidesToShow: 2,
      slidesToScroll: 1,
      arrows: true,
      dots: false,
      autoplay: false,
      infinite: false,
      speed: 300,
      responsive: [
        {
          breakpoint: 767,
          settings: "unslick"
        }
      ]
    });
  }
  if($('.dashboard-expired-offer-slider').children().length > 2) {
    $('a[href="#tabExpired"]').on('shown.bs.tab', function (e) {
      $(".dashboard-expired-offer-slider").not(".slick-initialized").slick({
        slidesToShow: 2,
        slidesToScroll: 1,
        arrows: true,
        dots: false,
        autoplay: false,
        infinite: false,
        speed: 300,
        responsive: [
          {
            breakpoint: 767,
            settings: {
                slidesToShow: 1,
            }
          }
        ]
      });
    });
  }
};

const fbChatHideNShowJS = () => {
  $(document).on('click', 'body .drawer-overlay, body .sk-cart__close-btn, body .drawer-close-btn', function() {
    if($('body #fb-root .fb_iframe_widget').length) $('body #fb-root').css('display', 'block');
  });
  $(document).on('click', '.navbar li.nav-item a.drawer-toggle, .navbar li.nav-item a.cart-has-product, .nav-menu-top li a.drawer-toggle, .sk-main__product-btn button.buy-now', function() {
    if($('body #fb-root .fb_iframe_widget').length) $('body #fb-root').css('display', 'none');
  });
};
