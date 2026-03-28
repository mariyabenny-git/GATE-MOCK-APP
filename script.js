document.addEventListener("DOMContentLoaded", () => {
    const database = [
        { "id": 1, "subject": "DSA", "question": "Worst-case time complexity of Quick Sort?", "options": ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"], "correctAnswer": 2, "marks": 2, "explanation": "Quick Sort degrades to O(n^2) when the pivot selection is poor (e.g., already sorted array)." },
        { "id": 2, "subject": "OS", "question": "Which scheduling algorithm is non-preemptive?", "options": ["Round Robin", "SRTF", "FCFS", "Priority"], "correctAnswer": 2, "marks": 1, "explanation": "First-Come-First-Served (FCFS) executes processes in order without interruption." },
        { "id": 3, "subject": "DBMS", "question": "What does the 'I' in ACID stand for?", "options": ["Index", "Inconsistency", "Isolation", "Integration"], "correctAnswer": 2, "marks": 1, "explanation": "Isolation ensures transactions execute as if they are the only ones in the system." },
        { "id": 4, "subject": "Networks", "question": "Which layer handles IP addressing?", "options": ["Data Link", "Physical", "Network", "Transport"], "correctAnswer": 2, "marks": 1, "explanation": "The Network layer is responsible for logical addressing and routing." },
        { "id": 5, "subject": "Digital", "question": "Output of AND gate for High/High inputs?", "options": ["High", "Low", "Floating", "High-Z"], "correctAnswer": 0, "marks": 1, "explanation": "AND gate is only High if ALL inputs are High." },
        { "id": 6, "subject": "Maths", "question": "The sum of a matrix and its transpose is always?", "options": ["Symmetric", "Identity", "Diagonal", "Skew-Symmetric"], "correctAnswer": 0, "marks": 1, "explanation": "(A + A')' = A' + A, which is the definition of a symmetric matrix." },
        { "id": 7, "subject": "TOC", "question": "Regular languages are closed under?", "options": ["Union", "Intersection", "Kleene Star", "All of these"], "correctAnswer": 3, "marks": 1, "explanation": "Regular languages have strong closure properties across most operations." },
        { "id": 8, "subject": "COA", "question": "Fastest memory in a computer?", "options": ["RAM", "Cache", "Register", "Disk"], "correctAnswer": 2, "marks": 1, "explanation": "Registers are CPU-internal and the fastest storage available." },
        { "id": 9, "subject": "Compiler", "question": "Which phase creates a Syntax Tree?", "options": ["Lexical", "Syntax Analysis", "Semantic", "Optimization"], "correctAnswer": 1, "marks": 1, "explanation": "The Parser (Syntax Analysis) builds the tree structure from tokens." },
        { "id": 10, "subject": "Aptitude", "question": "Next term: 2, 6, 12, 20, ?", "options": ["24", "28", "30", "36"], "correctAnswer": 2, "marks": 1, "explanation": "Pattern: +4, +6, +8, +10. So 20 + 10 = 30." }
    ];

    let selectedQuestions = [], answers = [], marked = [], visited = [];
    let current = 0, time = 600, timer; // 10 Minutes

    const startBtn = document.getElementById("startBtn");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const markBtn = document.getElementById("markBtn");
    const submitBtn = document.getElementById("submitBtn");

    function show(id) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    startBtn.onclick = () => {
        selectedQuestions = [...database].sort(() => 0.5 - Math.random());
        answers = Array(10).fill(null); marked = Array(10).fill(false); visited = Array(10).fill(false);
        show("quiz"); startTimer(); loadQ();
    };

    function startTimer() {
        timer = setInterval(() => {
            time--;
            let m = Math.floor(time / 60), s = time % 60;
            document.getElementById("timer").textContent = `${m}:${s < 10 ? "0" : ""}${s}`;
            if (time <= 0) finish();
        }, 1000);
    }

    function loadQ() {
        let q = selectedQuestions[current];
        visited[current] = true;
        document.getElementById("progress").textContent = `Question ${current + 1} / 10`;
        document.getElementById("subject-tag").textContent = q.subject;
        document.getElementById("question").textContent = q.question;
        document.getElementById("solution-box").style.display = "none";

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
        // Show solution immediately for practice
        document.getElementById("solution-text").textContent = selectedQuestions[current].explanation;
        document.getElementById("solution-box").style.display = "block";
    };

    window.go = (i) => { current = i; loadQ(); };

    function updatePalette() {
        let html = "";
        selectedQuestions.forEach((_, i) => {
            let cls = "gray"; // Dim (Unselected)
            if (marked[i]) cls = "purple"; // Marked/Unfinished
            else if (answers[i] !== null) cls = "bright-green"; // Finished
            else if (visited[i]) cls = "purple"; // Unfinished/Visited
            html += `<div class="${cls}" onclick="window.go(${i})">${i + 1}</div>`;
        });
        document.getElementById("palette").innerHTML = html;
    }

    nextBtn.onclick = () => { if (current < 9) { current++; loadQ(); } };
    prevBtn.onclick = () => { if (current > 0) { current--; loadQ(); } };
    markBtn.onclick = () => { marked[current] = !marked[current]; updatePalette(); };
    submitBtn.onclick = finish;

    function finish() {
        clearInterval(timer); show("result");
        let score = 0;
        selectedQuestions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) score += q.marks;
            else if (answers[i] !== null) score -= 0.33;
        });
        document.getElementById("scoreText").textContent = `Score: ${score.toFixed(2)} / 10`;
    }

    document.getElementById("restartBtn").onclick = () => location.reload();
});
