
/*  
let deckID = ''   // Global variable
let origBtnText = ''
let origImgDisplay = document.querySelector('#player1War1').style.display

fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')  // Grab a deck
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        deckID = data.deck_id  // Store Deck ID in variable
      })
      .catch(err => {
          console.log(`error ${err}`)
      });

document.getElementById('btn').addEventListener('click', drawTwo)

function drawTwo(){
  const url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`  // Grabbin' two cards

  document.querySelector('#player1War1').style.display = 'none'
  document.querySelector('#player1War2').style.display = 'none'
  document.querySelector('#player1War3').style.display = 'none'
  document.querySelector('#player2War1').style.display = 'none'
  document.querySelector('#player2War2').style.display = 'none'
  document.querySelector('#player2War3').style.display = 'none'

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        document.querySelector('#player1').src = data.cards[0].image
        document.querySelector('#player2').src = data.cards[1].image
        let player1Valoo = convertToNum(data.cards[0].value)
        let player2Valoo = convertToNum(data.cards[1].value)
        if (player1Valoo > player2Valoo) {
          document.querySelector('h3').innerText = 'Player 1 Won!'
        } else if (player1Valoo < player2Valoo) {
          document.querySelector('h3').innerText = 'Player 2 Wins!'
        } else {
          document.querySelector('h3').innerText = 'This. Is. WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARRRR!!!!!!!!!!!!'
          
	  origBtnText = document.getElementById('btn').innerText
          document.getElementById('btn').innerText = "WAR!!!"  // Change the button to WAR
          document.getElementById('btn').removeEventListener('click', drawTwo)
          document.getElementById('btn').addEventListener('click', drawWar) // Draw 8 cards        
        }

      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}
function convertToNum(val) {
  if (val === 'ACE') {
    return 14
  } else if (val === 'KING') {
    return 13
  } else if (val === 'QUEEN') {
    return 12
  } else if (val === 'JACK') {
    return 11
  } else {
    return Number(val)
  }
}


function drawWar(){
  const urlWar = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=8`  // Grabbin' eight cards

  document.querySelector('#player1War1').style.display = origImgDisplay
  document.querySelector('#player1War2').style.display = origImgDisplay
  document.querySelector('#player1War3').style.display = origImgDisplay
  document.querySelector('#player2War1').style.display = origImgDisplay
  document.querySelector('#player2War2').style.display = origImgDisplay
  document.querySelector('#player2War3').style.display = origImgDisplay

  fetch(urlWar)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        document.querySelector('#player1').src = data.cards[3].image
          document.querySelector('#player1War1').src = data.cards[0].image
          document.querySelector('#player1War2').src = data.cards[1].image
          document.querySelector('#player1War3').src = data.cards[2].image
        document.querySelector('#player2').src = data.cards[7].image
          document.querySelector('#player2War1').src = data.cards[4].image
          document.querySelector('#player2War2').src = data.cards[5].image
          document.querySelector('#player2War3').src = data.cards[6].image
        let player1Valoo = convertToNum(data.cards[3].value)
        let player2Valoo = convertToNum(data.cards[7].value)
        if (player1Valoo > player2Valoo) {
          document.querySelector('h3').innerText = 'PLAYER 1 HAS CONQUERED!'
          document.getElementById('btn').innerText = origBtnText  // Change the button back
          document.getElementById('btn').removeEventListener('click', drawWar)
          document.getElementById('btn').addEventListener('click', drawTwo) // Draw 8 cards   
        } else if (player1Valoo < player2Valoo) {
          document.querySelector('h3').innerText = 'PLAYER 2 PREVAILS!'
          document.getElementById('btn').innerText = origBtnText  // Change the button to WAR
          document.getElementById('btn').removeEventListener('click', drawWar)
          document.getElementById('btn').addEventListener('click', drawTwo) // Draw 8 cards   
        } else {
          document.querySelector('h3').innerText = 'This. Is. WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARRRR!!!!!!!!!!!! (again)'
  
        }
        // Change the button back
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

*/

