/* Sachet UI. Detection lives in engine.js, text in i18n.js */
const $=s=>document.querySelector(s),esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let LANG=store.get("sachet-lang")||"en";if(!I18N[LANG])LANG="en";
const T=k=>(I18N[LANG]&&I18N[LANG][k]!=null)?I18N[LANG][k]:I18N.en[k];
const LN={en:"English",hinglish:"Hinglish",hi:"हिन्दी",as:"অসমীয়া"};
const HNEN={hi:I18N.hi.vhiP,md:I18N.hi.vmdP,lo:I18N.hi.vloH,ok:I18N.hi.vokP};

const SAMPLES=[
"Dear customer, your SBI account will be blocked today. Update your KYC immediately: http://sbi-kyc-update.xyz/login and share the OTP you receive.",
"Your parcel is held at customs due to an incomplete address. Pay a redelivery fee of Rs 49 within 12 hours: bit.ly/3xYpost1",
"Congratulations! You have won a lucky draw prize of Rs 25,00,000. Claim your reward now, pay a small processing fee of Rs 999. Do not tell anyone.",
"482913 is your OTP for login to HDFC Bank NetBanking. Do not share it with anyone. Valid for 10 minutes.",
"Hello Customer,\nYour credit application of INR 40,000\nhas now reached the final disbursal stage.\nTap to continue ahead.\nRef ID-80025288",
"Priya grahak, aapka SBI khata aaj raat band ho jayega. Turant KYC update karein aur OTP bhejo: http://sbi-kyc-verify.top/login",
"बधाई हो! आपने ₹25,00,000 की लॉटरी जीती है। इनाम पाने के लिए तुरंत ₹999 प्रोसेसिंग फीस जमा करें। किसी को न बताएं।"];
const SENDERS=["+91 98765 43210","","","VM-HDFCBK","","+91 91234 56780",""];

