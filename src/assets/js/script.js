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
