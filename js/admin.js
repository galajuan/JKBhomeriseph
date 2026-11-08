(function(){
var $=function(i){return document.getElementById(i)},D,tab="listings",R=false;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var LF=[["n","Property name"],["m","Deal type","select",["Rent","Sell","Assume"]],["t","Property type","select",["House","Condo","Apartment"]],["loc","Area (e.g. Matina)"],["a","Full address","text","wide"],["p","Price in pesos (empty shows Message for price)","number"],["lab","Price label (optional), e.g. per month for 60 months"],["tg","Badge text (optional), e.g. Pre-selling"],["b","Bedrooms (0 = studio, empty = not shown)","number"],["ba","Bathrooms","number"],["s","Floor area in m²","number"],["imgs","Photos (the first one is the cover; use \u2190 to move a photo earlier)","photos"],["d","Description","textarea","wide"],["x","Details, one per line as Label: value","textarea","wide"],["am","Amenities, separated by commas","text","wide"]];
var EF=[["title","Event title","text","wide"],["date","Date","date"],["time","Time (optional), e.g. 2:00 PM"],["place","Place","text","wide"],["link","Link (optional)","text","wide"],["img","Photo (optional)","photo","wide"],["d","Description","textarea","wide"]];
var SP={listings:{one:"property",t:function(p){return p.n},s:function(p){return p.m+" in "+p.loc+", "+Number(p.p).toLocaleString()},f:LF},events:{one:"event",t:function(e){return e.title},s:function(e){return e.date+(e.place?" at "+e.place:"")},f:EF}};
function say(m,bad){var s=$("status");s.textContent=m;s.style.color=bad?"#ff8a80":"#7be0a0"}
function api(url,opt){return fetch(url,opt).then(function(r){if(r.status===401){login();throw new Error("auth")}if(!r.ok)throw new Error("error "+r.status);return r.json().catch(function(){return{}})})}
function save(){return api("/api/data",{method:"POST",body:JSON.stringify(D)}).then(function(){say("Saved. The website is updated.")}).catch(function(e){say("Could not save ("+e.message+")",true)})}
function login(){R=false;$("login").hidden=false;$("app").hidden=true}
function start(){return fetch("data/data.json",{cache:"no-store"}).then(function(r){return r.json()}).then(function(d){D=d;$("login").hidden=true;$("app").hidden=false;draw()})}
$("lbtn").onclick=function(){api("/api/login",{method:"POST",body:JSON.stringify({password:$("pw").value})}).then(start).catch(function(){$("lerr").textContent="Wrong password."})};
$("pw").onkeydown=function(e){if(e.key==="Enter")$("lbtn").click()};
api("/api/me").then(function(r){R=!!r.recovery;if(R)tab="settings";return start()}).catch(login);
document.querySelectorAll("[data-tab]").forEach(function(b){b.onclick=function(){tab=b.dataset.tab;draw()}});
function draw(){
 document.querySelectorAll("[data-tab]").forEach(function(b){b.setAttribute("aria-selected",b.dataset.tab===tab)});
 var box=$("panel");
 if(tab==="settings"){var SF=[["name","Website name"],["messenger","Messenger link"],["facebook","Facebook link"],["owner","Your name (shown on the home page)"],["role","Your title (shown under your name)"]];
  box.innerHTML='<div class="box">'+SF.map(function(f){return '<label class="wide">'+f[1]+'<input id="s_'+f[0]+'" value="'+esc(D.site[f[0]])+'"></label>'}).join("")+'<div class="wide"><button id="s_save">Save settings</button></div></div>';
  $("s_save").onclick=function(){SF.forEach(function(f){var v=$("s_"+f[0]).value.trim();if(v||f[0]==="facebook")D.site[f[0]]=v});save()};pwui(box);return}
 var sp=SP[tab],arr=D[tab];
 box.innerHTML='<div class="bar"><h2>'+(tab==="listings"?"Properties":"Events")+' ('+arr.length+')</h2><button id="add">Add '+sp.one+'</button></div><div id="rows">'+arr.map(function(it,i){return '<div class="row"><div><b>'+esc(sp.t(it))+'</b><br><small>'+esc(sp.s(it))+'</small></div><div><button class="s" data-e="'+i+'">Edit</button> <button class="s" data-d="'+i+'">Delete</button></div></div>'}).join("")+'</div><div id="form"></div>';
 $("add").onclick=function(){form(-1)};
 $("rows").onclick=function(e){var t=e.target;if(t.dataset.e!=null)form(+t.dataset.e);if(t.dataset.d!=null&&confirm("Delete this "+sp.one+"?")){arr.splice(+t.dataset.d,1);save();draw()}};
}
function val(k,it){if(k==="x")return(it.x||[]).map(function(r){return r[0]+": "+r[1]}).join("\n");if(k==="am")return(it.am||[]).join(", ");return it[k]==null?"":it[k]}
function form(i){
 var sp=SP[tab],arr=D[tab],it=i>=0?arr[i]:{};
 $("form").innerHTML='<form id="fm">'+sp.f.map(function(f){var k=f[0],id='f_'+k,v=esc(val(k,it)),c=f[3]==="wide"||f[2]==="textarea"||f[2]==="photo"?' class="wide"':'',inner;
  if(f[2]==="select")inner='<select id="'+id+'">'+f[3].map(function(o){return '<option'+(o===it[k]?' selected':'')+'>'+o+'</option>'}).join("")+'</select>';
  else if(f[2]==="textarea")inner='<textarea id="'+id+'">'+v+'</textarea>';
  else if(f[2]==="photos")inner='<input type="file" id="ups" accept="image/*" multiple><div class="phs" id="phs"></div>';
  else if(f[2]==="photo")inner='<input type="hidden" id="'+id+'" value="'+v+'"><input type="file" id="up" accept="image/*"><img class="pv" id="pv" src="'+v+'" alt="" '+(v?'':'hidden')+'><button type="button" class="s" id="rm">Remove photo</button>';
  else inner='<input id="'+id+'" type="'+(f[2]||"text")+'" value="'+v+'"'+(f[2]==="number"?' step="any"':'')+'>';
  return f[2]==="photos"?'<div class="wide"><b style="font-size:.85rem">'+f[1]+'</b>'+inner+'</div>':'<label'+c+'>'+f[1]+inner+'</label>'}).join("")+'<div class="wide"><button type="submit">'+(i>=0?'Save changes':'Add '+sp.one)+'</button> <button type="button" class="s" id="cx">Cancel</button></div></form>';
 $("form").scrollIntoView({behavior:"smooth"});
 $("cx").onclick=function(){$("form").innerHTML=""};
 var ph=(it.imgs&&it.imgs.length?it.imgs:(it.img?[it.img]:[])).slice();
 function drawPh(){$("phs").innerHTML=ph.map(function(u,i){return '<div class="ph1"><img src="'+esc(u)+'" alt="">'+(i===0?'<small>Cover</small><br>':'')+'<button type="button" class="s" data-m="'+i+'" title="Move left">\u2190</button><button type="button" class="s" data-x="'+i+'" title="Remove">\u2715</button></div>'}).join("")}
 if($("ups")){drawPh();
  $("phs").onclick=function(e){var t=e.target;if(t.dataset.x!=null){ph.splice(+t.dataset.x,1);drawPh()}if(t.dataset.m!=null&&+t.dataset.m>0){var i=+t.dataset.m,x=ph[i];ph[i]=ph[i-1];ph[i-1]=x;drawPh()}};
  $("ups").onchange=function(){var fs=Array.prototype.slice.call(this.files),n=0;this.value="";
   fs.reduce(function(pr,f){return pr.then(function(){say("Uploading photo "+(++n)+" of "+fs.length+"...");return upload(f).then(function(u){ph.push(u);drawPh()})})},Promise.resolve()).then(function(){say("Photos ready. Now save.")}).catch(function(){say("A photo failed to upload",true)})}}
 
 if($("rm"))$("rm").onclick=function(){$("f_img").value="";$("pv").hidden=true};
 if($("up"))$("up").onchange=function(){var file=this.files[0];if(!file)return;say("Uploading photo...");upload(file).then(function(p){$("f_img").value=p;$("pv").src=p;$("pv").hidden=false;say("Photo ready. Now save.")}).catch(function(){say("Photo upload failed",true)})};
 $("fm").onsubmit=function(e){e.preventDefault();
  var o=i>=0?arr[i]:{id:Date.now().toString(36)};
  sp.f.forEach(function(f){if(f[2]==="photos"){o.imgs=ph.slice();o.img=ph[0]||"";return}var k=f[0],v=$("f_"+k).value.trim();
   if(k==="x")o.x=v?v.split("\n").map(function(l){var j=l.indexOf(":");return j<0?[l.trim(),""]:[l.slice(0,j).trim(),l.slice(j+1).trim()]}).filter(function(r){return r[0]}):[];
   else if(k==="am")o.am=v?v.split(",").map(function(s){return s.trim()}).filter(Boolean):[];
   else if(f[2]==="number")o[k]=v===""?null:Number(v);
   else o[k]=v});
  if(tab==="listings"&&!o.n||tab==="events"&&(!o.title||!o.date)){say(tab==="events"?"Title and date are required":"Name is required",true);return}
  if(i<0)arr.push(o);
  save();draw()};
}
function upload(file){
 return createImageBitmap(file).then(function(bm){var s=Math.min(1,1400/Math.max(bm.width,bm.height)),c=document.createElement("canvas");c.width=Math.round(bm.width*s);c.height=Math.round(bm.height*s);var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(bm,0,0,c.width,c.height);return new Promise(function(r){c.toBlob(r,"image/jpeg",.85)})})
 .then(function(b){return api("/api/upload",{method:"POST",headers:{"x-ext":"jpg"},body:b})}).then(function(r){return r.path});
}
function pwui(box){
 box.insertAdjacentHTML("beforeend",'<div class="box"><h3 class="wide" style="margin:0">Change password</h3>'+(R?'<p class="wide" style="margin:0">You signed in with Google, so you can set a new password without the old one.</p>':'<label class="wide">Current password<input id="pw0" type="password" autocomplete="current-password"></label>')+'<label class="wide">New password (at least 8 characters)<input id="pw1" type="password" autocomplete="new-password"></label><label class="wide">Repeat new password<input id="pw2" type="password" autocomplete="new-password"></label><div class="wide"><button id="pwb">Change password</button></div></div>');
 $("pwb").onclick=function(){var n=$("pw1").value;if(n.length<8){say("Password must be at least 8 characters",true);return}if(n!==$("pw2").value){say("The two passwords do not match",true);return}
  api("/api/password",{method:"POST",body:JSON.stringify({current:R?"":$("pw0").value,next:n})}).then(function(){R=false;say("Password changed.");draw()}).catch(function(){say("Could not change the password. Check the current password.",true)})}}
$("out").onclick=function(){fetch("/api/logout",{method:"POST"}).then(login)};
fetch("/api/config").then(function(r){return r.json()}).then(function(c){$("glink").hidden=!c.google});
})();
