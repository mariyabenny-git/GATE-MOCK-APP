let allQuestions = [];
let selectedQuestions = [];
let answers = Array(10).fill(null);
let marked = Array(10).fill(false);
let visited = Array(10).fill(false);
let current = 0;
let time = 1800;
let timer;

// DOM Elements
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const markBtn = document.getElementById("markBtn");
const submitBtn = document.getElementById("submitBtn");

/* LOAD QUESTIONS */
fetch("questions.json")
    .then(res => res.json())
    .then(data => {
        for (let subject in data) {
            data[subject].forEach(q => {
                q.subject = subject;
                allQuestions.push(q);
            });
        }
    });

function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

startBtn.onclick = () => {
    selectedQuestions = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    show("quiz");
    startTimer();
    loadQ();
};

function startTimer() {
    timer = setInterval(() => {
        time--;
        let m = Math.floor(time / 60);
        let s = time % 60;
        document.getElementById("timer").textContent = `${m}:${s < 10 ? "0" : ""}${s}`;
        if (time <= 0) finish();
    }, 1000);
}

function loadQ() {
    visited[current] = true;
    let q = selectedQuestions[current];
    document.getElementById("progress").textContent = `Question ${current + 1} of 10`;
    document.getElementById("question").textContent = q.question;

    let html = "";
    q.options.forEach((opt, i) => {
        html += `<div class="option ${answers[current] === i ? 'selected' : ''}" onclick="selectOption(${i})">${opt}</div>`;
    });
    document.getElementById("options").innerHTML = html;
    updatePalette();
}

window.selectOption = (i) => {
    answers[current] = i;
    loadQ();
};

function updatePalette() {
    let html = "";
    for (let i = 0; i < 10; i++) {
        let cls = "gray";
        if (marked[i]) cls = "purple";
        else if (answers[i] !== null) cls = "green";
        else if (visited[i]) cls = "red";
        html += `<div class="${cls}" onclick="jumpTo(${i})">${i + 1}</div>`;
    }
    document.getElementById("palette").innerHTML = html;
}

window.jumpTo = (i) => { current = i; loadQ(); };
nextBtn.onclick = () => { if (current < 9) { current++; loadQ(); } };
prevBtn.onclick = () => { if (current > 0) { current--; loadQ(); } };
markBtn.onclick = () => { marked[current] = !marked[current]; updatePalette(); };
submitBtn.onclick = finish;

function finish() {
    clearInterval(timer);
    show("result");
    let score = 0;
    let stats = {};

    selectedQuestions.forEach((q, i) => {
        if (!stats[q.subject]) stats[q.subject] = { correct: 0, total: 0 };
        stats[q.subject].total++;
        if (answers[i] === q.correctAnswer) {
            score += q.marks;
            stats[q.subject].correct++;
        }
    });

    document.getElementById("scoreText").innerHTML = `Final Score: <strong>${score} / 20</strong>`;
    
    let analysisHtml = "<h3>Subject Analysis</h3>";
    for (let sub in stats) {
        let perc = Math.round((stats[sub].correct / stats[sub].total) * 100);
        analysisHtml += `<p>${sub}: ${perc}% Correct</p>`;
    }
    document.getElementById("analysis").innerHTML = analysisHtml;
}

document.getElementById("restartBtn").onclick = () => location.reload();
document.getElementById("exitBtn").onclick = () => location.reload();