function mark(t,M){M.sort((a,b)=>a[0]-b[0]);let o="",p=0;for(const [s,e,k,i] of M){if(s<p)continue;o+=esc(t.slice(p,s))+'<mark class="'+k+'" data-f="'+i+'">'+esc(t.slice(s,e))+"</mark>";p=e}return o+esc(t.slice(p))}
const ICON={hi:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',md:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5M12 17v.01"/></svg>',lo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9a3 3 0 115 2c-1 .8-2 1.2-2 3M12 18v.01"/></svg>',ok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'};
const EMPTY=()=>'<div class="empty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/></svg><div><b>'+T("emptyB")+'</b><span>'+T("emptyS")+"</span></div></div>";

function verdictOf(a,t){
  if(a.score>=55)return "hi";if(a.score>=25)return "md";
  const otp=/\botp\b|ओटीपी/i.test(t),warn=/(?:do not|don’t|don't|never)\s+share|kisi\s+ko\s+(?:na|mat)\s+bata|किसी\s*को\s*(?:न|मत)\s*बता/i.test(t);
  return(!a.U.length&&!a.F.length&&otp&&warn)?"ok":"lo";
}
const FL=f=>(f.rk!=null&&RT[LANG])?{h:RT[LANG][f.rk][0],d:RT[LANG][f.rk][1]}:{h:f.h,d:f.d};
const stOf=c=>T("st"+(c==="hi"?"scam":c));

let cur=null;
function render(a,t){
  cur={a,t};
  const res=$("#res"),s=a.score,c=verdictOf(a,t),V={c,st:stOf(c),h:T("v"+c+"H"),p:T("v"+c+"P")};
  const order=a.F.map((f,i)=>({f,i})).sort((x,y)=>y.f.w-x.f.w);
  let h='<article class="report '+c+'"><div class="verdict"><div class="gauge"><svg viewBox="0 0 200 112" role="img" aria-label="'+s+' / 100"><path class="trk" d="M20 100A80 80 0 0 1 180 100" pathLength="100" stroke-dasharray="100 100"/><path class="val" id="gv" d="M20 100A80 80 0 0 1 180 100" pathLength="100" stroke-dasharray="0 100"/></svg><div class="gn"><b>'+s+'</b><span>'+esc(T("score"))+'</span></div></div>';
  h+='<div class="vt"><span class="pill">'+ICON[c]+esc(V.st)+"</span>";
  const chips=[];if(a.type&&s>=25)chips.push('<span class="tchip"><i>'+esc(T("typeLbl"))+"</i> "+esc(T("t_"+a.type))+"</span>");
  if(a.lang!=="en")chips.push('<span class="tchip lg"><i>'+esc(T("langLbl"))+"</i> "+LN[a.lang]+"</span>");
  if(chips.length)h+='<div class="meta">'+chips.join("")+"</div>";
  h+="<h2>"+esc(V.h)+"</h2><p>"+esc(V.p)+"</p>"+(LANG==="en"?'<p lang="hi">'+esc(HNEN[c])+"</p>":"")+"</div></div><div class=\"rbody\">";
  h+=(a.note?'<p class="sn">'+esc(a.note)+"</p>":"")+"<h3>"+T("hMsg")+'</h3><div class="msg">'+mark(t,a.M)+"</div>";
  if(order.length)h+="<h3>"+T("hWhy")+'</h3><div class="fl">'+order.map(({f,i})=>{const L=FL(f);return '<div class="f '+f.sev+'" tabindex="0" data-i="'+i+'"><b>'+esc(L.h)+"<em>"+T(f.sev==="hi"?"serious":"warning")+'</em><em class="pts">+'+f.w+"</em></b><span>"+esc(L.d)+'</span><div class="wb"><i style="width:'+Math.min(100,f.w*2)+'%"></i></div></div>'}).join("")+"</div>";
  if(a.U.length)h+="<h3>"+T("hLink")+"</h3>"+a.U.map(u=>'<div class="lk" data-i="'+u.i+'"><p class="an"><span class="d">'+esc(u.pre)+'</span><b class="'+(u.bad?"bad":"")+'">'+esc(u.reg)+'</b><span class="d">'+esc(u.post)+'</span></p><small>Real owner: <b>'+esc(u.reg)+"</b>. Everything before it is just decoration anyone can add.</small></div>").join("");
  if(s>=25){h+="<h3>"+T("hNext")+'</h3><ol class="tl">'+playbook(a).map(x=>"<li>"+x+"</li>").join("")+"</ol>";const bd=BR.find(([b])=>new RegExp("\\b"+b+"\\b","i").test(t));if(bd)h+='<p class="brandnote" style="margin-top:14px">This message uses the name <b>'+bd[0].toUpperCase()+"</b>. The real site is <b>"+bd[1][0]+"</b>. Open it yourself; never through this message.</p>"}
  h+="<h3>"+T("hDo")+'</h3><ul class="todo">'+T(s>=25?"todoHi":"todoLo").map(x=>"<li>"+esc(x)+"</li>").join("")+'</ul><div class="acts"><button class="btn" id="cp">'+T("copy")+'</button><button class="btn" id="rd">'+T("read")+'</button><button class="btn primary" id="shc">'+T("share")+"</button></div></div></article>";
  res.innerHTML=h;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const g=$("#gv");if(g)g.style.strokeDasharray=s+" 100"}));
  res.querySelectorAll("[data-i]").forEach(el=>{const on=v=>res.querySelectorAll('mark[data-f="'+el.dataset.i+'"]').forEach(x=>x.classList.toggle("on",v));el.onmouseenter=el.onfocus=()=>on(1);el.onmouseleave=el.onblur=()=>on(0)});
  $("#rd").onclick=()=>{try{speechSynthesis.cancel();const hindi=LANG==="en"||LANG==="hi",u=new SpeechSynthesisUtterance(LANG==="en"?HNEN[c]:V.h+". "+V.p);u.lang=hindi?"hi-IN":"as-IN";speechSynthesis.speak(u)}catch(x){}};
  $("#cp").onclick=async e=>{const r="Sachet report\nVerdict: "+V.h+" (risk "+s+"/100)\n"+(a.type&&s>=25?"Type: "+I18N.en["t_"+a.type]+"\n":"")+order.map(({f})=>"- "+f.h).join("\n")+"\n\nMessage:\n"+t;try{await navigator.clipboard.writeText(r);e.target.textContent=T("copied")}catch(x){e.target.textContent=T("copyFail")}};
  $("#shc").onclick=e=>shareCard(a,t,e.target);
}

