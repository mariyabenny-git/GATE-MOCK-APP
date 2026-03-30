document.addEventListener("DOMContentLoaded",()=>{

let allQuestions=[], selectedQuestions=[];
let answers=[], marked=[], visited=[];
let current=0, time=1800, timer;
let isLoaded=false;

let timePerQuestion = Array(10).fill(0);
let lastTime = Date.now();

const startBtn=document.getElementById("startBtn");
const nextBtn=document.getElementById("nextBtn");
const prevBtn=document.getElementById("prevBtn");
const markBtn=document.getElementById("markBtn");
const submitBtn=document.getElementById("submitBtn");
const exitBtn=document.getElementById("exitBtn");
const restartBtn=document.getElementById("restartBtn");
const timerEl=document.getElementById("timer");

/* LOAD */
fetch("questions.json")
.then(res=>res.json())
.then(data=>{
  if(data.questions){
    allQuestions = data.questions;
  }
  isLoaded=true;
  startBtn.textContent="Start Test";
});

/* UI */
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* START */
startBtn.onclick=()=>{
  if(!isLoaded){
    alert("Loading...");
    return;
  }

  selectedQuestions=[...allQuestions].sort(()=>Math.random()-0.5).slice(0,10);

  answers=Array(10).fill(null);
  marked=Array(10).fill(false);
  visited=Array(10).fill(false);
  timePerQuestion=Array(10).fill(0);

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
    timerEl.textContent=`${m}:${s.toString().padStart(2,'0')}`;
    if(time<=0) finish();
  },1000);
}

/* LOAD QUESTION */
function loadQ(){
  let now=Date.now();
  timePerQuestion[current]+= (now-lastTime)/1000;
  lastTime=now;

  let q=selectedQuestions[current];
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

/* SELECT */
window.select=(i)=>{
  answers[current]=i; // FIXED
  loadQ();
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

nextBtn.onclick=()=>{ if(current<9){current++; loadQ();}};
prevBtn.onclick=()=>{ if(current>0){current--; loadQ();}};
markBtn.onclick=()=>{ marked[current]=!marked[current]; updatePalette();};
submitBtn.onclick=finish;

/* FINISH */
function finish(){
  clearInterval(timer);
  show("result");

  let score=0, correct=0, wrong=0, skipped=0;

  selectedQuestions.forEach((q,i)=>{
    if(answers[i]===q.correctAnswer){
      score+=q.marks;
      correct++;
    }
    else if(answers[i]===null){
      skipped++;
    }
    else{
      score-=q.marks*0.33;
      wrong++;
    }
  });

  let percent=Math.max(0,Math.round((score/20)*100));

  document.getElementById("scoreText").textContent=`Score: ${score} | ${percent}%`;
  document.getElementById("rankText").textContent=`AIR: ${Math.floor((100-percent)/100*50000)}`;

  setTimeout(()=>{
    drawDonut(correct,wrong,skipped);
    drawTimeGraph();
  },100);
}

/* DONUT */
function drawDonut(c,w,s){
  let ctx=document.getElementById("donutChart").getContext("2d");
  let total=c+w+s;
  let data=[c,w,s];
  let colors=["#34d399","#f87171","#475569"];
  let start=0;

  data.forEach((val,i)=>{
    let angle=(val/total)*2*Math.PI;
    ctx.beginPath();
    ctx.moveTo(125,125);
    ctx.arc(125,125,100,start,start+angle);
    ctx.fillStyle=colors[i];
    ctx.fill();
    start+=angle;
  });

  ctx.beginPath();
  ctx.arc(125,125,50,0,2*Math.PI);
  ctx.fillStyle="#030712";
  ctx.fill();
}

/* TIME GRAPH */
function drawTimeGraph(){
  let ctx=document.getElementById("timeChart").getContext("2d");
  let max=Math.max(...timePerQuestion);

  timePerQuestion.forEach((t,i)=>{
    let h=(t/max)*150;
    ctx.fillStyle="#8b5cf6";
    ctx.fillRect(i*30,180-h,20,h);
  });
}

/* ANTI CHEAT */
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){
    alert("Cheating detected!");
    finish();
  }
});

/* EXIT */
exitBtn.onclick=()=>location.reload();
restartBtn.onclick=()=>location.reload();

});
