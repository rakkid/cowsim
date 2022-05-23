
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
    const tmp_now = Date.now();
    this.#timeElapsed = tmp_now - this.#lastTime;
    this.#lastTime = tmp_now;
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
    //update our gameTimer..
    this.#gameTimer.update(this.#gameTime);
    this.#totalTimeElapsed += this.#gameTimer.timeElapsed;
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
    document.getElementById("elapsedTime").innerText = this.#totalTimeElapsed;

    if (this.#counter < 30) {
     setTimeout(() => { this.gameLoop() }, tmp_remaining_time > 0 ? tmp_remaining_time : 0);
    }
    //the gameloop ends...
  }
}


//umm..  create an object to store each button press, I guess.
class InputAction {
  static TYPE_KEY = 1;
  static TYPE_MOUSE = 2;
  constructor(in_type, in_name, in_time) {
    this.type = in_type;
    this.name = in_name;
    this.timeStart = in_time;
    this.timeEnd = in_time;
    this.numPresses = 1;
    this.released = false;
  }
  //this resets time and presses and released...
  reset(in_time) {
    this.timeStart = in_time;
    this.timeEnd = in_time;
    this.numPresses = 1;
    this.released = false;
  }
}

//sooo... should I do a think where we can create multiple input handlers?  Then can swap which is currently active?
//  So we can liike, have one for the gameplay, and the game elements register with that one.  Then have another
//  for maybe hitting escape to enter some menu shit.  Different elements register with that one.  Then we 
//  enable/disable which one is active.  That shouldn't be too hard to add in later.

//Input handler....  what are our inputs we care about....?
//  up/down/left/right ??  mouse cicks??  both??  for movement..
//  click on a thing (if in range, interact.. otherwise walk to spot??)
//  double click??  jump?  space bar??
//  what is the moo doing?  playng?  dancing?  eating?  stomping (negative)?
//I want this guy to register with the different inputs, and then update itself with the infos..  then anything else
//  can just be like if (input.clicked()) { ... }
class InputHandler {
  static #instance = null;
  static #TOO_CLOSE = 2;

  #draw = false;
  #doubleClickDelay = 400;

  //stored buttons..  I'm not going to do modifiers like Command+S, Shift+S, etc..  All button presses here are individual.
  #current = [];
  #completed = [];
  #all = [];
  #overlayElement;
  #allHTMLElements = [];

  constructor() {
    //to do...
    this.testValue = "null";
  }

