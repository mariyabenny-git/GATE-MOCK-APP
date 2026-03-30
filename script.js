// 1. HARDCODED QUIZ DATA (Fixes local fetch protocol failures)
const quizData = [
  { "question": "Which layer of the OSI model is responsible for node-to-node delivery of a frame?", "options": ["Physical", "Network", "Transport", "Data Link"], "correct": 3 },
  { "question": "In Operating Systems, 'Thrashing' is primarily caused by which of the following?", "options": ["High CPU utilization", "Lack of memory & excessive paging", "Deadlock state", "Too many I/O devices"], "correct": 1 },
  { "question": "Which model/machine has the highest computational power?", "options": ["Finite Automata", "Pushdown Automata", "Turing Machine", "Linear Bounded"], "correct": 2 },
  { "question": "In a relational database, which normal form deals with transitive dependencies?", "options": ["1NF", "2NF", "3NF", "BCNF"], "correct": 2 },
  { "question": "Which data structure is typically used by the compiler to check for balanced parentheses?", "options": ["Queue", "Stack", "Tree", "Array"], "correct": 1 },
  { "question": "What is the time complexity to find the shortest path using Dijkstra's algorithm with a binary heap?", "options": ["O(V^2)", "O(E log V)", "O(V log E)", "O(E + V)"], "correct": 1 },
  { "question": "In the TCP/IP suite, which protocol is used to map a known IP address to a MAC address?", "options": ["RARP", "DHCP", "ARP", "DNS"], "correct": 2 },
  { "question": "An operating system uses the Banker's algorithm. What is it primarily used for?", "options": ["Deadlock Prevention", "Deadlock Avoidance", "Deadlock Detection", "Memory Allocation"], "correct": 1 },
  { "question": "Which of the following problems is known to be undecidable?", "options": ["Membership for regular languages", "The Halting Problem for Turing machines", "Finiteness for context-free languages", "Emptiness for finite automata"], "correct": 1 },
  { "question": "What is the maximum number of nodes in a binary tree of height 'h'? (Assume root is at height 0)", "options": ["2^h", "2^(h+1) - 1", "2^h - 1", "h^2"], "correct": 1 }
];

// STATE VARIABLES
let currentQuestionIndex = 0;
let userAnswers = new Array(quizData.length).fill(null);
let timeLeft = 30;
let timerInterval = null;
let currentUsername = "";

// Helper to update screens
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// 2. AUTHENTICATION SYSTEM
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

  // Create user profile in localStorage
  const userData = { password: pass, history: [] };
  localStorage.setItem(`user_${user}`, JSON.stringify(userData));
  alert("Account created! Please log in.");
  document.getElementById('toLogin').click();
};

document.getElementById('loginBtn').onclick = () => {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  const storedUser = localStorage.getItem(`user_${user}`);
  
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.password === pass) {
      currentUsername = user;
      loadDashboard();
    } else { alert("Incorrect password!"); }
  } else { alert("User not found!"); }
};

document.getElementById('logoutBtn').onclick = () => location.reload();

// 3. PERSONALIZED USER EXPERIENCE & HISTORY
function loadDashboard() {
  document.getElementById('userText').innerText = currentUsername;
  document.getElementById('logoutBtn').classList.remove('hidden');
  
  const userData = JSON.parse(localStorage.getItem(`user_${currentUsername}`));
  const historyDiv = document.getElementById('history-section');
  
  if (userData.history && userData.history.length > 0) {
    historyDiv.innerHTML = `<strong>Your Past Scores:</strong> ${userData.history.join(', ')}`;
  } else {
    historyDiv.innerHTML = "No past scores yet. Take your first test!";
  }
  
  showScreen('start');
}

// 4. QUIZ ENGINE & NAVIGATION
document.getElementById('startBtn').onclick = () => {
  currentQuestionIndex = 0;
  userAnswers.fill(null);
  showScreen('quiz');
  loadQuestion();
};

function loadQuestion() {
  clearInterval(timerInterval);
  timeLeft = 30;
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
    
    // ANSWER SELECTION SYSTEM
    btn.onclick = () => {
      userAnswers[currentQuestionIndex] = index;
      loadQuestion(); // Refresh to highlight selection
    };
    optionsDiv.appendChild(btn);
  });

  // Per-Question Timer
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      moveToNext();
    }
  }, 1000);
}

function updateTimerUI() {
  document.getElementById('timer-text').innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
  const percentage = (timeLeft / 30) * 100;
  document.getElementById('timer-bar').style.width = `${percentage}%`;
  document.getElementById('timer-bar').style.backgroundColor = timeLeft <= 10 ? 'var(--danger)' : 'var(--accent)';
}

function moveToNext() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  } else {
    clearInterval(timerInterval);
    alert("Test complete! Please hit submit.");
  }
}

document.getElementById('prevBtn').onclick = () => {
  if (currentQuestionIndex > 0) { currentQuestionIndex--; loadQuestion(); }
};

document.getElementById('nextBtn').onclick = moveToNext;

// 5. SUBMIT & ANALYTICS DASHBOARD
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
  
  // Save score to user history
  const userData = JSON.parse(localStorage.getItem(`user_${currentUsername}`));
  userData.history.push(score);
  localStorage.setItem(`user_${currentUsername}`, JSON.stringify(userData));
  
  showScreen('result');
  drawDoughnutChart(score, wrong, skipped);
  drawLeaderboardChart(score);
};

// CHART JS 1: Performance
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
        borderColor: '#161b22', borderWidth: 2
      }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#f0f6fc' } } } }
  });
}

// CHART JS 2: AIR Mock Leaderboard Prediction
function drawLeaderboardChart(userScore) {
  const ctx = document.getElementById('leaderboardChart').getContext('2d');
  if (window.leaderboard) window.leaderboard.destroy();

  // Mock peers data
  const peers = [ { name: "Arjun", mark: 8 }, { name: "Sneha", mark: 6 }, { name: "Rahul", mark: 4 } ];
  peers.push({ name: currentUsername, mark: userScore });
  peers.sort((a, b) => b.mark - a.mark);

  const labels = peers.map(p => p.name);
  const marks = peers.map(p => p.mark);

  window.leaderboard = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Marks',
        data: marks,
        backgroundColor: labels.map(l => l === currentUsername ? '#7c4dff' : '#30363d'),
        borderRadius: 5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { color: '#8b949e' }, grid: { color: '#21262d' } },
        x: { ticks: { color: '#8b949e' }, grid: { display: false } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

document.getElementById('restartBtn').onclick = () => loadDashboard();