function show(){
  const t=$("#t").value.trim(),res=$("#res"),tray=$("#tray");
  if(!t){res.innerHTML='<div class="empty warn"><div><b>'+T("nothingB")+"</b><span>"+T("nothingS")+"</span></div></div>";return}
  const run=()=>{
    tray.classList.remove("scan");
    const a=analyze(t,$("#sn").value),c=verdictOf(a,t);
    saveScan(t,a.score,c);render(a,t);renderHist();
    if(!matchMedia("(prefers-reduced-motion:reduce)").matches)res.scrollIntoView({behavior:"smooth",block:"start"});
    if(c==="hi"||c==="md")alarm(c);
  };
  if(matchMedia("(prefers-reduced-motion:reduce)").matches)run();else{tray.classList.add("scan");setTimeout(run,700)}
}

/* ---------- History (only in this browser) ---------- */
function saveScan(t,s,c){let H=(store.get("sachet-hist")||[]).filter(x=>x.t!==t.slice(0,600));H.unshift({t:t.slice(0,600),s,c,d:Date.now()});store.set("sachet-hist",H.slice(0,8))}
function renderHist(){
  const H=store.get("sachet-hist")||[],el=$("#hist");
  if(!H.length){el.innerHTML="";return}
  el.innerHTML='<div class="hist"><div class="hist-h"><h3>'+T("histH")+'</h3><button class="btn quiet sm" id="hc">'+T("histClear")+'</button></div><div class="hist-l">'+H.map((x,i)=>'<button class="hi-item" data-k="'+i+'"><span class="hc c-'+x.c+'">'+esc(stOf(x.c))+'</span><b>'+x.s+'</b><span class="ht">'+esc(x.t.replace(/\s+/g," ").slice(0,90))+"</span></button>").join("")+'</div><p class="hist-n">'+T("histNote")+"</p></div>";
  el.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{$("#t").value=H[b.dataset.k].t;$("#sn").value="";show()});
  $("#hc").onclick=()=>{store.set("sachet-hist",[]);renderHist()};
}

/* ---------- Share card (drawn in the browser, never contains the message) ---------- */
function wrap(ctx,text,x,y,w,lh,max){const words=text.split(/(\s+)/);let line="",n=0;for(const wd of words){const test=line+wd;if(ctx.measureText(test).width>w&&line){ctx.fillText(line.trim(),x,y);y+=lh;line=wd.trimStart();if(++n>=max)return y}else line=test}if(line.trim())ctx.fillText(line.trim(),x,y),y+=lh;return y}
async function shareCard(a,t,btn){
  const c=verdictOf(a,t),s=a.score,col={hi:"#F97066",md:"#FEC84B",lo:"#98A2B3",ok:"#47CD89"}[c];
  const W=1080,H=1350,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");
  const F='Inter,"Noto Sans Devanagari","Noto Sans Bengali",system-ui,sans-serif';
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0B2239");g.addColorStop(1,"#071524");x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle="rgba(94,234,212,.08)";x.beginPath();x.arc(W,0,520,0,7);x.fill();
  x.textBaseline="alphabetic";x.fillStyle="#5EEAD4";x.font="800 46px "+F;x.fillText("Sachet",80,110);x.fillStyle="rgba(255,255,255,.6)";x.font="500 30px "+F;x.fillText("सचेत · scam message inspector",250,108);
  x.lineCap="round";x.lineWidth=52;x.strokeStyle="rgba(255,255,255,.12)";x.beginPath();x.arc(540,560,280,Math.PI,2*Math.PI);x.stroke();
  x.strokeStyle=col;x.beginPath();x.arc(540,560,280,Math.PI,Math.PI+Math.PI*Math.max(.01,s/100));x.stroke();
  x.textAlign="center";x.fillStyle=col;x.font="800 170px "+F;x.fillText(String(s),540,545);x.fillStyle="rgba(255,255,255,.65)";x.font="500 34px "+F;x.fillText(T("score"),540,600);
  const lab=stOf(c);x.font="800 52px "+F;const pw=x.measureText(lab).width+90;x.fillStyle=col;x.beginPath();x.roundRect?x.roundRect(540-pw/2,670,pw,92,46):x.rect(540-pw/2,670,pw,92);x.fill();x.fillStyle="#0B2239";x.fillText(lab,540,735);
  x.fillStyle="#fff";x.font="800 54px "+F;let y=wrap(x,T("v"+c+"H"),540,850,900,68,2);
  x.textAlign="left";
  if(a.type&&s>=25){x.fillStyle="rgba(255,255,255,.65)";x.font="600 32px "+F;x.fillText(T("typeLbl")+": "+T("t_"+a.type),80,y+20);y+=50}
  x.font="500 34px "+F;y+=14;
  a.F.slice().sort((p,q)=>q.w-p.w).slice(0,3).forEach(f=>{if(y>1180)return;x.fillStyle=col;x.fillText("●",80,y+4);x.fillStyle="#E7EEF8";y=wrap(x,FL(f).h,125,y+4,870,44,2)+8});
  x.fillStyle="rgba(255,255,255,.12)";x.fillRect(80,1230,920,2);
  x.fillStyle="rgba(255,255,255,.75)";x.font="500 28px "+F;x.fillText("Checked privately on my device with Sachet",80,1282);
  x.fillStyle="#5EEAD4";x.font="700 28px "+F;x.fillText(location.protocol.startsWith("http")?location.host:"Pehle jaanch, phir bharosa",80,1322);
  cv.toBlob(async b=>{
    const f=new File([b],"sachet-result.png",{type:"image/png"});
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:"Sachet",text:"I checked this message with Sachet."});return}}catch(e){if(e&&e.name==="AbortError")return}
    const u=URL.createObjectURL(b),l=document.createElement("a");l.href=u;l.download="sachet-result.png";document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
    btn.textContent=T("shared");
  },"image/png");
}

