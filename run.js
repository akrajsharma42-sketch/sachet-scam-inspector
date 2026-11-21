// Run with: node tests/run.js
const {analyze,classify}=require("../engine.js");
const S=require("./samples.json");
let ok=0,fp=0,fn=0;const rows=[];
for(const s of S){
  const a=analyze(s.text,s.sender),flag=a.score>=25,pass=(s.expect==="scam")===flag;
  if(pass)ok++;else if(flag)fp++;else fn++;
  rows.push({known:!!s.known,pass,note:s.note,expect:s.expect,score:a.score,type:a.type,lang:a.lang});
}
for(const r of rows)console.log((r.pass?"PASS ":(r.known?"KNOWN":"FAIL "))+r.note.padEnd(18)+" expect="+r.expect.padEnd(8)+" score="+String(r.score).padStart(3)+" type="+(r.type||"-")+" lang="+r.lang);
const sc=S.filter(s=>s.expect==="scam").length,gn=S.length-sc;
console.log(`\nAccuracy: ${ok}/${S.length} (${Math.round(ok/S.length*100)}%)  | scams caught: ${sc-fn}/${sc}  | genuine kept clear: ${gn-fp}/${gn}`);
const bad=rows.filter(r=>!r.pass&&!r.known).length;console.log("Known limitations (documented): "+rows.filter(r=>!r.pass&&r.known).length);process.exitCode=bad?1:0;
