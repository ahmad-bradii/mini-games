let findIt = false;
let tryIndex = 0;
const maxTries = 5;
const letters = document.querySelectorAll(".scoreboard");
const loadingDiv = document.querySelector(".info-bar");

function createPlaces(maxWordLength) {
  for (let i = 0; i < maxWordLength * 5; i++) {
    const letter = document.createElement("div");
    letter.classList.add("scoreboard-letter");
    letter.id = `letter-${i}`;

    letters[0].appendChild(letter);
  }
}

async function init() {
  const randomWord = await fetch(
    "https://random-word-api.herokuapp.com/word?number=1"
  );
  const wordJson = await randomWord.json();
  const word = wordJson[0];
  console.log(word);
  let currentWord = "";
  let currentBoxIndex = 0;

  const maxWordLength = word.length;
  let currentIndex = 0;
  letters[0].style.gridTemplateColumns = `repeat(${maxWordLength}, 1fr)`;
  createPlaces(maxWordLength);

  function addLetter(letter) {
    if (currentWord.length < word.length) {
      currentWord += letter;
    } else {
      currentWord = currentWord.substring(0, word.length - 1) + letter;
    }

    currentIndex = currentBoxIndex * maxWordLength + currentWord.length;
    letters[0].children[currentIndex - 1].textContent = letter;
  }

  function backspace() {
    if (currentWord.length > 0) {
      currentWord = currentWord.substring(0, currentWord.length - 1);
      currentIndex = currentBoxIndex * maxWordLength + currentWord.length;
      letters[0].children[currentIndex].textContent = "";
    }
  }

  function commit() {
    tryIndex++;
    const restLetters = word.length - currentWord.length;
    if (restLetters !== 0) {
      for (let j = 0; j < restLetters; j++) {
        document
          .getElementById(`letter-${currentIndex + j}`)
          .classList.add("empty");
      }
      setTimeout(() => {
        Array.from(document.getElementsByClassName("empty")).forEach(
          (element) => {
            element.classList.remove("empty");
          }
        );
      }, 200);
    } else {
      if (currentWord === word.toUpperCase()) {
        for (let i = 0; i < word.length; i++) {
          document
            .getElementById(`letter-${currentBoxIndex * maxWordLength + i}`)
            .classList.add("correct");
        }
        findIt = true;
      } else {
        let currentWordMap = {};
        let closeAnswers = {};
        let correctAnswers = {};

        // Populate currentWordMap with indices of each letter in currentWord
        for (let i = 0; i < currentWord.length; i++) {
          if (!currentWordMap[currentWord[i]]) {
            currentWordMap[currentWord[i]] = [i];
          } else {
            currentWordMap[currentWord[i]].push(i);
          }
        }

        console.log(currentWordMap);
        // Populate closeAnswers with indices of letters in word that are in currentWord
        for (let i = 0; i < word.length; i++) {
          let letter = word[i].toUpperCase();

          // Check for correct answers
          if (currentWord[i] === letter) {
            // Initialize correctAnswers[letter] if it doesn't exist
            correctAnswers[letter] = correctAnswers[letter] || [];

            // Add the current index to correctAnswers
            correctAnswers[letter].push(i);

            // Remove the current index from currentWordMap
            if (currentWordMap[letter]) {
              currentWordMap[letter] = currentWordMap[letter].filter(
                (item) => item !== i
              );
            }
          }
          // Check for close answers (letter is in the word but not in the correct position)
          else if (currentWord.includes(letter)) {
            // Initialize closeAnswers[letter] if it doesn't exist
            closeAnswers[letter] = closeAnswers[letter] || [];

            // Ensure currentWordMap[letter] exists and has elements
            if (currentWordMap[letter] && currentWordMap[letter].length > 0) {
              // Add the first available index from currentWordMap to closeAnswers
              closeAnswers[letter].push(currentWordMap[letter].shift());
            }
          }
        }
        // Mark remaining letters in currentWordMap as 'wrong'
        for (let letter in currentWordMap) {
          if (currentWordMap[letter].length > 0) {
            currentWordMap[letter].forEach((element) => {
              document
                .getElementById(
                  `letter-${currentBoxIndex * maxWordLength + element}`
                )
                .classList.add("wrong");
            });
          }
          if (closeAnswers[letter] && closeAnswers[letter].length > 0) {
            closeAnswers[letter].forEach((element) => {
              document
                .getElementById(
                  `letter-${currentBoxIndex * maxWordLength + element}`
                )
                .classList.remove("wrong");
              document
                .getElementById(
                  `letter-${currentBoxIndex * maxWordLength + element}`
                )
                .classList.add("close");
            });
          }
          if (correctAnswers[letter] && correctAnswers[letter].length > 0) {
            correctAnswers[letter].forEach((element) => {
              document
                .getElementById(
                  `letter-${currentBoxIndex * maxWordLength + element}`
                )
                .classList.remove("close");
              document
                .getElementById(
                  `letter-${currentBoxIndex * maxWordLength + element}`
                )
                .classList.remove("wrong");
              document
                .getElementById(
                  `letter-${currentBoxIndex * maxWordLength + element}`
                )
                .classList.add("correct");
            });
          }
        }

        console.log("coorect", correctAnswers);
        console.log("wrong", currentWordMap);
        console.log("close", closeAnswers);
      }
      if (currentBoxIndex < maxTries) {
        currentBoxIndex++;
        currentWord = "";
      }
    }
  }

  document.addEventListener("keydown", function handleKeyPress(e) {
    const action = e.key;
    console.log(currentBoxIndex);
    if (findIt || currentBoxIndex === maxTries) {
      document.querySelector(
        "#massege"
      ).innerHTML = `Game Over!!<br><button class='refrechButton' onclick="refresh()">Try again</button><br>the word is: '${word}' `;
      return;
    } else if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    }
    //else will do nothing
  });
}
init();

// Refresh function for the "Try again" button
function refresh() {
  window.location.reload();
}

// #Function
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}
