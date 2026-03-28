let allQuestions=[];
let selectedQuestions=[];
let answers=Array(10).fill(null);
let marked=Array(10).fill(false);
let visited=Array(10).fill(false);
let current=0;
let time=1800;
let timer;

const timerEl=document.getElementById("timer");
const startBtn=document.getElementById("startBtn");

/* LOAD QUESTIONS */
fetch("questions.json")
.then(res=>res.json())
.then(data=>{
  if(data.questions){
    allQuestions=data.questions;
  }else{
    for(let sub in data){
      data[sub].forEach(q=>allQuestions.push(q));
    }
  }
  console.log("Questions Loaded:", allQuestions.length);
});

/* SCREEN SWITCH */
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* START */
startBtn.onclick=()=>{
  if(allQuestions.length===0){
    alert("Questions not loaded!");
    return;
  }

  selectedQuestions=allQuestions.sort(()=>Math.random()-0.5).slice(0,10);
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

    if(time<=0){
      clearInterval(timer);
      finish();
    }
  },1000);
}

/* LOAD QUESTION */
function loadQ(){
  visited[current]=true;
  let q=selectedQuestions[current];

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

document.getElementById("nextBtn").onclick=()=>{ if(current<9){current++; loadQ();}};
document.getElementById("prevBtn").onclick=()=>{ if(current>0){current--; loadQ();}};
document.getElementById("markBtn").onclick=()=>{ marked[current]=!marked[current]; updatePalette();};

/* FINISH */
document.getElementById("submitBtn").onclick=finish;

function finish(){
  clearInterval(timer);
  show("result");

  let correct=0;
  selectedQuestions.forEach((q,i)=>{
    if(answers[i]===q.correctAnswer) correct++;
  });

  document.getElementById("scoreText").textContent=`Score: ${correct}/10`;
}
