
const CONFIG = {
  ACCESS_MODE: "link-key", // "off" or "link-key"
  ACCESS_KEY: "aFAiHnGF4F9UBMMJdH-V8wmRwue72CgkIrZHFhCF8JQ"
};

const defaultState = {
  completed:[],
  history:[],
  memories:[],
  relationships:{},
  current:null,
  goals:[],
  step:"intro",
  signals:{trust:58,warmth:56,respect:62,face:70,openness:61},
  learner:"Matthias",
  mode:"china",
  filter:0
};

let state = loadState();
function loadState(){
  try{
    const s=JSON.parse(localStorage.getItem("sociallab.v2")||"null");
    return Object.assign(structuredClone(defaultState),s||{});
  }catch(e){return structuredClone(defaultState)}
}
function saveState(){
  localStorage.setItem("sociallab.v2",JSON.stringify(state));
  updateHeader();
}
function toast(msg){
  const t=document.getElementById("toast");t.textContent=msg;t.classList.remove("hidden");
  setTimeout(()=>t.classList.add("hidden"),1800)
}
function updateHeader(){
  document.getElementById("progressChip").textContent=`${state.completed.length} / ${SCENARIOS.length}`;
}
function gateInit(){
  if(CONFIG.ACCESS_MODE!=="link-key")return;
  const key=new URLSearchParams(location.search).get("key");
  const ok=sessionStorage.getItem("sociallab.gate")==="ok" || key===CONFIG.ACCESS_KEY;
  if(ok){sessionStorage.setItem("sociallab.gate","ok");return}
  document.getElementById("gate").classList.remove("hidden");
}
function unlockGate(){
  const k=document.getElementById("gateKey").value.trim();
  if(k===CONFIG.ACCESS_KEY){
    sessionStorage.setItem("sociallab.gate","ok");
    document.getElementById("gate").classList.add("hidden");
  }else document.getElementById("gateError").classList.remove("hidden")
}
function navigate(view){
  const ids={home:"homeView",scenario:"scenarioView",network:"networkView",patterns:"patternsView"};
  Object.values(ids).forEach(id=>document.getElementById(id).classList.add("hidden"));
  document.getElementById(ids[view]).classList.remove("hidden");
  document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.nav===view));
  if(view==="home")renderHome();
  if(view==="network")renderNetwork();
  if(view==="patterns")renderPatterns();
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderFilters(){
  const el=document.getElementById("levelFilter");
  el.innerHTML=[0,1,2,3,4,5].map(n=>`<button class="${state.filter===n?"active":""}" onclick="setFilter(${n})">${n===0?"All":`Level ${n}`}</button>`).join("");
}
function setFilter(n){state.filter=n;saveState();renderHome()}
function renderHome(){
  renderFilters();
  const grid=document.getElementById("scenarioGrid");grid.innerHTML="";
  SCENARIOS.forEach((s,i)=>{
    if(state.filter && s.level!==state.filter)return;
    const done=state.completed.includes(i);
    const div=document.createElement("article");div.className=`scenario-card ${done?"completed":""}`;
    div.innerHTML=`<div><div class="scenario-meta">LEVEL ${s.level} · ${i+1} OF ${SCENARIOS.length}</div>
    <h3>${s.title}</h3><p>${s.skill}</p></div>
    <div class="scenario-bottom"><div class="difficulty">${[1,2,3,4,5].map(x=>`<span class="${x<=s.level?"on":""}"></span>`).join("")}</div>
    <button class="play-link" onclick="openScenario(${i})">${done?"Replay":"Enter"} →</button></div>`;
    grid.appendChild(div)
  })
}
function startRecommended(){
  const idx=SCENARIOS.findIndex((_,i)=>!state.completed.includes(i));
  openScenario(idx===-1?0:idx)
}
function getRelationship(pid){
  if(!state.relationships[pid]){
    const p=PERSONAS[pid];
    state.relationships[pid]=structuredClone(p.base);
  }
  return state.relationships[pid];
}
function openScenario(i){
  state.current=i;state.goals=[...SCENARIOS[i].goals];state.step="intro";
  const rels=SCENARIOS[i].people.map(getRelationship);
  const avg=(k)=>Math.round(rels.reduce((a,r)=>a+(r[k]||50),0)/rels.length);
  state.signals={trust:avg("trust"),warmth:avg("warmth"),respect:avg("respect"),face:70,openness:avg("openness")};
  saveState();renderScenario();navigate("scenario")
}
function renderScenario(){
  const s=SCENARIOS[state.current];
  document.getElementById("scenarioNumber").textContent=`LEVEL ${s.level} · SCENARIO ${state.current+1}`;
  document.getElementById("scenarioSkill").textContent=s.skill;
  document.getElementById("peopleList").innerHTML=s.people.map(pid=>{
    const p=PERSONAS[pid],r=getRelationship(pid);
    return `<div class="person-row"><b>${p.name}</b><small>${p.role}</small><small>Current trust ${r.trust}</small></div>`
  }).join("");
  renderSignals();
  renderStage();
}
function renderSignals(){
 const labels={trust:"Trust",warmth:"Warmth",respect:"Competence / respect",face:"Face preserved",openness:"Future openness"};
 document.getElementById("signalMeters").innerHTML=Object.entries(state.signals).map(([k,v])=>`
 <div class="meter"><div class="meter-head"><span>${labels[k]}</span><span>${v}</span></div>
 <div class="meter-track"><div class="meter-fill" style="width:${v}%"></div></div></div>`).join("")
}
function speakerBlock(pid,text){
 const p=PERSONAS[pid];
 return `<div class="dialogue"><div class="avatar">${p.initial}</div><div><b>${p.name}</b><div class="dialogue-text">${text}</div></div></div>`
}
function renderStage(){
 const s=SCENARIOS[state.current], card=document.getElementById("stageCard");
 if(state.step==="intro"){
  card.innerHTML=`<p class="kicker">SITUATION</p><h1>${s.title}</h1><p class="context">${s.context}</p>
  ${speakerBlock(s.speaker,s.quote)}
  <div class="hero-actions"><button class="button primary" onclick="showGoals()">Set your objectives</button></div>`;
 }
 if(state.step==="goals"){
  card.innerHTML=`<p class="kicker">BEFORE YOU SPEAK</p><h1>What are you actually trying to achieve?</h1>
  <p class="context">Rank the objectives. Your later result is judged partly against your own priorities, not against a universal “correct answer.”</p>
  <div class="goal-list">${state.goals.map((g,i)=>`<div class="goal-item"><div class="goal-rank">${i+1}</div><div>${g}</div><div class="reorder"><button onclick="moveGoal(${i},-1)">↑</button><button onclick="moveGoal(${i},1)">↓</button></div></div>`).join("")}</div>
  <div class="hero-actions"><button class="button primary" onclick="showResponse()">Lock priorities</button></div>`
 }
 if(state.step==="response"){
  card.innerHTML=`<p class="kicker">YOUR MOVE</p><h1>What would you actually say or do?</h1>
  <p class="context">Write the real wording you would use — not the answer you think the simulator wants.</p>
  ${speakerBlock(s.speaker,s.quote)}
  <textarea id="response1" class="field" placeholder="Type your exact response…"></textarea>
  <div class="response-tools"><span>Free text · no multiple choice</span><span>Impact ≠ intent</span></div>
  <button class="button primary" onclick="analyzeFirst()">Run the interaction</button>`
 }
 if(state.step==="reaction")renderReaction(card);
 if(state.step==="follow")renderFollow(card);
 if(state.step==="final")renderFinal(card);
}
function showGoals(){state.step="goals";renderStage()}
function showResponse(){state.step="response";renderStage();setTimeout(()=>document.getElementById("response1")?.focus(),50)}
function moveGoal(i,d){
 const j=i+d;if(j<0||j>=state.goals.length)return;
 [state.goals[i],state.goals[j]]=[state.goals[j],state.goals[i]];renderStage()
}
function analyzeText(t){
 const x=t.toLowerCase().trim(), words=x.split(/\s+/).filter(Boolean);
 const has=(arr)=>arr.some(k=>x.includes(k));
 let q={warmth:0,direct:0,alternative:0,empathy:0,gratitude:0,ownership:0,face:0,boundary:0,question:0};
 if(has(["thank","thanks","appreciate","glad","kind","helpful"]))q.gratitude+=2;
 if(has(["understand","i can see","makes sense","i know","sorry","i get"]))q.empathy+=2;
 if(has(["maybe","perhaps","might","could we","would it","one option","what if"]))q.face+=1;
 if(has(["instead","another option","how about","i can","we can","next week","later"]))q.alternative+=2;
 if(has(["i suggest","my read","i think the best","i propose","here's what i can","my recommendation"]))q.ownership+=2;
 if(has(["can't","cannot","won't","not able","i need to","i'm not available"]))q.boundary+=2;
 if(has(["wrong","bad idea","doesn't make sense","no.","no,","i disagree","not possible"]))q.direct+=2;
 if(x.includes("?"))q.question+=1;
 if(words.length<9)q.direct+=1;
 if(words.length>24)q.warmth+=1;
 q.warmth+=q.gratitude+q.empathy+q.alternative;
 return {...q,words:words.length,text:t}
}
function clamp(n){return Math.max(5,Math.min(95,Math.round(n)))}
function impactFrom(a,level){
 let s={...state.signals};
 s.warmth+=a.warmth*3-a.direct*2;
 s.trust+=a.empathy*3+a.gratitude*2+a.alternative*2-a.direct;
 s.respect+=a.ownership*4+a.direct*1.5+a.boundary*1.2;
 s.face+=a.face*4+a.empathy*2+a.alternative*2-a.direct*4;
 s.openness+=a.alternative*3+a.question*2+a.empathy*2-a.direct*2;
 if(level>=3){s.respect+=a.ownership*2;s.face+=a.face*2}
 Object.keys(s).forEach(k=>s[k]=clamp(s[k]));
 return s
}
function classify(s){
 const relational=(s.trust+s.warmth+s.face+s.openness)/4;
 if(relational>=64)return"warm";
 if(relational<48)return"cold";
 return"neutral"
}
function heard(a){
 const arr=[];
 if(a.direct>=2)arr.push("“He is prioritizing clarity and movement.”");
 if(a.gratitude)arr.push("“He noticed the relationship, not only the task.”");
 if(a.alternative)arr.push("“The request may be closed, but the relationship is not.”");
 if(a.empathy)arr.push("“He is taking my position into account.”");
 if(a.ownership)arr.push("“He is bringing judgment rather than exporting the decision to me.”");
 if(a.boundary)arr.push("“There is a real boundary here.”");
 if(!arr.length)arr.push("“I understand the literal answer, but I am unsure what it says about the relationship.”");
 return arr.slice(0,3)
}
let temp={};
function analyzeFirst(){
 const el=document.getElementById("response1"),t=el.value.trim();
 if(!t){toast("Write your real response first.");return}
 const s=SCENARIOS[state.current],a=analyzeText(t);
 temp.first={text:t,a};state.signals=impactFrom(a,s.level);
 state.step="reaction";renderSignals();renderStage()
}
function renderReaction(card){
 const s=SCENARIOS[state.current],a=temp.first.a,c=classify(state.signals);
 const reaction=c==="warm"?"The other person experiences your response as both clear and relationally considerate.":
 c==="cold"?"The literal message is understood, but the other person is likely to reduce discretionary relational investment.":
 "The interaction works. The social signal is more functional than relationship-building.";
 card.innerHTML=`<p class="kicker">IMPACT</p><h1>The words landed. Now the interpretation begins.</h1>
 <div class="reaction-card"><b>Plausible immediate reaction</b><br>${reaction}</div>
 <div class="analysis-grid">
   <div class="analysis-card"><h4>YOUR LIKELY INTENT</h4>${state.goals.slice(0,3).map(g=>`<span class="tag">${g}</span>`).join("")}</div>
   <div class="analysis-card"><h4>WHAT THEY MAY HAVE HEARD</h4>${heard(a).map(h=>`<div style="margin:7px 0">${h}</div>`).join("")}</div>
 </div>
 <div class="perspective-card"><p class="mini-heading">PERSPECTIVE REPLAY</p><b>You are now ${PERSONAS[s.speaker].name}.</b>
 <p>Read your own sentence from the other side:</p><div class="dialogue-text">“${temp.first.text.replace(/</g,"&lt;")}”</div>
 <p class="muted">What relationship signal would you infer if you did not know Matthias's intention?</p></div>
 <div class="consequence"><b>The conversation continues.</b><br>${s.follow}</div>
 <div class="hero-actions"><button class="button primary" onclick="showFollow()">Make the second move</button></div>`
}
function showFollow(){state.step="follow";renderStage()}
function renderFollow(card){
 const s=SCENARIOS[state.current];
 card.innerHTML=`<p class="kicker">SECOND MOVE</p><h1>The first answer changed the context.</h1>
 <p class="context">${s.follow}</p>
 <textarea id="response2" class="field" placeholder="What would you say or do now?"></textarea>
 <div class="response-tools"><span>The second move can repair, deepen or amplify the first.</span></div>
 <button class="button primary" onclick="finishScenario()">Resolve the interaction</button>`;
 setTimeout(()=>document.getElementById("response2")?.focus(),50)
}
function finishScenario(){
 const t=document.getElementById("response2").value.trim();if(!t){toast("Write the second move first.");return}
 const s=SCENARIOS[state.current],a2=analyzeText(t);
 const combined={};
 Object.keys(temp.first.a).forEach(k=>{if(typeof temp.first.a[k]==="number")combined[k]=(temp.first.a[k]+(a2[k]||0))/2});
 combined.text=temp.first.text+" "+t;
 state.signals=impactFrom(combined,s.level);
 const cls=classify(state.signals);
 // update relationships
 s.people.forEach(pid=>{
   const r=getRelationship(pid);
   r.trust=clamp(r.trust+(state.signals.trust-58)*.16);
   r.warmth=clamp(r.warmth+(state.signals.warmth-56)*.16);
   r.respect=clamp(r.respect+(state.signals.respect-62)*.16);
   r.openness=clamp(r.openness+(state.signals.openness-61)*.18);
   r.threat=clamp(r.threat+(cls==="cold"?5:cls==="warm"?-2:0));
 });
 const memory=s.memory[cls], delayed=s.delayed[cls];
 const record={id:state.current,ts:Date.now(),classification:cls,signals:{...state.signals},style:combined,goals:[...state.goals],memory,delayed,people:[...s.people]};
 state.history.push(record);state.memories.unshift({scenario:s.title,ts:Date.now(),text:memory,delayed,people:[...s.people]});
 if(!state.completed.includes(state.current))state.completed.push(state.current);
 saveState();temp.final=record;state.step="final";renderSignals();renderStage()
}
function renderFinal(card){
 const s=SCENARIOS[state.current],r=temp.final||state.history.filter(h=>h.id===state.current).at(-1);
 const relational=Math.round((r.signals.trust+r.signals.warmth+r.signals.face+r.signals.openness)/4);
 const effectiveness=Math.round((r.signals.trust+r.signals.respect+r.signals.openness)/3);
 card.innerHTML=`<p class="kicker">OUTCOME</p><h1>This interaction is over. Its consequences are not.</h1>
 <div class="score-row">
  <div class="score-card"><b>${effectiveness}</b><small>Goal effectiveness</small></div>
  <div class="score-card"><b>${relational}</b><small>Relationship durability</small></div>
  <div class="score-card"><b>${r.signals.face}</b><small>Face preserved</small></div>
 </div>
 <div class="reaction-card" style="margin-top:16px"><b>What they remember</b><br>${r.memory}</div>
 <div class="consequence"><b>Delayed consequence</b><br>${r.delayed}</div>
 <div class="lesson-card"><p class="mini-heading" style="color:#aeb6bb">CORE LESSON</p><p>${s.lesson}</p></div>
 <div class="hero-actions"><button class="button primary" onclick="nextScenario()">Continue</button>
 <button class="button ghost" onclick="navigate('network')">See relationship map</button></div>`
}
function nextScenario(){
 const next=SCENARIOS.findIndex((_,i)=>i>state.current&&!state.completed.includes(i));
 openScenario(next===-1?Math.min(state.current+1,SCENARIOS.length-1):next)
}
function renderNetwork(){
 const canvas=document.getElementById("networkCanvas");
 const active=Object.keys(state.relationships);
 if(!active.length){
  canvas.innerHTML=`<div style="padding:36px;color:var(--muted)">Complete a scenario to start building the map.</div>`;
  document.getElementById("networkDetail").innerHTML=`<p class="kicker">NO RELATIONSHIPS YET</p><h2>People appear here after you interact with them.</h2>`;
 }else{
  const positions=[[46,42],[18,18],[72,15],[15,68],[74,70],[44,8],[44,76],[8,42],[82,42]];
  canvas.innerHTML=`<div class="map-node main" style="left:calc(50% - 56px);top:calc(50% - 56px)"><div><b>${state.learner}</b><small>you</small></div></div>`+
  active.map((pid,i)=>{
    const p=PERSONAS[pid],pos=positions[i%positions.length];
    return `<button class="map-node" style="left:${pos[0]}%;top:${pos[1]}%" onclick="showRelation('${pid}')"><div><b>${p.initial} ${p.name.split(" ")[0]}</b><small>${p.role.split("·")[0]}</small></div></button>`
  }).join("");
  showRelation(active[0])
 }
 document.getElementById("memoryFeed").innerHTML=state.memories.slice(0,12).map(m=>`
 <div class="memory-item"><time>${new Date(m.ts).toLocaleDateString()}</time><div><b>${m.scenario}</b><div>${m.text}</div><small style="color:var(--muted)">Later: ${m.delayed}</small></div></div>`).join("") || `<p class="muted">No social memory yet.</p>`
}
function showRelation(pid){
 const p=PERSONAS[pid],r=getRelationship(pid);
 const related=state.memories.filter(m=>m.people.includes(pid)).slice(0,4);
 document.getElementById("networkDetail").innerHTML=`<p class="kicker">RELATIONSHIP</p><h2>${p.name}</h2><p class="muted">${p.role}<br>${p.traits}</p>
 ${["trust","warmth","respect","openness","threat"].map(k=>`<div class="relation-stat"><div class="relation-stat-head"><span>${k[0].toUpperCase()+k.slice(1)}</span><b>${r[k]}</b></div><div class="meter-track"><div class="meter-fill" style="width:${r[k]}%"></div></div></div>`).join("")}
 <p class="mini-heading" style="margin-top:24px">WHAT THIS PERSON REMEMBERS</p>
 ${related.length?related.map(m=>`<div style="font-size:12px;line-height:1.5;margin:10px 0;padding-top:10px;border-top:1px solid var(--line)">${m.text}</div>`).join(""):`<p class="muted">No completed interaction yet.</p>`}`
}
function averageStyle(k){
 if(!state.history.length)return 0;
 return state.history.reduce((a,h)=>a+(h.style[k]||0),0)/state.history.length
}
function averageSignal(k){
 if(!state.history.length)return 0;
 return Math.round(state.history.reduce((a,h)=>a+h.signals[k],0)/state.history.length)
}
function renderPatterns(){
 const out=document.getElementById("patternSummary"),deep=document.getElementById("patternDeep");
 if(!state.history.length){
   out.innerHTML=`<div class="pattern-card-large"><p class="kicker">NOT ENOUGH DATA</p><h2>Complete your first scenario.</h2><p class="muted">The pattern report needs actual choices before it can say anything useful.</p></div>`;
   deep.innerHTML="";return
 }
 const vals={warmth:averageSignal("warmth"),trust:averageSignal("trust"),respect:averageSignal("respect"),face:averageSignal("face")};
 const direct=averageStyle("direct"), alt=averageStyle("alternative"), emp=averageStyle("empathy"), own=averageStyle("ownership"), boundary=averageStyle("boundary");
 let title,body,watch;
 if(direct>2 && vals.warmth<58){title="You often optimize the current interaction faster than the future relationship.";body="Clarity and decisiveness are visible strengths. The recurring cost is that other people may reduce optional, discretionary engagement even when they comply.";watch="Before a difficult reply, ask: am I closing the request, or accidentally closing the relationship too?"}
 else if(vals.warmth>70 && own<1){title="You protect relationships well, but may sometimes blur your own judgment.";body="The social cushioning is strong. The next edge is learning to state a real position without losing warmth.";watch="Try: acknowledge → judgment → reason → alternative."}
 else if(alt>1.1 && emp>1){title="You are unusually good at keeping doors open.";body="You often pair a boundary with an alternative and perspective-taking. That preserves future cooperation.";watch="The risk is over-explaining. A warm boundary can still be concise."}
 else {title="Your current pattern is balanced rather than dominated by one style.";body="You move between clarity, warmth and judgment depending on context. The next skill is making the trade-off deliberate.";watch="Social skill is not maximizing warmth. It is choosing a social cost on purpose rather than creating it accidentally."}
 out.innerHTML=`<div class="pattern-hero">
 <div class="pattern-card-large"><p class="kicker">CURRENT PATTERN</p><h2>${title}</h2><p class="hero-text" style="font-size:16px">${body}</p></div>
 <div class="pattern-card-small"><p class="kicker">WATCH NEXT</p><p style="font-size:20px;line-height:1.45">${watch}</p></div></div>
 <div class="pattern-bars" style="margin-top:12px">${Object.entries(vals).map(([k,v])=>`<div class="pattern-score"><b>${v}</b><small>${k[0].toUpperCase()+k.slice(1)}</small></div>`).join("")}</div>`;
 const topGoals={};state.history.forEach(h=>h.goals.slice(0,2).forEach(g=>topGoals[g]=(topGoals[g]||0)+1));
 const top=Object.entries(topGoals).sort((a,b)=>b[1]-a[1]).slice(0,4);
 deep.innerHTML=`<div class="pattern-card-large"><p class="kicker">WHAT YOU CONSISTENTLY VALUE</p>
 ${top.map(([g,n])=>`<div style="padding:12px 0;border-bottom:1px solid var(--line)"><b>${g}</b><small style="float:right;color:var(--muted)">${n}× top-two priority</small></div>`).join("")}</div>
 <div class="pattern-card-large"><p class="kicker">BEHAVIORAL TENDENCIES</p>
 <div class="relation-stat-head"><span>Directness</span><b>${direct.toFixed(1)}</b></div>
 <div class="relation-stat-head"><span>Alternative-giving</span><b>${alt.toFixed(1)}</b></div>
 <div class="relation-stat-head"><span>Perspective-taking</span><b>${emp.toFixed(1)}</b></div>
 <div class="relation-stat-head"><span>Ownership / judgment</span><b>${own.toFixed(1)}</b></div>
 <div class="relation-stat-head"><span>Boundary clarity</span><b>${boundary.toFixed(1)}</b></div>
 <p class="muted" style="margin-top:20px">These are local text heuristics, not psychometric scores.</p></div>`
}
function openSettings(){
 document.getElementById("learnerName").value=state.learner;
 document.getElementById("practiceMode").value=state.mode;
 document.getElementById("settingsModal").classList.remove("hidden")
}
function closeSettings(){document.getElementById("settingsModal").classList.add("hidden")}
function modalBackdrop(e){if(e.target.id==="settingsModal")closeSettings()}
function saveSettings(){
 state.learner=document.getElementById("learnerName").value.trim()||"Matthias";
 state.mode=document.getElementById("practiceMode").value;saveState();closeSettings();toast("Settings saved")
}
function resetProgress(){
 if(!confirm("Reset all scenarios, relationship memory and pattern data?"))return;
 state=structuredClone(defaultState);saveState();closeSettings();renderHome();toast("Progress reset")
}

gateInit();updateHeader();renderHome();navigate("home");
