document.addEventListener("DOMContentLoaded", () => {
    // 120 Question Database embedded directly to bypass CORS "Failure"
    const database = {
        "questions": [
            // DSA (15-20 qns)
            { "id": 1, "subject": "DSA", "question": "Worst-case time complexity of Quick Sort?", "options": ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"], "correctAnswer": 2, "marks": 2, "explanation": "Quick Sort degrades to O(n^2) with bad pivot selection." },
            { "id": 2, "subject": "DSA", "question": "Which data structure is used for BFS?", "options": ["Stack", "Queue", "Tree", "Array"], "correctAnswer": 1, "marks": 1, "explanation": "Queue is FIFO, used for Level Order Traversal." },
            // OS (15-20 qns)
            { "id": 3, "subject": "OS", "question": "Which is NOT a deadlock condition?", "options": ["Mutual Exclusion", "Hold & Wait", "Preemption", "Circular Wait"], "correctAnswer": 2, "marks": 1, "explanation": "No-Preemption is the condition; Preemption breaks deadlock." },
            { "id": 4, "subject": "OS", "question": "Belady's Anomaly occurs in?", "options": ["LRU", "Optimal", "FIFO", "MRU"], "correctAnswer": 2, "marks": 2, "explanation": "FIFO page replacement shows this anomaly." },
            // ... (Repeat these patterns to fill 120 qns)
        ]
    };

    // Fill the rest with placeholders for your testing until you paste all 120
    for(let i=5; i<=120; i++) {
        database.questions.push({
            "id": i,
            "subject": "GATE General",
            "question": `Sample GATE Question #${i}: What is the output of a standard logic gate?`,
            "options": ["High", "Low", "Floating", "Depends on Input"],
            "correctAnswer": 3,
            "marks": 1,
            "explanation": "Logic gates process inputs to produce specific outputs."
        });
    }

    let allQuestions = database.questions;
    let selectedQuestions = [];
    let answers = [], marked = [], visited = [];
    let current = 0, time = 1800, timer;

    const startBtn = document.getElementById("startBtn");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const markBtn = document.getElementById("markBtn");
    const submitBtn = document.getElementById("submitBtn");
    const timerEl = document.getElementById("timer");

    // Immediately enable button since data is now internal
    startBtn.textContent = "Start Test";

    function show(id) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    startBtn.onclick = () => {
        selectedQuestions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
        answers = Array(10).fill(null);
        marked = Array(10).fill(false);
        visited = Array(10).fill(false);
        current = 0; time = 1800;
        show("quiz");
        startTimer();
        loadQ();
    };

    function startTimer() {
        timer = setInterval(() => {
            time--;
            let m = Math.floor(time / 60), s = time % 60;
            timerEl.textContent = `${m}:${s < 10 ? "0" : ""}${s}`;
            if (time <= 0) finish();
        }, 1000);
    }

    function loadQ() {
        let q = selectedQuestions[current];
        visited[current] = true;
        document.getElementById("progress").textContent = `Q ${current + 1} / 10`;
        document.getElementById("question").textContent = q.question;
        
        let html = "";
        q.options.forEach((opt, i) => {
            let sel = answers[current] === i ? "selected" : "";
            html += `<div class="option ${sel}" onclick="window.select(${i})">${opt}</div>`;
        });
        document.getElementById("options").innerHTML = html;
        updatePalette();
    }

    window.select = (i) => {
        answers[current] = i;
        loadQ();
    };

    window.go = (i) => { current = i; loadQ(); };

    function updatePalette() {
        let html = "";
        selectedQuestions.forEach((_, i) => {
            let cls = "gray";
            if (marked[i]) cls = "purple";
            else if (answers[i] !== null) cls = "green";
            else if (visited[i]) cls = "red";
            html += `<div class="${cls}" onclick="window.go(${i})">${i + 1}</div>`;
        });
        document.getElementById("palette").innerHTML = html;
    }

    nextBtn.onclick = () => { if (current < 9) { current++; loadQ(); } };
    prevBtn.onclick = () => { if (current > 0) { current--; loadQ(); } };
    markBtn.onclick = () => { marked[current] = !marked[current]; updatePalette(); };
    submitBtn.onclick = finish;

    function finish() {
        clearInterval(timer);
        show("result");
        let score = 0;
        selectedQuestions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) score += q.marks;
            else if (answers[i] !== null) score -= (q.marks * 0.33);
        });
        document.getElementById("scoreText").textContent = `${Math.max(0, score.toFixed(2))} / 20`;
    }

    document.getElementById("restartBtn").onclick = () => location.reload();
});
