var blogSliderJS = function () {
  $(".blog-topic-container").slick({
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          centerPadding: "0px",
        },
      },
      {
        breakpoint: 600,
        settings: "unslick",
      },
    ],
  });
};
