// $(function() {
//     $(".btn").click(function() {
//       $(".form-signin").toggleClass("form-signin-left");
//       $(".form-signup").toggleClass("form-signup-left");
//       $(".frame").toggleClass("frame-long");
//       $(".signup-inactive").toggleClass("signup-active");
//       $(".signin-active").toggleClass("signin-inactive");
//       $(".forgot").toggleClass("forgot-left");
//       $(this).removeClass("idle").addClass("active");
//     });
//   });
  
//   $(function() {
//     $(".btn-signup").click(function() {
//       $(".nav").toggleClass("nav-up");
//       $(".form-signup-left").toggleClass("form-signup-down");
//       $(".success").toggleClass("success-left");
//       $(".frame").toggleClass("frame-short");
//     });
//   });
  
//   $(function() {
//     $(".btn-signin").click(function() {
//       $(".btn-animate").toggleClass("btn-animate-grow");
//       $(".welcome").toggleClass("welcome-left");
//       $(".cover-photo").toggleClass("cover-photo-down");
//       $(".frame").toggleClass("frame-short");
//       $(".profile-photo").toggleClass("profile-photo-down");
//       $(".btn-goback").toggleClass("btn-goback-up");
//       $(".forgot").toggleClass("forgot-fade");
//     });
//   });

console.log("=== Sign_up_in.js LOADED ===");


  // 使用 jQuery 的入口写法，等 DOM 加载完才执行
$(function() {
    // 当任意 .btn 元素被点击时触发
    $(".btn").click(function() {
  
      // 切换 form-signin 区域到左侧，用于制作 Sign in 界面滑动离开或出现的效果
      $(".form-signin").toggleClass("form-signin-left");
  
      // 切换 form-signup 区域到左侧，用于制作 Sign up 界面滑动离开或出现的效果
      $(".form-signup").toggleClass("form-signup-left");
  
      // 切换 .frame 的高度，让整体容器在 Sign in / Sign up 之间切换时增高或缩短
      $(".frame").toggleClass("frame-long");
  
      // 切换导航上的“Sign up”是否处于 active 状态
      $(".signup-inactive").toggleClass("signup-active");
  
      // 切换导航上的“Sign in”是否处于 inactive 状态
      $(".signin-active").toggleClass("signin-inactive");
  
      // 切换“forgot”文字位置，配合 CSS transition 实现动画
      $(".forgot").toggleClass("forgot-left");
  
      // 当前点击的元素移除 idle 类，添加 active 类，改变按钮样式
      $(this).removeClass("idle").addClass("active");
    });
  });
  
  
  // 当“Sign up”按钮被点击时触发
    // Sign_up_in.js
    $(function() {
        $(".btn-signup").click(function() {
        // 阻止<a>或<button>在表单里的默认提交行为

        // 下面是切换动画的逻辑
        $(".nav").toggleClass("nav-up");
        $(".form-signup-left").toggleClass("form-signup-down");
        $(".success").toggleClass("success-left");
        $(".frame").toggleClass("frame-short");
        });
    });


    $(function() {
        console.log("Looking for .btn-signup elements…");
        const $btns = $(".btn-signup");
        console.log("Found:", $btns.length, $btns); // 打印查询到的数量 & 元素
      });
      
    
  
  
  // 当“Sign in”按钮被点击时触发
  $(function() {
    $(".btn-signin").click(function() {
  
      // 按钮点击后，切换动画展开或收回
      $(".btn-animate").toggleClass("btn-animate-grow");
  
      // 切换“welcome”文字位置，往左滑动出现或消失
      $(".welcome").toggleClass("welcome-left");
  
      // 切换封面图片出现或隐藏
      $(".cover-photo").toggleClass("cover-photo-down");
  
      // 同样切换容器高度，让页面整体缩短或恢复
      $(".frame").toggleClass("frame-short");
  
      // 切换个人头像出现或隐藏
      $(".profile-photo").toggleClass("profile-photo-down");
  
      // 切换“go back”按钮向上出现或隐藏
      $(".btn-goback").toggleClass("btn-goback-up");
  
      // 切换“forgot your password?”文字透明度或显示
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

$(function() {
  $(".btn-ok").click(function(e) {
    e.preventDefault();
    // 让整个成功提示区隐藏
    $(".success").removeClass("success-left").fadeOut();
    // 或者做别的逻辑，比如跳转:
     window.location.href = "https://popcat.click/";
  });
});
