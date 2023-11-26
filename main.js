
const INTERVALS = [12, 7, 5, 4, 3, 9, 2, 8, 11, 10, 1, 6];

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

const playInterval = function( id )
{
    document.getElementById(id).play();
}

let sounds = [];

for (let i=40; i<=80; ++i) {
	sounds[i] = new Audio("./sounds/git-mid"+i+".wav");
}

const playDynamicInterval = function( pair )
{
	const start = 0;
	const delay = 800;
	const f1 = function() { sounds[pair[0]].cloneNode().play(); };
	const f2 = function() { sounds[pair[1]].cloneNode().play(); };
	window.setTimeout ( f1, start );
	window.setTimeout ( f2, delay );
}

const generateTest = function()
{
    show("questionArea");
    hide("startButton");
    show("message", "&nbsp");

    questions = [];
    answers = [];
    questionIndex = 0;
    correctAnswers = 0;
    score = 0;
	setLevel(level);
	
    for( let question = 0; question < questionCount; question++ )
    {
		const d_interval = getRandomDynamicInterval(level+1);
		questions[question] = d_interval;
        answers[question] = getInterval(d_interval[2]);
    }

    beginTime = Date.now();
    nextQuestion();
}

const nextQuestion = function()
{
    show("questionIndex", "Level #" + level + ", " + score + " Punkte<br> Frage "
                            + ( questionIndex + 1 ) +
                             " von " +
                             questionCount );
	playDynamicInterval(questions[questionIndex]);

}

const doAnswer = function(id)
{
    let okay = doEvaluateAnswer(id);
    questionIndex++;
    if (questionIndex < questionCount)
    {
        if (okay) {
            nextQuestion();
        } else {
            window.setTimeout(nextQuestion, 1000);
        }
    }
    else
    {
        finishGame();
    }
}

const showValue = function(id, okay, duration)
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

const doEvaluateAnswer = function(id)
{
    let okay = false;
    let interval = getInterval( id );
    if( interval.code === answers[questionIndex].code)
    {
        okay = true;
        correctAnswers++;
        score += score_increment;
        if (id == bonus_interval) {
            score += 5;
        }
        showValue(interval.code, true, 500);
        show("message", "&nbsp");
    }
    else
    {
        showValue(interval.code, false, 1000);
        showValue(answers[questionIndex].code, true, 1000);
        show("message", "Falsch, die richtige Antwort ist: " +
                            answers[questionIndex].name );
    }
    return okay;
}

const finishGame = function()
{
    show("startButton");
    hide("questionArea");
    let highScoreMessage = score + " Punkte. Du konntest deine Leistung nicht verbessern.<br>";
    let delta = Date.now() - beginTime; // milliseconds elapsed since start
    let completionSeconds = Math.floor(delta / 1000);
	
	tryAdvanceLevel();
	
    if (saveHighScore(completionSeconds)) {
        highScoreMessage = score + " Punkte. Neue Bestleistung!<br>";
    }

    show( "message", highScoreMessage + 
                         "(" + correctAnswers +
                         " von " + questionCount +
                         " richtige Antworten in " + completionSeconds + " Sekunden.)" );
}

const tryAdvanceLevel = function()
{
	if (correctAnswers == questionCount) {
		if (level < 11) {
			setLevel(level +1);
		}
	}
}

const setLevel = function(val)
{
	if (val < 1) {
		val = 1;
	} else if (val > 11) {
		val = 11;
	}
	level = val;
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

const saveHighScore = function( completionSeconds )
{
    let improved_highscore = false;
    let highscore = localStorage.getItem('highscore');
    let time = localStorage.getItem('time');
    console.log("highscore:", highscore, "time:", time);
    if (score > highscore || (score >= highscore && completionSeconds < time))
    {
        localStorage.setItem('highscore', score);
        localStorage.setItem('time', completionSeconds);
        improved_highscore = true;
    }
    return improved_highscore;
}

const replayInterval = function()
{
    playDynamicInterval(questions[questionIndex]);
}

const getRandomDynamicInterval = function(upper_bound)
{
    let interval = INTERVALS[getRandomInteger(0, upper_bound)];
    let base = getRandomInteger(40, 80-interval);
    return [base, base+interval, interval];
}

const show = function( id, value )
{
    let element = document.getElementById(id);
    element.style.display = "";
    if( value !== undefined )
    {
        element.innerHTML = value;
    }
}

const hide = function( id )
{
    document.getElementById(id).style.display = "none";
}

const getInterval = function( id )
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

const checkRandomFunction = function()
{
	histo = [0,0,0,0];
	for (let i=0; i<4000*1000; ++i) {
		histo[getRandomInteger(0, 4)] += 1;
	}
	for (let i=0; i<histo.length; ++i) {
		console.log("histo[", i, "]==", histo[i])
	}
}

/** Return a pseudo-random integer in the interval
 *  between `min` (inclusive) and `max` (exclusive).
 */
const getRandomInteger = function( min, max )
{
	return Math.floor( Math.random() * ( max - min ) ) + min;
}