// Store deck to local storage



//Start here..  Just start typing, or nothing's gonna get done, buddy!

//what do I want to do start...?  For my game screen, I need a size, I guess..?  It can be some kind of relative size..
//  then everything that goes into it will have a location..  should that location be centered?  Porbably...  maybe center
//  left/right, and bottom for up/down?  Or maybe have an object location, and a draw location..

//location.  drawOffset (where is lower/left or upper/left in relation to location..)
//  a) Center (zero)
//  b) a number..
//  c) LL, LC, LR, CL, C, CR, UL, UC, UR  ....?

//anyway..  I want a list of all my game objects.  Then each one'll have a moooove.  Pretty much like unity?  Let's see if I can 
//  make that happen..

//I also need the world to move as our moomoo moooves.
//  mooLocation is 8, 10.  That means we want that center-ish (wherever I have the moo.. maybe a bit lower than center)
//  I moove the moo to 7, 10.  The world now needs to moove right.  OK.

//


class GameTime {
  #beginTime;
  #lastTime;
  #timeElapsed;

  constructor() {
    this.#beginTime = Date.now();
    this.#lastTime = this.#beginTime;
    this.#timeElapsed = 0;
  }

  get timeElapsed() {
    return this.#timeElapsed;
  }
  get lastTime() {
    return this.#lastTime;
  }

  update() {
    const tmp_time = Date.now();
    this.#timeElapsed = tmp_time - this.#lastTime;
    this.#lastTime = tmp_time;
  }
}

//I'm trying to make it so that GameTimer cannot be updated anywhere except by the game loop..
//  I'm going to create this guy, and have it take in a GameTime object.  And every time update is called, 
//  the GameTime object must be passed in.. if the wrong GameTime object is passed in, update does not happen!
class GameTimer {
  #gameTimeObj;

  constructor() {
    //nothing..
  }

  registerTimer(in_gameTime) {
    //verify that in_gameTimer is a gameTimer???  probably...
    if (!(in_gameTime instanceof GameTime)) {
      //uhhh.......  FAIL!!
      throw "registered timer is not a GameTime object!";
    }
    //great, we are good to save it!
    this.#gameTimeObj = in_gameTime;
  }

  get timeElapsed() {
    if (this.#gameTimeObj) {
      return this.#gameTimeObj.timeElapsed;
    }
    else {
      //the gameTime object hasn't been returned yet??  return zero?
      throw "no registered timer!";
    }
  }

  get lastTime() {
    if (this.#gameTimeObj) {
      return this.#gameTimeObj.lastTime;
    }
    else {
      //the gameTime object hasn't been returned yet??  return zero?
      throw "no registered timer!";
    }
  }


  update(in_gameTime) {
    //make sure this matches our time object!
    if (this.#gameTimeObj === in_gameTime) {
      //it matches!  Great!  We can update the timer!
      this.#gameTimeObj.update();
    }
  }

}

//umm... should I just make a game class?  It's gonna be a singleton
class Game {
  static #instance = null;
  #gameTime;
  #gameTimer;
  #targetFPS;
  #targetFrameTime;

  #counter = 0;
  #totalTimeElapsed = 0;
  #lastFrameTimes = [];

  #elementTimeUpdate = null;

  constructor(in_FPS) {
    this.#gameTime = new GameTime();
    this.#gameTimer = new GameTimer();
    this.#gameTimer.registerTimer(this.#gameTime)
    this.#targetFPS = in_FPS? in_FPS : 15;
    this.#targetFrameTime = 1000 / this.#targetFPS;
  }

  set targetFPS(in_FPS) {
    this.#targetFPS = in_FPS;
    this.#targetFrameTime = 1000 / this.#targetFPS;
  }

  get timer() {
    return this.#gameTimer;
  }

