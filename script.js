/* IMPROVED START LOGIC */
startBtn.onclick = () => {
    selectedQuestions = [];
    
    // Group all questions by subject first
    const subjects = Object.keys(allData); 
    
    // Logic: Pick 2 random questions from each subject until we hit 10-15 total
    subjects.forEach(sub => {
        let shuffledSub = allData[sub].sort(() => Math.random() - 0.5);
        selectedQuestions.push(...shuffledSub.slice(0, 2)); 
    });

    // Final shuffle so subjects are mixed up
    selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5).slice(0, 10);

    // Reset states
    answers = Array(selectedQuestions.length).fill(null);
    marked = Array(selectedQuestions.length).fill(false);
    visited = Array(selectedQuestions.length).fill(false);
    current = 0;
    time = 1800;

    show("quiz");
    startTimer();
    loadQ();
};

/* FETCH UPDATE */
let allData = {};
fetch("questions.json")
    .then(res => res.json())
    .then(data => {
        allData = data; // Store the whole 120+ qn object
        // Flatten for any global use if needed
        for (let sub in data) {
            data[sub].forEach(q => {
                q.subject = sub;
                allQuestions.push(q);
            });
        }
    });
