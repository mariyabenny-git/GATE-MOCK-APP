let allQuestions=[], selectedQuestions=[];
let answers=Array(10).fill(null);
let marked=Array(10).fill(false);
let visited=Array(10).fill(false);
let current=0;
let time=1800;

const timerEl=document.getElementById("timer");

fetch("questions.json")
.then(r=>r.json())
.then(data=>{
  for(let s in data){
    data[s].forEach(q=>allQuestions.push(q));
  }
});

function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("startBtn").onclick=()=>{
  selectedQuestions=allQuestions.sort(()=>Math.random()-0.5).slice(0,10);
  show("quiz");
  startTimer();
  loadQ();
};

function startTimer(){
  setInterval(()=>{
    time--;
    let m=Math.floor(time/60);
    let s=time%60;
    timerEl.textContent=`${m}:${s}`;

    if(time<300){
      timerEl.style.color="red";
    }

    if(time<=0) finish();
  },1000);
}

function loadQ(){
  visited[current]=true;
  let q=selectedQuestions[current];

  document.getElementById("question").textContent=q.question;

  let optHTML="";
  q.options.forEach((o,i)=>{
    optHTML+=`<div class="option" onclick="select(${i})">${o}</div>`;
  });

  document.getElementById("options").innerHTML=optHTML;

  updatePalette();
}

function select(i){
  answers[current]=i;
  loadQ();
}

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

function go(i){ current=i; loadQ(); }

document.getElementById("nextBtn").onclick=()=>{ if(current<9){current++; loadQ();}};
document.getElementById("prevBtn").onclick=()=>{ if(current>0){current--; loadQ();}};
document.getElementById("markBtn").onclick=()=>{ marked[current]=!marked[current]; updatePalette(); };

document.getElementById("submitBtn").onclick=finish;

function finish(){
  show("result");

  let correct=0, wrong=0, skipped=0;

  selectedQuestions.forEach((q,i)=>{
    if(answers[i]==null) skipped++;
    else if(answers[i]==q.correctAnswer) correct++;
    else wrong++;
  });

  let score=correct;

  document.getElementById("scoreText").textContent=`Score: ${score}`;

  drawCircle(score);
  drawDonut(correct,wrong,skipped);
  drawBar(score);
}

/* SVG CIRCLE */
function drawCircle(score){
  let percent=score*10;
  let offset=314-(314*percent/100);
  document.getElementById("progressCircle").style.strokeDashoffset=offset;
}

/* DONUT */
function drawDonut(c,w,s){
  let ctx=document.getElementById("donutChart").getContext("2d");
  let data=[c,w,s];
  let total=data.reduce((a,b)=>a+b,0);
  let start=0;

  data.forEach(val=>{
    let angle=(val/total)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(100,100);
    ctx.arc(100,100,80,start,start+angle);
    ctx.fill();
    start+=angle;
  });
}

/* BAR */
function drawBar(score){
  let ctx=document.getElementById("barChart").getContext("2d");
  let history=JSON.parse(localStorage.getItem("scores"))||[];
  history.push(score);
  localStorage.setItem("scores",JSON.stringify(history));

  history.forEach((s,i)=>{
    ctx.fillRect(i*30,150-s*10,20,s*10);
  });
}
