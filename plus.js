/* Sachet Toolkit (add-on). Runs fully on the device. Does not modify existing files. */
(function(){
"use strict";

/* ================= CORE LOGIC (pure, testable in Node) ================= */
const BR=[
 {n:"SBI",k:["sbi","onlinesbi","sbicard"],d:["sbi.co.in","onlinesbi.sbi","onlinesbi.com","sbicard.com","sbilife.co.in"]},
 {n:"HDFC Bank",k:["hdfc","hdfcbank"],d:["hdfcbank.com"]},
 {n:"ICICI Bank",k:["icici","icicibank"],d:["icicibank.com"]},
 {n:"Axis Bank",k:["axis","axisbank"],d:["axisbank.com"]},
 {n:"PNB",k:["pnb","pnbindia"],d:["pnbindia.in","netpnb.com"]},
 {n:"Bank of Baroda",k:["bankofbaroda","bobibanking"],d:["bankofbaroda.in","bobibanking.com"]},
 {n:"Kotak",k:["kotak"],d:["kotak.com"]},
 {n:"Paytm",k:["paytm"],d:["paytm.com"]},
 {n:"PhonePe",k:["phonepe"],d:["phonepe.com"]},
 {n:"Google Pay",k:["gpay","googlepay"],d:["google.com","pay.google.com"]},
 {n:"Amazon",k:["amazon"],d:["amazon.in","amazon.com"]},
 {n:"Flipkart",k:["flipkart"],d:["flipkart.com"]},
 {n:"India Post",k:["indiapost"],d:["indiapost.gov.in"]},
 {n:"Income Tax",k:["incometax","incometaxindia"],d:["incometax.gov.in","incometaxindia.gov.in"]},
 {n:"Aadhaar (UIDAI)",k:["uidai","aadhaar","aadhar"],d:["uidai.gov.in"]},
 {n:"EPFO",k:["epfindia","epfo"],d:["epfindia.gov.in"]},
 {n:"IRCTC",k:["irctc"],d:["irctc.co.in"]},
 {n:"Jio",k:["jio"],d:["jio.com"]},
 {n:"Airtel",k:["airtel"],d:["airtel.in"]},
 {n:"NPCI / BHIM",k:["npci","bhim"],d:["npci.org.in"]}
];
const MULTI=["co.in","gov.in","nic.in","org.in","net.in","ac.in","res.in","co.uk","org.uk","com.au"];
const FREEHOST=["google.com","blogspot.com","github.io","vercel.app","netlify.app","web.app","pages.dev","weebly.com","wixsite.com","000webhostapp.com","webflow.io","glitch.me","carrd.co"];
const BADTLD=["xyz","top","vip","click","icu","live","online","site","shop","buzz","cfd","sbs","rest","cyou","monster","club","work","fun","link","info"];
const SHORT=["bit.ly","tinyurl.com","cutt.ly","t.co","rb.gy","is.gd","shorturl.at","tiny.cc","rebrand.ly","goo.gl","t.ly"];
const KW=["kyc","verify","update","secure","login","signin","refund","claim","reward","bonus","offer","gift","prize","lucky","support","care"];

function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}

function parseLink(s){
  s=String(s||"").trim();
  const tok=s.split(/\s+/).find(x=>/\.[a-z]{2,}/i.test(x)||/^\d{1,3}(\.\d{1,3}){3}/.test(x));
  if(!tok)return null;
  let u=tok.replace(/^[("'<]+|[)"'>.,;]+$/g,""),scheme=(u.match(/^(https?):\/\//i)||[])[1];
  u=u.replace(/^[a-z][a-z0-9+.-]*:\/\//i,"");
  const auth=u.split(/[\/?#]/)[0],rest=u.slice(auth.length);
  const at=auth.includes("@");
  let host=auth.slice(auth.lastIndexOf("@")+1).replace(/:\d+$/,"").toLowerCase().replace(/^www\./,"");
  if(!host)return null;
  return{host,scheme:scheme?scheme.toLowerCase():"",at,path:rest.toLowerCase(),isIp:/^\d{1,3}(\.\d{1,3}){3}$/.test(host)};
}
function regOf(host){
  const l=host.split(".");if(l.length<=2)return host;
  const two=l.slice(-2).join("."),three=l.slice(-3).join(".");
  if(MULTI.includes(two)||FREEHOST.includes(two))return three;
  return two;
}
const toks=s=>s.split(/[.\-_]/).filter(Boolean);
function brandHit(tokens,whole){
  const out=[];
  for(const b of BR){for(const k of b.k){
    const hit=tokens.some(t=>t===k)||(k.length>=5&&whole.includes(k));
    if(hit){out.push(b);break}
  }}
  return out;
}
function norm(t){return t.replace(/rn/g,"m").replace(/vv/g,"w").replace(/0/g,"o").replace(/1/g,"l").replace(/3/g,"e").replace(/5/g,"s")}
function norm2(t){return t.replace(/rn/g,"m").replace(/vv/g,"w").replace(/0/g,"o").replace(/1/g,"i").replace(/3/g,"e").replace(/5/g,"s")}

function checkLink(input){
  const p=parseLink(input);if(!p)return null;
  const host=p.host,reg=regOf(host),labels=host.split("."),regLabels=reg.split("."),
        regLabel=regLabels[0],tld=labels[labels.length-1],
        subPart=labels.slice(0,labels.length-regLabels.length).join(".");
  const items=[],add=(code,sev,w,pr)=>items.push({code,sev,w,p:pr||{}});
  let official=null;
  const regHit=brandHit(toks(regLabel),regLabel),subHit=brandHit(toks(subPart),subPart);
  for(const b of regHit){if(b.d.includes(reg)||b.d.includes(host)){official=b;break}}
  const isGov=/\.(gov|nic)\.in$/.test(reg)&&!official;
  const flagged=new Set();
  if(!official){
    for(const b of regHit){add("brandIn","hi",55,{b:b.n,d:reg});flagged.add(b.n)}
    for(const b of subHit){if(flagged.has(b.n))continue;add("sub","hi",55,{b:b.n,d:reg});flagged.add(b.n)}
    for(const b of BR){
      if(flagged.has(b.n))continue;
      for(const k of b.k){
        let found=null;
        for(const t of toks(regLabel).concat([regLabel])){
          if(t.length<4||t===k)continue;
          const n1=norm(t),n2=norm2(t);
          if(t!==n1&&(n1===k||n2===k||(k.length>=5&&(n1.includes(k)||n2.includes(k))))){found="glyph";break}
          if(Math.abs(t.length-k.length)<=1&&lev(t,k)<=(k.length>=6?2:1)){found="typo";break}
        }
        if(found){add(found,"hi",found==="glyph"?55:50,{b:b.n});flagged.add(b.n);break}
      }
    }
  }
  if(FREEHOST.includes(regLabels.slice(-2).join("."))&&regLabels.length>=3&&!official)add("free","md",30,{d:reg});
  if(p.isIp)add("ip","hi",40);
  if(p.at)add("at","hi",35);
  if(host.includes("xn--"))add("puny","hi",40);
  if(SHORT.includes(reg))add("short","md",25);
  if(!official&&!isGov&&BADTLD.includes(tld))add("tld","md",20,{x:tld});
  const hy=(regLabel.match(/-/g)||[]).length;if(hy>=2)add("hyph","md",15);
  if(/\.apk(\b|$)/.test(p.path))add("apk","hi",40);
  if(!official&&!isGov){
    const all=(host+p.path),w=KW.filter(k=>all.includes(k));
    if(w.length)add("kw","md",12,{x:w.slice(0,3).join(", ")});
  }
  if(p.scheme==="http"&&items.length)add("http","md",5);
  let score=Math.min(100,items.reduce((a,x)=>a+x.w,0)),level;
  if(official&&score<20){level="official";items.unshift({code:"official",sev:"ok",w:0,p:{b:official.n,d:reg}})}
  else if(isGov&&score<20){level="official";items.unshift({code:"gov",sev:"ok",w:0,p:{}})}
  else level=score>=45?"fake":score>=18?"sus":"none";
  return{host,reg,score,level,items};
}

const HANDLES=["ybl","ibl","axl","okaxis","oksbi","okhdfcbank","okicici","paytm","apl","upi","sbi","hdfcbank","icici","axisbank","pnb","boi","cnrb","kotak","barodampay","indus","fbl","aubank","yesbank","postbank","ikwik","freecharge","jupiteraxis","airtel","jio","unionbank","uboi","idfcbank","federal","rbl","pingpay","slc","dbs","cboi","centralbank","mahb","sib","kbl","tmb","dlb","hsbc","okbizaxis","abfspay","waaxis","wahdfcbank","wasbi","waicici","yapl","naviaxis","superyes","tapicici"];
const UKW=["sbi","hdfc","icici","axis","paytm","phonepe","amazon","flipkart","npci","rbi","bank","care","support","helpline","customer","official","kyc","refund","reward","cashback","lottery","prize","claim","police","cbi","tax","govt","gov","electric","bill","helpdesk"];

function checkUpi(s){
  s=String(s||"").trim().toLowerCase();if(!s)return null;
  const items=[],add=(code,sev,w,pr)=>items.push({code,sev,w,p:pr||{}});
  if(/^\+?[\d\s\-()]{8,16}$/.test(s)&&!s.includes("@"))return checkPhone(s);
  const m=s.match(/^([a-z0-9._\-]{2,64})@([a-z][a-z0-9]{1,30})$/);
  if(!m){add("fmt","hi",45);return fin(items,"upi",s)}
  const u=m[1],h=m[2];
  if(!HANDLES.includes(h))add("unk","md",20,{x:h});
  const w=UKW.find(k=>u.includes(k));
  if(w)add("kwUser","hi",45,{x:w});
  return fin(items,"upi",s);
}
function checkPhone(s){
  const items=[],add=(code,sev,w,pr)=>items.push({code,sev,w,p:pr||{}});
  const plus=/^\s*\+/.test(s);let d=String(s).replace(/\D/g,"");
  if(plus&&!d.startsWith("91")){add("intl","md",35,{x:d.slice(0,2)})}
  else{
    if(d.length===12&&d.startsWith("91"))d=d.slice(2);
    if(d.length===11&&d.startsWith("0"))d=d.slice(1);
    if(d.length===10){
      if(!/^[6-9]/.test(d))add("phBad","md",30);
      else if(d.startsWith("140"))add("t140","md",20);
    }else if(!/^1[89]00/.test(d)&&!/^140/.test(d))add("phBad","md",30);
    else if(d.startsWith("140"))add("t140","md",20);
  }
  return fin(items,"phone",s);
}
function fin(items,kind,input){
  const score=Math.min(100,items.reduce((a,x)=>a+x.w,0));
  return{kind,input,score,level:score>=45?"fake":score>=18?"sus":"none",items};
}

const API={checkLink,checkUpi,checkPhone,parseLink,regOf,lev};
if(typeof module!=="undefined")module.exports=API;
if(typeof document==="undefined")return;

/* ================= TEXT (English, Hindi, Assamese) ================= */
const P={
en:{
 nav:"Toolkit",h:"Sachet Toolkit",sub:"Extra tools that run on your device. Nothing you type here is uploaded.",
 tLink:"Fake-link check",tUpi:"UPI & phone",tSos:"I got scammed",tStat:"My stats",
 linkH:"Look-alike link detector",linkP:"Paste a link. Sachet compares it with real brand websites such as SBI, HDFC, Paytm and India Post.",linkPh:"e.g. http://sbi-kyc-update.xyz/login",
 upiH:"UPI ID and phone number checker",upiP:"Paste a UPI ID (name@bank) or a phone number someone gave you.",upiPh:"e.g. sbi.support@ybl or +92 300 1234567",
 check:"Check",try:"Try",
 vfake:"Fake or look-alike",vsus:"Suspicious",vnone:"No known red flag",vofficial:"Official domain",
 owner:"Real owner:",
 noteLink:"No look-alike pattern found. This does not prove a link is safe.",
 noteUpi:"A normal-looking ID or number is not proof of honesty. Check the name your app shows before paying. You never enter a PIN to receive money.",
 bad:"Could not read a link or ID here. Paste it again.",
 r:{brandIn:"Uses the name {b}, but this link belongs to {d}, not to {b}.",sub:"{b} appears only as a prefix. The real site is {d}.",typo:"Looks like a misspelling of {b}.",glyph:"Uses look-alike characters (like 0 for o, or rn for m) to imitate {b}.",tld:"Ends in .{x}, an ending often used by throwaway scam sites.",short:"A link shortener hides where this really goes.",ip:"The address is a bare number, not a website name.",at:"Contains @, which can disguise the real site.",puny:"Uses special letters (xn--) that can imitate real names.",hyph:"Many hyphens, a common sign of fake pages.",kw:"Contains pressure words such as {x}.",apk:"Points to an app file (.apk). Real banks do not send apps by link.",http:"Not encrypted (http).",free:"Hosted on a free page builder ({d}). Companies use their own domain.",official:"This is the official {b} domain ({d}). Still, open it by typing the address yourself, not from a message.",gov:"Ends in .gov.in or .nic.in, which only Indian government bodies can get.",
  fmt:"This is not a valid UPI ID. It should look like name@bank.",unk:"The handle after @ ({x}) is not one Sachet recognises. It may be new, so verify before paying.",kwUser:"The ID contains '{x}'. Banks and companies do not collect money through personal-looking UPI IDs like this.",phBad:"This is not a valid Indian mobile number (10 digits starting 6 to 9).",intl:"International number (+{x}). Many WhatsApp job, task and 'police' scams come from foreign numbers.",t140:"Numbers starting 140 are used for bulk marketing calls. No genuine caller needs your OTP."},
 sosH:"I got scammed: your first-hour plan",sosP:"Speed matters. Pick what happened and follow the steps. Report quickly to 1930 so the money has a chance of being frozen.",
 c:["I shared an OTP, card or bank details","I sent money (UPI or transfer)","I installed an app or gave remote access","I clicked a link or typed a password"],
 now:"Now",h1:"Within 1 hour",call:"Call 1930",timer:"Time since you started:",prog:"{a} of {b} steps done",
 s:[["Call your bank on the official number printed on your card and block the card and net banking.","Do not share any more codes. Change your net-banking password and UPI PIN from the bank's official app.","Check your recent transactions. If any money has left, call 1930 right away."],
    ["Call 1930 immediately. The earlier it is reported, the better the chance of freezing the money.","Call your bank and report the transaction. Keep the UPI reference or transaction ID ready.","File a complaint at cybercrime.gov.in with screenshots (use the draft below). Never pay a 'recovery fee' to anyone."],
    ["Switch on flight mode or turn off internet, then uninstall AnyDesk, TeamViewer or the unknown app.","From another phone, call your bank to block cards and UPI. Change passwords only from a clean device.","Call 1930. If you cannot remove the app, back up photos and factory-reset the phone."],
    ["Change the password of that account, and of any other account that uses the same password.","Log out of all devices and turn on two-step verification.","Check bank and UPI for activity you do not recognise. If you find any, call your bank and 1930."]],
 cmpH:"Complaint draft",cmpP:"Fill what you know. The draft is ready to paste into cybercrime.gov.in or to give your bank.",
 fAmt:"Amount lost (₹)",fWhen:"Date and time",fRef:"Transaction / UPI reference",fWho:"Scammer's phone, UPI ID or link",fBank:"Your bank",
 copy:"Copy draft",copied:"Copied",portal:"Open cybercrime.gov.in",
 stH:"Your device stats",stP:"Kept only in this browser. Nothing is sent anywhere.",stA:"messages checked",stB:"flagged scam or suspect",stC:"links checked",stD:"UPI / phone checks",stR:"Reset stats",
 fam:"Warn family on WhatsApp",sosBtn:"I got scammed",mic:"Speak",
 what:["I shared my OTP, card or bank details with a fraudster.","I transferred money to a fraudster.","I installed an app or gave remote access to a fraudster.","I clicked a fraudulent link or entered my password on a fake page."],
 famMsg:"⚠️ Sachet alert: I just checked a message{t}. It looks like a SCAM. Do not click any link, do not share OTP or PIN, do not pay. If you already did, call 1930 now."},
hi:{
 nav:"टूलकिट",h:"सचेत टूलकिट",sub:"अतिरिक्त टूल जो आपके डिवाइस पर चलते हैं। यहाँ टाइप की गई कोई चीज़ अपलोड नहीं होती।",
 tLink:"नकली लिंक जाँच",tUpi:"UPI और फोन",tSos:"मैं ठगा गया",tStat:"मेरे आँकड़े",
 linkH:"मिलता-जुलता (नकली) लिंक डिटेक्टर",linkP:"लिंक चिपकाएँ। सचेत उसे SBI, HDFC, Paytm, India Post जैसी असली वेबसाइटों से मिलाता है।",linkPh:"जैसे http://sbi-kyc-update.xyz/login",
 upiH:"UPI ID और फोन नंबर जाँच",upiP:"कोई UPI ID (name@bank) या फोन नंबर चिपकाएँ जो किसी ने आपको दिया।",upiPh:"जैसे sbi.support@ybl या +92 300 1234567",
 check:"जाँचें",try:"आज़माएँ",
 vfake:"नकली / मिलता-जुलता",vsus:"संदिग्ध",vnone:"कोई ज्ञात खतरा संकेत नहीं",vofficial:"आधिकारिक डोमेन",
 owner:"असली मालिक:",
 noteLink:"कोई मिलता-जुलता पैटर्न नहीं मिला। इसका मतलब यह नहीं कि लिंक सुरक्षित है।",
 noteUpi:"सामान्य दिखने वाली ID या नंबर भरोसे का सबूत नहीं है। पैसे देने से पहले ऐप में दिखा नाम जाँचें। पैसे पाने के लिए कभी PIN नहीं डालना पड़ता।",
 bad:"यहाँ लिंक या ID पढ़ी नहीं जा सकी। दोबारा चिपकाएँ।",
 r:{brandIn:"इसमें {b} का नाम है, पर यह लिंक {d} का है, {b} का नहीं।",sub:"{b} सिर्फ आगे जोड़ा गया नाम है। असली साइट {d} है।",typo:"यह {b} की गलत स्पेलिंग जैसा दिखता है।",glyph:"{b} की नकल के लिए मिलते-जुलते अक्षर (जैसे o की जगह 0, m की जगह rn) इस्तेमाल हुए हैं।",tld:"अंत में .{x} है, जो अक्सर फर्जी साइटों पर मिलता है।",short:"लिंक शॉर्टनर असली ठिकाना छिपा देता है।",ip:"पता वेबसाइट का नाम नहीं, सिर्फ एक नंबर है।",at:"इसमें @ है, जो असली साइट छिपा सकता है।",puny:"इसमें खास अक्षर (xn--) हैं जो असली नाम की नकल कर सकते हैं।",hyph:"कई हाइफन हैं, जो नकली पेज की आम निशानी है।",kw:"{x} जैसे दबाव वाले शब्द हैं।",apk:"यह ऐप फाइल (.apk) की ओर ले जाता है। असली बैंक लिंक से ऐप नहीं भेजते।",http:"एन्क्रिप्टेड नहीं है (http)।",free:"फ्री पेज बिल्डर ({d}) पर बना है। कंपनियाँ अपना डोमेन इस्तेमाल करती हैं।",official:"यह {b} का आधिकारिक डोमेन ({d}) है। फिर भी मैसेज से नहीं, खुद पता टाइप करके खोलें।",gov:".gov.in या .nic.in पर खत्म होता है, जो सिर्फ सरकारी संस्थाओं को मिलता है।",
  fmt:"यह सही UPI ID नहीं है। यह name@bank जैसी होनी चाहिए।",unk:"@ के बाद का हैंडल ({x}) सचेत नहीं पहचानता। नया हो सकता है, भुगतान से पहले जाँचें।",kwUser:"ID में '{x}' है। बैंक और कंपनियाँ ऐसी निजी जैसी UPI ID से पैसे नहीं लेतीं।",phBad:"यह सही भारतीय मोबाइल नंबर नहीं है (10 अंक, 6 से 9 से शुरू)।",intl:"विदेशी नंबर (+{x})। कई WhatsApp जॉब, टास्क और 'पुलिस' स्कैम विदेशी नंबरों से आते हैं।",t140:"140 से शुरू होने वाले नंबर प्रचार कॉल के लिए होते हैं। असली कॉलर को आपका OTP नहीं चाहिए।"},
 sosH:"मैं ठगा गया: पहले घंटे की योजना",sosP:"तेज़ी ज़रूरी है। जो हुआ उसे चुनें और कदम अपनाएँ। 1930 पर जल्दी रिपोर्ट करने से पैसा रुकने की संभावना बढ़ती है।",
 c:["मैंने OTP, कार्ड या बैंक जानकारी बता दी","मैंने पैसे भेज दिए (UPI या ट्रांसफर)","मैंने कोई ऐप इंस्टॉल किया या रिमोट एक्सेस दिया","मैंने लिंक खोला या पासवर्ड डाल दिया"],
 now:"अभी",h1:"1 घंटे के अंदर",call:"1930 पर कॉल करें",timer:"शुरू करने के बाद का समय:",prog:"{b} में से {a} कदम पूरे",
 s:[["कार्ड के पीछे छपे आधिकारिक नंबर पर बैंक को कॉल करके कार्ड और नेट बैंकिंग ब्लॉक करवाएँ।","अब कोई और कोड न बताएँ। बैंक के आधिकारिक ऐप से नेट बैंकिंग पासवर्ड और UPI PIN बदलें।","हाल के लेनदेन देखें। अगर पैसा निकला है तो तुरंत 1930 पर कॉल करें।"],
    ["तुरंत 1930 पर कॉल करें। जितनी जल्दी रिपोर्ट, पैसा रुकने की उतनी ज़्यादा संभावना।","बैंक को कॉल करके लेनदेन की रिपोर्ट करें। UPI रेफरेंस या ट्रांज़ैक्शन ID तैयार रखें।","स्क्रीनशॉट के साथ cybercrime.gov.in पर शिकायत दर्ज करें (नीचे का ड्राफ्ट इस्तेमाल करें)। 'रिकवरी फीस' किसी को न दें।"],
    ["फ्लाइट मोड चालू करें या इंटरनेट बंद करें, फिर AnyDesk, TeamViewer या अनजान ऐप हटाएँ।","दूसरे फोन से बैंक को कॉल करके कार्ड और UPI बंद करवाएँ। पासवर्ड सिर्फ साफ डिवाइस से बदलें।","1930 पर कॉल करें। ऐप न हटे तो फोटो बैकअप करके फोन फैक्टरी रीसेट करें।"],
    ["उस अकाउंट का पासवर्ड बदलें, और जिन अकाउंट में वही पासवर्ड है उनका भी।","सभी डिवाइस से लॉग आउट करें और टू-स्टेप वेरिफिकेशन चालू करें।","बैंक और UPI में अनजान गतिविधि देखें। मिले तो बैंक और 1930 पर कॉल करें।"]],
 cmpH:"शिकायत ड्राफ्ट",cmpP:"जो पता है भरें। ड्राफ्ट cybercrime.gov.in में चिपकाने या बैंक को देने के लिए तैयार है (ड्राफ्ट अंग्रेज़ी में बनता है)।",
 fAmt:"गंवाई रकम (₹)",fWhen:"तारीख और समय",fRef:"ट्रांज़ैक्शन / UPI रेफरेंस",fWho:"ठग का फोन, UPI ID या लिंक",fBank:"आपका बैंक",
 copy:"ड्राफ्ट कॉपी करें",copied:"कॉपी हो गया",portal:"cybercrime.gov.in खोलें",
 stH:"आपके डिवाइस के आँकड़े",stP:"सिर्फ इस ब्राउज़र में रखे जाते हैं। कहीं भेजे नहीं जाते।",stA:"जाँचे गए मैसेज",stB:"स्कैम या संदिग्ध पाए गए",stC:"जाँचे गए लिंक",stD:"UPI / फोन जाँच",stR:"आँकड़े रीसेट करें",
 fam:"परिवार को WhatsApp पर चेताएँ",sosBtn:"मैं ठगा गया",mic:"बोलें",
 famMsg:"⚠️ सचेत चेतावनी: मैंने अभी एक मैसेज जाँचा{t}। यह स्कैम लगता है। किसी लिंक पर क्लिक न करें, OTP या PIN न बताएं, पैसे न दें। अगर कर चुके हैं तो तुरंत 1930 पर कॉल करें।"},
as:{
 nav:"টুলকিট",h:"সচেত টুলকিট",sub:"অতিৰিক্ত টুল যি আপোনাৰ ডিভাইচতে চলে। ইয়াত টাইপ কৰা একোৱেই আপলোড নহয়।",
 tLink:"ভুৱা লিংক পৰীক্ষা",tUpi:"UPI আৰু ফোন",tSos:"মই প্ৰতাৰিত হৈছোঁ",tStat:"মোৰ পৰিসংখ্যা",
 linkH:"একেধৰণৰ (ভুৱা) লিংক ডিটেক্টৰ",linkP:"লিংক পেষ্ট কৰক। সচেতে ইয়াক SBI, HDFC, Paytm, India Post ৰ দৰে প্ৰকৃত ৱেবছাইটৰ সৈতে তুলনা কৰে।",linkPh:"যেনে http://sbi-kyc-update.xyz/login",
 upiH:"UPI ID আৰু ফোন নম্বৰ পৰীক্ষা",upiP:"কোনোৱে দিয়া UPI ID (name@bank) বা ফোন নম্বৰ পেষ্ট কৰক।",upiPh:"যেনে sbi.support@ybl বা +92 300 1234567",
 check:"পৰীক্ষা কৰক",try:"চেষ্টা কৰক",
 vfake:"ভুৱা / একেধৰণৰ",vsus:"সন্দেহজনক",vnone:"কোনো জনা সতৰ্কবাৰ্তা নাই",vofficial:"আনুষ্ঠানিক ডোমেইন",
 owner:"প্ৰকৃত গৰাকী:",
 noteLink:"কোনো একেধৰণৰ আৰ্হি পোৱা নগ'ল। ইয়াৰ অৰ্থ লিংকটো সুৰক্ষিত বুলি নহয়।",
 noteUpi:"সাধাৰণ দেখা ID বা নম্বৰ বিশ্বাসযোগ্যতাৰ প্ৰমাণ নহয়। পইচা দিয়াৰ আগত এপত দেখুওৱা নামটো চাওক। পইচা পাবলৈ কেতিয়াও PIN দিব নালাগে।",
 bad:"ইয়াত লিংক বা ID পঢ়িব নোৱাৰিলোঁ। আকৌ পেষ্ট কৰক।",
 r:{brandIn:"ইয়াত {b}ৰ নাম আছে, কিন্তু এই লিংক {d}ৰ, {b}ৰ নহয়।",sub:"{b} কেৱল আগত যোগ কৰা নাম। প্ৰকৃত চাইট {d}।",typo:"এইটো {b}ৰ ভুল বানান যেন লাগে।",glyph:"{b}ৰ নকল কৰিবলৈ একেধৰণৰ আখৰ (যেনে o ৰ ঠাইত 0, m ৰ ঠাইত rn) ব্যৱহাৰ কৰা হৈছে।",tld:"শেষত .{x} আছে, যিটো প্ৰায়ে ভুৱা চাইটত দেখা যায়।",short:"লিংক চৰ্টনাৰে প্ৰকৃত গন্তব্য লুকুৱাই ৰাখে।",ip:"ঠিকনাটো ৱেবছাইটৰ নাম নহয়, কেৱল এটা সংখ্যা।",at:"ইয়াত @ আছে, যিয়ে প্ৰকৃত চাইট লুকুৱাব পাৰে।",puny:"ইয়াত বিশেষ আখৰ (xn--) আছে যিয়ে প্ৰকৃত নামৰ নকল কৰিব পাৰে।",hyph:"বহু হাইফেন আছে, যি ভুৱা পৃষ্ঠাৰ সাধাৰণ চিন।",kw:"{x} ধৰণৰ চাপ সৃষ্টি কৰা শব্দ আছে।",apk:"ই এটা এপ ফাইল (.apk) লৈ যায়। প্ৰকৃত বেংকে লিংকেৰে এপ নপঠায়।",http:"এনক্ৰিপ্টেড নহয় (http)।",free:"বিনামূলীয়া পেজ বিল্ডাৰ ({d})ত বনোৱা। কোম্পানীয়ে নিজৰ ডোমেইন ব্যৱহাৰ কৰে।",official:"এইটো {b}ৰ আনুষ্ঠানিক ডোমেইন ({d})। তথাপি মেছেজৰ পৰা নহয়, নিজে ঠিকনা টাইপ কৰি খুলিব।",gov:".gov.in বা .nic.in ত শেষ হৈছে, যিটো কেৱল চৰকাৰী প্ৰতিষ্ঠানে পায়।",
  fmt:"এইটো সঠিক UPI ID নহয়। ই name@bank ৰ দৰে হ'ব লাগে।",unk:"@ ৰ পিছৰ হেণ্ডলটো ({x}) সচেতে চিনি নাপায়। নতুন হ'ব পাৰে, পইচা দিয়াৰ আগত নিশ্চিত হওক।",kwUser:"ID ত '{x}' আছে। বেংক আৰু কোম্পানীয়ে এনেকুৱা ব্যক্তিগত ধৰণৰ UPI IDৰে পইচা নলয়।",phBad:"এইটো সঠিক ভাৰতীয় মোবাইল নম্বৰ নহয় (১০ টা অংক, ৬-৯ৰ পৰা আৰম্ভ)।",intl:"বিদেশী নম্বৰ (+{x})। বহু WhatsApp চাকৰি, টাস্ক আৰু 'পুলিচ' স্কেম বিদেশী নম্বৰৰ পৰা আহে।",t140:"১৪০ ৰে আৰম্ভ হোৱা নম্বৰ প্ৰচাৰৰ কলৰ বাবে। প্ৰকৃত কলাৰে আপোনাৰ OTP নিবিচাৰে।"},
 sosH:"মই প্ৰতাৰিত হৈছোঁ: প্ৰথম ঘণ্টাৰ পৰিকল্পনা",sosP:"দ্ৰুততা প্ৰয়োজন। কি হ'ল বাছনি কৰক আৰু পদক্ষেপবোৰ অনুসৰণ কৰক। ১৯৩০ত সোনকালে জনালে পইচা ৰখাৰ সম্ভাৱনা বাঢ়ে।",
 c:["মই OTP, কাৰ্ড বা বেংকৰ তথ্য দি দিলোঁ","মই পইচা পঠিয়ালোঁ (UPI বা ট্ৰান্সফাৰ)","মই কোনো এপ ইনষ্টল কৰিলোঁ বা ৰিমোট এক্সেছ দিলোঁ","মই লিংক খুলিলোঁ বা পাছৱৰ্ড দিলোঁ"],
 now:"এতিয়াই",h1:"১ ঘণ্টাৰ ভিতৰত",call:"১৯৩০ত ফোন কৰক",timer:"আৰম্ভ কৰাৰ পিছৰ সময়:",prog:"{b}টাৰ ভিতৰত {a}টা পদক্ষেপ সম্পূৰ্ণ",
 s:[["কাৰ্ডৰ পিছফালে ছপা আনুষ্ঠানিক নম্বৰত বেংকক ফোন কৰি কাৰ্ড আৰু নেট বেংকিং ব্লক কৰাওক।","আৰু কোনো ক'ড নিদিব। বেংকৰ আনুষ্ঠানিক এপৰ পৰা নেট বেংকিং পাছৱৰ্ড আৰু UPI PIN সলনি কৰক।","শেহতীয়া লেনদেন চাওক। পইচা ওলাই গৈ থাকিলে লগে লগে ১৯৩০ত ফোন কৰক।"],
    ["লগে লগে ১৯৩০ত ফোন কৰক। যিমান সোনকালে জনাব, পইচা ৰখাৰ সম্ভাৱনা সিমানেই বেছি।","বেংকক ফোন কৰি লেনদেনটো জনাওক। UPI ৰেফাৰেন্স বা ট্ৰেঞ্জেকচন ID হাতত ৰাখক।","স্ক্ৰীনশ্বটৰ সৈতে cybercrime.gov.in ত অভিযোগ দিয়ক (তলৰ খচৰা ব্যৱহাৰ কৰক)। কাকো 'ৰিকভাৰী ফী' নিদিব।"],
    ["ফ্লাইট মোড অন কৰক বা ইণ্টাৰনেট বন্ধ কৰক, তাৰ পিছত AnyDesk, TeamViewer বা অচিনাকি এপ আঁতৰাওক।","আন এটা ফোনৰ পৰা বেংকক ফোন কৰি কাৰ্ড আৰু UPI বন্ধ কৰাওক। পাছৱৰ্ড কেৱল পৰিষ্কাৰ ডিভাইচৰ পৰা সলনি কৰক।","১৯৩০ত ফোন কৰক। এপ আঁতৰাব নোৱাৰিলে ফটো বেকআপ কৰি ফোন ফেক্টৰী ৰিছেট কৰক।"],
    ["সেই একাউণ্টৰ পাছৱৰ্ড সলনি কৰক, আৰু একে পাছৱৰ্ড থকা অন্য একাউণ্টৰো।","সকলো ডিভাইচৰ পৰা লগ আউট কৰক আৰু টু-ষ্টেপ ভেৰিফিকেচন অন কৰক।","বেংক আৰু UPIত অচিনাকি কাম আছে নেকি চাওক। থাকিলে বেংক আৰু ১৯৩০ত ফোন কৰক।"]],
 cmpH:"অভিযোগৰ খচৰা",cmpP:"যি জানে পূৰণ কৰক। খচৰাটো cybercrime.gov.in ত পেষ্ট কৰিবলৈ বা বেংকক দিবলৈ সাজু (খচৰা ইংৰাজীত হয়)।",
 fAmt:"হেৰুৱা ধন (₹)",fWhen:"তাৰিখ আৰু সময়",fRef:"ট্ৰেঞ্জেকচন / UPI ৰেফাৰেন্স",fWho:"প্ৰতাৰকৰ ফোন, UPI ID বা লিংক",fBank:"আপোনাৰ বেংক",
 copy:"খচৰা কপি কৰক",copied:"কপি হ'ল",portal:"cybercrime.gov.in খোলক",
 stH:"আপোনাৰ ডিভাইচৰ পৰিসংখ্যা",stP:"কেৱল এই ব্ৰাউজাৰতহে থাকে। ক'তো পঠিওৱা নহয়।",stA:"পৰীক্ষা কৰা বাৰ্তা",stB:"স্কেম বা সন্দেহজনক পোৱা গ'ল",stC:"পৰীক্ষা কৰা লিংক",stD:"UPI / ফোন পৰীক্ষা",stR:"পৰিসংখ্যা ৰিছেট কৰক",
 fam:"পৰিয়ালক WhatsAppত সতৰ্ক কৰক",sosBtn:"মই প্ৰতাৰিত হৈছোঁ",mic:"কওক",
 famMsg:"⚠️ সচেত সতৰ্কবাণী: মই এতিয়াই এটা বাৰ্তা পৰীক্ষা কৰিলোঁ{t}। ই স্কেম যেন লাগে। কোনো লিংকত ক্লিক নকৰিব, OTP বা PIN নকব, পইচা নিদিব। কৰি পেলালে এতিয়াই ১৯৩০ত ফোন কৰক।"}
};
const lang=()=>{try{return(typeof LANG!=="undefined"&&P[LANG])?LANG:"en"}catch(e){return"en"}};
const L=k=>{const v=P[lang()][k];return v!=null?v:P.en[k]};
const fmt=(s,p)=>s.replace(/\{(\w+)\}/g,(m,k)=>p[k]!=null?p[k]:m);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const q=s=>document.querySelector(s);
const sto={get(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const bump=k=>{const s=sto.get("sachet-plus-stats",{});s[k]=(s[k]||0)+1;sto.set("sachet-plus-stats",s);paintStats()};

/* ================= UI ================= */
const SAMPLES_LINK=["http://sbi-kyc-update.xyz/login","hdfcbank-secure.in/verify","www.paytrn.com/refund","https://www.onlinesbi.sbi"];
const SAMPLES_UPI=["sbi.support@ybl","+92 300 1234567","rahul.k@oksbi"];
let tab="sos",sosC=null,sosT0=0,sosDone={},lastLink=null,lastUpi=null,timerId=null;

function build(){
  const sec=document.createElement("section");sec.className="sec alt px";sec.id="plus";
  sec.innerHTML='<div class="in"><h2 class="sh" data-p="h"></h2><p class="sub" data-p="sub"></p>'+
   '<div class="px-tabs" role="tablist">'+["link","upi","sos","stat"].map(t=>'<button role="tab" data-tab="'+t+'" class="'+(t==="sos"?"sos":"")+'"></button>').join("")+'</div>'+
   '<div class="px-panel card" data-panel="link"><h3 data-p="linkH"></h3><p class="px-p" data-p="linkP"></p>'+
     '<div class="px-in"><input id="px-link" autocomplete="off" spellcheck="false" aria-label="Link"><button class="btn primary" id="px-linkgo" data-p="check"></button></div>'+
     '<div class="px-try"><span data-p="try"></span>'+SAMPLES_LINK.map((s,i)=>'<button class="chip-btn" data-sl="'+i+'">'+esc(s.replace(/^https?:\/\//,"").slice(0,26))+'</button>').join("")+'</div><div id="px-linkres"></div></div>'+
   '<div class="px-panel card" data-panel="upi"><h3 data-p="upiH"></h3><p class="px-p" data-p="upiP"></p>'+
     '<div class="px-in"><input id="px-upi" autocomplete="off" spellcheck="false" aria-label="UPI ID or phone"><button class="btn primary" id="px-upigo" data-p="check"></button></div>'+
     '<div class="px-try"><span data-p="try"></span>'+SAMPLES_UPI.map((s,i)=>'<button class="chip-btn" data-su="'+i+'">'+esc(s)+'</button>').join("")+'</div><div id="px-upires"></div></div>'+
   '<div class="px-panel card" data-panel="sos"><h3 data-p="sosH"></h3><p class="px-p" data-p="sosP"></p><div class="px-choice" id="px-choice"></div><div id="px-plan"></div>'+
     '<div class="px-cmp"><h3 data-p="cmpH"></h3><p class="px-p" data-p="cmpP"></p>'+
     '<div class="px-form"><label><span data-p="fAmt"></span><input id="cm-amt" inputmode="numeric"></label><label><span data-p="fWhen"></span><input id="cm-when" type="datetime-local"></label><label><span data-p="fRef"></span><input id="cm-ref"></label><label><span data-p="fWho"></span><input id="cm-who"></label><label><span data-p="fBank"></span><input id="cm-bank"></label></div>'+
     '<pre class="px-draft" id="cm-out"></pre><div class="px-acts"><button class="btn primary" id="cm-copy" data-p="copy"></button><a class="btn" href="https://cybercrime.gov.in" target="_blank" rel="noopener" data-p="portal"></a></div></div></div>'+
   '<div class="px-panel card" data-panel="stat"><h3 data-p="stH"></h3><p class="px-p" data-p="stP"></p><div class="px-stats" id="px-stats"></div><button class="btn quiet" id="px-reset" data-p="stR"></button></div>'+
   '</div>';
  const how=q("#how");if(how)how.before(sec);else(q("main")||document.body).appendChild(sec);
  const nav=q(".nav nav");if(nav){const a=document.createElement("a");a.href="#plus";a.dataset.p="nav";nav.appendChild(a)}
  const f=document.createElement("a");f.href="#plus";f.className="px-fab";f.id="px-fab";f.onclick=()=>{tab="sos";paint()};document.body.appendChild(f);
}

function paint(){
  document.querySelectorAll("[data-p]").forEach(el=>{el.textContent=L(el.dataset.p)});
  document.querySelectorAll("[data-tab]").forEach(b=>{const t=b.dataset.tab;b.textContent=L({link:"tLink",upi:"tUpi",sos:"tSos",stat:"tStat"}[t]);b.setAttribute("aria-selected",String(t===tab))});
  document.querySelectorAll("[data-panel]").forEach(p=>p.hidden=p.dataset.panel!==tab);
  q("#px-link").placeholder=L("linkPh");q("#px-upi").placeholder=L("upiPh");
  q("#px-fab").textContent=L("sosBtn");
  const mic=q("#px-mic");if(mic)mic.lastChild.textContent=" "+L("mic");
  const fam=q("#fam");if(fam)fam.textContent=L("fam");
  resLink();resUpi();paintSos();paintStats();draft();
}
function items(r){
  const R=L("r");
  return r.items.map(i=>'<li class="'+i.sev+'">'+esc(fmt(R[i.code]||i.code,i.p))+"</li>").join("");
}
function resBox(r,note,extra){
  const V={fake:"vfake",sus:"vsus",none:"vnone",official:"vofficial"}[r.level];
  const cls={fake:"hi",sus:"md",none:"lo",official:"ok"}[r.level];
  return '<div class="px-res '+cls+'"><div class="px-v"><b>'+esc(L(V))+'</b><span>'+r.score+'/100</span></div>'+(extra||"")+
    (r.items.length?"<ul>"+items(r)+"</ul>":"")+((r.level==="none"||(note==="noteUpi"&&r.level!=="official"))?'<p class="px-note">'+esc(L(note))+"</p>":"")+"</div>";
}
function resLink(){
  const el=q("#px-linkres");if(!lastLink){el.innerHTML="";return}
  if(lastLink==="bad"){el.innerHTML='<p class="px-note">'+esc(L("bad"))+"</p>";return}
  const r=lastLink;
  el.innerHTML=resBox(r,"noteLink",'<p class="px-own">'+esc(L("owner"))+" <b>"+esc(r.reg)+"</b></p>");
}
function resUpi(){
  const el=q("#px-upires");if(!lastUpi){el.innerHTML="";return}
  if(lastUpi==="bad"){el.innerHTML='<p class="px-note">'+esc(L("bad"))+"</p>";return}
  el.innerHTML=resBox(lastUpi,"noteUpi");
}
function paintSos(){
  const ch=q("#px-choice");
  ch.innerHTML=L("c").map((t,i)=>'<button class="px-c'+(sosC===i?" on":"")+'" data-c="'+i+'">'+esc(t)+"</button>").join("");
  const pl=q("#px-plan");
  if(sosC==null){pl.innerHTML="";return}
  const steps=L("s")[sosC],tm=["now","now","h1"];
  const n=steps.filter((_,i)=>sosDone[sosC+"-"+i]).length;
  pl.innerHTML='<div class="px-top"><a class="btn sosb" href="tel:1930">☎ '+esc(L("call"))+' <b>1930</b></a><span class="px-clock">'+esc(L("timer"))+' <b id="px-clk">00:00</b></span></div>'+
   '<div class="px-bar"><i style="width:'+Math.round(n/steps.length*100)+'%"></i></div><p class="px-prog">'+esc(fmt(L("prog"),{a:n,b:steps.length}))+"</p><ol class=\"px-steps\">"+
   steps.map((s,i)=>'<li><label><input type="checkbox" data-st="'+sosC+"-"+i+'"'+(sosDone[sosC+"-"+i]?" checked":"")+'><span><em class="'+tm[i]+'">'+esc(L(tm[i]))+"</em> "+esc(s)+"</span></label></li>").join("")+"</ol>";
  clock();
}
function clock(){
  const c=q("#px-clk");if(!c)return;
  const s=Math.floor((Date.now()-sosT0)/1000);c.textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
}
function draft(){
  const out=q("#cm-out");if(!out)return;
  const v=id=>(q(id).value||"").trim()||"____";
  const what=sosC!=null?P.en.what[sosC]:"I was targeted by an online fraud.";
  const w=q("#cm-when").value?q("#cm-when").value.replace("T"," "):"____";
  out.textContent="To,\nThe Officer In-charge, Cyber Crime Cell / National Cyber Crime Reporting Portal\n\nSubject: Complaint regarding online financial fraud\n\nSir/Madam,\n\nI wish to report an online fraud. On "+w+", "+what+"\n\nDetails:\n- Amount lost: Rs. "+v("#cm-amt")+"\n- Transaction / UPI reference: "+v("#cm-ref")+"\n- Fraudster's phone number / UPI ID / link: "+v("#cm-who")+"\n- My bank: "+v("#cm-bank")+"\n\nI have kept screenshots and call records and can share them. I request you to trace the fraudster and take steps to freeze the amount.\n\nName: ________   Mobile: ________   Date: ________";
}
function paintStats(){
  const el=q("#px-stats");if(!el)return;const s=sto.get("sachet-plus-stats",{});
  el.innerHTML=[["stA",s.checked],["stB",s.scams],["stC",s.links],["stD",s.upi]].map(([k,v])=>"<div><b>"+(v||0)+"</b><span>"+esc(L(k))+"</span></div>").join("");
}

function wire(){
  q("#px-linkgo").onclick=()=>{const r=checkLink(q("#px-link").value);lastLink=r||"bad";if(r)bump("links");resLink()};
  q("#px-link").onkeydown=e=>{if(e.key==="Enter")q("#px-linkgo").click()};
  q("#px-upigo").onclick=()=>{const r=checkUpi(q("#px-upi").value);lastUpi=r||"bad";if(r)bump("upi");resUpi()};
  q("#px-upi").onkeydown=e=>{if(e.key==="Enter")q("#px-upigo").click()};
  document.querySelectorAll("[data-sl]").forEach(b=>b.onclick=()=>{q("#px-link").value=SAMPLES_LINK[b.dataset.sl];q("#px-linkgo").click()});
  document.querySelectorAll("[data-su]").forEach(b=>b.onclick=()=>{q("#px-upi").value=SAMPLES_UPI[b.dataset.su];q("#px-upigo").click()});
  document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{tab=b.dataset.tab;paint()});
  q("#px-choice").onclick=e=>{const b=e.target.closest("[data-c]");if(!b)return;sosC=+b.dataset.c;sosT0=Date.now();sosDone={};paintSos();draft()};
  q("#px-plan").onchange=e=>{const c=e.target.closest("[data-st]");if(!c)return;sosDone[c.dataset.st]=c.checked;paintSos()};
  document.querySelectorAll("#cm-amt,#cm-when,#cm-ref,#cm-who,#cm-bank").forEach(i=>i.oninput=draft);
  q("#cm-copy").onclick=async e=>{try{await navigator.clipboard.writeText(q("#cm-out").textContent);e.target.textContent=L("copied");setTimeout(()=>e.target.textContent=L("copy"),1600)}catch(x){}};
  q("#px-reset").onclick=()=>{sto.set("sachet-plus-stats",{});paintStats()};
  timerId=setInterval(clock,1000);
  document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>setTimeout(paint,60)));
  if(location.hash==="#plus")q("#plus").scrollIntoView();
}

/* Family warn button inside the existing result card */
function famBtn(){
  let c=null;try{c=cur}catch(e){}
  const acts=q("#res .acts");if(!c||!acts||q("#fam")||c.a.score<25)return;
  const b=document.createElement("button");b.className="btn";b.id="fam";b.textContent=L("fam");
  b.onclick=()=>{
    let t="";try{const k="t_"+c.a.type;t=c.a.type&&I18N.en[k]?" ("+I18N[lang()][k]+")":""}catch(e){}
    const link=/^https?:/.test(location.protocol)?"\n\n"+location.origin:"";
    const l=lang(),order=[l].concat(["en","hi","as"].filter(x=>x!==l));
    const msg=order.map(x=>P[x].famMsg.replace("{t}",x===l?t:"")).join("\n\n")+link;
    window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank","noopener");
  };
  acts.appendChild(b);
}
function watch(){const r=q("#res");if(!r)return;new MutationObserver(famBtn).observe(r,{childList:true,subtree:true});famBtn()}

/* Count every scan using the existing saveScan hook (wrapped, not edited) */
function hookStats(){
  try{
    if(typeof saveScan==="function"){const o=saveScan;window.saveScan=function(t,s,c){try{bump("checked");if(c==="hi"||c==="md")bump("scams")}catch(e){}return o.apply(this,arguments)}}
  }catch(e){}
}

/* Voice input (browser speech recognition, if available) */
function voice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition,row=q("#tray .row");if(!SR||!row)return;
  const b=document.createElement("button");b.className="btn quiet";b.id="px-mic";
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg> ';
  b.appendChild(document.createTextNode(" "+L("mic")));
  let rec=null,on=false;
  b.onclick=()=>{
    if(on&&rec){rec.stop();return}
    rec=new SR();rec.lang={en:"en-IN",hi:"hi-IN",as:"as-IN"}[lang()];rec.interimResults=false;
    rec.onresult=e=>{const t=q("#t");t.value=(t.value+" "+e.results[0][0].transcript).trim()};
    rec.onend=()=>{on=false;b.classList.remove("rec")};rec.onerror=()=>{on=false;b.classList.remove("rec")};
    try{rec.start();on=true;b.classList.add("rec")}catch(x){}
  };
  row.appendChild(b);
}

build();wire();hookStats();watch();voice();paint();
})();
