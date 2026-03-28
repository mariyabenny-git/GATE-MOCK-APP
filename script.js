let allQuestions=[];
let selectedQuestions=[];
let answers=[];
let marked=[];
let visited=[];
let current=0;
let time=1800;
let timer;

const startBtn=document.getElementById("startBtn");
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
  selectedQuestions=[...allQuestions].sort(()=>Math.random()-0.5).slice(0,10);

  answers=Array(10).fill(null);
  marked=Array(10).fill(false);
  visited=Array(10).fill(false);
  current=0;
  time=1800;

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

/* LOAD QUESTION */
function loadQ(){
  visited[current]=true;
  let q=selectedQuestions[current];

  document.getElementById("progress").textContent=`Q ${current+1}/10`;
  document.getElementById("question").textContent=q.question;

  let html="";
  q.options.forEach((opt,i)=>{
    html+=`<div class="option ${answers[current]===i?'selected':''}" onclick="select(${i})">${opt}</div>`;
  });

  document.getElementById("options").innerHTML=html;
  updatePalette();
}

/* SELECT */
function select(i){
  answers[current]=i;
  loadQ();
}

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

/* NAV */
function go(i){ current=i; loadQ(); }
nextBtn.onclick=()=>{ if(current<9){current++; loadQ();}};
prevBtn.onclick=()=>{ if(current>0){current--; loadQ();}};
markBtn.onclick=()=>{ marked[current]=!marked[current]; updatePalette();};

/* FINISH */
submitBtn.onclick=finish;

function finish(){
  clearInterval(timer);
  show("result");

  let score=0;
  let subjectStats={};

  selectedQuestions.forEach((q,i)=>{
    if(!subjectStats[q.subject]){
      subjectStats[q.subject]={correct:0,total:0};
    }

    subjectStats[q.subject].total++;

    if(answers[i]===q.correctAnswer){
      score+=q.marks;
      subjectStats[q.subject].correct++;
    }
  });

  let percentage=Math.round((score/20)*100);

  document.getElementById("scoreText").textContent=`Score: ${score} | ${percentage}%`;

  /* WEAKNESS */
  let analysis="";
  for(let sub in subjectStats){
    let s=subjectStats[sub];
    let p=Math.round((s.correct/s.total)*100);
    analysis+=`<p>${sub}: ${p}%</p>`;
  }

  document.getElementById("analysis").innerHTML=analysis;

  /* STORE HISTORY */
  let history=JSON.parse(localStorage.getItem("gateScores"))||[];
  history.push(percentage);
  localStorage.setItem("gateScores",JSON.stringify(history));

  /* RANK */
  let avg=history.reduce((a,b)=>a+b,0)/history.length;

  let rank;
  if(percentage>avg+20) rank="Top 5% 🚀";
  else if(percentage>avg) rank="Above Average 👍";
  else rank="Needs Improvement ⚠️";

  document.getElementById("rankText").textContent=`Rank: ${rank}`;
}

/* EXIT */
exitBtn.onclick=()=>location.reload();
restartBtn.onclick=()=>location.reload();
