document.addEventListener("DOMContentLoaded", () => {
    let allQuestions = [], selectedQuestions = [];
    let answers = [], marked = [], visited = [];
    let current = 0, time = 1800, timer;

    const startBtn = document.getElementById("startBtn");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const markBtn = document.getElementById("markBtn");
    const submitBtn = document.getElementById("submitBtn");
    const timerEl = document.getElementById("timer");

    // LOAD DATA
    fetch("questions.json")
        .then(res => res.json())
        .then(data => {
            // Flexible loader for both flat and nested JSON
            allQuestions = data.questions || [];
            if (data.subjects) {
                data.subjects.forEach(s => s.questions.forEach(q => {
                    q.subject = s.name;
                    allQuestions.push(q);
                }));
            }
            startBtn.textContent = "Start Test";
        });

    function show(id) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    startBtn.onclick = () => {
        if (allQuestions.length === 0) return alert("Still loading questions...");
        
        // Pick 10 random
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
        document.getElementById("subject-tag").textContent = q.subject || "GATE CSE";
        document.getElementById("question").textContent = q.question;
        document.getElementById("feedback-area").innerHTML = "";

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
        loadQ(); // Re-render to show selected class
        
        // Optional: Instant Feedback for "Practice Mode" credibility
        let q = selectedQuestions[current];
        let correct = i === q.correctAnswer;
        document.getElementById("feedback-area").innerHTML = `
            <p style="margin-top:15px; color:${correct ? '#4ade80' : '#fb7185'}">
                ${correct ? "Correct!" : "Incorrect."} ${q.explanation || ""}
            </p>`;
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

    if (nextBtn) nextBtn.onclick = () => { if (current < 9) { current++; loadQ(); } };
    if (prevBtn) prevBtn.onclick = () => { if (current > 0) { current--; loadQ(); } };
    if (markBtn) markBtn.onclick = () => { marked[current] = !marked[current]; updatePalette(); };
    if (submitBtn) submitBtn.onclick = finish;

    function finish() {
        clearInterval(timer);
        show("result");
        let score = 0;
        selectedQuestions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) score += q.marks;
            else if (answers[i] !== null) score -= (q.marks * 0.33); // Negative marking
        });
        let percent = Math.round((score / 20) * 100);
        document.getElementById("scoreText").textContent = `${percent}%`;
        document.getElementById("rankText").textContent = percent > 70 ? "Qualified for Mock Elite" : "Needs Practice";
    }

    document.getElementById("restartBtn").onclick = () => location.reload();
    document.getElementById("exitBtn").onclick = () => location.reload();
});