  static Instance() {
    if (Game.#instance) {
      //the instance exists! return it.
      return Game.#instance;
    }
    else {
      //we need to create a new instance of the class and save it to instance
      Game.#instance = new Game();
      return Game.#instance;
    }
  }

  //this guy gets called before looping?
  start() {
    this.#gameTimer.register(this.#gameTime)
  }

  //this guy is our looper..
  //hmmm.... watching the numbers, we get back here like 5 ms too late, pretty often, even when trying to adjust..
  //  I probably need to track every few, and adjust?  is it worth it?
  //create an array that looks at the last 3 or 5 frames, and adjusts based on that?
  gameLoop() {
    this.#counter++;
    this.#totalTimeElapsed += this.#gameTimer.timeElapsed;
    //update our gameTimer..
    this.#gameTimer.update(this.#gameTime);
    //document.getElementById("timeUpdate").innerText = "z";
    if (this.#elementTimeUpdate === null) {
      this.#elementTimeUpdate = document.getElementById("timeUpdate");
    }
    this.#elementTimeUpdate.innerText = this.#counter + " time elapsed: " + this.#gameTimer.timeElapsed + ", target: " + this.#targetFrameTime;


    //finally, we need to call the loop again!  using setTimeout!
    //we want to wait our target time - time to process.. (which is now - last time)
    //soo.. we have a target framerate??  Let's say it's 30 fps..
    //  that gives us .033 seconds..  we want to wait .033 - (Date.now() - this.#gameTime.l)
    //we also want to consider how long the previous timeElapsed was....
    //our target time is 100 ..  timeElapsed was 105..  we want to sleep 5 less, to catch up!!
    let tmp_late = 0;
    if (this.#gameTimer.timeElapsed > this.#targetFrameTime) {
      tmp_late = this.#gameTimer.timeElapsed - this.#targetFrameTime;
    }
    //look at last frames and adjust...
    const tmp_remaining_time = this.#targetFrameTime - (Date.now() - this.#gameTimer.lastTime) - tmp_late;
    //this.#elementTimeUpdate.innerText = this.#counter + " time to sleep: " + tmp_remaining_time + ", target: " + this.#targetFrameTime;
    document.getElementById("p2").innerText = this.#totalTimeElapsed;

    if (this.#counter < 30) {
     setTimeout(() => { this.gameLoop() }, tmp_remaining_time > 0 ? tmp_remaining_time : 0);
    }
    //the gameloop ends...
  }
}

//Input handler....  what are our inputs we care about....?
//  up/down/left/right ??  mouse cicks??  both??  for movement..
//  click on a thing (if in range, interact.. otherwise walk to spot??)
//  double click??  jump?  space bar??
//  what is the moo doing?  playng?  dancing?  eating?  stomping (negative)?
//I want this guy to register with the different inputs, and then update itself with the infos..  then anything else
//  can just be like if (input.clicked()) { ... }
class InputHandler {
  static #instance = null;

  constructor() {
    //to do...
    this.testValue = "null";
  }

  static Instance() {
    
    if (InputHandler.#instance) {
      //the instance exists! return it.
      InputHandler.#instance.testValue = "exists!!";
      return InputHandler.#instance;
    }
    else {
      //we need to create a new instance of the class, and save it to instance.
      InputHandler.#instance = new InputHandler();
      InputHandler.#instance.testValue = "did not exist!";
      return InputHandler.#instance;
    }
    

  }

  //all our accessors to see what inputs were inputted!
}

//---===---===---===---
//  Start here!
//---===---===---===---

//document.getElementById("timeUpdate").innerText = InputHandler.Instance().testValue;

//get/create our game instance..
const game = Game.Instance();
document.getElementById("timeUpdate").innerText = InputHandler.Instance().testValue;

//should we have a start, for all the set up?  Probably...

//our loooop
//start the game loop!!  (it repeats itself)
game.targetFPS = 1;
game.gameLoop();
