const INTERVALS = [12, 7, 5, 2, 9, 4, 11, 10, 3, 8, 1, 6];

const LEVEL_DISTRI = {
0:  [20],
1:  [10, 10],
2:  [8, 7, 5],
3:  [7, 6, 4, 3],
4:  [6, 5, 4, 3, 2],
5:  [6, 5, 4, 3, 1, 1],
6:  [6, 5, 4, 2, 1, 1, 1],
7:  [6, 5, 3, 2, 1, 1, 1, 1],
8:  [6, 4, 3, 2, 1, 1, 1, 1, 1],
9:  [5, 4, 3, 2, 1, 1, 1, 1, 1, 1],
10: [5, 4, 3, 1, 1, 1, 1, 1, 1, 1, 1],
11: [5, 4, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};

const questionCount = 20;
let level = 1;

let questions = [];
let answers = [];
let questionIndex = 0;
let correctAnswers = 0;
let score = 0;
let score_increment = 10;
let bonus_interval = 0;
let beginTime = "";

function playInterval(id)
{
    document.getElementById(id).play();
}

let sounds = [];

for (let i=40; i<=80; ++i) {
	sounds[i] = new Audio("./sounds/git-mid"+i+".wav");
}

function playDynamicInterval(pair)
{
	const start = 0;
	const delay = 800;
	const f1 = function() { sounds[pair[0]].cloneNode().play(); };
	const f2 = function() { sounds[pair[1]].cloneNode().play(); };
	window.setTimeout ( f1, start );
	window.setTimeout ( f2, delay );
}

function generateTest()
{
    show("questionArea");
    hide("startButton");
    show("message", "&nbsp");

    questions = [];
    answers = [];
    questionIndex = 0;
    correctAnswers = 0;
    score = 0;
    level = loadLevel();
	setLevel(level);
    
    let distri = LEVEL_DISTRI[level];
    let level_intervals = [];
    for (let i=0; i<distri.length; ++i) {
        for (let n=0; n<distri[distri.length-1-i]; ++n) {
            level_intervals.push(INTERVALS[i]);
        }
    }
    shuffle(level_intervals);
	
    let last_interval = undefined;
    for (let question = 0; question < questionCount; ++question)
    {
		let d_interval = getRandomPlacedInterval(level_intervals[question]);
        if (last_interval) {
            while ((d_interval[2] == last_interval[2]) && (d_interval[1] == last_interval[1])) {
                d_interval = getRandomPlacedInterval(level_intervals[question]);
                console.log("replace duplicate interval")
            }
        }
		questions[question] = d_interval;
        answers[question] = getInterval(d_interval[2]);
        last_interval = d_interval;
    }

    beginTime = Date.now();
    nextQuestion();
}

function nextQuestion()
{
    show("questionIndex", "Level #" + level +
        " " + (questionIndex + 1) + "/" + 
        questionCount + " <br> " + score + " Punkte");
	playDynamicInterval(questions[questionIndex]);

}

function doAnswer(id)
{
    let okay = doEvaluateAnswer(id);
    questionIndex++;
    if (questionIndex < questionCount) {
        if (okay) {
            nextQuestion();
        } else {
            window.setTimeout(nextQuestion, 1000);
        }
    } else {
        finishGame();
    }
}

function showValue(id, okay, duration)
{
    let val = document.querySelector('#b'+(id)+' > .eval');
    if (okay) {
        val.textContent = '✔️'; /* Emoji Grüner Haken */
    } else {
        val.textContent = '❌'; /* Emoji Rotes Kreuz */
    }
    const clear = function() { val.textContent = ''; };
	window.setTimeout (clear, duration);
}

function doEvaluateAnswer(id)
{
    let okay = false;
    let interval = getInterval( id );
    if (interval.code === answers[questionIndex].code) {
        okay = true;
        correctAnswers++;
        score += score_increment;
        if (id == bonus_interval) {
            score += 5;
        }
        showValue(interval.code, true, 500);
        show("message", "&nbsp");
    } else {
        showValue(interval.code, false, 1000);
        showValue(answers[questionIndex].code, true, 1000);
        show("message", "Falsch, die richtige Antwort ist: " +
                            answers[questionIndex].name );
    }
    return okay;
}

function finishGame()
{
    let delta = Date.now() - beginTime; // milliseconds elapsed since start
    let completionSeconds = Math.floor(delta / 1000);
    
    show("startButton");
    hide("questionArea");
    let highScoreMessage = score + " Punkte.<br>";
	
    if (saveHighScore(completionSeconds)) {
        highScoreMessage = score + " Punkte. Neue Bestleistung!<br>";
    }

    show( "message", highScoreMessage + 
                         "(" + correctAnswers +
                         " von " + questionCount +
                         " richtig in " + completionSeconds + " Sekunden)" );
	tryAdvanceLevel();
}

function tryAdvanceLevel()
{
	if (correctAnswers == questionCount) {
		if (level < 11) {
			setLevel(level +1);
		}
	}
}

function setLevel(val)
{
	if (val < 1) {
		val = 1;
	} else if (val > 11) {
		val = 11;
	}
    if (level != val) {
        level = val;
        storeLevel(level);
    }
    score_increment = 10 + (level-1)*5;
    if (level > 1) {
        bonus_interval = INTERVALS[level];
    } else {
        bonus_interval = 0;
    }
    console.log(bonus_interval);
	for (let i=0; i<12; ++i) {
		if (i <= level) {
			document.getElementById("b"+INTERVALS[i]).disabled = false;
		} else {
			document.getElementById("b"+INTERVALS[i]).disabled = true;
		}
	}
}

function storeLevel(level)
{
    localStorage.setItem('level', level);
}

function loadLevel()
{
    let stored_level = localStorage.getItem('level');
    if (!stored_level) {
        stored_level = 1;
    }
    return Number(stored_level);
}

function saveHighScore(completionSeconds)
{
    let improved_highscore = false;
    let highscore = localStorage.getItem('highscore');
    let time = localStorage.getItem('time');
    console.log("highscore:", highscore, "time:", time);
    if (score > highscore || (score >= highscore && completionSeconds < time)) {
        localStorage.setItem('highscore', score);
        localStorage.setItem('time', completionSeconds);
        improved_highscore = true;
    }
    return improved_highscore;
}

function replayInterval()
{
    playDynamicInterval(questions[questionIndex]);
}

function getRandomPlacedInterval(interval)
{
    let base = getRandomInteger(40, 80-interval);
    return [base, base+interval, interval];
}

function getRandomDynamicInterval(upper_bound)
{
    let interval = INTERVALS[getRandomInteger(0, upper_bound)];
    return getRandomPlacedInterval(interval);
}

function show(id, value)
{
    let element = document.getElementById(id);
    element.style.display = "";
    if (value !== undefined) {
        element.innerHTML = value;
    }
}

function hide(id)
{
    document.getElementById(id).style.display = "none";
}

function getInterval(id)
{
    id = id + "";
    let interval = { code: id, name: "Oktave" }
    switch (id)
    {
      case "1":
        interval = { code: id, name: "Kleine Sekunde" }
        break;
      case "2":
        interval = { code: id, name: "Große Sekunde" }
        break;
      case "3":
        interval = { code: id, name: "Kleine Terz" }
        break;
      case "4":
        interval = { code: id, name: "Große Terz" };
        break;
      case "5":
        interval = { code: id, name: "Quarte" }
        break;
      case "6":
        interval = { code: id, name: "Tritonus" }
        break;
      case "7":
        interval = { code: id, name: "Quinte" }
        break;
      case "8":
        interval = { code: id, name: "Kleine Sexte" }
        break;
      case "9":
        interval = { code: id, name: "Große Sexte" }
        break;
      case "10":
        interval = { code: id, name: "Kleine Septime" }
        break;
      case "11":
        interval = { code: id, name: "Große Septime" }
        break;
      case "12":
        interval = { code: id, name: "Oktave" }
        break;
      default:
        // Return whatever was set as the default
    }
    return interval;
}

function checkRandomFunction()
{
	histo = [0,0,0,0];
	for (let i=0; i<4000*1000; ++i) {
		histo[getRandomInteger(0, 4)] += 1;
	}
	for (let i=0; i<histo.length; ++i) {
		console.log("histo[", i, "]==", histo[i])
	}
}

/** Shuffle an array in place (Fisher–Yates shuffle). 
 * Source: https://stackoverflow.com/a/2450976/2932052
 */
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

/** Return a pseudo-random integer in the interval
 *  between `min` (inclusive) and `max` (exclusive).
 */
function getRandomInteger(min, max)
{
	return Math.floor(Math.random() * (max - min)) + min;
}
