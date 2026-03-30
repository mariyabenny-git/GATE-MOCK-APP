document.addEventListener("DOMContentLoaded",()=>{

let allQuestions=[], selectedQuestions=[];
let answers=[], visited=[], marked=[];
let explainList=[], weakIndexes=[];
let timePerQ=[];
let current=0;
let lastTime=Date.now();

const startBtn=document.getElementById("startBtn");
const nextBtn=document.getElementById("nextBtn");
const prevBtn=document.getElementById("prevBtn");
const markBtn=document.getElementById("markBtn");
const submitBtn=document.getElementById("submitBtn");
const explainBtn=document.getElementById("explainBtn");
const exitBtn=document.getElementById("exitBtn");
const restartBtn=document.getElementById("restartBtn");
const reviseBtn=document.getElementById("reviseBtn");

/* LOAD */
fetch("questions.json")
.then(res=>res.json())
.then(data=>{ allQuestions=data.questions; });

/* SCREEN */
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* START */
startBtn.onclick=()=>{
  selectedQuestions=[...allQuestions].sort(()=>Math.random()-0.5).slice(0,10);

  answers=Array(10).fill(null);
  visited=Array(10).fill(false);
  marked=Array(10).fill(false);
  explainList=[];
  weakIndexes=[];
  timePerQ=Array(10).fill(0);

  current=0;
  lastTime=Date.now();

  show("quiz");
  loadQ();
};

/* LOAD Q */
function loadQ(){
  let now=Date.now();
  timePerQ[current]+=(now-lastTime)/1000;
  lastTime=now;

  let q=selectedQuestions[current];
  visited[current]=true;

  document.getElementById("progress").innerHTML=`Q ${current+1}/10`;
  document.getElementById("question").textContent=q.question;

  let html="";
  q.options.forEach((opt,i)=>{
    html+=`<div class="option ${answers[current]===i?'selected':''}" onclick="select(${i})">${opt}</div>`;
  });

  document.getElementById("options").innerHTML=html;
  updatePalette();

  explainBtn.style.background = explainList.includes(current) ? "#f59e0b" : "#8b5cf6";
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

/* BULB */
explainBtn.onclick=()=>{
  if(!explainList.includes(current)) explainList.push(current);
};

/* EXIT */
exitBtn.onclick=()=>location.reload();
restartBtn.onclick=()=>location.reload();

/* SUBMIT */
submitBtn.onclick=()=>{
  show("result");

  let correct=0, wrong=0, skipped=0;
  let subjectStats={};

  selectedQuestions.forEach((q,i)=>{
    if(!subjectStats[q.subject]) subjectStats[q.subject]={c:0,t:0};
    subjectStats[q.subject].t++;

    if(answers[i]===null) skipped++;
    else if(answers[i]===q.correctAnswer){
      correct++;
      subjectStats[q.subject].c++;
    } else {
      wrong++;
      weakIndexes.push(i);
    }
  });

  document.getElementById("scoreText").textContent=`Score: ${correct}/10 | Skipped: ${skipped}`;

  let percent=(correct/10)*100;
  let air=Math.floor((100-percent)*500);
  document.getElementById("airText").textContent=`Predicted AIR: ${air}`;

  let weak="";
  Object.keys(subjectStats).forEach(s=>{
    if(subjectStats[s].c/subjectStats[s].t<0.5) weak+=s+" ";
  });
  document.getElementById("weakText").textContent=weak||"Strong performance";

  drawCharts(correct,wrong,skipped);
  showGolden();
};

/* CHARTS */
function drawCharts(c,w,s){
  new Chart(document.getElementById("donutChart"),{
    type:"doughnut",
    data:{
      labels:["Correct","Wrong","Unattempted"],
      datasets:[{
        data:[c,w,s],
        backgroundColor:["#10b981","#ef4444","#f59e0b"]
      }]
    }
  });

  new Chart(document.getElementById("timeChart"),{
    type:"bar",
    data:{
      labels:timePerQ.map((_,i)=>"Q"+(i+1)),
      datasets:[{label:"Time (s)",data:timePerQ}]
    }
  });
}

/* GOLDEN CORNER */
function showGolden(){
  let html="";
  explainList.forEach(i=>{
    let q=selectedQuestions[i];
    html+=`<div class="solution-card">
    Q${i+1}: ${q.question}<br>💡 ${q.explanation}
    </div>`;
  });
  document.getElementById("solutions").innerHTML=html||"No selections";
}

/* REVISION */
reviseBtn.onclick=()=>{
  selectedQuestions=weakIndexes.map(i=>selectedQuestions[i]);

  answers=Array(selectedQuestions.length).fill(null);
  visited=Array(selectedQuestions.length).fill(false);
  marked=Array(selectedQuestions.length).fill(false);

  current=0;
  show("quiz");
  loadQ();
};

});
