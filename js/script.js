(function(){
var $=function(i){return document.getElementById(i)},MSG="https://m.me/johnkevin.binalon",D={listings:[],events:[]},gr=$("grid"),dlg=$("dlg");
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function peso(n){return "₱"+Number(n).toLocaleString("en-US")}
function lab(p){return p.lab||(p.m==="Rent"?"per month":p.m==="Assume"?"per month + cash-out":"total price")}
function tag(p){return p.tg||(p.m==="Sell"?"For sale":p.m==="Rent"?"For rent":"Assume balance")}
function imgs(p){return p.imgs&&p.imgs.length?p.imgs:(p.img?[p.img]:[])}
function pic(p){var im=imgs(p);return im.length?'<img src="'+esc(im[0])+'" alt="" loading="lazy">':'<div class="ph"><svg viewBox="0 0 64 48" aria-hidden="true"><path d="M6 24L32 4l26 20M12 20v24h40V20M26 44V30h12v14"/></svg>Photo coming soon</div>'}
(window.JKB&&JKB.url&&JKB.key?fetch(JKB.url+"/rest/v1/site_content?id=eq.main&select=data",{headers:{apikey:JKB.key,Authorization:"Bearer "+JKB.key}}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(a){if(!a.length||!a[0].data)throw 0;return a[0].data}):Promise.reject()).catch(function(){return fetch("data/data.json",{cache:"no-store"}).then(function(r){return r.json()})}).then(function(d){D=d;init()}).catch(function(){gr.innerHTML='<div class="empty">The property list could not load. Open this site through a web server (see README).</div>'});
function init(){
 var s=D.site||{};MSG=s.messenger||MSG;
 if(s.name){document.title=s.name+": rent, buy or assume";document.querySelectorAll("[data-site-name]").forEach(function(e){e.textContent=s.name})}
 document.querySelectorAll("[data-msg]").forEach(function(a){a.href=MSG});
 [["owner","[data-owner]"],["role","[data-role]"]].forEach(function(k){if(s[k[0]])document.querySelectorAll(k[1]).forEach(function(e){e.textContent=s[k[0]]})});
 if(s.facebook)document.querySelectorAll("[data-fb]").forEach(function(a){a.href=s.facebook});
 var locs=[];D.listings.forEach(function(p){if(p.loc&&locs.indexOf(p.loc)<0)locs.push(p.loc)});locs.sort();
 locs.forEach(function(l){var o=document.createElement("option");o.textContent=l;$("f-loc").appendChild(o)});
 hero();portrait(s);render();events();
}

var hs=[],hi=0,ht=null,hpause=false,HT=$("h-title"),HX=$("h-text"),HD={t:HT.textContent,x:HX.textContent};
function portrait(s){if(s.portrait===""){$("portrait").hidden=true;document.querySelector(".hero-grid").style.gridTemplateColumns="1fr"}else if(s.portrait){$("portrait-img").src=s.portrait}}
function hero(){
 var list=(D.hero||[]).filter(function(h){return h&&h.img});if(!list.length)return;
 hs=list;var box=$("slides");
 box.innerHTML=hs.map(function(h,i){return '<div class="slide'+(i?'':' on')+'"><img src="'+esc(h.img)+'" alt=""'+(i?' loading="lazy"':'')+'></div>'}).join("");
 $("hdots").innerHTML=hs.map(function(h,i){return '<button class="'+(i?'':'on')+'" aria-label="Go to slide '+(i+1)+'" data-i="'+i+'"></button>'}).join("");
 hset(0,true);
 if(hs.length<2)return;
 $("hero").classList.remove("single");
 $("hprev").onclick=function(){hset(hi-1);hplay()};$("hnext").onclick=function(){hset(hi+1);hplay()};
 $("hdots").onclick=function(e){var b=e.target.closest("button");if(b){hset(+b.dataset.i);hplay()}};
 var hh=$("hero"),x0=0;
 hh.addEventListener("mouseenter",function(){hpause=true});hh.addEventListener("mouseleave",function(){hpause=false});
 hh.addEventListener("focusin",function(){hpause=true});hh.addEventListener("focusout",function(){hpause=false});
 hh.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
 hh.addEventListener("touchend",function(e){var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50){hset(hi+(dx<0?1:-1));hplay()}});
 hplay();
}
function hplay(){clearInterval(ht);if(window.matchMedia("(prefers-reduced-motion:reduce)").matches)return;ht=setInterval(function(){if(!hpause&&!document.hidden)hset(hi+1)},6500)}
function hset(i,first){
 var n=hs.length;hi=(i+n)%n;
 document.querySelectorAll(".slide").forEach(function(e,k){e.classList.toggle("on",k===hi)});
 document.querySelectorAll("#hdots button").forEach(function(e,k){e.classList.toggle("on",k===hi)});
 var h=hs[hi],t=h.title||HD.t,x=h.text||HD.x;
 if(first){HT.textContent=t;HX.textContent=x;return}
 if(HT.textContent===t&&HX.textContent===x)return;
 HT.style.opacity=HX.style.opacity=0;
 setTimeout(function(){HT.textContent=t;HX.textContent=x;HT.style.opacity=HX.style.opacity=1},300);
}
function facts(p){var f=[p.t];if(p.b!=null)f.push(p.b?p.b+" bed":"Studio");if(p.ba!=null)f.push(p.ba+" bath");if(p.s!=null)f.push(p.s+" m²");if(f.length===1)f.push(p.loc);return f}
function render(){
 var d=$("f-deal").value,t=$("f-type").value,l=$("f-loc").value,b=+$("f-beds").value,n=0;
 gr.innerHTML="";
 D.listings.forEach(function(p,i){
  if((d!=="All"&&p.m!==d)||(t!=="All"&&p.t!==t)||(l!=="All"&&p.loc!==l)||(b&&(p.b==null||p.b<b)))return;
  n++;
  var c=document.createElement("button");c.className="card";
  c.innerHTML='<div class="pic">'+pic(p)+'<span class="tag">'+esc(tag(p))+'</span>'+(imgs(p).length>1?'<span class="cnt">'+imgs(p).length+' photos</span>':'')+'</div><div class="body"><div class="price">'+peso(p.p)+' <small>'+esc(lab(p))+'</small></div><h3>'+esc(p.n)+'</h3><p class="addr">'+esc(p.a)+'</p><div class="facts">'+facts(p).map(function(x){return '<span>'+esc(x)+'</span>'}).join("")+'</div></div>';
  c.onclick=function(){show(p)};gr.appendChild(c)});
 $("count").textContent=n+(n===1?" property found":" properties found");
 if(!n)gr.innerHTML='<div class="empty">No properties match these filters. Change them or <a href="'+esc(MSG)+'" target="_blank" rel="noopener">message me on Messenger</a> and I will look for you.</div>';
}
function show(p){
 gallery(p);
 $("dt").textContent=p.n;$("da").textContent=p.a;
 var rows=(p.p>0?[["Price / payment",peso(p.p)+" "+lab(p)]]:[]).concat(p.x||[],[["Type",p.t]]);
 if(p.b!=null)rows.push(["Bedrooms",p.b||"Studio"]);if(p.ba!=null)rows.push(["Bathrooms",p.ba]);if(p.s!=null)rows.push(["Floor area",p.s+" m²"]);
 $("db").innerHTML='<p class="desc">'+esc(p.d)+'</p><dl>'+rows.map(function(r){return '<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>'}).join("")+'</dl><ul class="am">'+(p.am||[]).map(function(a){return '<li>'+esc(a)+'</li>'}).join("")+'</ul><a class="btn" href="'+esc(MSG)+'" target="_blank" rel="noopener">Ask about this on Messenger</a>';
 dlg.showModal();
}
function events(){
 var n=new Date(),today=n.getFullYear()+"-"+("0"+(n.getMonth()+1)).slice(-2)+"-"+("0"+n.getDate()).slice(-2);
 var list=(D.events||[]).filter(function(e){return e.date>=today}).sort(function(a,b){return a.date<b.date?-1:1}),box=$("events-list");
 if(!list.length){box.innerHTML='<div class="empty" style="grid-column:1/-1">No events scheduled right now. <a href="'+esc(MSG)+'" target="_blank" rel="noopener">Message me on Messenger</a> to ask about upcoming viewings.</div>';return}
 box.innerHTML=list.map(function(e){
  var d=new Date(e.date+"T00:00:00"),when=d.toLocaleDateString("en-US",{weekday:"long"})+(e.time?" at "+e.time:"")+(e.place?" · "+e.place:"");
  return '<article class="ev"><div class="evd"><b>'+d.getDate()+'</b><span>'+d.toLocaleDateString("en-US",{month:"short"})+'</span></div><div class="evb"><h3>'+esc(e.title)+'</h3><p class="evm">'+esc(when)+'</p><p>'+esc(e.d)+'</p>'+(e.link?'<a class="btn" href="'+esc(e.link)+'" target="_blank" rel="noopener">More info</a>':'')+'<a class="btn ghost" style="color:var(--ink);border-color:var(--line)" href="'+esc(MSG)+'" target="_blank" rel="noopener">Ask on Messenger</a></div>'+(e.img?'<img src="'+esc(e.img)+'" alt="" loading="lazy">':'')+'</article>'}).join("");
}
var gi=0,gl=[];
function gallery(p){
 gl=imgs(p);gi=0;var n=gl.length,box=$("dpic");
 if(!n){box.innerHTML='<div class="pic dpic">'+pic(p)+'<span class="tag">'+esc(tag(p))+'</span></div>';return}
 box.innerHTML='<div class="gmain"><img id="gimg" alt=""><span class="tag">'+esc(tag(p))+'</span>'+(n>1?'<button class="gnav gp" aria-label="Previous photo">\u2039</button><button class="gnav gn" aria-label="Next photo">\u203a</button><span class="gcount" id="gcount"></span>':'')+'</div>'+(n>1?'<div class="gthumbs">'+gl.map(function(u,i){return '<button class="gt" data-i="'+i+'" aria-label="Photo '+(i+1)+'"><img src="'+esc(u)+'" alt=""></button>'}).join("")+'</div>':'');
 gset(0);
 if(n>1){box.querySelector(".gp").onclick=function(){gset(gi-1)};box.querySelector(".gn").onclick=function(){gset(gi+1)};
  box.querySelectorAll(".gt").forEach(function(b){b.onclick=function(){gset(+b.dataset.i)}});
  var x0=0,m=box.querySelector(".gmain");m.ontouchstart=function(e){x0=e.touches[0].clientX};m.ontouchend=function(e){var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)gset(gi+(dx<0?1:-1))}}
}
function gset(i){var n=gl.length;gi=(i+n)%n;var im=$("gimg");im.src=gl[gi];im.alt="Photo "+(gi+1)+" of "+n;var c=$("gcount");if(c)c.textContent=(gi+1)+" / "+n;
 document.querySelectorAll(".gt").forEach(function(b,k){b.classList.toggle("on",k===gi)})}
document.addEventListener("keydown",function(e){if(!dlg.open||gl.length<2)return;if(e.key==="ArrowRight")gset(gi+1);if(e.key==="ArrowLeft")gset(gi-1)});
var nav=document.querySelector(".nav"),ls=document.querySelectorAll(".links a"),secs=["listings","how","events","guide","contact"].map($).filter(Boolean);
$("burger").onclick=function(){var o=nav.classList.toggle("open");this.setAttribute("aria-expanded",o)};
ls.forEach(function(a){a.addEventListener("click",function(){nav.classList.remove("open")})});
function spy(){var y=window.scrollY+120,cur="top";secs.forEach(function(e){if(e.offsetTop<=y)cur=e.id});ls.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+cur)})}
window.addEventListener("scroll",spy,{passive:true});spy();
["f-deal","f-type","f-loc","f-beds"].forEach(function(id){$(id).onchange=render});
$("go").onclick=function(){render();$("listings").scrollIntoView({behavior:"smooth"})};
$("close").onclick=function(){dlg.close()};
dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
})();
