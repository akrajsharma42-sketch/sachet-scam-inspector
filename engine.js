const R=[
{l:"Asks for your OTP, PIN or password",w:45,y:"No bank or company needs you to send an OTP. Anyone who asks is trying to log in as you.",re:/\b(?:share|send|tell|give|forward|provide|enter|reply)\b[^.\n]{0,30}\b(?:otp|pin|cvv|password|passcode)\b/gi,g:(t,m)=>!/(?:not|never|n't|’t)\s*$/i.test(t.slice(Math.max(0,m.index-25),m.index))},
{l:"Creates false urgency",w:18,y:"Scammers rush you so you act before you think.",re:/\b(?:urgent(?:ly)?|immediately|right now|within \d+ ?(?:hours?|hrs?|mins?|minutes?)|expires? (?:today|soon|tonight)|last (?:chance|warning)|act now|final notice|today only)\b/gi},
{l:"Threatens to block or suspend something",w:22,y:"Fear of losing your account, SIM or service is the most common hook.",re:/\b(?:(?:account|card|sim|number|service|connection)\b[^.\n]{0,25}\b(?:block(?:ed)?|suspend(?:ed)?|deactivat(?:ed|e)|disconnect(?:ed)?|freez(?:e|ing))|will be (?:blocked|suspended|closed|disconnected))/gi},
{l:"Mentions KYC or PAN/Aadhaar update",w:25,y:"Banks do not ask for KYC updates through SMS links.",re:/\b(?:kyc|re-?kyc|pan (?:card )?(?:update|verification|link)|update (?:your )?(?:pan|aadhaar|bank))\b/gi},
{l:"Prize, lottery or reward claim",w:25,y:"If you never entered a draw, you did not win. Prize messages lead to fee or data theft.",re:/\b(?:you(?:’|')?ve won|you have won|lottery|lucky draw|congratulations|cash ?prize|claim (?:your )?(?:prize|reward|gift)|reward points?|free gift)\b/gi},
{l:"Delivery or customs fee request",w:25,y:"Fake courier messages collect card or UPI details on a copy of a payment page.",re:/\b(?:parcel|package|courier|shipment)\b[^.\n]{0,60}\b(?:held|pending|failed|undelivered|customs|fee|incomplete address|redeliver\w*)\b|\b(?:redelivery|customs|delivery) (?:fee|charge)s?\b/gi},
{l:"Claims to be police or a government body",w:22,y:"Agencies do not threaten arrest or demand money by message or call.",re:/\b(?:income tax refund|tax refund|rbi|trai|cbi|police|cyber ?crime|court|arrest|warrant|digital arrest|narcotics|electricity (?:bill|connection)[^.\n]{0,40}(?:disconnect\w*|cut))\b/gi},
{l:"Asks you to pay a fee or scan a QR code",w:28,y:"Real prizes, refunds and jobs never need payment first. A QR scan or UPI request only sends money out.",re:/\b(?:processing fee|registration fee|security deposit|upi (?:collect|request|pin)|scan (?:the )?qr(?: code)?)|\b(?:pay|send|transfer)\s*(?:₹|rs\.?|inr)?\s*\d[\d,]*/gi},
{l:"Typical fake job offer wording",w:28,y:"Task-based and per-day earning offers are a leading fraud type.",re:/\b(?:work from home|part[- ]time job|earn\s*(?:₹|rs\.?)?\s*\d[\d,]*\s*(?:per|\/|a) ?day|daily (?:income|earning)|like (?:and|&) subscribe|telegram (?:group|channel))/gi},
{l:"Asks you to install an app or remote-access tool",w:35,y:"Apps from message links can read your SMS and OTPs; remote tools let a stranger control your phone.",re:/\b(?:anydesk|teamviewer|quick ?support|rustdesk|install (?:the |this )?(?:app|apk)|download (?:the |this )?(?:app|apk))\b|\.apk\b/gi},
{l:"Tells you to keep it secret",w:20,y:"Isolation stops you from checking with family or your bank.",re:/\b(?:do not (?:tell|inform)|keep (?:this )?(?:confidential|secret)|don(?:’|')t tell)\b/gi},
{l:"Pushes you to click a link",w:12,y:"Genuine alerts rarely depend on a link you must tap straight away.",re:/\b(?:click (?:here|the link|below)|tap (?:here|the link)|verify (?:now|your)|login (?:now|here)|update (?:now|here))\b/gi},
{l:"Unrequested loan or credit offer",w:30,y:"“Approved” or “disbursal” messages out of nowhere are a common lure. Genuine lenders only message after you apply, and name themselves.",re:/\b(?:(?:credit|loan) (?:application|limit|offer)|pre-?approved|disbursal|disbursement|instant (?:loan|credit|cash)|loan (?:approved|sanctioned)|limit (?:approved|increase))\b/gi},
{l:"Vague “tap to continue” instruction",w:20,y:"Real alerts name the company and the exact app or site. A bare “tap to continue” hides where it leads, and the link is often removed from copied text.",re:/\b(?:tap|click|press) (?:to|on) (?:continue|proceed|apply|claim|verify|view|open)\b|\bcontinue ahead\b|\bfinal (?:stage|step)\b/gi},
{l:"Generic greeting",w:8,y:"Real companies usually address you by name.",re:/\b(?:dear|hello|hi) (?:customer|user|sir|madam|valued|account holder|applicant)\b/gi}];
const SHORT=["bit.ly","tinyurl.com","t.co","cutt.ly","rb.gy","is.gd","shorturl.at","goo.gl","t.ly","rebrand.ly"];
const TLD=/\.(?:xyz|top|click|info|live|icu|cfd|sbs|vip|online|site|shop|help|support|link|buzz|work|monster)$/;
const BR=[["sbi",["sbi.co.in","onlinesbi.sbi","sbi.bank.in"]],["hdfc",["hdfcbank.com"]],["icici",["icicibank.com"]],["axis",["axisbank.com"]],["paytm",["paytm.com"]],["phonepe",["phonepe.com"]],["amazon",["amazon.in","amazon.com"]],["flipkart",["flipkart.com"]],["indiapost",["indiapost.gov.in"]],["irctc",["irctc.co.in"]],["incometax",["incometax.gov.in"]],["aadhaar",["uidai.gov.in"]],["fedex",["fedex.com"]],["bluedart",["bluedart.com"]],["airtel",["airtel.in"]]];
const URLRE=/\b(?:https?:\/\/|www\.)[^\s<>"']+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|in|net|org|xyz|top|click|info|live|icu|cfd|sbs|co|me|ly|gl|link|app|apk|online|site|shop|vip|help|support)\b(?:\/[^\s]*)?/gi;
const hostOf=u=>u.replace(/^[a-z]+:\/\//i,"").split(/[\/?#]/)[0].replace(/^.*@/,"").replace(/:\d+$/,"").toLowerCase();
function checkUrl(raw){
  const out=[],host=hostOf(raw),tok=host.split(/[.\-]/);
  if(SHORT.includes(host))out.push([20,"is a shortened link, so you cannot see where it leads"]);
  if(/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host))out.push([30,"uses a raw IP address instead of a name"]);
  if(/^[a-z]+:\/\/[^\/]*@/i.test(raw))out.push([30,"hides the real address behind an @ sign"]);
  if(TLD.test(host))out.push([20,"ends in a cheap domain type often used for scams"]);
  if(host.includes("xn--"))out.push([25,"uses look-alike characters (punycode)"]);
  if((host.match(/-/g)||[]).length>=2)out.push([10,"has many hyphens, typical of fake domains"]);
  if(/^http:\/\//i.test(raw))out.push([8,"does not use secure https"]);
  if(/\.apk(?:$|\?)/i.test(raw))out.push([40,"downloads an app file (.apk)"]);
  for(const [b,offs] of BR)if(tok.some(t=>t===b||(b.length>4&&t.includes(b)))&&!offs.some(o=>host===o||host.endsWith("."+o))){out.push([40,"copies the name “"+b+"” but is not its official site"]);break}
  if(tok.includes("gov")&&!/\.(?:gov|nic)\.in$/.test(host))out.push([30,"pretends to be a government site"]);
  return {host,out};
}
function anat(raw){
  const host=hostOf(raw),L=host.split("."),n=L.length>=3&&/^(?:co|com|gov|nic|ac|org|net)$/.test(L[L.length-2])&&L[L.length-1].length==2?3:2;
  const reg=L.slice(-n).join("."),at=raw.toLowerCase().indexOf(host);
  return {reg,pre:at<0?"":raw.slice(0,at)+host.slice(0,host.length-reg.length),post:at<0?"":raw.slice(at+host.length)};
}
function analyze(t,sn){
  const F=[],M=[],U=[];let score=0,m;
  for(const [ri,r] of R.entries()){
    r.re.lastIndex=0;const h=[];
    while((m=r.re.exec(t))){if(r.g&&!r.g(t,m))continue;h.push([m.index,m.index+m[0].length])}
    if(h.length){const k=r.w>=25?"hi":"md",i=F.push({sev:k,h:r.l,d:r.y,w:r.w,rk:ri})-1;score+=r.w;h.forEach(x=>M.push([x[0],x[1],k,i]))}
  }
  URLRE.lastIndex=0;
  while((m=URLRE.exec(t))){
    const raw=m[0].replace(/[.,;:!?)]+$/,""),c=checkUrl(raw),w=Math.min(50,c.out.reduce((a,b)=>a+b[0],0));let i=-1;
    if(w){i=F.push({sev:w>=30?"hi":"md",h:"Suspicious link: "+c.host,d:"This link "+c.out.map(x=>x[1]).join("; ")+".",w})-1;score+=w;M.push([m.index,m.index+raw.length,"hi",i])}
    U.push({...anat(raw),bad:!!w,i});
  }
  let note="";
  if(sn){const x=sn.trim();
    if(/^[A-Z]{2}-[A-Z0-9]{3,8}(?:-[A-Z])?$/i.test(x))note="Sender “"+x+"” looks like a registered business header. That is a good sign, but not proof.";
    else if(/^\+?\d[\d\s-]{8,}$/.test(x)){const b=/\b(?:sbi|hdfc|icici|axis|paytm|bank|kyc|otp|account|aadhaar|pan|income tax|rbi|credit|loan)\b/i.test(t),w=b?30:10;score+=w;F.push({sev:b?"hi":"md",h:"Sent from a personal mobile number",d:b?"Banks and government bodies send alerts from registered headers like VM-SBIINB, not from a 10-digit mobile number.":"Unknown mobile numbers are how most scam chats start.",w})}}
  const L=t.replace(/[^A-Za-z]/g,"");
  if(L.length>30&&L.replace(/[^A-Z]/g,"").length/L.length>.5){score+=8;F.push({sev:"md",h:"Mostly capital letters",d:"Shouting text is a pressure tactic.",w:8})}
  if((t.match(/!/g)||[]).length>=3){score+=5;F.push({sev:"md",h:"Many exclamation marks",d:"Official messages are usually calm and plain.",w:5})}
  if(F.length>=3&&U.some(u=>u.bad))score+=10;
  return {score:Math.min(100,score),F,M,U,note,type:classify(F,U),lang:detectLang(t)};
}
function playbook(a){const has=r=>a.F.some(f=>r.test(f.h));
  if(has(/OTP/))return["They try to log in to your account","Your bank sends you a real OTP","You read it out, and that OTP approves their transaction"];
  if(has(/install|remote/i))return["You install the app or remote tool","It reads your SMS or shares your screen","They approve payments from your phone"];
  if(has(/loan/i))return["You tap and enter Aadhaar, PAN and bank details","They ask for a “processing fee” before the loan is paid out","Your fee is lost and your identity details are misused"];
  if(has(/fee|prize|delivery|job|QR/i))return["You pay a “small” fee","They ask for more: tax, insurance, release charges","The prize, parcel or job never arrives"];
  return["You tap the link and land on a fake page that looks real","It asks for your login, card details or OTP","The scammer uses them within minutes to move your money"]}

/* ---------- Hinglish and Hindi (Devanagari) wording, merged into the same rule groups ---------- */
const NEG=/(?:\b(?:mat|na|nahi|nahin|kabhi)\b|मत|नहीं|(?:^|\s)न\s)/i;
const HX=[
[0,String.raw`\b(?:otp|pin|cvv|password)\b[^.\n]{0,30}\b(?:bhej\w*|bata\w*|share\s+kar\w*|de\s+do|dijiye|dena)\b|\b(?:bhej\w*|bata\w*|share\s+kar\w*)\b[^.\n]{0,25}\b(?:otp|pin|cvv|password)\b|(?:ओटीपी|OTP|पिन|पासवर्ड)[^\n.।]{0,25}(?:भेज|बता|शेयर|दें)`],
[1,String.raw`\b(?:turant|foran|jaldi\s+se|aaj\s+hi|aaj\s+raat|abhi\s+(?:karein|kare|karo|update|verify|click)|\d+\s*ghant[ea]\s*(?:me|mein|ke\s+andar))\b|तुरंत|अभी\s*(?:करें|अपडेट)|आज\s*ही|आज\s*रात|\d+\s*घंटे`],
[2,String.raw`\b(?:khata|account|card|sim|number)\b[^.\n]{0,25}\b(?:band|block|suspend|freeze)\b[^.\n]{0,12}\b(?:ho\s*(?:jayega|jayegi|jaega|jaegi|sakta)|kar\s*diya)\b|\b(?:band|block|suspend)\s+ho\s+(?:jayega|jayegi|jaega|jaegi)\b|(?:खाता|अकाउंट|कार्ड|सिम)[^\n.।]{0,20}(?:बंद|ब्लॉक|सस्पेंड)`],
[3,String.raw`\b(?:pan|aadhaar|aadhar)\b[^.\n]{0,20}\b(?:update|link|verify)\b|केवाईसी|केवायसी|(?:पैन|आधार)[^\n.।]{0,15}(?:अपडेट|लिंक)`],
[4,String.raw`\b(?:badhai\s+ho|inaam|puraskar|lucky\s+winner)\b|\baapne\b[^.\n]{0,30}\bjeet\w*|\bjeeta\s+hai\b|बधाई\s*हो|लॉटरी|इनाम|पुरस्कार|जीत[ाी]\s*है`],
[5,String.raw`\b(?:parcel|courier|package)\b[^.\n]{0,40}\b(?:ruka|atka|pending|fail)\b|पार्सल[^\n.।]{0,30}(?:शुल्क|फीस|रुका|अटका)|\b(?:delivery|customs|redelivery)\s+(?:shulk|fees?)\b`],
[6,String.raw`\b(?:giraftar\w*|kanooni\s+(?:karwai|karyavahi)|case\s+darj)\b|गिरफ्तार|पुलिस|सीबीआई|साइबर\s*क्राइम`],
[7,String.raw`(?:\brs\.?|\binr|₹)\s?\d[\d,]*\s*(?:bhej\w*|jama\s+kar\w*|pay\s+kar\w*|bhar\w*)\b|\b(?:processing\s+fee|fees?|shulk)\b[^.\n]{0,20}\b(?:bhar\w*|jama\s+kar\w*|pay\s+kar\w*|bhej\w*)\b|(?:प्रोसेसिंग\s*फीस|रजिस्ट्रेशन\s*फीस|शुल्क)[^\n.।]{0,15}(?:जमा|भरें|भेजें)|(?:₹|रु\.?)\s?\d[\d,]*[^\n.।]{0,15}(?:जमा|भेजें)`],
[8,String.raw`\bghar\s+baithe\b[^.\n]{0,20}\bkamao\b|\broz(?:ana)?\b[^.\n]{0,15}\bkamao\b|घर\s*बैठे[^\n.।]{0,15}कमा|रोज़?\s*कमाएं`],
[9,String.raw`ऐप\s*(?:इंस्टॉल|डाउनलोड)|\b(?:app|apk)\s+(?:install|download)\s+kar\w*`],
[10,String.raw`\bkisi\s+ko\s+(?:mat|na)\s+bata\w*|\bgopniya\b|किसी\s*को\s*(?:न|मत)\s*बता\w*|गोपनीय`],
[11,String.raw`\b(?:link\s+(?:par|pe)\s+click|click\s+kar(?:ein|e|o)|neeche\s+diye\s+(?:gaye\s+)?link)\b|लिंक\s*पर\s*क्लिक`],
[12,String.raw`\b(?:loan|credit\s+limit)\s+(?:pass|approve\w*|manzoor|sanction\w*)\b|\bloan\s+offer\b|लोन\s*(?:पास|मंजूर|स्वीकृत)`],
[13,String.raw`\bcontinue\s+kar(?:ein|e)\b|आगे\s*बढ़ने\s*के\s*लिए\s*टैप`],
[14,String.raw`\b(?:priya|pyare|dear)\s+(?:grahak|upbhokta|khatadhark\w*)\b|प्रिय\s*(?:ग्राहक|उपभोक्ता)`]];
HX.forEach(([i,s])=>{R[i].re=new RegExp(R[i].re.source+"|"+s,"gi")});
{const og=R[0].g;R[0].g=(t,m)=>og(t,m)&&!NEG.test(t.slice(m.index,m.index+m[0].length+20))}
R[10].g=(t,m)=>!/otp|ओटीपी|pin|पिन|cvv|password/i.test(t.slice(Math.max(0,m.index-40),m.index));

/* ---------- Scam type and language ---------- */
function classify(F,U){
  const has=i=>F.some(f=>f.rk===i);
  for(const [i,k] of [[12,"loan"],[5,"del"],[4,"prize"],[8,"job"],[9,"app"],[3,"kyc"],[6,"imp"],[2,"kyc"],[0,"otp"]])if(has(i))return k;
  return U.some(u=>u.bad)?"phish":null;
}
function detectLang(t){
  const n=t.replace(/\s/g,"").length||1;
  if((t.match(/[ऀ-ॿ]/g)||[]).length/n>.25)return "hi";
  if((t.match(/[ঀ-৿]/g)||[]).length/n>.25)return "as";
  const h=(t.match(/\b(?:aapka|aapke|aapne|apna|hai|hain|karein|kare|karo|kijiye|kripya|turant|jaldi|nahi|band|jayega|jayegi|bhejo|batao|khata|rupaye|grahak|abhi|aaj)\b/gi)||[]).length;
  return h>=2?"hinglish":"en";
}
if(typeof module!=="undefined")module.exports={analyze,classify,detectLang,R};
