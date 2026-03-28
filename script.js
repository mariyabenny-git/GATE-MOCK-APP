let allQuestions=[];
let selectedQuestions=[];
let userAnswers=Array(10).fill(null);
let marked=Array(10).fill(false);
let current=0;
let totalTime=1800;
let timer;

const screens=document.querySelectorAll(".screen");
const startBtn=document.getElementById("startBtn");
const questionEl=document.getElementById("question");
const optionsEl=document.getElementById("options");
const progressEl=document.getElementById("progress");
const timerEl=document.getElementById("timer");
const palette=document.getElementById("palette");
const scoreText=document.getElementById("scoreText");
const analysis=document.getElementById("analysis");

function show(id){
  screens.forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

fetch("questions.json")
.then(r=>r.json())
.then(data=>{
  for(let sub in data){
    data[sub].forEach(q=>{
      q.subject=sub;
      allQuestions.push(q);
    });
  }
});

function shuffle(a){
  return [...a].sort(()=>Math.random()-0.5);
}

startBtn.onclick=()=>{
  current=0;
  userAnswers=Array(10).fill(null);
  marked=Array(10).fill(false);
  totalTime=1800;

  selectedQuestions=shuffle(allQuestions).slice(0,10);

  show("quiz");
  startTimer();
  loadQ();
};

function startTimer(){
  timer=setInterval(()=>{
    totalTime--;
    timerEl.textContent=format(totalTime);
    if(totalTime<=0){
      clearInterval(timer);
      finish();
    }
  },1000);
}

function format(s){
  let m=Math.floor(s/60);
  let sec=s%60;
  return `${m}:${sec<10?"0":""}${sec}`;
}

function loadQ(){
  let q=selectedQuestions[current];
  questionEl.textContent=q.question;
  progressEl.textContent=`Q ${current+1}/10`;

  optionsEl.innerHTML="";

  q.options.forEach((opt,i)=>{
    let div=document.createElement("div");
    div.className="option";
    div.textContent=opt;

    if(userAnswers[current]===i){
      div.classList.add("selected");
    }

    div.onclick=()=>{
      userAnswers[current]=i;
      loadQ();
      loadPalette();
    };

    optionsEl.appendChild(div);
  });

  loadPalette();
}

function loadPalette(){
  palette.innerHTML="";
  for(let i=0;i<10;i++){
    let box=document.createElement("div");
    box.textContent=i+1;

    if(marked[i]) box.classList.add("marked");
    else if(userAnswers[i]!=null) box.classList.add("answered");
    else box.classList.add("not-answered");

    box.onclick=()=>{
      current=i;
      loadQ();
    };

    palette.appendChild(box);
  }
}

document.getElementById("nextBtn").onclick=()=>{
  if(current<9){current++; loadQ();}
};

document.getElementById("prevBtn").onclick=()=>{
  if(current>0){current--; loadQ();}
};

document.getElementById("markBtn").onclick=()=>{
  marked[current]=!marked[current];
  loadPalette();
};

document.getElementById("submitBtn").onclick=finish;

function finish(){
  clearInterval(timer);

  let score=0, correct=0, attempted=0;
  let subjectStats={};

  selectedQuestions.forEach((q,i)=>{
    if(userAnswers[i]!=null){
      attempted++;

      if(userAnswers[i]===q.correctAnswer){
        score+=q.marks;
        correct++;
      }else{
        score-=q.marks*0.33;
      }

      if(!subjectStats[q.subject]){
        subjectStats[q.subject]={c:0,t:0};
      }

      subjectStats[q.subject].t++;
      if(userAnswers[i]===q.correctAnswer){
        subjectStats[q.subject].c++;
      }
    }
  });

  let acc=attempted?((correct/attempted)*100).toFixed(1):0;

  show("result");

  scoreText.innerHTML=`
    Score: ${score.toFixed(2)} <br>
    Accuracy: ${acc}% <br>
    Attempted: ${attempted}/10
  `;
}