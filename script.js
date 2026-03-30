let currentUser = null;
let questions = [];
let selected = [];
let answers = [];
let current = 0;

/* SCREEN SWITCH */
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* AUTH */
function toggleAuth(){
  document.getElementById("login-box").classList.toggle("hidden");
  document.getElementById("signup-box").classList.toggle("hidden");
}

function handleSignUp(){
  let u = document.getElementById("signup-username").value;
  let p = document.getElementById("signup-password").value;

  if(!u || !p) return alert("Fill all");

  if(localStorage.getItem(u)){
    alert("User exists");
    return;
  }

  localStorage.setItem(u,p);
  alert("Account created");
  toggleAuth();
}

function handleLogin(){
  let u = document.getElementById("login-username").value;
  let p = document.getElementById("login-password").value;

  let stored = localStorage.getItem(u);

  if(!stored) alert("User not found");
  else if(stored !== p) alert("Wrong password");
  else{
    currentUser = u;
    localStorage.setItem("currentUser",u);
    document.getElementById("userText").textContent=u;
    loadHistory();
    show("start");
  }
}

/* LOGOUT */
document.getElementById("logoutBtn").onclick=()=>{
  localStorage.removeItem("currentUser");
  location.reload();
};

/* HISTORY */
function loadHistory(){
  let data = JSON.parse(localStorage.getItem(currentUser+"_scores")) || [];
  document.getElementById("history").textContent =
    data.length ? "Scores: "+data.join(", ") : "No attempts yet";
}

/* QUESTIONS */
fetch("questions.json")
.then(res=>res.json())
.then(data=>{questions=data.questions;});

/* START */
document.getElementById("startBtn").onclick=()=>{
  selected=[...questions].sort(()=>Math.random()-0.5).slice(0,10);
  answers=Array(10).fill(null);
  current=0;
  show("quiz");
  loadQ();
};

function loadQ(){
  let q=selected[current];
  document.getElementById("progress").textContent=`Q ${current+1}/10`;
  document.getElementById("question").textContent=q.question;

  let html="";
  q.options.forEach((o,i)=>{
    html+=`<div class="option ${answers[current]==i?'selected':''}" onclick="select(${i})">${o}</div>`;
  });

  document.getElementById("options").innerHTML=html;
}

function select(i){
  answers[current]=i;
  loadQ();
}

document.getElementById("nextBtn").onclick=()=>{ if(current<9){current++; loadQ();}};
document.getElementById("prevBtn").onclick=()=>{ if(current>0){current--; loadQ();}};

/* SUBMIT */
document.getElementById("submitBtn").onclick=()=>{
  let correct=0;

  selected.forEach((q,i)=>{
    if(answers[i]==q.correctAnswer) correct++;
  });

  document.getElementById("scoreText").textContent=`Score: ${correct}/10`;

  let data = JSON.parse(localStorage.getItem(currentUser+"_scores")) || [];
  data.push(correct);
  localStorage.setItem(currentUser+"_scores",JSON.stringify(data));

  new Chart(document.getElementById("chart"),{
    type:"doughnut",
    data:{
      labels:["Correct","Wrong"],
      datasets:[{
        data:[correct,10-correct],
        backgroundColor:["green","red"]
      }]
    }
  });

  show("result");
};
