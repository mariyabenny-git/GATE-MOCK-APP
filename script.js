document.addEventListener("DOMContentLoaded",()=>{

let allQuestions=[], selectedQuestions=[];
let answers=[], marked=[], visited=[];
let current=0, time=1800, timer;

const startBtn=document.getElementById("startBtn");
const explainBtn=document.getElementById("explainBtn");

fetch("questions.json")
.then(res=>res.json())
.then(data=>{
  allQuestions=data.questions;
  startBtn.textContent="Start Test";
});

/* START */
startBtn.onclick=()=>{
  selectedQuestions=[...allQuestions].sort(()=>Math.random()-0.5).slice(0,10);

  answers=Array(10).fill(null);
  marked=Array(10).fill(false);

  show("quiz");
  startTimer();
  loadQ();
};

function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}

/* LOAD Q */
function loadQ(){
  let q=selectedQuestions[current];

  document.getElementById("progress").innerHTML=
  `Question <b>${current+1}</b> of 10`;

  document.getElementById("question").textContent=q.question;

  let html="";
  q.options.forEach((opt,i)=>{
    html+=`<div class="option ${answers[current]===i?'selected':''}" onclick="select(${i})">${opt}</div>`;
  });

  document.getElementById("options").innerHTML=html;
}

/* SELECT */
window.select=(i)=>{
  answers[current]=i;
  loadQ();
};

/* NAV */
nextBtn.onclick=()=>{ if(current<9){current++; loadQ();}};
prevBtn.onclick=()=>{ if(current>0){current--; loadQ();}};

/* TIMER */
function startTimer(){
  timer=setInterval(()=>{
    time--;
    let m=Math.floor(time/60);
    let s=time%60;
    timerEl.textContent=`${m}:${s}`;
    if(time<=0) finish();
  },1000);
}

/* FINISH */
submitBtn.onclick=finish;

function finish(){
  clearInterval(timer);
  show("result");

  let correct=0, wrong=0, skipped=0;
  let subjectStats={};

  selectedQuestions.forEach((q,i)=>{
    if(!subjectStats[q.subject]) subjectStats[q.subject]={c:0,t:0};
    subjectStats[q.subject].t++;

    if(answers[i]===q.correctAnswer){
      correct++;
      subjectStats[q.subject].c++;
    }
    else if(answers[i]==null) skipped++;
    else wrong++;
  });

  document.getElementById("scoreText").textContent=
  `Correct: ${correct} | Wrong: ${wrong}`;

  /* WEAK AREA */
  let weak="";
  Object.keys(subjectStats).forEach(sub=>{
    let acc=subjectStats[sub].c/subjectStats[sub].t;
    if(acc<0.5) weak+=sub+" ";
  });

  document.getElementById("weakText").textContent=
  `Weak Areas: ${weak}`;

  drawCharts(correct,wrong,skipped);
  showSolutions();
}

/* CHARTS */
function drawCharts(c,w,s){

new Chart(document.getElementById("donutChart"),{
  type:"doughnut",
  data:{
    labels:["Correct","Wrong","Skipped"],
    datasets:[{data:[c,w,s]}]
  }
});

}

/* SOLUTIONS */
function showSolutions(){
  let html="";
  selectedQuestions.forEach((q,i)=>{
    html+=`
    <div>
    <b>Q${i+1}</b> ${q.question}<br>
    ✅ ${q.options[q.correctAnswer]}<br>
    💡 ${q.explanation}
    </div>`;
  });
  document.getElementById("solutions").innerHTML=html;
}

/* EXPLAIN BUTTON */
explainBtn.onclick=()=>{
  alert("Available after submission");
};

});
