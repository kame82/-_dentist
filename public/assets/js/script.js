// swiper_js
const swiper = new Swiper(".swiper", {
  // Optional parameters
  loop: true,
  speed: 1500,
  effect: "fade", //fade effect
  fadeEffect: {
    //追加
    crossFade: true, //追加 (スライドの重なりを解消)
  },

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  autoplay: {
    delay: 4000,
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

//drawer menu
$(".c-hamburger").on("click", function () {
  $("#js-nav, #js-navBgk").toggleClass("p-nav__isHide");
  $("#js-nav__menu1").toggleClass("c-hamburger__bar1-clicked");
  $("#js-nav__menu2").toggleClass("c-hamburger__bar2-clicked");
  $("#js-nav__menu3").toggleClass("c-hamburger__bar3-clicked");
  return false;
});
