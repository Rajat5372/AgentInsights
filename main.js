function shuffleOptions(optionsArray) {
    var options = [...optionsArray];

    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
}

function shuffleQuestions(questionsArray) {
    var questions = [...questionsArray];

    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];

        questions[i].options = shuffleOptions(questions[i].options);
    }

    return questions;
}

class QuizClass {
    questions = [];
    answers = [];

    maxSections = 0;
    score = 0;

    init(questions) {
        this.questions = questions;
        this.answers = new Array(questions.length).fill(-1);
        this.maxSections = questions.length - 1;
    }

    updateAnswers(questionIndex, answerIndex) {
        this.answers[questionIndex] = answerIndex;
    }

    calculateFilledSections() {
        return this.answers.filter(answer => answer !== -1).length;
    }

    calculateScore() {
        this.answers.forEach((answer, index) => {
            if (answer === -1) return;

            const option = this.questions[index].options[answer];
            const selectedAnswer = this.questions[index].answer;

            if (option === selectedAnswer) this.score++;
        });
    }
}

const Quiz = new QuizClass();
currentSection = 0;

function translateToTarget(target) {
    currentSection = target;
    translateSections(target);
}

function translateSections(target) {
    animateToTarget(target);
    toggleButtons();
    updateProgressBar();
}

function animateToTarget(target) {
    const container = document.getElementsByClassName("sections-container").item(0);
    container.style.transition = "transform 0.5s ease-in-out";
    container.style.transform = `translateY(-${target * 100}vh)`;
    setTimeout(() => { container.style.transition = "none" }, 500);
}

function toggleButtons() {
    if (currentSection === 0) {
        document.getElementById("prev").disabled = true;
    }
    else if (currentSection === Quiz.maxSections) {
        document.getElementById("next").disabled = true;
    }
    else {
        document.getElementById("prev").disabled = false;
        document.getElementById("next").disabled = false;
    }
}

function updateProgressBar() {
    const progressBar = document.getElementsByClassName("progress").item(0);
    const progress = (Quiz.calculateFilledSections() / (Quiz.maxSections + 1)) * 100;
    progressBar.style.width = `${progress}vw`;
}

function proceed() {
    translateToTarget(currentSection + 1);
}

function back() {
    translateToTarget(currentSection - 1);
}

function generateSectionBody(question, questionIndex, options, last) {
    var body = `
    <div class="section">
        <h3 class="question">${questionIndex + 1}. ${question}</h3>
        <div class="options-group">
    `;

    options.forEach((option, optionIndex) => {
        body += `
            <div class="option">
                <label onclick="handleSelection(${questionIndex}, ${optionIndex})">
                    <input type="radio" name="option-${questionIndex}" value="${option}">
                    <span id="option-text">${option}</span>
                </label>
            </div>
        `;
    });

    body += `
        </div>
        <button id="clear" onclick="handleClear(${questionIndex})" disabled>Clear</button>
        <input id="continue" type="submit" value="${last ? 'Submit' : 'Continue'}" disabled onclick="handleContinue(${questionIndex}, ${last})">
    </div>
    `;

    return body;
}

function handleClear(questionIndex) {
    Quiz.updateAnswers(questionIndex, -1);
    updateProgressBar();

    document.getElementsByClassName("section").item(questionIndex).getElementsByTagName("input").item(4).disabled = true;
    document.getElementsByClassName("section").item(questionIndex).getElementsByTagName("button").item(0).disabled = true;

    const options = document.getElementsByClassName("section").item(questionIndex).getElementsByTagName("input");
    for (var i = 0; i < options.length; i++) options.item(i).checked = false;
}

function handleSelection(questionIndex, optionIndex) {
    Quiz.updateAnswers(questionIndex, optionIndex);

    document.getElementsByClassName("section").item(questionIndex).getElementsByTagName("input").item(4).disabled = false;
    document.getElementsByClassName("section").item(questionIndex).getElementsByTagName("button").item(0).disabled = false;
}

function handleContinue(questionIndex, last) {
    if (last) {
        const incompleteQuestionIndex = Quiz.answers.findIndex(answer => answer === -1);
        if (incompleteQuestionIndex !== -1) {
            translateToTarget(incompleteQuestionIndex);
            return;
        }

        handleSubmit();
    }

    proceed();
}

function handleSubmit() {
    Quiz.calculateScore();
    setTimeout(() => displayResults(), 500);
}

function displayResults() {
    const sections = document.getElementsByClassName("sections-container").item(0);
    sections.style.display = "none";

    const bottomnav = document.getElementsByClassName("bottom-nav").item(0);
    bottomnav.style.display = "none";

    const results = document.getElementsByClassName("results").item(0);
    results.style.display = "flex";

    const result = document.getElementById("result");
    result.innerHTML = `Score ${Quiz.score} <small>/</small> ${Quiz.maxSections + 1} Points`;
}

function restart() {
    window.location.reload();
}

function generateQuestions(questions) {
    const sectionContainer = document.getElementsByClassName("sections-container").item(0);
    sectionContainer.innerHTML = "";

    questions.forEach((question, index) => {
        sectionContainer.innerHTML += generateSectionBody(question.question, index, question.options, last = (index === questions.length - 1));
    });
}

function initialiseQuiz(questionsArray) {
    const questions = shuffleQuestions(questionsArray);

    Quiz.init(questions);
    generateQuestions(questions);

    toggleButtons();
}

const questionsJSON = [
    {
        question: "What is the capital of India?",
        options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
        answer: "New Delhi"
    },
    {
        question: "What is the capital of Maharashtra?",
        options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
        answer: "Mumbai"
    },
    {
        question: "What is the capital of West Bengal?",
        options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
        answer: "Kolkata"
    },
    {
        question: "What is the capital of Tamil Nadu?",
        options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
        answer: "Chennai"
    },
];

initialiseQuiz(questionsJSON);