/* ---------- Inputs ---------- */
$("#go").onclick=show;
$("#t").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))show()});
$("#clr").onclick=()=>{$("#t").value="";$("#sn").value="";cur=null;$("#res").innerHTML=EMPTY();$("#t").focus()};
document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{$("#t").value=SAMPLES[b.dataset.s];$("#sn").value=SENDERS[b.dataset.s]||"";show()});
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{LANG=b.dataset.lang;store.set("sachet-lang",LANG);applyLang()});

/* ---------- Quiz ---------- */
const Q=[["SBI: Your account is blocked. Update PAN now: http://sbi-pan-update.top",1,"A bank never asks you to update PAN through a link, and .top is not a bank domain."],
["482913 is your OTP for HDFC Bank NetBanking login. Do not share it with anyone.",0,"It names the purpose, warns you not to share, and has no link."],
["Your parcel is held. Pay Rs 25 redelivery fee: bit.ly/3xYpost1",1,"Fee requests plus shortened links are the classic fake courier trick."],
["Rs 2,500 debited from A/c XX1234 on 21-Nov. Not you? Call the number on the back of your card. -ICICI Bank",0,"It only informs you, has no link, and sends you to the number printed on your own card."],
["You won Rs 25 lakh in a lucky draw! WhatsApp +91 98XXXXXX10 and pay Rs 5,000 fee to claim.",1,"You never entered, and real prizes never ask for a fee first."]];
let qi=0,qs=0;
function quiz(){const el=$("#quiz");
  if(qi>=Q.length){el.innerHTML='<div class="qc"><p class="qh">Your result</p><h3 style="margin:0 0 6px;font-size:1.4rem">You scored '+qs+" of "+Q.length+".</h3><p style=\"color:var(--mu)\">"+(qs>=4?"Sharp eyes. Share Sachet with someone who needs it.":"Try the samples above to learn the signs, then play again.")+'</p><button class="btn primary" id="qr">Play again</button></div>';$("#qr").onclick=()=>{qi=qs=0;quiz()};return}
  const q=Q[qi];
  el.innerHTML='<div class="qc"><p class="qh">Question '+(qi+1)+" of "+Q.length+'</p><div class="bar"><i style="width:'+(qi/Q.length*100)+'%"></i></div><div class="bub">'+esc(q[0])+'</div><div class="row"><button class="btn" data-a="1">Scam</button><button class="btn" data-a="0">Genuine</button></div><p id="qf" aria-live="polite"></p></div>';
  el.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{const ok=+b.dataset.a===q[1];if(ok)qs++;el.querySelectorAll("[data-a]").forEach(x=>x.disabled=true);$("#qf").innerHTML="<b>"+(ok?"Correct.":"Not quite.")+"</b> It is "+(q[1]?"a scam":"genuine")+". "+esc(q[2])+' <button class="btn sm primary" id="qn">'+(qi+1<Q.length?"Next":"See score")+"</button>";$("#qn").onclick=()=>{qi++;quiz()}})}
