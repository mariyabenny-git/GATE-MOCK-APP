document.addEventListener("DOMContentLoaded",()=>{

let allQuestions=[], selectedQuestions=[];
let answers=[], visited=[], marked=[], explainList=[];
let current=0;
let user="";
let timePerQ=[];

/* ELEMENTS */
const loginBtn=document.getElementById("loginBtn");
const startBtn=document.getElementById("startBtn");
const submitBtn=document.getElementById("submitBtn");
const nextBtn=document.getElementById("nextBtn");
const prevBtn=document.getElementById("prevBtn");
const markBtn=document.getElementById("markBtn");
const explainBtn=document.getElementById("explainBtn");

/* LOGIN */
loginBtn.onclick=()=>{
  user=document.getElementById("username").value.trim();
  if(!user) return alert("Enter name");

  localStorage.setItem("user",user);
  document.getElementById("userText").textContent=user;
  loadHistory();
  show("start");
};

/* HISTORY */
function loadHistory(){
  let data=JSON.parse(localStorage.getItem(user))||[];
  document.getElementById("history").textContent=
    data.length? "Scores: "+data.join(", "):"No attempts yet";
}

/* LOAD QUESTIONS */
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
  let diff=document.getElementById("difficulty").value;

  let filtered=allQuestions.filter(q=>diff==="all"||q.level===diff);

  selectedQuestions=[...filtered].sort(()=>Math.random()-0.5).slice(0,10);

  answers=Array(10).fill(null);
  visited=Array(10).fill(false);
  marked=Array(10).fill(false);
  explainList=[];
  timePerQ=Array(10).fill(0);

  current=0;
  show("quiz");
  loadQ();
};

/* LOAD Q */
function loadQ(){
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

/* SUBMIT */
submitBtn.onclick=()=>{
  show("result");

  let correct=0, wrong=0, skipped=0;
  let weakTopics={};

  selectedQuestions.forEach((q,i)=>{
    if(!weakTopics[q.subject]) weakTopics[q.subject]={c:0,t:0};
    weakTopics[q.subject].t++;

    if(answers[i]===null) skipped++;
    else if(answers[i]===q.correctAnswer){
      correct++;
      weakTopics[q.subject].c++;
    } else {
      wrong++;
    }
  });

  document.getElementById("scoreText").textContent=`Score: ${correct}/10 | Skipped: ${skipped}`;

  let percent=(correct/10)*100;
  document.getElementById("airText").textContent=`Predicted AIR: ${Math.floor((100-percent)*500)}`;

  let weak="";
  Object.keys(weakTopics).forEach(s=>{
    if(weakTopics[s].c/weakTopics[s].t<0.5) weak+=s+" ";
  });
  document.getElementById("weakText").textContent=weak||"Strong performance";

  saveScore(correct);
  drawCharts(correct,wrong,skipped);
  showGolden();
};

/* SAVE */
function saveScore(score){
  let data=JSON.parse(localStorage.getItem(user))||[];
  data.push(score);
  localStorage.setItem(user,JSON.stringify(data));
}

/* CHART */
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

});
