'use strict';

import answerList from './data/answerList.js';
import validWords from './data/validWords.js';
import keyboardKeys from './data/keyboardKeys.js';

const inputContainer = document.querySelector('.input--container');
const btnRules = document.querySelector('.img-help');
const btnCloseRules = document.querySelector('.close--rules');
const modalRules = document.querySelector('.rules--modal');
const overlay = document.querySelector('.overlay');
const keyboard = document.querySelector('.keyboard');
const exampleTiles = document.querySelectorAll('.example--tile');
const alertMsg = document.querySelector('.alert--message');
const feedback = document.querySelector('.feedback');

let currentTile = 0;
let answer = '';
let wordLength = 5;
let numberOfTrails = 6;
let currentRowNumber = 0;
let state = 'empty';
let reset = false;

function createTiles() {
  inputContainer.innerHTML = '';
  for (let i = 0; i < numberOfTrails; i++) {
    inputContainer.insertAdjacentHTML(
      'beforeend',
      `<div letters data-state="empty" class="input--${i} inputs"></div>`
    );
    const currentDiv = document.querySelector(`.input--${i}`);
    for (let j = 0; j < wordLength; j++) {
      const html = `<div class="cell" data-index="${j}" data-state="empty"></div>`;
      currentDiv.insertAdjacentHTML('beforeend', html);
    }
  }
}

function createKeyboard() {
  keyboard.innerHTML = '';
  let max = 10,
    idx = 0;
  for (let i = 0; i < 3; i++) {
    keyboard.insertAdjacentHTML(
      'beforeend',
      `<div class="keyboard--row row--${i}"></div>`
    );
    max = i > 0 ? 9 : 10;
    const currentRow = document.querySelector(`.row--${i}`);
    for (let j = 0; j < max; j++) {
      currentRow.insertAdjacentHTML(
        'beforeend',
        `<button data-key="${
          keyboardKeys[idx] === 'bks' ? 'backspace' : keyboardKeys[idx]
        }" class="keyboard--btn">${keyboardKeys[idx]}</button>`
      );
      idx++;
    }
  }
}

//Rules modal
const hideRulesModal = function() {
  modalRules.classList.add('hidden');
  overlay.classList.add('hidden');
  exampleTiles[1].classList.remove('correct', 'flip');
  exampleTiles[8].classList.remove('misplaced', 'flip');
  exampleTiles[10].classList.remove('wrong', 'flip');
};

const showRulesModal = function() {
  modalRules.classList.remove('hidden');
  overlay.classList.remove('hidden');
  setTimeout(_ => exampleTiles[1].classList.add('correct', 'flip'), 500);
  setTimeout(_ => exampleTiles[8].classList.add('misplaced', 'flip'), 850);
  setTimeout(_ => exampleTiles[10].classList.add('wrong', 'flip'), 1200);
};
//End of rules modal

function answerGenerator() {
  answer = answerList[Math.trunc(Math.random() * answerList.length + 1)];
}

let gridCells;
let currentRow;

function init() {
  createTiles();
  createKeyboard();
  if (!reset) showRulesModal();
  currentTile = 0;
  currentRowNumber = 0;
  state = 'playing';
  answerGenerator();
  gridCells = document.querySelectorAll('.cell');
  currentRow = document.querySelector('.input--0');
  if (!reset)
    document
      .querySelectorAll('.keyboard--btn')
      .forEach(key => key.classList.remove('wrong', 'correct', 'misplaced'));
}
init();

btnRules.addEventListener('click', showRulesModal);
btnCloseRules.addEventListener('click', hideRulesModal);
overlay.addEventListener('click', () => {
  if (!modalRules.classList.contains('hidden')) hideRulesModal();
});

//Feedback modal
const createFeedbackModal = function() {
  const html = `<div class="feedback--modal hidden">
    <button class="close--modal close--feedback">X</button>
    <h1>
      <strong><center>${
        state === 'win' ? 'YAAYYYY🎉 You won' : ' 😟 Oh no!'
      }</center></strong>
    </h1>
    <br />
    <p class="center">
      ${state === 'lose' ? `The answer was ${answer}. <br />` : ''}
      ${state === 'lose' ? 'Better luck next time... <br />' : ''}
      Press enter to play again 😄
    </p>
  </div>`;

  feedback.innerHTML = '';
  feedback.insertAdjacentHTML('beforeend', html);
};

const hideFeedbackModal = function() {
  document.querySelector('.feedback--modal').classList.add('hidden');
  overlay.classList.add('hidden');
};

const showFeedbackModal = function() {
  createFeedbackModal();
  document.querySelector('.feedback--modal').classList.remove('hidden');
  overlay.classList.remove('hidden');
  document
    .querySelector('.close--feedback')
    .addEventListener('click', hideFeedbackModal);
};
//End of feedback modal

