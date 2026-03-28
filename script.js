document.addEventListener("DOMContentLoaded",()=>{

let allQuestions=[], selectedQuestions=[];
let answers=[], marked=[], visited=[];
let current=0, time=1800, timer;

const startBtn=document.getElementById("startBtn");
const nextBtn=document.getElementById("nextBtn");
const prevBtn=document.getElementById("prevBtn");
const markBtn=document.getElementById("markBtn");
const submitBtn=document.getElementById("submitBtn");
const exitBtn=document.getElementById("exitBtn");
const restartBtn=document.getElementById("restartBtn");
const timerEl=document.getElementById("timer");

/* LOAD QUESTIONS */
fetch("questions.json")
.then(res=>res.json())
.then(data=>{
  data.subjects.forEach(sub=>{
    sub.questions.forEach(q=>{
      q.subject=sub.name;
      allQuestions.push(q);
    });
  });
});

/* SCREEN */
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* START */
startBtn.onclick=()=>{
  if(allQuestions.length===0){
    alert("Wait, loading questions...");
    return;
  }

  selectedQuestions=[...allQuestions].sort(()=>Math.random()-0.5).slice(0,10);

  answers=Array(10).fill(null);
  marked=Array(10).fill(false);
  visited=Array(10).fill(false);
  current=0; time=1800;

  show("quiz");
  startTimer();
  loadQ();
};

/* TIMER */
function startTimer(){
  timer=setInterval(()=>{
    time--;
    let m=Math.floor(time/60);
    let s=time%60;
    timerEl.textContent=`${m}:${s<10?"0":""}${s}`;
    if(time<=0) finish();
  },1000);
}

/* LOAD */
function loadQ(){
  let q=selectedQuestions[current];
  if(!q) return;

  visited[current]=true;

  document.getElementById("progress").textContent=`Q ${current+1}/10`;
  document.getElementById("question").textContent=q.question;

  let html="";
  q.options.forEach((opt,i)=>{
    html+=`<div class="option ${answers[current]===i?'selected':''}" onclick="select(${i})">${opt}</div>`;
  });

  document.getElementById("options").innerHTML=html;
  updatePalette();
}

window.select=function(i){
  answers[current]=i;
  let q=selectedQuestions[current];

  let msg = answers[current]===q.correctAnswer ? "✅ Correct" : "❌ Wrong";

  document.getElementById("options").innerHTML += `
    <p style="color:#94a3b8">${msg}<br>${q.explanation||""}</p>
  `;
};

/* PALETTE */
function updatePalette(){
  let html="";
  for(let i=0;i<10;i++){
    let cls="gray";
    if(marked[i]) cls="purple";
    else if(answers[i]!=null) cls="green";
    else if(visited[i]) cls="red";

    html+=`<div class="${cls}" onclick="go(${i})">${i+1}</div>`;
  }
  document.getElementById("palette").innerHTML=html;
}

window.go=(i)=>{ current=i; loadQ(); };

if(nextBtn) nextBtn.onclick=()=>{ if(current<9){current++; loadQ();}};
if(prevBtn) prevBtn.onclick=()=>{ if(current>0){current--; loadQ();}};
if(markBtn) markBtn.onclick=()=>{ marked[current]=!marked[current]; updatePalette();};
if(submitBtn) submitBtn.onclick=finish;

/* FINISH */
function finish(){
  clearInterval(timer);
  show("result");

  let score=0, stats={};

  selectedQuestions.forEach((q,i)=>{
    if(!stats[q.subject]) stats[q.subject]={c:0,t:0};
    stats[q.subject].t++;

    if(answers[i]===q.correctAnswer){
      score+=q.marks;
      stats[q.subject].c++;
    } else if(answers[i]!=null){
      score-=q.marks*0.33;
    }
  });

  let percent=Math.round((score/20)*100);

  document.getElementById("scoreText").textContent=`Score: ${score} (${percent}%)`;

  let html="";
  for(let s in stats){
    let p=Math.round((stats[s].c/stats[s].t)*100);
    html+=`<p>${s}: ${p}%</p>`;
  }

  document.getElementById("analysis").innerHTML=html;

  let history=JSON.parse(localStorage.getItem("scores"))||[];
  history.push(percent);
  localStorage.setItem("scores",JSON.stringify(history));

  let avg=history.reduce((a,b)=>a+b,0)/history.length;
  let rank = percent>avg ? "Above Avg" : "Improve";

  document.getElementById("rankText").textContent=`Rank: ${rank}`;
}

/* EXIT */
if(exitBtn) exitBtn.onclick=()=>location.reload();
if(restartBtn) restartBtn.onclick=()=>location.reload();

});