quiz();
$("#big").onclick=()=>{const on=document.documentElement.classList.toggle("big");$("#big").setAttribute("aria-pressed",on)};

/* ---------- Alert tone: synthesised in the browser, no audio file needed ---------- */
let snd=true,ac;
function alarm(level){if(!snd)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const n=level==="hi"?4:2;for(let i=0;i<n;i++){const o=ac.createOscillator(),g=ac.createGain(),t0=ac.currentTime+i*.3;o.type="square";o.frequency.setValueAtTime(i%2?660:880,t0);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.15,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.27);o.connect(g).connect(ac.destination);o.start(t0);o.stop(t0+.28)}navigator.vibrate&&navigator.vibrate(level==="hi"?[200,100,200,100,300]:[150])}catch(x){}}
$("#snd").onclick=()=>{snd=!snd;$("#snd").textContent=T(snd?"sndOn":"sndOff");$("#snd").setAttribute("aria-pressed",snd)};

/* ---------- Screenshot reader (OCR) runs in the browser with Tesseract.js ---------- */
const loadOCR=()=>window.Tesseract?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";s.onload=ok;s.onerror=no;document.head.appendChild(s)});
async function ocr(file){const st=$("#ocrs");st.textContent="Loading the screenshot reader…";
  try{await loadOCR();const {data}=await Tesseract.recognize(file,"eng",{logger:m=>{if(m.status==="recognizing text")st.textContent="Reading screenshot… "+Math.round(m.progress*100)+"%"}});
    const t=data.text.replace(/\n{3,}/g,"\n\n").trim();
    if(!t){st.textContent="No text found. Try a clearer, closer screenshot.";return}
    $("#t").value=t;$("#sn").value="";st.textContent="Text read from your screenshot. Check it for mistakes.";show()
  }catch(e){st.textContent="Could not read the image. The reader needs internet the first time. You can paste the text instead."}}
$("#upb").onclick=()=>$("#img").click();
$("#img").onchange=e=>{if(e.target.files[0])ocr(e.target.files[0]);e.target.value=""};
$("#t").addEventListener("paste",e=>{const f=[...(e.clipboardData?e.clipboardData.files:[])].find(x=>x.type.startsWith("image/"));if(f){e.preventDefault();ocr(f)}});
const tray=$("#tray");
tray.ondragover=e=>{e.preventDefault();tray.classList.add("drag")};
tray.ondragleave=()=>tray.classList.remove("drag");
tray.ondrop=e=>{e.preventDefault();tray.classList.remove("drag");const f=[...e.dataTransfer.files].find(x=>x.type.startsWith("image/"));if(f)ocr(f)};

/* ---------- Language ---------- */
function applyLang(){
  document.documentElement.lang=LANG;
  document.querySelectorAll("[data-t]").forEach(el=>{const v=T(el.dataset.t);if(v==null)return;if(el.hasAttribute("data-html"))el.innerHTML=v;else el.textContent=v});
  document.querySelectorAll("[data-t-ph]").forEach(el=>{el.placeholder=T(el.dataset.tPh)});
  document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lang===LANG)));
  $("#snd").textContent=T(snd?"sndOn":"sndOff");
  if(cur)render(cur.a,cur.t);else $("#res").innerHTML=EMPTY();
  renderHist();
}
applyLang();

/* ---------- Installable app: service worker and install button ---------- */
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
let dp;addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;$("#inst").hidden=false});
$("#inst").onclick=async()=>{if(dp){dp.prompt();dp=null;$("#inst").hidden=true}};
