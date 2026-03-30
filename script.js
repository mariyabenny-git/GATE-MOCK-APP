// 1. DUMMY DATA (Simulating GATE questions)
const quizData = [
  {
    question: "OSI Layer responsible for node-to-node reliability?",
    options: ["Physical", "Network", "Transport", "Data Link"],
    correct: 3 // Data Link is node-to-node (Transport is end-to-end)
  },
  {
    question: "Thrashing means?",
    options: ["Excess paging", "Deadlock state", "CPU idling", "Memory full"],
    correct: 0
  },
  {
    question: "Which model has the highest computational power?",
    options: ["Finite Automata", "Pushdown Automata", "Turing Machine", "Linear Bounded"],
    correct: 2
  }
];

// 2. APP STATE
let currentQuestionIndex = 0;
let userAnswers = new Array(quizData.length).fill(null);
let currentUsername = "";

// 3. DOM ELEMENTS
const authScreen = document.getElementById('auth');
const startScreen = document.getElementById('start');
const quizScreen = document.getElementById('quiz');
const resultScreen = document.getElementById('result');

// 4. NAVIGATION FUNCTION
function showScreen(screen) {
  [authScreen, startScreen, quizScreen, resultScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// 5. AUTHENTICATION LOGIC
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
  alert("Account created! Logging you in...");
  loginUser(user);
};

document.getElementById('loginBtn').onclick = () => {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  const storedPass = localStorage.getItem(user);
  
  if (storedPass && storedPass === pass) {
    loginUser(user);
  } else {
    alert("Invalid credentials!");
  }
};

function loginUser(username) {
  currentUsername = username;
  document.getElementById('userText').innerText = username;
  document.getElementById('logoutBtn').classList.remove('hidden');
  showScreen(startScreen);
}

document.getElementById('logoutBtn').onclick = () => location.reload();

// 6. QUIZ LOGIC
document.getElementById('startBtn').onclick = () => {
  currentQuestionIndex = 0;
  userAnswers.fill(null);
  showScreen(quizScreen);
  loadQuestion();
};

function loadQuestion() {
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
      loadQuestion(); // Refresh styles to show selected
    };
    
    optionsDiv.appendChild(btn);
  });
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

document.getElementById('submitBtn').onclick = () => {
  let score = 0;
  let skipped = 0;
  
  quizData.forEach((q, i) => {
    if (userAnswers[i] === q.correct) score++;
    else if (userAnswers[i] === null) skipped++;
  });
  
  const wrong = quizData.length - score - skipped;
  
  document.getElementById('scoreText').innerText = `You scored ${score} out of ${quizData.length}`;
  showScreen(resultScreen);
  drawChart(score, wrong, skipped);
};

document.getElementById('restartBtn').onclick = () => showScreen(startScreen);

// 7. CHART.JS INTEGRATION
function drawChart(correct, wrong, skipped) {
  const ctx = document.getElementById('chart').getContext('2d');
  
  // Destroy old chart instance if existing to prevent overlaps
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
      plugins: {
        legend: { position: 'bottom', labels: { color: '#f0f6fc' } }
      }
    }
  });
}
;
