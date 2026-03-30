document.addEventListener("DOMContentLoaded",()=>{

let allQuestions=[], selectedQuestions=[];
let answers=[], marked=[], visited=[];
let current=0;

const startBtn=document.getElementById("startBtn");
const nextBtn=document.getElementById("nextBtn");
const prevBtn=document.getElementById("prevBtn");
const markBtn=document.getElementById("markBtn");
const submitBtn=document.getElementById("submitBtn");

/* LOAD */
fetch("questions.json")
.then(res=>res.json())
.then(data=>{
  allQuestions=data.questions;
  startBtn.textContent="Start Test";
});

/* SHOW */
function show(id){
  document.querySelectorAll(".screen")
    .forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* START */
startBtn.onclick=()=>{
  selectedQuestions=[...allQuestions]
    .sort(()=>Math.random()-0.5)
    .slice(0,10);

  answers=Array(10).fill(null);
  marked=Array(10).fill(false);
  visited=Array(10).fill(false);

  current=0;
  show("quiz");
  loadQ();
};

/* LOAD Q */
function loadQ(){
  let q=selectedQuestions[current];
  visited[current]=true;

  document.getElementById("progress").innerHTML=
    `Q ${current+1}/10`;

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
  answers[current]=i;
  loadQ();
};

/* NAV */
nextBtn.onclick=()=>{ if(current<9){current++; loadQ();}};
prevBtn.onclick=()=>{ if(current>0){current--; loadQ();}};
markBtn.onclick=()=>{ marked[current]=!marked[current]; updatePalette();};

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

/* FINISH */
submitBtn.onclick=()=>{
  show("result");

  let correct=0, wrong=0, stats={};

  selectedQuestions.forEach((q,i)=>{
    if(!stats[q.subject]) stats[q.subject]={c:0,t:0};
    stats[q.subject].t++;

    if(answers[i]===q.correctAnswer){
      correct++;
      stats[q.subject].c++;
    } else wrong++;
  });

  document.getElementById("scoreText").textContent=
    `Score: ${correct}/10`;

  let weak="";
  Object.keys(stats).forEach(s=>{
    if(stats[s].c/stats[s].t<0.5) weak+=s+" ";
  });

  document.getElementById("weakText").textContent=
    weak ? "Weak: "+weak : "None yet! Keep practicing 💪";

  drawChart(correct,wrong);
  showSolutions();
};

/* CHART */
function drawChart(c,w){
  new Chart(document.getElementById("donutChart"),{
    type:"doughnut",
    data:{
      labels:["Correct","Wrong"],
      datasets:[{
        data:[c,w],
        backgroundColor:["#10b981","#ef4444"]
      }]
    }
  });
}

/* SOLUTIONS */
function showSolutions(){
  let html="";
  selectedQuestions.forEach((q,i)=>{
    if(answers[i]!==q.correctAnswer){
      html+=`
      <div class="solution-card">
      Q${i+1}: ${q.question}<br>
      ✅ ${q.options[q.correctAnswer]}<br>
      💡 ${q.explanation}
      </div>`;
    }
  });

  document.getElementById("solutions").innerHTML=
    html || "Perfect Score 🎉";
}

});
