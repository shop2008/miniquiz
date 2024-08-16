let quizData;
let currentQuestion = 0;

// Generate a random question based on the difficulty level
function generateRandomQuestion(difficulty) {
  // Define operators and data types available for each difficulty level
  const operators = {
    easy: ["+", "-"],
    medium: ["+", "-", "*", "/", "%"],
    hard: ["+", "-", "*", "/", "%", "++", "--", "+=", "-=", "*=", "/="],
  };
  const dataTypes = {
    easy: ["number"],
    medium: ["number", "string", "boolean"],
    hard: ["number", "string", "boolean", "null", "undefined"],
  };

  // Select operators and data types based on the given difficulty
  const availableOperators = operators[difficulty];
  const availableDataTypes = dataTypes[difficulty];

  // Randomly choose an operator and data types for the question
  const operator =
    availableOperators[Math.floor(Math.random() * availableOperators.length)];
  const dataType1 =
    availableDataTypes[Math.floor(Math.random() * availableDataTypes.length)];
  const dataType2 =
    availableDataTypes[Math.floor(Math.random() * availableDataTypes.length)];

  let value1 = generateRandomValue(dataType1);
  let value2 = generateRandomValue(dataType2);

  let question, correctAnswer;

  if (operator === "++" || operator === "--") {
    question = `What is the result of: let x = ${value1}; x${operator};`;
    let x = value1;
    correctAnswer = operator === "++" ? x++ : x--;
  } else if (operator.endsWith("=")) {
    question = `What is the value of x after: let x = ${value1}; x ${operator} ${value2};`;
    let x = value1;
    switch (operator) {
      case "+=":
        x += value2;
        break;
      case "-=":
        x -= value2;
        break;
      case "*=":
        x *= value2;
        break;
      case "/=":
        x /= value2;
        break;
    }
    correctAnswer = x;
  } else {
    question = `What is the result of ${value1} ${operator} ${value2}?`;
    let x = value1;
    let y = value2;
    switch (operator) {
      case "+":
        correctAnswer = x + y;
        break;
      case "-":
        correctAnswer = x - y;
        break;
      case "*":
        correctAnswer = x * y;
        break;
      case "/":
        correctAnswer = x / y;
        break;
      case "%":
        correctAnswer = x % y;
        break;
    }
  }
  correctAnswer = correctAnswer.toString();

  return { question, correctAnswer };
}

// Generate a random value based on the data type
function generateRandomValue(dataType) {
  switch (dataType) {
    case "number":
      // Generate a random number between 0 and 9
      return Math.floor(Math.random() * 10);
    case "string":
      return `${Math.random().toString(36).substring(7)}`;
    case "boolean":
      return Math.random() < 0.5;
    case "null":
      return null;
    case "undefined":
      return undefined;
  }
}

/**
 * Generate a random quiz data based on the number of questions and difficulty level
 * @param {number} numQuestions - Number of questions to generate (default: 5)
 * @param {string} difficulty - Difficulty level of the quiz (default: "medium")
 * @returns {Array} An array of question objects
 */
function generateQuizData(numQuestions = 5, difficulty = "medium") {
  return Array.from({ length: numQuestions }, () => {
    const { question, correctAnswer } = generateRandomQuestion(difficulty);
    const options = [correctAnswer];
    const correctNum = Number(correctAnswer);

    while (options.length < 4) {
      let randomOption;
      if (!isNaN(correctNum)) {
        // For numeric answers, generate similar numbers
        const variation = Math.floor(Math.random() * 5) + 1;
        randomOption = (
          Math.random() < 0.5 ? correctNum + variation : correctNum - variation
        ).toString();
      } else {
        // For non-numeric answers, generate random strings
        randomOption = Math.random().toString(36).substring(7);
      }
      if (!options.includes(randomOption)) {
        options.push(randomOption);
      }
    }
    return {
      question,
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer: options.indexOf(correctAnswer),
    };
  });
}

/**
 * Render the quiz questions and options in the DOM
 * Creates HTML structure for each question and its options
 */
function renderQuiz() {
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = `
                <div class="question-container">
                    ${quizData
                      .map(
                        (q, index) => `
                        <div class="question bg-white rounded-2xl p-6 shadow-lg" id="question${index}">
                            <p class="text-xl font-semibold mb-6 text-indigo-700">${
                              index + 1
                            }. ${q.question}</p>
                            <div class="options space-y-3">
                                ${q.options
                                  .map(
                                    (option, i) => `
                                    <label class="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition duration-300 ease-in-out cursor-pointer transform hover:scale-105">
                                        <input type="radio" name="q${index}" value="${i}" class="form-radio text-indigo-600 focus:ring-indigo-500 h-5 w-5">
                                        <span class="text-gray-700">${option}</span>
                                    </label>
                                `
                                  )
                                  .join("")}
                            </div>
                            <div class="result mt-6 font-bold text-lg opacity-0 transition-opacity duration-300 ease-in-out" id="result${index}"></div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;
  showQuestion(0);
}

/**
 * Display the question at the given index and hide others
 * @param {number} index - Index of the question to display
 */
function showQuestion(index) {
  const questions = document.querySelectorAll(".question");
  const container = document.querySelector(".question-container");

  questions.forEach((q, i) => {
    if (i === index) {
      q.style.display = "block";
      setTimeout(() => {
        const height = q.offsetHeight;
        container.style.height = `${height}px`;
        q.classList.add("active");
      }, 0);
    } else {
      q.classList.remove("active");
      setTimeout(() => {
        q.style.display = "none";
      }, 500);
    }
  });
  currentQuestion = index;
  updateNavButtons();
  updateProgress();
}

