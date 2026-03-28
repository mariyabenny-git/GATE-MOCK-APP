let allData = null;
let currentMock = [];
let userAnswers = [];
let markedForReview = [];
let visited = [];
let currentIdx = 0;
let timerSeconds = 1800;
let timerInterval;

// Select Elements
const startBtn = document.getElementById('startBtn');
const qText = document.getElementById('q-text');
const optionsContainer = document.getElementById('q-options');
const palette = document.getElementById('palette-grid');

// 1. Fetch JSON Data Safely
fetch('questions.json')
    .then(res => res.json())
    .then(data => {
        allData = data;
        startBtn.disabled = false;
        startBtn.innerText = "Start Mock Test";
    })
    .catch(err => startBtn.innerText = "Data Error");

// 2. Randomize: Pick 1-2 random questions from every category
function setupMockTest() {
    currentMock = [];
    for (let category in allData) {
        let categoryPool = allData[category].sort(() => 0.5 - Math.random());
        // Pick 2 from each category
        currentMock.push(...categoryPool.slice(0, 2));
    }
    // Shuffle the final 10-15 questions and limit to 10
    currentMock = currentMock.sort(() => 0.5 - Math.random()).slice(0, 10);
    
    // Reset states
    userAnswers = Array(currentMock.length).fill(null);
    markedForReview = Array(currentMock.length).fill(false);
    visited = Array(currentMock.length).fill(false);
    currentIdx = 0;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// 3. App Logic
startBtn.onclick = () => {
    setupMockTest();
    showScreen('quiz-screen');
    startTimer();
    renderQuestion();
};

function renderQuestion() {
    visited[currentIdx] = true;
    const q = currentMock[currentIdx];
    
    document.getElementById('q-progress').innerText = `Question ${currentIdx + 1}/10`;
    document.getElementById('q-subject').innerText = q.subject || "";
    qText.innerText = q.question;
    
    optionsContainer.innerHTML = q.options.map((opt, i) => `
        <div class="option ${userAnswers[currentIdx] === i ? 'selected' : ''}" 
             onclick="handleAnswer(${i})">
            ${opt}
        </div>
    `).join('');
    
    renderPalette();
}

window.handleAnswer = (i) => {
    userAnswers[currentIdx] = i;
    renderQuestion();
};

function renderPalette() {
    palette.innerHTML = currentMock.map((_, i) => {
        let status = "gray";
        if (markedForReview[i]) status = "purple";
        else if (userAnswers[i] !== null) status = "green";
        else if (visited[i]) status = "red";
        return `<div class="${status}" onclick="jumpTo(${i})">${i + 1}</div>`;
    }).join('');
}

window.jumpTo = (i) => { currentIdx = i; renderQuestion(); };

// Navigation
document.getElementById('nextBtn').onclick = () => { if(currentIdx < 9) { currentIdx++; renderQuestion(); } };
document.getElementById('prevBtn').onclick = () => { if(currentIdx > 0) { currentIdx--; renderQuestion(); } };
document.getElementById('markBtn').onclick = () => { markedForReview[currentIdx] = !markedForReview[currentIdx]; renderPalette(); };

// 4. Timer & Result
function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds--;
        let m = Math.floor(timerSeconds / 60);
        let s = timerSeconds % 60;
        document.getElementById('timer').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (timerSeconds <= 0) finalizeTest();
    }, 1000);
}

document.getElementById('submitBtn').onclick = finalizeTest;

function finalizeTest() {
    clearInterval(timerInterval);
    showScreen('result-screen');
    
    let score = 0;
    currentMock.forEach((q, i) => {
        if (userAnswers[i] === q.correctAnswer) score += (q.marks || 1);
    });

    const percent = Math.round((score / 20) * 100);
    document.getElementById('score-circle').innerText = `${percent}%`;
    document.getElementById('analysis-report').innerHTML = `
        <p>Total Correct: ${score / 2} questions</p>
        <p>Current Rank: ${percent > 70 ? 'Gold' : 'Silver'} League</p>
    `;
}

document.getElementById('restartBtn').onclick = () => location.reload();
document.getElementById('exitBtn').onclick = () => location.reload();
