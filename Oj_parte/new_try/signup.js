// 切换顶部 Sign in / Sign up
$(function() {
  $(".btn").click(function() {
    $(".form-signin").toggleClass("form-signin-left");
    $(".form-signup").toggleClass("form-signup-left");
    $(".frame").toggleClass("frame-long");
    $(".signup-inactive").toggleClass("signup-active");
    $(".signin-active").toggleClass("signin-inactive");
    $(".forgot").toggleClass("forgot-left");
    $(this).removeClass("idle").addClass("active");
  });
});

// Sign Up 按钮点击（在表单内的 <a>.btn-signup）
$(function() {
  $(".btn-signup").click(function(e) {
    // 阻止 <a> 默认行为（避免刷到顶部/刷新）
    e.preventDefault();

    // 原动画逻辑
    $(".nav").toggleClass("nav-up");
    $(".form-signup-left").toggleClass("form-signup-down");
    $(".success").toggleClass("success-left");
    $(".frame").toggleClass("frame-short");
  });
});

// Sign in 按钮点击
$(function() {
  $(".btn-signin").click(function() {
    $(".btn-animate").toggleClass("btn-animate-grow");
    $(".welcome").toggleClass("welcome-left");
    $(".cover-photo").toggleClass("cover-photo-down");
    $(".frame").toggleClass("frame-short");
    $(".profile-photo").toggleClass("profile-photo-down");
    $(".btn-goback").toggleClass("btn-goback-up");
    $(".forgot").toggleClass("forgot-fade");
  });
});


// 全新逻辑：点击 Extra Button
$(function() {
  $(".btn-extra").click(function(e) {
    e.preventDefault(); // 如果是 <a> 或你想彻底阻止默认行为，就保留这一行

    // 这里写你想做的任何新逻辑
    // 示例1: 直接复制和 .btn-signup 一样的切换
    //        让它执行和 "Sign Up" 相同的动画
    $(".nav").toggleClass("nav-up");
    $(".form-signup-left").toggleClass("form-signup-down");
    $(".success").toggleClass("success-left");
    $(".frame").toggleClass("frame-short");

    // 示例2: 或者你也可以只用局部几个类, 具体看你想要的效果
    // $(".nav").toggleClass("nav-up");
    // $(".frame").toggleClass("frame-short");
    // ...
  });
});