  set draw(in_draw) {
    this.#draw = in_draw;
  }
  set doubleClickDelay(in_time) {
    this.#doubleClickDelay = in_time;
  }
  get doubleClickDelay() {
    return this.#doubleClickDelay;
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

  //How do I want to handle more-than double clicks?  Liiike, 3 in a row?
  //  a) ignore them - until they stop clicking beyond double-click time, do not let double-click be recognized.
  //  b) once we get a double click, the next click immediately resets to click #1
  //  c) once we get a double click, all clicks up to the double-click time get ignored, and the first click after
  //       double-click time becomes the new first click
  registerInputHandling() {
    //add an event listener for key-down presses.
    //When we get these, we need to save the key to current!
    //  IF we for some reason already have it stored in current, then skip it....???
    //  IF we have it in completed, then they've pressed the key AGAIN before the game has even gotten info about the first
    //    press of this key.  What should we do?  I guess I need to add a counter?
    //    I guess I could use this for double clicks.... have a double-click speed.  We keep everything in completed until
    //    after the double-click length.
    //What if we get events out of order..?  Could it happen???  We press a button so fast that keydown and keyup get 
    //  kicked off at the same time, and we process keyup FIRST?  Maybe when checking the completed, see if its time
    //  matches current time?
    //I'm going to trust that we don't get events out of order.
    //If you hold the button down for a while, it keeps sending KEYDOWN.  Even though no KeyUp happened!  SOOOOoo...
    //  I'm going to change things so that I IGNORE continued key-downs!
    document.addEventListener("keydown", (inn_event) => {
      const tmp_now = Date.now();

      let tmp_all_index = -1;
      let tmp_pressed = null;

      //oh sweet... we can check if it's a repeat event.  if so, we can ignore it.
      if (inn_event.repeat) {
        return;
      }

      //OK... soooo TODO: if they have keys down while we lose window focus, all keys need to be set as "keyup"
      //  Or at least the tab key..  Technically everything will be looking for keyup actions, so long keydowns
      //  shouldn't really matter.  Except the cow walking around.  Oh noo, the cow walked to the edge of the 
      //  pasture!

      //OK, I want to look at event.CODE, rather than event.KEY.  Code does'nt change from modifiers (shift, etc..)

      //let's look for the key..
      //  a) it's already in our current list...  that would mean we somehow missed the keyup??
      //  b) it's in our completed list..  means we're:
      //     a) a double click 
      //     b) a new click (beyond double click time) .. so gotta reset things
      //     c) somehow the keyup event registered before the keydown event??!  (is that possible??) - in this case, we 
      //          don't need to do anything..
      //look for it in the completed list..
      const tmp_pressed_index = this.#completed.findIndex(cur => cur.type === InputAction.TYPE_KEY && cur.name === inn_event.code);
      if (tmp_pressed_index === -1) {
        //it wasn't in the completed list!  Now we can see if it's in current list!
        //  a) it's not there - this is expected, and we just create it and add it.
        //  b) it's there - this means that the system is sending us MORE keydowns, while we're really jsut holding
        //       a key down...
        tmp_pressed = this.#current.find(cur => cur.type == InputAction.TYPE_KEY && cur.name == inn_event.code);
        if (tmp_pressed) {
          //we found it!  We can just return...
          return;
        }
        else {
          //greate!  it wasn't found.  we create it and add it!
          tmp_pressed = new InputAction(InputAction.TYPE_KEY, inn_event.code, tmp_now);
          this.#current.push(tmp_pressed);
          //we also need to add it to all!
          this.#all.push(tmp_pressed);
          //and we KNOW the index in all (last location), so we can save that!
          tmp_all_index = this.#all.length - 1;
        }
        //now draw/update the overlay!
        this.#drawOverlay(tmp_all_index, tmp_pressed);

        //and we can return!
        return;
      }

      //we found this guy in the completed!  Let's get it using index and see what we need to do with it..
      tmp_pressed = this.#completed[tmp_pressed_index];
      //if we're suuuuper close to the keyup event, then we can consider this a "we got the down after the up"..
      //  if that's even a thing....
      if (tmp_now - tmp_pressed.timeEnd < InputHandler.#TOO_CLOSE) {
        //I guess we just leave it there in completed..  we don't need to do anything at all..
        return;
      }
      //if the click is beyond double time, we reset it
      if (tmp_now - tmp_pressed.timeEnd > this.#doubleClickDelay) {
        //reset it!
        tmp_pressed.reset(tmp_now);
      }
      else {
        //we need to update the time, num pressed, and released..  (almost reset the thing, but not, because we want
        //  to remember the num pressed.)..  okay... we save num presses and reset.  that'll be cleaner
        const tmp_presses = tmp_pressed.numPresses;
        tmp_pressed.reset(tmp_now);
        tmp_pressed.numPresses = tmp_presses + 1;
      }
      //now, we need to remove the guy from completed, and put it back into current!
      this.#completed.splice(tmp_pressed_index, 1);
      this.#current.push(tmp_pressed);

      //now draw/update the overlay!
      this.#drawOverlay(tmp_all_index, tmp_pressed);

    }, false);

    //add an event listern for key-up unpresses!
    //When we get these, they're done pressing!  Pull it from current and put it in completed.
    //  if it's not in current, then we missed the key-down??  create one and put it in completed..
    document.addEventListener("keyup", (inn_event) => {
      const tmp_now = Date.now();

      let tmp_all_index = -1;
      let tmp_pressed = null;

      //let's look for the key..
      const tmp_pressed_index = this.#current.findIndex(cur => cur.type === InputAction.TYPE_KEY && cur.name === inn_event.code);

      if (tmp_pressed_index === -1) {
        //it wasn't found!  Weird, but OK.  Let's see if it exists in completed..  we'll either need to update that, or 
        //  build a new pressed..
        //check the completed guy for it...
        tmp_pressed = this.#completed.find(cur => cur.type === InputAction.TYPE_KEY && cur.name === inn_event.code);
        if (tmp_pressed) {
          //okay!  It's there...  we need to update it...
          //first save it as draw_element (for passing to draw method.. so draw can find this guy)
          tmp_draw_element = tmp_pressed;

          //if now is beyond than double-pressed time, then we do NOT save it as double pressed.
          if (tmp_now - tmp_pressed.timeEnd > this.#doubleClickDelay) {
            //we need to consider this guy a "new" object..  so we want to reset it..  this sets the time and num presses
            //  (and also sets released to false, which we need to set to true..)
            tmp_pressed.reset(tmp_now);
            tmp_pressed.released = true;
          }
          else {
            //we can consider this guy a double press!
            tmp_pressed.numPresses++;
            //update the time...  since we never got a start time, we need to use tmp_now for start/end times..
            tmp_pressed.timeStart = tmp_now;
            tmp_pressed.timeEnd = tmp_now;
          }
        }
        else {
          //it wasn't there.. we need to create it and add it to completed...
          tmp_pressed = new InputAction(InputAction.TYPE_KEY, inn_event.code, tmp_now);
          tmp_pressed.released = true;
          this.#completed.push(tmp_pressed);
          //we also need to add it to all!
          this.#all.push(tmp_pressed);
          //and we KNOW the index in all (last location), so we can save that!
          tmp_all_index = this.#all.length - 1;
        }
        //now draw/update the overlay!
        this.#drawOverlay(tmp_all_index, tmp_pressed);

        //and we're done...
        return;
      }

      //we found the index!
      tmp_pressed = this.#current[tmp_pressed_index];
      //Time to update it, remove it from current, and put in completed.
      tmp_pressed.timeEnd = tmp_now;
      tmp_pressed.released = true;
      //remove from current (that's what we need the index for...)
      this.#current.splice(tmp_pressed_index, 1);
      //and add it to completed!
      this.#completed.push(tmp_pressed);

      //now draw/update the overlay!  tmp_all_index is -1...
      this.#drawOverlay(tmp_all_index, tmp_pressed);

    }, false);
  }

  #eventDown(in_event, in_type) {

  }

