const quizData = [
  { question: "OSI Layer responsible for node-to-node reliability?", options: ["Physical", "Network", "Transport", "Data Link"], correct: 3 },
  { question: "Thrashing means?", options: ["Excess paging", "Deadlock state", "CPU idling", "Memory full"], correct: 0 },
  { question: "Which model has the highest computational power?", options: ["Finite Automata", "Pushdown Automata", "Turing Machine", "Linear Bounded"], correct: 2 }
];

// STATE VARIABLES
let currentQuestionIndex = 0;
let userAnswers = new Array(quizData.length).fill(null);
let timePerQuestion = 30; // Seconds allowed per question
let timeLeft = timePerQuestion;
let timerInterval = null;
let currentUsername = "";

// NAVIGATION
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// AUTH
document.getElementById('toSignup').onclick = () => {
  document.getElementById('login-box').classList.add('hidden');
  document.getElementById('signup-box').classList.remove('hidden');
};

document.getElementById('toLogin').onclick = () => {
  document.getElementById('signup-box').classList.add('hidden');
  document.getElementById('login-box').classList.remove('hidden');
};

document.getElementById('signupBtn').onclick = () => {
  const user = document.getElementById('signup-username').value.trim();
  const pass = document.getElementById('signup-password').value.trim();
  if (!user || !pass) return alert("Fill all fields");
  localStorage.setItem(user, pass);
  loginUser(user);
};

document.getElementById('loginBtn').onclick = () => {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  const storedPass = localStorage.getItem(user);
  
  if (storedPass && storedPass === pass) loginUser(user);
  else alert("Invalid credentials!");
};

function loginUser(username) {
  currentUsername = username;
  document.getElementById('userText').innerText = username;
  document.getElementById('logoutBtn').classList.remove('hidden');
  showScreen('start');
}

document.getElementById('logoutBtn').onclick = () => location.reload();

// QUIZ & TIMER
document.getElementById('startBtn').onclick = () => {
  currentQuestionIndex = 0;
  userAnswers.fill(null);
  showScreen('quiz');
  loadQuestion();
};

function loadQuestion() {
  clearInterval(timerInterval); // Stop previous question's clock
  timeLeft = timePerQuestion;   // Reset clock
  updateTimerUI();

  const currentData = quizData[currentQuestionIndex];
  document.getElementById('progress').innerText = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
  document.getElementById('question').innerText = currentData.question;
  
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = "";
  
  currentData.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    if (userAnswers[currentQuestionIndex] === index) btn.classList.add('selected');
    btn.innerText = option;
    
    btn.onclick = () => {
      userAnswers[currentQuestionIndex] = index;
      loadQuestion(); // Refresh visual selection
    };
    optionsDiv.appendChild(btn);
  });

  // Start the ticking clock for THIS question
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      moveToNextQuestion(); // Auto-skips when time expires
    }
  }, 1000);
}

function updateTimerUI() {
  document.getElementById('timer-text').innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
  const percentage = (timeLeft / timePerQuestion) * 100;
  document.getElementById('timer-bar').style.width = `${percentage}%`;
  
  // Visual alert: Turn bar red when under 10 seconds
  document.getElementById('timer-bar').style.backgroundColor = timeLeft <= 10 ? 'var(--danger)' : 'var(--accent)';
}

function moveToNextQuestion() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    clearInterval(timerInterval);
    alert("Time ran out for the final question! Please submit.");
  }
}

document.getElementById('prevBtn').onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
};

document.getElementById('nextBtn').onclick = () => {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
};

// SKIP BUTTON FUNCTIONALITY
document.getElementById('skipBtn').onclick = () => {
  userAnswers[currentQuestionIndex] = null; // Forces "skipped" state
  moveToNextQuestion();
};

// SUBMIT & CHARTS
document.getElementById('submitBtn').onclick = () => {
  clearInterval(timerInterval);
  let score = 0;
  let skipped = 0;
  
  quizData.forEach((q, i) => {
    if (userAnswers[i] === q.correct) score++;
    else if (userAnswers[i] === null) skipped++;
  });
  
  const wrong = quizData.length - score - skipped;
  document.getElementById('scoreText').innerText = `You scored ${score} out of ${quizData.length}`;
  showScreen('result');
  
  drawDoughnutChart(score, wrong, skipped);
  drawLeaderboardChart(score);
};

function drawDoughnutChart(correct, wrong, skipped) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (window.myChart) window.myChart.destroy();
  
  window.myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Correct', 'Wrong', 'Skipped'],
      datasets: [{
        data: [correct, wrong, skipped],
        backgroundColor: ['#2ea44f', '#da363c', '#8b949e'],
        borderColor: '#161b22',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { color: '#f0f6fc' } } }
    }
  });
}

// 8. SIMULATED PEER COMPARISON LEADERBOARD
function drawLeaderboardChart(userScore) {
  const ctx = document.getElementById('leaderboardChart').getContext('2d');
  if (window.leaderboard) window.leaderboard.destroy();

  // Simulated peer data
  const peers = [
    { name: "Arjun", mark: 3 },
    { name: "Sneha", mark: 2 },
    { name: "Rahul", mark: 1 }
  ];

  // Add current user to list and sort
  peers.push({ name: currentUsername, mark: userScore });
  peers.sort((a, b) => b.mark - a.mark);

  const labels = peers.map(p => p.name);
  const marks = peers.map(p => p.mark);

  window.leaderboard = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Marks Scored',
        data: marks,
        // Highlighting current user in purple, peers in gray
        backgroundColor: labels.map(l => l === currentUsername ? '#7c4dff' : '#30363d'),
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#8b949e', stepSize: 1 },
          grid: { color: '#21262d' }
        },
        x: {
          ticks: { color: '#8b949e' },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false } // Hide label box
      }
    }
  });
}

document.getElementById('restartBtn').onclick = () => showScreen('start');
