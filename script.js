document.addEventListener("DOMContentLoaded",()=>{

let allQuestions=[], selectedQuestions=[];
let user="";
let difficulty="all";

/* ELEMENTS */
const loginBtn=document.getElementById("loginBtn");
const startBtn=document.getElementById("startBtn");
const userText=document.getElementById("userText");
const historyEl=document.getElementById("history");

/* LOGIN */
loginBtn.onclick=()=>{
  user=document.getElementById("username").value.trim();
  if(!user) return alert("Enter name");

  localStorage.setItem("user",user);
  show("start");

  userText.textContent=user;
  loadHistory();
};

/* LOAD HISTORY */
function loadHistory(){
  let data=JSON.parse(localStorage.getItem(user))||[];
  historyEl.textContent = data.length
    ? "Previous Scores: "+data.join(", ")
    : "No attempts yet";
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
  difficulty=document.getElementById("difficulty").value;

  let filtered = allQuestions.filter(q=>{
    return difficulty==="all" || q.level===difficulty;
  });

  selectedQuestions=[...filtered].sort(()=>Math.random()-0.5).slice(0,10);

  startTest();
};

/* START TEST */
function startTest(){
  answers=Array(selectedQuestions.length).fill(null);
  current=0;
  show("quiz");
  loadQ();
}

/* SAVE SCORE */
function saveScore(score){
  let data=JSON.parse(localStorage.getItem(user))||[];
  data.push(score);
  localStorage.setItem(user,JSON.stringify(data));
}

/* SUBMIT */
submitBtn.onclick=()=>{
  show("result");

  let correct=0;
  selectedQuestions.forEach((q,i)=>{
    if(answers[i]===q.correctAnswer) correct++;
  });

  document.getElementById("scoreText").textContent=`Score: ${correct}`;

  saveScore(correct);
};
});