/**
 * Adjust the height of the question container on window resize
 * Ensures proper layout when the window size changes
 */
function handleResize() {
  const activeQuestion = document.querySelector(".question.active");
  if (activeQuestion) {
    const container = document.querySelector(".question-container");
    container.style.height = `${activeQuestion.offsetHeight}px`;
  }
}

/**
 * Update the state of navigation buttons based on current question
 * Enables/disables prev/next buttons and updates their styles
 */
function updateNavButtons() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  prevBtn.disabled = currentQuestion === 0;
  nextBtn.disabled = currentQuestion === quizData.length - 1;

  // Add or remove disabled style
  prevBtn.classList.toggle("opacity-50", prevBtn.disabled);
  nextBtn.classList.toggle("opacity-50", nextBtn.disabled);

  // Enable the next button if the current question has been answered
  const currentRadio = document.querySelector(
    `input[name="q${currentQuestion}"]:checked`
  );
  if (currentRadio && currentQuestion < quizData.length - 1) {
    nextBtn.disabled = false;
    nextBtn.classList.remove("opacity-50");
  }
}

/**
 * Update the progress bar based on answered questions
 * Calculates and displays the percentage of questions answered
 */
function updateProgress() {
  const answered = quizData.filter((_, i) =>
    document.querySelector(`input[name="q${i}"]:checked`)
  ).length;
  const progress = (answered / quizData.length) * 100;
  document.getElementById("progress").style.width = `${progress}%`;
  // document.getElementById('progress').textContent = `${Math.round(progress)}%`;
}

/**
 * Calculate the score and display correct/incorrect feedback
 * @returns {number} The total score
 */
function calculateScore() {
  let score = 0;
  quizData.forEach((q, index) => {
    const selectedOption = document.querySelector(
      `input[name="q${index}"]:checked`
    );
    const resultDiv = document.getElementById(`result${index}`);
    const correctAnswerValue = q.options[q.correctAnswer];

    if (selectedOption) {
      if (parseInt(selectedOption.value) === q.correctAnswer) {
        score++;
        resultDiv.textContent = `Correct! The answer is ${correctAnswerValue}.`;
        resultDiv.className = "result mt-6 font-bold text-lg text-green-600";
      } else {
        resultDiv.textContent = `Incorrect. The correct answer is ${correctAnswerValue}.`;
        resultDiv.className = "result mt-6 font-bold text-lg text-red-600";
      }
    } else {
      resultDiv.textContent = `Not answered. The correct answer is ${correctAnswerValue}.`;
      resultDiv.className = "result mt-6 font-bold text-lg text-yellow-600";
    }
    resultDiv.style.opacity = "0";
    setTimeout(() => {
      resultDiv.style.opacity = "1";
    }, 300);
  });
  return score;
}

/**
 * Display the final score and show the restart button
 * @param {number} score - The final score to display
 */
function showResult(score) {
  const resultDiv = document.getElementById("result");
  resultDiv.textContent = `Your score: ${score} out of ${quizData.length}`;
  document.getElementById("restart-btn").style.display = "inline-block";
}

/**
 * Reset the quiz with new questions based on selected difficulty
 * Generates new quiz data and resets the UI
 */
function restartQuiz() {
  const difficulty = document.getElementById("difficulty").value;
  quizData = generateQuizData(5, difficulty);
  renderQuiz();
  showQuestion(0);
  document.getElementById("result").textContent = "";
  document.getElementById("restart-btn").style.display = "none";
  document.getElementById("submit-btn").disabled = false;
}

/**
 * Initialize the quiz with default settings
 * Generates initial quiz data and renders the quiz
 */
function initQuiz() {
  const difficulty = document.getElementById("difficulty").value;
  quizData = generateQuizData(5, difficulty);
  renderQuiz();
  updateProgress();
}

/**
 * Add animation effect when an option is selected
 * Applies a scale and background color change to the selected option
 */
function addOptionSelectionAnimation() {
  document.getElementById("quiz-container").addEventListener("change", (e) => {
    if (e.target.type === "radio") {
      const label = e.target.closest("label");
      label.classList.add("scale-105", "bg-indigo-100");
      setTimeout(() => {
        label.classList.remove("scale-105", "bg-indigo-100");
      }, 300);
    }
  });
}

// Event listener for submit button
document.getElementById("submit-btn").addEventListener("click", () => {
  const score = calculateScore();
  showResult(score);
  document.getElementById("submit-btn").disabled = true;
  document.getElementById("restart-btn").style.display = "inline-block";
});

// Event listener for restart button
document.getElementById("restart-btn").addEventListener("click", restartQuiz);

// Event listener for option selection
document.getElementById("quiz-container").addEventListener("change", (e) => {
  if (e.target.type === "radio") {
    updateNavButtons();
    updateProgress();
    if (currentQuestion < quizData.length - 1) {
      showQuestion(currentQuestion + 1);
    }
  }
});

// Event listener for previous button
document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentQuestion > 0) {
    showQuestion(currentQuestion - 1);
  }
});

// Event listener for next button
document.getElementById("next-btn").addEventListener("click", () => {
  if (currentQuestion < quizData.length - 1) {
    showQuestion(currentQuestion + 1);
  }
});

// Event listener for difficulty selection
document.getElementById("difficulty").addEventListener("change", restartQuiz);

// Initialize the quiz
initQuiz();
addOptionSelectionAnimation();
window.addEventListener("resize", handleResize);