  #eventUp(in_event, in_type) {

  }

  //time to draw the input overlay!
  #drawOverlay(in_index, in_inputAction) {
    //if draw isn't true, then do NOT draw the overlay!
    if (this.#draw !== true) {
      return;
    }

    //OK!  To draw the overlay!
    //  1) create the overlay div
    //  2) add all our buttons to it
    //  3) put it in the lower left corner??  Some corner..

    //does the overlay exist?
    if (this.#overlayElement) {
      //great... do we need to display it?  (ie, it was hidden..)  we know this is true if in_index is zero!
      //  that means this is the ONLY press, and we just added it to the list!
      if (in_index === 0) {
        //okay!  gotta display it!
        document.body.appendChild(this.#overlayElement);
      }
      //else we're good...
    }
    else {
      //we haven't created it yet!  Time to create the overlay guy!
      this.#overlayElement = document.createElement("div");
      this.#overlayElement.id = "input_overlay";
      document.body.appendChild(this.#overlayElement);
    }

    //OK, now, if in_index is > -1, then we are adding a new guy!
    //  a) create a new html thingy thangy
    //  b) add it to the end of our HTMLElements array
    //ELSE, in_index is -1..  in that case, we need to find the index of the press, and then update the HTMLElement 
    //  to match what it's doing.
    if (in_index === -1) {
      //find it, update it.
      const tmp_index = this.#all.indexOf(in_inputAction);
      //and add the up/down aspect..
      if (in_inputAction.released) {
        //this is up..
        this.#allHTMLElements[tmp_index].classList.remove("input_keydown");
        this.#allHTMLElements[tmp_index].classList.add("input_keyup");
        //aand, I guess we need to call this guy with a timer, to clear it after double click option expires.
        setTimeout(() => { this.#clearOverlayElement(in_inputAction) }, this.#doubleClickDelay+1);
      }
      else {
        //this is down..
        this.#allHTMLElements[tmp_index].classList.remove("input_keyup");
        this.#allHTMLElements[tmp_index].classList.add("input_keydown");
      }
    }
    else {
      //create new one..
      const tmp_element = document.createElement("div");
      tmp_element.classList.add("input_element");
      //now add the up/down aspect...
      if (in_inputAction.released) {
        //this is up..
        tmp_element.classList.add("input_keyup");
        //aand, I guess we need to call this guy with a timer, to clear it after double click option expires.
        setTimeout(() => { this.#clearOverlayElement(in_inputAction) }, this.#doubleClickDelay+1);
      }
      else {
        //this is down..
        tmp_element.classList.add("input_keydown");
      }
      //add the name!
      tmp_element.innerHTML = in_inputAction.name;
      //add it to the HTMLElements array..
      this.#allHTMLElements.push(tmp_element);
      //and add it to the overlay!
      this.#overlayElement.appendChild(tmp_element);
    }
  }

  //When an element gets its up-click, it triggers a delayed call to here, to clear it.
  //  the delay is doubleclick time + 1, so we will always be OK to clear it, if it hasn't been
  //  clicked again in that time.
  #clearOverlayElement(in_inputAction) {
    const tmp_index = this.#all.indexOf(in_inputAction);

    //umm... just in case we don't find it, it means it was already deleted... but this shouldn't
    //  happen, since any time we get multiple clicks in a row, the end-time is updated, so the
    //  earlier calls will fail on the less than doubleClick time check.
    if (tmp_index === -1) {
      //console.log("nothing!");
      return;
    }

    if (Date.now() - in_inputAction.timeEnd > this.#doubleClickDelay) {
      //we're beyond the click delay, so we are good to delete it!
      this.#overlayElement.removeChild(this.#allHTMLElements[tmp_index]);
      this.#allHTMLElements.splice(tmp_index, 1);
      this.#all.splice(tmp_index, 1);
      this.#completed.splice(this.#completed.indexOf(in_inputAction), 1);
      //if there are no more HTML elements, deleeete the overlayElement from body!
      if (this.#all.length === 0) {
        document.body.removeChild(this.#overlayElement);
      }
    }
    //else it must have been clicked again, so no need to delete.. and THAT click will initiate a new
    //  attempt to delete.
  }

  //all our accessors to see what inputs were inputted!
}

//Here's the game window...?
class GameWindow {
  //we want the page size, and we want some sorta top/bottom left/right min border..
  //we also want a height/width ratio
  #minBorderRatio = .18;
  #widthHeightRatio = 12/8;
  #width;
  #height;
  #borderPadding;
  #windowElement;
  #windowBorderElement;
  #windowScale;

  //maybe I don't even need a list of elements..?  Unless this guy determines what is and ISN'T visable..
  #elements = [];

  #bodyWidth;
  #bodyHeight;

  constructor() {
    this.#bodyWidth = document.documentElement.clientWidth;
    this.#bodyHeight = document.documentElement.clientHeight;

    this.#updateSize();
    this.#buildWindow();
  }

  #updateSize() {
    let tmp_width_max = Math.floor(this.#bodyWidth * (1 - 2*this.#minBorderRatio));
    let tmp_height_max = Math.floor(this.#bodyHeight * (1 - 2*this.#minBorderRatio));
    console.log("max w/h are: " + tmp_width_max + " / " + tmp_height_max);

    //now we need to see which is the limiting one...
    let tmp_height_for_width = Math.floor(tmp_width_max / this.#widthHeightRatio);
    let tmp_width_for_height = Math.floor(tmp_height_max * this.#widthHeightRatio);

    //noww.... which one do we use??  if height_for is > than height_max, then we have to use height_max!
    if (tmp_height_for_width > tmp_height_max) {
      this.#width = tmp_width_for_height;
      this.#height = tmp_height_max;
    }
    else {
      this.#width = tmp_width_max;
      this.#height = tmp_height_for_width;
    }

    //the scaling is how small we are compared to 1200x800??  Maybe I should have tiers..
    this.#windowScale = this.#width / 1200;

    this.#borderPadding = (this.#bodyWidth - this.#width) / 2;

    console.log("window will be: " + this.#width + " x " + this.#height);
    console.log("webpage is: " + this.#bodyWidth + " x " + this.#bodyHeight);
    console.log("padding is: " + this.#borderPadding)
    //bam.
  }

  #buildWindow() {
    //let's build the windowww...
    this.#windowBorderElement = document.createElement("div");
    this.#windowBorderElement.id = "gameWindowBorder";
    this.#windowElement = document.createElement("div");
    this.#windowElement.id = "gameWindow";

    this.#windowBorderElement.appendChild(this.#windowElement);
    document.body.appendChild(this.#windowBorderElement);

    //now set the size..
    this.#windowElement.style.width = this.#width + "px";
    this.#windowElement.style.height = this.#height + "px";
    this.#windowBorderElement.style.top = (this.#borderPadding - 5) + "px";
    this.#windowBorderElement.style.left = (this.#borderPadding - 5) + "px";
  }

  //adds the element to the window...
  addElement(in_element, in_fixed_scaling) {
    this.#elements.push(in_element);

    //we need to apply any scaling, that the window has, to the element!  if the element has its own scaling,
    //  then use that instead of the window's scaling!
    if (in_fixed_scaling) {
      in_element.style.height = (in_fixed_scaling*100) + "%";
    }
    else {
      in_element.style.height = (this.#windowScale*100) + "%";
    }

    //add it to the window!
    this.#windowElement.appendChild(in_element);
  }

  removeElement(in_element) {
    //this.#elements.indexOf(in_element);
    this.#elements.splice(this.#elements.indexOf(in_element), 1);
    this.#windowElement.removeChild(in_element);
  }

  //I guess each element can disable itself, if it's not just gone.

  get windowElement() {
    return this.#windowElement;
  }
}

//load files I care about!
class FileLoader {
  static #instance;

  //we need to store the file name when we create the element..  that way, when the element actually
  //  loads, it can get its filename again! (because the src gets updated to a full file path)
  #elementToFileMap;
  #fileMap;

  #numFilesToLoad;
  #numFilesLoaded;
  #okToContinue;

  constructor() {
    this.#fileMap = new Map();
    this.#elementToFileMap = new Map();
    this.#numFilesToLoad = 0;
    this.#numFilesLoaded = 0;
    this.#okToContinue = false;
  }

  static Instance() {
    if (FileLoader.#instance) {
      return FileLoader.#instance;
    }
    FileLoader.#instance = new FileLoader();
    return FileLoader.#instance;
  }

  loaded(in_element) {
    this.#numFilesLoaded += 1;
    let tmp_file_name = this.#elementToFileMap.get(in_element);
    console.log("saving to map: " + tmp_file_name);
    this.#fileMap.set(tmp_file_name, in_element);
  }

  loadFile(in_url, in_html_type, next) {
    //set it up for loading..
    this.#numFilesToLoad += 1;

    const tmp_loaded = document.createElement(in_html_type);
    //tmp_loaded.src = URL.createObjectURL(in_url);
    tmp_loaded.src = in_url;
    this.#elementToFileMap.set(tmp_loaded, in_url);
    tmp_loaded.onload = function() {
      URL.revokeObjectURL(this.src);
      FileLoader.Instance().loaded(this);
      console.log("file has loaded.. " + FileLoader.Instance().loadingComplete + ", " + FileLoader.Instance().okToContinue);
      if (FileLoader.Instance().loadingComplete && FileLoader.Instance().okToContinue) {
        next();
      }
      else {
        console.log("not yet.. " + FileLoader.Instance().okToContinue);
      }
    }
  }

  get loadingComplete() {
    return this.#numFilesToLoad === this.#numFilesLoaded;
  }
  set okToContinue(in_ok) {
    this.#okToContinue = in_ok;
  }
  get okToContinue() {
    return this.#okToContinue;
  }

  async waitUntilComplete() {

    //ummm.... have a little loop
    let tmp_tries = 0;
    let success = false;
    while (tmp_tries <= 5) {
      tmp_tries += 1;
      console.log("try #" + tmp_tries + " START");
      success = await this.#checkIfComplete();
      if (success === true) {
        console.log("  success! breaking while loop!");
        break;
      }
      console.log("try #" + tmp_tries + " END");
    }
    return success;
  }

  #checkIfComplete() {
    if (this.#numFilesToLoad === this.numFilesLoaded) {
      return true;
    }
    const resolve = function() {
      if (this.#numFilesToLoad === this.#numFilesLoaded) {
        //we are done!
        return true;
      }
      else {
        return false;
      }
    }

    const myPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    })
  }

  async recursiveWaitForPromises(in_promise) {
    const resolve = function() {
      if (this.#numFilesToLoad === this.#numFilesLoaded) {
        //we are done!
        imagesLoaded();
      }
      else {
        return false;
      }
    }

    in_promise.then(completed => {
      if (completed) {
        imagesLoaded();
      }
      else {
        //create a new promise
        const myPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 500);
        });
      }
    });
  }

  //this returns a previously loaded file..
  getFile(in_name) {
    console.log("map size: " + this.#fileMap.size + "..  " + this.#elementToFileMap.get(this.#fileMap.get(in_name)));
    return this.#fileMap.get(in_name);
  }
}

//this is going to be its own class.  HTML allows me to repeat a background image, or scale an img.. but I really
//  want to repeat an img...  SOOooo....  I guess its time to build our own.
//It'll take in a specific scaling, its parent element (to get size), and the image to use.  It'll scale itself
//  (which will really be a bunch of images)
class CanvasOverlay {
  #image;
  #imageElement;
  #scale;
  #parent;

  #zindex;
  #left;
  #bottom;
  #right;
  #top;
  #leftImage;
  #bottomImage;
  #rightImage;
  #topImage;

  #canvasElement;

  constructor(in_image, in_scale, in_parent) {
    //let's try and get the image from file loader..
    this.#imageElement = FileLoader.Instance().getFile(in_image);
    this.#image = in_image;
    if (!this.#imageElement) {
      //didn't get anything.. so we need to craete it ourselves.
    this.#imageElement = document.createElement("img");
    this.#imageElement.src = in_image;
    }
    else {
      console.log("gREAT!  file already loaded");
      this.#image = this.#imageElement.src;
      console.log("iamge is: " + this.#image);
    }

    this.#scale = in_scale;
    this.#parent = in_parent;
  }

  get element() {
    return this.#canvasElement;
  }

  set zIndex(in_depth) {
    this.#zindex = in_depth;
  }
  set left(in_img) {
    this.#left = in_img;
    this.#leftImage = FileLoader.Instance().getFile(in_img);
  }
  set bottom(in_img) {
    this.#bottom = in_img;
    this.#bottomImage = FileLoader.Instance().getFile(in_img);
  }
  set right(in_img) {
    this.#right = in_img;
    this.#rightImage = FileLoader.Instance().getFile(in_img);
  }
  set top(in_img) {
    this.#top = in_img;
    this.#topImage = FileLoader.Instance().getFile(in_img);
  }

  createCanvas() {
    this.#canvasElement = document.createElement("div");
    this.#canvasElement.style.position = "relative;"
    this.#canvasElement.style.width = this.#parent.clientWidth + "px";
    this.#canvasElement.style.height = this.#parent.clientHeight + "px";
    this.#canvasElement.style.overflow = "hidden";
    this.#canvasElement.style.zIndex = this.#zindex;

    //oookay.  we need to know our image size, or image scale, and our parent size.  We then calc how many of our
    //  image we need, and voala!  viola?

    const tmp_img = new Image();
    //const tmp_image = URL.createObjectURL(this.#image);
    tmp_img.src = this.#image;
    /*
    tmp_img.onload = function() {
      URL.revokeObjectURL(this.src);
    };
    */

    console.log(this.#parent.clientWidth + ", " + this.#imageElement.naturalWidth + ", " + this.#scale);

    const tmp_horizontal = this.#parent.clientWidth / (this.#imageElement.naturalWidth * this.#scale);
    const tmp_vertical = this.#parent.clientHeight / (this.#imageElement.naturalHeight * this.#scale);
    const tmp_h_rem = this.#parent.clientWidth - (this.#imageElement.naturalWidth * this.#scale) * Math.floor(tmp_horizontal);
    const tmp_v_rem = this.#parent.clientHeight - (this.#imageElement.naturalHeight * this.#scale) * Math.floor(tmp_vertical);
    //aand now I need to add this many...

    console.log(tmp_horizontal + " x " + tmp_vertical + " rem: " + tmp_h_rem + " x " + tmp_v_rem);

    if (1 < 4) {
      //return
    }

    const tmp_size = this.#imageElement.naturalWidth * this.#scale;
    const tmp_bottom_edge_size = this.#bottomImage.naturalHeight;
    //const tmp_bottom_edge_size = this.#bottomImage.naturalHeight * this.#scale;

    let tmp_element;
    for (let i=0; i < tmp_vertical; i++) {
      //create one for each horizontal (and if this is the last one, create the partial)
      for (let j=0; j < tmp_horizontal; j++) {
        //easy...
        tmp_element = document.createElement("img");
        tmp_element.src = this.#image;
        tmp_element.style.height = tmp_size + "px";
        tmp_element.style.position = "absolute";
        tmp_element.style.top = (i*tmp_size) + "px";
        tmp_element.style.left = (j*tmp_size) + "px";
        console.log("natural size is " + tmp_element.naturalWidth);
        this.#canvasElement.appendChild(tmp_element);

        //if this is the left edge (j = 0), then we also need to put our edge graphic
        if (j == 0) {
          tmp_element = document.createElement("img");
          tmp_element.src = this.#leftImage.src;
          tmp_element.style.height = tmp_size + "px";
          tmp_element.style.width = tmp_bottom_edge_size + "px";
          tmp_element.style.position = "absolute";
          tmp_element.style.top = (i*tmp_size) + "px";
          tmp_element.style.left = (j*tmp_size) + "px";
          this.#canvasElement.appendChild(tmp_element);
        }
        //if this is the top edge (i = 0), then we need to put our top edge graphic..
        if (i == 0) {
          tmp_element = document.createElement("img");
          tmp_element.src = this.#topImage.src;
          tmp_element.style.height = tmp_bottom_edge_size + "px";
          tmp_element.style.width = tmp_size + "px";
          tmp_element.style.position = "absolute";
          tmp_element.style.top = (i*tmp_size) + "px";
          tmp_element.style.left = (j*tmp_size) + "px";
          this.#canvasElement.appendChild(tmp_element);
        }
        //if this is the bottom edge, we need to put the bottom edge graphic..
        if (i+1 >= tmp_vertical) {
          tmp_element = document.createElement("img");
          tmp_element.src = this.#bottomImage.src;
          tmp_element.style.width = tmp_size + "px";
          tmp_element.style.height = tmp_bottom_edge_size + "px";
          tmp_element.style.position = "absolute";
          tmp_element.style.top = (this.#parent.clientHeight - tmp_bottom_edge_size) + "px";
          tmp_element.style.left = (j*tmp_size) + "px";
          this.#canvasElement.appendChild(tmp_element);          
        }
        //if this is the right edge, we need to put the right edge graphic..
        if (j+1 >= tmp_horizontal) {
          tmp_element = document.createElement("img");
          tmp_element.src = this.#rightImage.src;
          tmp_element.style.width = tmp_bottom_edge_size + "px";
          tmp_element.style.height = tmp_size + "px";
          tmp_element.style.position = "absolute";
          tmp_element.style.top = (i*tmp_size) + "px";
          tmp_element.style.left = (this.#parent.clientWidth - tmp_bottom_edge_size) + "px";
          this.#canvasElement.appendChild(tmp_element);          
        }
      }

      /*
      if (tmp_h_rem > 0) {
        tmp_element = document.createElement("img");
        tmp_element.src = this.#image;
        tmp_element.style.height = tmp_size + "px";
        tmp_element.style.width = tmp_h_rem + "px";
        this.#canvasElement.appendChild(tmp_element);
      }
      */
    }

    //now add it to the parent!
    this.#parent.appendChild(this.#canvasElement);
  }
}


//ummm..... GameWindow is where our game happens...  externally, I'm telling the gamewindow what z-index each thing 
//  needs to be on.  However, the pasture horizon is a point where some objects change z-index...
//I'm going to need to give a distance to whatever handles the horizon, etc, and then that needs to change the z-index 
//  as stuff appears in front and behind it.  Mean.  GameWindow does NOT handle the z-index!  Each element, or something,
//  handles their own index.  There ya go.

//---===---===---===---
//  Start here!
//---===---===---===---

//document.getElementById("timeUpdate").innerText = InputHandler.Instance().testValue;

//get/create our game instance..
const game = Game.Instance();
document.getElementById("timeUpdate").innerText = InputHandler.Instance().testValue;

InputHandler.Instance().registerInputHandling();
InputHandler.Instance().draw = true;
//InputHandler.Instance().doubleClickDelay = 2000;

//should we have a start, for all the set up?  Probably...

//our loooop
//start the game loop!!  (it repeats itself)
game.targetFPS = 1;
game.gameLoop();

//how do we get the screen width and height??
let tmp_screen_width = document.body.clientWidth;
let tmp_screen_height = document.body.clientHeight;
//alert("h x w: " + tmp_screen_height + " x " + tmp_screen_width);

let gameWindow = new GameWindow();

//here's our canvas overlay..
//let tmp_canvas = document.createElement("img");
//tmp_canvas.src = "assets/canvas_36tpi_2x2_288.png";
//gameWindow.addElement(tmp_canvas);

//const tmp_canvas = new CanvasOverlay("assets/canvas_36tpi_2x2_288.png", 0.5, gameWindow.windowElement);
//tmp_canvas.createCanvas();

FileLoader.Instance().loadFile("assets/canvas_36tpi_2x2_288.png", "img", imagesLoaded);
FileLoader.Instance().loadFile("assets/canvas_edge_v_light.png", "img", imagesLoaded);
FileLoader.Instance().loadFile("assets/canvas_edge_h_light.png", "img", imagesLoaded);
FileLoader.Instance().loadFile("assets/canvas_edge_v_right.png", "img", imagesLoaded);
FileLoader.Instance().loadFile("assets/canvas_edge_h_top.png", "img", imagesLoaded);
FileLoader.Instance().okToContinue = true;
console.log("ready ready");

//let success = FileLoader.Instance().waitUntilComplete();
//console.log("success" + success);

//let tmp_tries = 0;
//while (tmp_tries )

function imagesLoaded() {
  console.log("OMG SOMETHING WORKS!");
  const tmp_canvas = new CanvasOverlay("assets/canvas_36tpi_2x2_288.png", .5, gameWindow.windowElement);
  tmp_canvas.zIndex = 10;
  tmp_canvas.left = "assets/canvas_edge_v_light.png";
  tmp_canvas.bottom = "assets/canvas_edge_h_light.png";
  tmp_canvas.right = "assets/canvas_edge_v_right.png";
  tmp_canvas.top = "assets/canvas_edge_h_top.png";
  tmp_canvas.createCanvas();
}
