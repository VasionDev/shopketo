const researchSliderJS = () => {
  $(".research-slider").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: false,
    autoplay: false,
    dots: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  });
};

const aosJS = () => {
  AOS.init({
    duration: 1500,
    once: true,
  });
};

const researchFlipCardJS = () => {
  const learnMoreEl = document.getElementsByClassName("learn-more");
  const cardCloseEl = document.getElementsByClassName("card-close");

  const cardRotated = function (e) {
    e.preventDefault();
    const researchLab = this.closest(".research-card");
    const cardFront = researchLab.querySelector(".card-front");
    const cardBack = researchLab.querySelector(".card-back");
    cardBack.classList.add("active");
    cardFront.style.transform = "rotateY(180deg)";
  };

  const cardCLose = function (e) {
    e.preventDefault();
    const researchLab = this.closest(".research-card");
    const cardFront = researchLab.querySelector(".card-front");
    const cardBack = researchLab.querySelector(".card-back");
    cardBack.classList.remove("active");
    cardFront.style.transform = "rotateY(0deg)";
  };

  Array.from(learnMoreEl).forEach(function (el) {
    el.addEventListener("click", cardRotated);
  });

  Array.from(cardCloseEl).forEach(function (el) {
    el.addEventListener("click", cardCLose);
  });
};


const smartshipFlipCardJS = () => {
  const learnMoreEl = document.getElementsByClassName("learn-more");
  const cardCloseEl = document.getElementsByClassName("card-close");

  const cardRotated = function (e) {
    e.preventDefault();
    const exclusiveCard = this.closest(".exclusive-card");
    const cardFront = exclusiveCard.querySelector(".card-front");
    const cardBack = exclusiveCard.querySelector(".card-back");
    cardBack.classList.add("active");
    cardFront.style.transform = "rotateY(180deg)";
  };

  const cardCLose = function (e) {
    e.preventDefault();
    const exclusiveCard = this.closest(".exclusive-card");
    const cardFront = exclusiveCard.querySelector(".card-front");
    const cardBack = exclusiveCard.querySelector(".card-back");
    cardBack.classList.remove("active");
    cardFront.style.transform = "rotateY(0deg)";
  };

  Array.from(learnMoreEl).forEach(function (el) {
    el.addEventListener("click", cardRotated);
  });

  Array.from(cardCloseEl).forEach(function (el) {
    el.addEventListener("click", cardCLose);
  });
};

const learnPageSliderJs = function (e) {
  $(".favorite-community-slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: false,
    dots: false,
    infinite: false,
  });

  //choose-starter-pack-slider
  /*$(".choose-starter-pack-slider").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: false,
    autoplay: false,
    dots: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });*/

  //js for before-better-marquee-slide
  setTimeout(() => {
    $(".before-better-marquee-slide").slick({
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
  }, 200);
  
  
}