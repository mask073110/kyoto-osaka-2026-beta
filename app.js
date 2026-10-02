const DAYS=[
["11/19","台灣 → 關西 → 京都","出發・抵達京都・晚上自由活動",[["03:40","NOAH 新竹市出發"],["04:00","1250 客運 → 桃園機場 T1"],["05:00","T1 全員集合"],["07:40","JX820 → KIX"],["11:10","抵達 KIX"],["12:30","包車 → 京都飯店"],["15:00","飯店寄放／入住・休息"],["16:00","寺町・新京極・四条河原町"],["18:30","沿途晚餐"]]],
["11/20","和服・清水寺・祇園","主要人像攝影日",[["09:00","和服店｜3位女生著裝・髮型"],["10:00","清水寺"],["11:15","三年坂・二年坂"],["12:30","沿途午餐"],["14:00","八坂塔・高台寺方向"],["16:00","祇園・花見小路"],["17:15","歸還和服 → 河原町晚餐"]]],
["11/21","弘法市・糺之森・伏見稻荷","包車固定行程",[["08:30","京都飯店出發"],["09:00","東寺 弘法市"],["11:30","下鴨神社・糺之森"],["14:30","移動伏見稻荷"],["15:00","伏見稻荷大社"],["17:30","京都站晚餐"]]],
["11/22","勝尾寺・箕面・大阪","退房＋包車移動日",[["08:00","京都飯店退房｜行李上車"],["09:30","勝尾寺"],["11:30","箕面公園・瀑布"],["13:30","橋本亭・柚子咖啡"],["14:45","杯麵博物館 池田"],["17:00","大阪飯店入住"]]],
["11/23","新世界 → 道頓堀 → 心齋橋","大阪街拍・美食・採買",[["09:00","大阪飯店出發"],["09:30","新世界・通天閣"],["12:00","日本橋"],["13:00","難波・千日前"],["15:00","道頓堀"],["17:00","心齋橋・長堀橋"],["18:30","大阪晚餐"]]],
["11/24","大阪 → KIX → 台灣","回程・退稅・最後採買",[["08:00","飯店早餐／最後整理"],["09:30","退房・8 人行李集合"],["10:00","包車 → KIX"],["11:00","KIX｜報到・退稅／海關・最後採買"],["14:00","JX823 → TPE"],["16:15","抵達 TPE"]]]
];
let day=Number(localStorage.getItem("day")||0),tab=localStorage.getItem("tab")||"today";
function goDay(i){day=i;localStorage.setItem("day",i);render()}
function goTab(t){tab=t;localStorage.setItem("tab",t);render()}
function mapTo(x){window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x),"_blank")}
function locate(){if(!navigator.geolocation){alert("此瀏覽器不支援定位");return}navigator.geolocation.getCurrentPosition(()=>alert("定位成功。下一版會把即時距離接進卡片。"),()=>alert("定位未取得，請檢查瀏覽器位置權限。"))}
function body(d){
 if(tab==="today")return '<div class="section-kicker">TODAY\'S ROUTE</div><div class="section-title">今日行程</div><div class="route-note"><span>小提醒｜依現場節奏彈性調整</span><span class="count">● '+d[3].length+' 行程</span></div><section class="timeline-card">'+d[3].map((x,i)=>'<div class="event"><span class="num">'+String(i+1).padStart(2,"0")+'</span><span class="time">'+x[0]+'</span><span class="event-title">'+x[1]+'</span></div>').join("")+'</section><div class="actions"><button class="action primary" onclick="locate()">📍 取得位置</button><button class="action" onclick="mapTo(\''+(day<3?"Comfort Hotel Kyoto Horikawagojo":"Hearton Hotel Shinsaibashi Nagahoridori")+'\')">回飯店</button></div><section class="decision"><div class="section-kicker">RIGHT NOW</div><h3>現在去哪？</h3><p>依目前時間、位置與今日剩餘行程重新判斷。尚未取得即時資料時，不顯示假 ETA。</p><div class="grid"><button onclick="goTab(\'photo\')">📷 拍照</button><button onclick="goTab(\'food\')">🍴 吃東西</button><button onclick="goTab(\'near\')">🛍 周邊</button></div></section>';
 if(tab==="photo")return '<div class="section-kicker">PHOTO GUIDE</div><div class="section-title">今日攝影</div>'+d[3].slice(1,5).map(x=>'<article class="card"><div class="photo"></div><h3>'+x[1]+'</h3><div class="small">建議 '+x[0]+' 前後｜依實際路線安排，不為理想光線硬改整天行程。</div><div class="actions"><button class="action" onclick="mapTo(\''+x[1]+'\')">導航</button></div></article>').join("");
 const names=tab==="food"?["沿途正餐候選","咖啡／休息候選","小吃候選"]:["藥妝／採買","伴手禮","順路景點"];
 return '<div class="section-kicker">'+(tab==="food"?"FOOD OPTIONS":"AROUND YOU")+'</div><div class="section-title">'+(tab==="food"?"沿途美食":"順路周邊")+'</div>'+names.map(x=>'<article class="card"><h3>'+x+'</h3><div class="small">目前資料｜出發前再確認。正式版會依 DAY 路線、營業時間與定位排序。</div></article>').join("");
}
function render(){
 const d=DAYS[day]||DAYS[0];
 document.getElementById("app").innerHTML='<div class="app"><header class="hero"><div class="hero-top"><span>京都・大阪 秋旅</span><span class="beta">2026 BETA</span></div><div class="kicker">DAY '+(day+1)+' · '+d[0]+'</div><h1>'+d[1]+'</h1><div class="sub">'+d[2]+'</div></header><section class="tripmeta"><div class="meta-row"><span>2026.11.19 — 11.24</span><span>8人攝影旅行</span></div><div class="motto">攝影決定路線，美食提供選擇。</div><div class="days">'+DAYS.map((x,i)=>'<button class="day '+(i===day?"active":"")+'" onclick="goDay('+i+')"><b>'+(i+1)+'</b><small>'+x[0]+'</small></button>').join("")+'</div></section><main class="main">'+body(d)+'</main><nav class="nav"><button class="'+(tab==="today"?"active":"")+'" onclick="goTab(\'today\')"><i>⌾</i>今日</button><button class="'+(tab==="photo"?"active":"")+'" onclick="goTab(\'photo\')"><i>▣</i>攝影</button><button class="'+(tab==="food"?"active":"")+'" onclick="goTab(\'food\')"><i>♜</i>美食</button><button class="'+(tab==="near"?"active":"")+'" onclick="goTab(\'near\')"><i>▤</i>周邊</button></nav></div>';
}
render();