const displayAlert = function(msg) {
  if (!overlay.classList.contains('hidden')) return;
  alertMsg.textContent = msg;
  alertMsg.style.display = 'block';
  setTimeout(_ => {
    alertMsg.style.display = 'none';
  }, 1000);
};

const displayConfetti = function() {
  confetti();
  setTimeout(() => {
    confetti.reset();
    confetti();
  }, 1000);
  setTimeout(() => {
    confetti.reset();
  }, 3000);
};

//Handler for key pressed other than 'enter' itself
function letterEntered(letter) {
  if (letter === 'backspace' && currentTile === 0) return;
  if (
    letter === 'backspace' &&
    gridCells[currentTile - 1].parentElement.dataset.state != 'set'
  ) {
    gridCells[--currentTile].innerHTML = '';
    currentRow.setAttribute(
      'letters',
      currentRow.getAttribute('letters').slice(0, -1)
    );
    gridCells[currentTile].dataset.state = 'empty';
    if (!currentRow.getAttribute('letters')) currentRow.dataset.state = 'empty';
  } else if (
    letter !== 'backspace' &&
    currentRow.getAttribute('letters').length < wordLength
  ) {
    currentRow.setAttribute(
      'letters',
      currentRow.getAttribute('letters') + letter
    );
    currentRow.dataset.state = gridCells[currentTile].dataset.state = 'tbd';
    gridCells[currentTile++].innerHTML = letter;
  }
}

//Check if guessed word is valid
const validateWord = function(word) {
  if (validWords.includes(word)) return true;
  return false;
};

//Compare actual answer with the guess entered
const compareAnswers = function(tempWord) {
  let answerArray = answer.split('');
  let comparisonResult = new Array(answerArray.length).fill(0);

  //Mark all 'in place' letters
  for (let i = 0; i < answer.length; i++)
    if (tempWord.charAt(i) === answer.charAt(i)) {
      comparisonResult[i] = 1;
      const index = answerArray.indexOf(tempWord.charAt(i));
      if (index > -1) {
        answerArray.splice(index, 1);
      }
    }

  //Mark misplaced and absent letters
  for (let i = 0; i < answer.length; i++) {
    if (comparisonResult[i] === 1) continue;
    if (answerArray.includes(tempWord.charAt(i))) {
      comparisonResult[i] = 2;
      const index = answerArray.indexOf(tempWord.charAt(i));
      if (index > -1) {
        answerArray.splice(index, 1);
      }
    } else comparisonResult[i] = -1;
  }
  return comparisonResult;
};

//Handler for 'enter' pressed
function enterPressed() {
  if (state !== 'playing') {
    hideFeedbackModal();
    reset = true;
    init();
    return;
  }
  const tempWord = currentRow.getAttribute('letters');
  if (tempWord.length < wordLength) {
    displayAlert('Word is too short!');
  } else {
    if (!validateWord(tempWord)) {
      displayAlert('Enter a valid word 😊');
      return;
    }
    currentRow.dataset.state = 'set';
    let comparisonResult = compareAnswers(tempWord);
    currentRow.querySelectorAll('.cell').forEach((tile, i) => {
      setTimeout(_ => {
        const key = document.querySelector(`[data-key=${tempWord.charAt(i)}]`);
        if (comparisonResult[i] === 1) {
          tile.classList.add('correct', 'flip');
          key.classList.remove('misplaced', 'wrong');
          key.classList.add('correct');
        } else if (comparisonResult[i] === 2) {
          tile.classList.add('misplaced', 'flip');
          if (!key.classList.contains('correct'))
            key.classList.add('misplaced');
        } else if (comparisonResult[i] === -1) {
          tile.classList.add('wrong', 'flip');
          if (
            !key.classList.contains('correct') &&
            !key.classList.contains('misplaced')
          )
            key.classList.add('wrong');
        }
        tile.dataset.state = 'set';
      }, i * 250);
    });
    if (tempWord === answer) {
      state = 'win';
      displayConfetti();
      showFeedbackModal();
    }
    if (currentRowNumber < numberOfTrails - 1) {
      currentRow = document.querySelector(`.input--${++currentRowNumber}`);
    } else if (state !== 'win') {
      state = 'lose';
      showFeedbackModal();
    }
  }
}

window.addEventListener('keydown', function(e) {
  if (e.keyCode === 27) {
    if (!modalRules.classList.contains('hidden')) hideRulesModal();
    return;
  }
  if (e.keyCode === 13) {
    enterPressed();
  } else if (state !== 'playing') {
    return;
  } else if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 8) {
    letterEntered(e.key.toLowerCase());
  }
});

keyboard.addEventListener('click', function(e) {
  if (e.target?.dataset.key === 'enter') {
    enterPressed();
  } else if (state !== 'playing') {
    return;
  } else if (e.target?.dataset.key) {
    letterEntered(e.target?.dataset.key);
  }
  e.target.blur();
});
