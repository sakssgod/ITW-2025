 /**@type{HTMLCanvasElement}*/ //vsCode
 var gnav = document.getElementById('gnav');
 var mine_total = document.getElementById('mine-total');
 var mine_timer = document.getElementById('timer');
 var canv = document.getElementById('mycanv');
 var ctx = canv.getContext('2d');
 //游戏等级信息
 var levels = [
     [9, 9, 10],
     [16, 16, 40],
     [16, 30, 99],
 ];
 //预设游戏等级0
 var level = 0;
 var g = levels[level];//当前游戏等级信息
 var g_arr = [];//游戏块id列表
 var g_info = {};//每个块的游戏信息
 var g_color = {//预设游戏块颜色
     block: '#369',
     open: '#ddd',
     mine: '#69f',
     bomb: '#f66',
     highlight: '#69d',
 };
 var mine_arr = [];//当前游戏雷块id列表
 var count = 0;//已标记雷块统计
 var over = false;//游戏是否结束
 var win = false;//游戏是否获胜
 var XY = '';//构造xy
 var gblock = {//布局,游戏块尺寸:宽度,圆角,外边距
     width: 50,
     radius: 6,
     margin: 2,
 };
 var mine = ['💣', '🚩', '❔', '💥'];//预设雷块标记符号
 var gamestart = 0;//游戏是否开始
 var ttimer = 0;//游戏计时器
 var durtime = 0;//游戏耗时记录
 g_init();
 //初始化
 function g_init() {//初始化布局及游戏信息
 //------重置游戏基础信息------
     g_arr = [];
     mine_arr = [];
     count = 0;
     over = false;
     win = false;
     gamestart = 0;
     durtime = 0;
     clearInterval(ttimer);//清除定时器
     g = levels[level];//获取游戏等级,重置游戏画布及相关游戏数据
     gnav.style.width = g[1] * gblock.width + 'px';
     mine_total.value = g[2];
     mine_timer.value = 0;
     let h = g[0] * gblock.width;
     let w = g[1] * gblock.width;
     canv.height = h;
     canv.width = w;
     ctx.clearRect(0, 0, w, h);//清除画布
     //按行列输出游戏块
     for (let i = 0; i < g[0]; i++) {
         for (let j = 0; j < g[1]; j++) {
             let xy = j + '-' + i;//根据坐标构造游戏块id
             g_arr.push(xy);//g_arr记录游戏块id
             g_info[xy] = {//对每个游戏块, 预设游戏信息: 
                 mark: 0,//mark:数字标记0-8或雷标记-1;
                 open: 0,//open:游戏块打开状态:0未打开/1已打开/-1标记雷块/-2疑似雷块
             };
             drawBlock(xy, g_color.block);//绘制: 块,颜色
         }
     }
     //随机布雷
     setMine();
     // showInfo();
 }

 function select_lev(lv) {//选择游戏等级
     level = lv || level;
     g_init();
 }

 function drawBlock(xy, c) {//绘制游戏块: 圆角矩形
     let [x, y] = xy.split('-').map(n => n * gblock.width);//解析id,并构造坐标
     let w = gblock.width - gblock.margin;
     let r = gblock.radius;
     ctx.clearRect(x, y, gblock.width, gblock.width); 
     ctx.save();
     ctx.beginPath();
     ctx.moveTo(x, y + gblock.radius);
     ctx.arcTo(x, y + w, x + w, y + w, r);
     ctx.arcTo(x + w, y + w, x + w, y, r);
     ctx.arcTo(x + w, y, x, y, r);
     ctx.arcTo(x, y, x, y + w, r);
     ctx.closePath();
     ctx.fillStyle = c;
     ctx.fill();
     ctx.restore();
 }

 function setMine() {//随机布雷: 生成雷块列表mine_arr,更新游戏块信息g_info:标记为雷或计算数字
 //对游戏块随机打乱,提取定量雷块
     mine_arr = g_arr.sort(() => Math.random() - 0.5).slice(0, g[2]);
     mine_arr.forEach(xy => {
         g_info[xy].mark = -1;//将游戏块标记为雷-1
         getAround(xy).forEach(n => {//获取当前雷块周边8块: 计算数字
             if (g_info[n].mark != -1) g_info[n].mark++;//每布一个雷,对于周边非雷块数字+1
         });
     });
 }

 function getAround(xy) {//获取当前游戏块的周边有效块
     let [x, y] = xy.split('-').map(n => n * 1);
     let around = [];
     //左中右,上中下
     for (let i = -1; i <= 1; i++) {
         for (let j = -1; j <= 1; j++) {
             //构造游戏块id
             let id = `${x + i}-${y + j}`;
             //判断id是否有效:在游戏块数组g_arr中包含, 并排除自身块;
             if (g_arr.includes(id) && id != xy) around.push(id);
         }
     }
     return around;
 }

 function markText(xy, text) {//在游戏块上标注文本: 数字或雷块标记
     let [x, y] = xy.split('-').map(n => n * gblock.width);
     ctx.save();
     ctx.fillStyle = '#111';
     ctx.font = '20px arial';
     ctx.textAlign = 'center';
     ctx.textBaseline = 'middle';
     ctx.fillText(text, x + gblock.width / 2, y + gblock.width / 2);
     ctx.restore();
 }
 //辅助显示
 function showInfo() {//辅助显示布雷情况信息, 显示数字和雷块标记
     g_arr.forEach(xy => {
         if (g_info[xy].mark == -1) {
             drawBlock(xy, g_color.mine);
         } else {
             //显示数字
             drawBlock(xy, g_color.block);
             markText(xy, g_info[xy].mark);
         }
     });
 }
 //鼠标事件:
 //1,左键点击click(未打开块)打开游戏块(普通数字块,空白区递归清零,雷块触雷失败)
 //2,右键点击contextmenu(未打开块)标记游戏块(标记雷块,标记疑似雷块,取消标记)
 //3,点击已打开的块: mousedown按下鼠标高亮周边; mouseup松开鼠标取消高亮,*辅助扫雷;
 canv.addEventListener('click', openBlock);
 canv.addEventListener('contextmenu', markMine);
 canv.addEventListener('mousedown', highLight);
 canv.addEventListener('mouseup', supGame);

 function highLight(ev) {//右击非雷块,辅助: 高亮周边
     if (over) return;
     //获取正确坐标
     let x = ~~(ev.offsetX / gblock.width);
     let y = ~~(ev.offsetY / gblock.width);
     let xy = x + '-' + y;
     if (g_info[xy].open == 1) getAround(xy).forEach(n => {
         if (g_info[n].open == 0) {
             drawBlock(n, g_color.highlight);
         }
     });
 }

 function startTimer() {//游戏开始计时
     ttimer = setInterval(() => {
         durtime++;
         mine_timer.value = (durtime / 10).toFixed(1);
     }, 100);
 }

 function supGame(ev) {//右击非雷块,辅助: 鼠标按下高亮,鼠标松开取消高亮并标注确定的游戏块(打开或标记雷)
     if (over) return;
     //获取正确坐标
     let x = ~~(ev.offsetX / gblock.width);
     let y = ~~(ev.offsetY / gblock.width);
     let xy = x + '-' + y;
     if (g_info[xy].open == 1) {
         let around = getAround(xy);//获取当前游戏块周边
         let mark = g_info[xy].mark;
         let marked_mine = 0;//已标记雷块数量
         let unopen = 0;//未打开块数量
         around.forEach(n => {//统计周边游戏块信息: 未打开块数量和已标记雷数量
             if (g_info[n].open == 0 || g_info[n].open == -2) unopen++;
             if (g_info[n].open == -1) marked_mine++;
         });
         around.forEach(n => {//遍历周边块,
             if (g_info[n].open == 0) {
                 drawBlock(n, g_color.block);//取消高亮
                 //辅助扫雷
                 if (mark == marked_mine) {//如果当前数字等于已经标记的雷块:雷已经全部排出, 其他为安全块
                     g_info[n].open = 1;//安全块,自动打开
                     drawBlock(n, g_color.open);
                     markText(n, g_info[n].mark);
                     if (g_info[n].mark == 0) openZero(n);//如果是0块, 递归清零(0块说明周边没有雷)
                     if (g_info[n].mark == -1) {//在安全块中遇到雷(说明标记了错误雷块)
                         drawBlock(n, g_color.bomb);
                         markText(n, mine[0]);
                         markText(n, mine[3]);
                         checkOver(true);//游戏结束
                     }
                 } else if (unopen == mark - marked_mine) {//如果剩余的块都是雷, 则直接标注雷
                     g_info[n].open = -1;
                     drawBlock(n, g_color.mine);
                     markText(n, mine[1]);
                     count++;
                     mine_total.value = g[2] - count;
                     if (count == g[2]) checkOver();//标记雷之后, 判断数量, 是否完成扫雷
                 }
             }
         });
     }
 }

 function openBlock(ev) {//左键单击,打开游戏块
     if (over) return;
     if (gamestart == 0) {//打开第一个块,游戏开始标记
         gamestart = 1;
         startTimer();
     }
     //获取正确坐标
     let x = ~~(ev.offsetX / gblock.width);
     let y = ~~(ev.offsetY / gblock.width);
     let xy = x + '-' + y;
     if (g_info[xy].open == 0) {//仅对未打开的游戏块有效
         g_info[xy].open = 1;//常规标注,标记打开状态
         drawBlock(xy, g_color.open);
         markText(xy, g_info[xy].mark);
         if (g_info[xy].mark == 0) {//遇到0块, 递归清零
             openZero(xy);
         } else if (g_info[xy].mark == -1) {//点爆雷块, 游戏结束
             drawBlock(xy, g_color.bomb);
             markText(xy, mine[0]);
             markText(xy, mine[3]);
             checkOver(true);
         }
     }
 }

 function openZero(xy) {//递归清零,遇到0块说明周边安全,可以全部打开
     getAround(xy).forEach(n => {
         if (g_info[n].open == 0) {
             g_info[n].open = 1;
             drawBlock(n, g_color.open);
             markText(n, g_info[n].mark);
             if (g_info[n].mark == 0) openZero(n);
         }
     });
 }

 function checkOver(bomb) {//判断游戏结束,
     over = true;
     clearInterval(ttimer);
     //判断是否获胜:所有标注的雷块open-1是否和对应的mark-1一致.
     //bomb:左键点爆雷,或辅助扫雷点爆,游戏直接失败结束
     win = bomb ? false : mine_arr.every(xy => g_info[xy].mark == g_info[xy].open);
     setTimeout(() => {//延迟弹窗,确定:重玩
         let restart = confirm(win ? `恭喜胜利!\n耗时：${(durtime/10).toFixed(1)}秒` : '挑战失败~');
         if (restart) g_init();
     }, 100);
 }

 function markMine(ev) {//右键标注雷块
     //禁用右键的浏览器默认菜单:阻止默认动作
     ev.preventDefault();
     if (over) return;
     if (gamestart == 0) {
         gamestart = 1;
         startTimer();
     }
     //获取正确坐标
     let x = ~~(ev.offsetX / gblock.width);
     let y = ~~(ev.offsetY / gblock.width);
     let xy = x + '-' + y;
     if (g_info[xy].open == 0) {//如果是未打开块, 标注雷-1
         g_info[xy].open = -1;
         drawBlock(xy, g_color.mine);
         markText(xy, mine[1]);
         count++;
         mine_total.value = g[2] - count;
         if (count == g[2]) checkOver();
     } else if (g_info[xy].open == -1) {//如果已标注雷-1, 则标注为疑似雷-2
         g_info[xy].open = -2;
         drawBlock(xy, g_color.mine);
         markText(xy, mine[2]);
         count--;
         mine_total.value = g[2] - count;
     } else if (g_info[xy].open == -2) {//如果标注疑似雷-2, 则恢复未打开状态0
         g_info[xy].open = 0;
         drawBlock(xy, g_color.block);
     }
 }