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

const IMG_TYPE = "png";
const HILL_OPTIONS = 4;
const HILL_COLORS = ["g"];
const HILL_NAME = "assets/hill/hill_"
const GRASS_S_OPTIONS = 5;
const GRASS_S_NAME = "assets/grass/grass_s_";
const GRASS_L_OPTIONS = 4;
const GRASS_L_NAME = "assets/grass/grass_l_";
const FLOWER_OPTIONS = 4;
const TREE_OPTIONS = 4;
const GROUND_EFFECTS_OPTIONS = 4;

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
      const tmp_pressed_index = this.#completed.findIndex(vv_cur => vv_cur.type === InputAction.TYPE_KEY && vv_cur.name === inn_event.code);
      if (tmp_pressed_index === -1) {
        //it wasn't in the completed list!  Now we can see if it's in current list!
        //  a) it's not there - this is expected, and we just create it and add it.
        //  b) it's there - this means that the system is sending us MORE keydowns, while we're really jsut holding
        //       a key down...
        tmp_pressed = this.#current.find(vv_cur => vv_cur.type == InputAction.TYPE_KEY && vv_cur.name == inn_event.code);
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
      const tmp_pressed_index = this.#current.findIndex(vv_cur => vv_cur.type === InputAction.TYPE_KEY && vv_cur.name === inn_event.code);

      if (tmp_pressed_index === -1) {
        //it wasn't found!  Weird, but OK.  Let's see if it exists in completed..  we'll either need to update that, or 
        //  build a new pressed..
        //check the completed guy for it...
        tmp_pressed = this.#completed.find(vv_cur => vv_cur.type === InputAction.TYPE_KEY && vv_cur.name === inn_event.code);
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

//class for animated actions of objects?  I dunoo.....
class Animation {
  #name;
  #numFrames;
  #frameImgs;
  #timeLength;
  #frameTimes;  //ratio of how long each frame lasts over the whole length...
}

class Location {
  #x;
  #y;
  #z;

  constructor(in_x, in_y, in_z) {
    this.#x = in_x;
    this.#y = in_y;
    this.#z = in_z;
  }

  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  get z() {
    return this.#z;
  }
}

//should I allow us to 
class Size {
  #width;
  #height;
  constructor(in_width, in_height) {
    if (in_width < 0 || in_height < 0) {
      throw "Size object cannot have negative size!! (w x h): (" + in_width + " x " + in_height + ")";
    }
    //let's round these...
    this.#width = Math.round(in_width);
    this.#height = Math.round(in_height);
  }

  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  //should I allow these??  Or require new every time?
  /*
  set width(in_value) {
    this.#width = in_value;
  }
  set height(in_value) {
    this.#height = in_value;
  }
  */
}

//base class for game objects...  who knows!
class GameObject {
  static LOC_CC = 1;  //center center
  static LOC_BC = 2;  //bottom center
  static LOC_BL = 3;  //bottom left
  static LOC_TL = 4;  //top left
  //is location CENTER of image?
  #location;
  #locationPoint;

  //do I wrap this guy in a div?  Or just have a floating image?
  #element;

  #sceneLocation;
  #xyOffset;

  #naturalSize;
  //how am I going to do size....?  size vs image size??
  #sizeScale;
  //this is the actual size of our img/div holding it.  calc'd from img size and scale.
  #size;
  //this is the top left, calculated from size, location, and loc point
  #topLeft;

  #img;
  #baseAnimation;
  #animationMap;

  #locChange;

  #hidden;
  #disabled;
  #deleted;

  constructor() {
    this.#location = new Location(0,0,0);
    this.#locationPoint = GameObject.LOC_BL;
    this.#animationMap = new Map();
    this.#locChange = true;  //it needs to be drawn initially...
    this.#hidden = false;
    this.#disabled = false;
    this.#deleted = false;
  }

  begin() {}
  update() {}
  delete() {}

  resetLocChange() {
    this.#locChange = false;
  }

  #calcOffset() {
    let tmp_x_offset = 0;
    let tmp_y_offset = 0;

    if (this.#locationPoint === GameObject.LOC_CC) {
      //center-center:
      //  width is - 1/2 width
      //  height is - 1/2 height
      tmp_x_offset = Math.round(-0.5 * this.size.width);
      tmp_y_offset = Math.round(-0.5 * this.size.height);
    }
    else if (this.#locationPoint === GameObject.LOC_BC) {
      //bottom-center:
      //  width is - 1/2 width
      //  height is no change
      tmp_x_offset = Math.round(-0.5 * this.size.width);
      tmp_y_offset = 0;
    }
    else if (this.#locationPoint === GameObject.LOC_CC) {
      //bottom-left:
      //  width is 0
      //  height is 0
      tmp_x_offset = 0;
      tmp_y_offset = 0;
    }
    else if (this.#locationPoint === GameObject.LOC_CC) {
      //top-left:
      //  width is 0
      //  height is -  height
      tmp_x_offset = 0;
      tmp_y_offset = -1 * this.size.height;
    }

    //and save our offset..
    this.#xyOffset = new Location(tmp_x_offset, tmp_y_offset, 0);
  }

  set location(in_value) {
    if (! in_value instanceof Location) {
      throw "GameObject.location must be a Location object!";
    }
    this.#locChange = true;
    this.#location = in_value;
  }
  get location() {
    return this.#location;
  }
  set locationPoint(in_value) {
    if (in_value < 0 || in_value > 4) {
      throw "GameObject.locationPoint is invalid!!";
    }
    this.#locationPoint = in_value;
  }
  get locChange() {
    return this.#locChange;
  }
  getLocationBox() {
    //this returns this guy's box...
    return this.#element.getBoundingClientRect();
  }
  set sizeScale(in_value) {
    if (in_value < 0) {
      throw "GameObject.sizeScale cannot be negative!!";
    }
    if (this.#element == null) {
      //element was never created??  That means they never gave us an image...  Not good!!
      throw "GameObject.image but be assigned before assigning sizeScale!";
    }

    //OK!  We've been told our size scale!  We need to use this with our natural size and set our
    //  size!
    //This value is coming from our parent scene layer, which combines its zDepth scale with the
    //  scaling of the gameWindow!  So we don't need to know anything special here!
    if (this.#sizeScale === in_value) {
      //size scale is already what we want, so we are good!
      return;
    }
    this.#sizeScale = in_value;
    this.#size = new Size(in_value * this.#naturalSize.width, in_value * this.#naturalSize.height);
    //TODO:  ALTERNATELY, I can create a new Size in the constructor, and just update the size here..
    //  then I'm not creating lots of new Size objects...  buuut, I dunno.  Defeats the purpose of
    //  accidently messing up the size object?  It does'nt really matter....

    //also create our x and y offsets to get to BOTTOM LEFT of this image!
    this.#calcOffset();

    //TODO:  Have different rendered images based on size... if our size goes below a threshold, swap
    //  images to the smaller (or larger) size?

    //also update our object??
    this.#element.style.width = this.#size.width + "px";
    this.#element.style.height = this.#size.height + "px";
  }
  setImage(in_value, in_loaded) {
    this.#img = in_value;

    this.#naturalSize = new Size(in_loaded.naturalWidth, in_loaded.naturalHeight);

    //aand... build our element if need be??
    if (this.#element == null) {
      this.#element = document.createElement("img");
      this.#element.src = in_loaded.src;
      this.#element.classList.add("sceneElement");
    }
  }
  set baseAnimation(in_value) {
    if (! in_value instanceof Animation) {
      throw "GameObject.baseAnimation must be an Animation!!";
    }
    this.#baseAnimation = in_value;
  }
  addAnimation(in_value) {
    if (! in_value instanceof Animation) {
      throw "GameObject.addAnimation must receive an Animation!!";
    }
    this.#animationMap.set(in_value.name, in_value);
  }
  set sceneLocation(in_value) {
    if (! in_value instanceof Location) {
      throw "GameObject.sceneLocation must be a Location object!";
    }
    this.#sceneLocation = in_value;

    //and now update our location??  this is absolute locations within our parent..
    this.#element.style.zIndex = this.#sceneLocation.z;
    //now set the location to our element!  We do bottom left!  (x and y offsets are already calc'd)
    console.log("HILL LEFT IS " + (this.#sceneLocation.x + this.#xyOffset.x));
    this.#element.style.left = Math.round(this.#sceneLocation.x + this.#xyOffset.x) + "px";
    this.#element.style.bottom = Math.round(this.#sceneLocation.y + this.#xyOffset.y) + "px";
  }

  get size() {
    return this.#size;
  }
  get element() {
    return this.#element;
  }
  get naturalSize() {
    return this.#naturalSize;
  }
}

//I need to create something that handles depth and converts it into z-index and height... and I guess
//  horizontal movement in the distance.
//  a) pasture / grass / ground area that is in front of our "horizon"  - also need a height of our horizon
//  b) the "back" pasture/grass/ground area (behind the horizon)
//  c) far pastures (imagine some rolling hills) .. some dots of cows, tractor, cowboy in the distance..
//       maybe we could set it up so we can see the back fence on a far hill..
//  d) woods / mountains, far mountains (and clouds) are 3 other distances.
//SO..  let's say we give everything a real x,y,z location, and we then translate those..
//  umm...  let's say our cow stands at 20.  pasture horizon is at 0. so anything on the horizon is 20 away
//    from cow.  Cow walks toward horizon, those things get closer.
//  pasture size...  this will start at maybee.. umm..  40x40 ?  eventually get to ... 400x400?
//  back pasture is just hidden until stuff gets close...  40 away?  We can start with that..  and things 
//    behind the horizon will scale down.
//  far pasture - umm... 300 away?  300 ...  means we can see 100 of the last of our pasture..  when we 
//    get to distance of 400, then there's still 300 away.  plus maybe 150??  so 300-450 is visible..
//    So when we walk to 400, then that's 700 - 850 is visible.  HOWEVER, I don't want the back pasture
//    to move at alll until maybe we walk to a distance of 100 or 120??  Soo, it's really only 240 away.
//  Anyway... beyond that will be like somewhere around 800 to 1000...
//  Anything beyond 1000 is FIXED depth.  It won't come closer.  But it will move left/right a bit??

//Umm..  Let's create the farfar ones first, so I can get a better concept of how to do scaled left/right 
//  movement..
//we will need a movement ratio for left right.  maybe another for up/down???
//  for every 10 that the camera (or cow) moves, move 1.  that'll be 0.1 move ratio.
//Relative height..  where lower left is..?  Since each layer is higher than the one in front of it..
//  How best to do this.  I could do it as a ratio.  0.4 = 40% of parent..  let's give it a try..
class SceneLayer {
  static TOP = 1;
  static BOTTOM = 2;

  #baseDepth;  //z index for this guy's div.
  #moveRatioH;
  #moveRatioV;
  #relHeight;  //where the bottom edge will be on the screen.
  #parentWindow;

  //SceneLayer needs an effective "height"...  liiike, how much is the ground, for knowing where our edge is, etc..
  //is this my horizon line?  Do I give it an image, and be like "here is this guy's relative height (where it starts)",
  //  and this guy is the horizon definer!  And it uses that height to figure it out..
  #layerHeight;
  #layerHorizonHeight;

  #element
  #gameObjects;  //is there a best way to have these dudes sorted?  I think I once read about handling collisions..
  #staticGameObjects;

  constructor(in_depth, in_ratio_horizontal, in_ratio_vertical, in_relative_height, in_parent_window) {
    this.#baseDepth = in_depth;
    this.#moveRatioH = in_ratio_horizontal;
    this.#moveRatioV = in_ratio_vertical;
    this.#relHeight = in_relative_height;
    this.#parentWindow = in_parent_window;

    this.#gameObjects = [];
    this.#staticGameObjects = [];
    this.#element = document.createElement("div");
    this.#element.style.zIndex = this.#baseDepth;
    this.#element.classList.add("sceneLayer");
    this.#element.style.width = in_parent_window.windowElement.clientWidth + "px";

    //calc our height using relative height...  OK, that was easy.
    this.#layerHeight = Math.round(in_parent_window.windowElement.clientHeight * in_relative_height);
    //NOTE: this can be changed if "defineLayerHorizonHeight" is called later...
    this.#layerHorizonHeight = this.#layerHeight;
    this.#element.style.height = this.#layerHeight + "px";


    //aand add ourself to our parent??
    in_parent_window.addScene(this.#element);
  }

  addObject(in_game_object) {
    //okayyyy!  New game object in our windowww!  It has a location... we need to translate that location to
    //  OUR scene!  Trickyyyy

    this.#gameObjects.push(in_game_object);
    this.#element.appendChild(in_game_object.element);
  }

  //OK... static objects do not move/change, etc...  they are just there.  Pretty much the ground and horizon edge)
  //These guys are kept in a separate list, since they don't update, so no need to look at them in the update
  //  method!
  addStaticObject(in_game_object) {
    this.#staticGameObjects.push(in_game_object);
    //give it the right scale, and we should be good...
    in_game_object.sizeScale = this.#parentWindow.windowScale;
    //no scaling or changing of location for scene loc
    in_game_object.sceneLocation = new Location(in_game_object.location.x, in_game_object.location.y, in_game_object.location.z);
    this.#element.appendChild(in_game_object.element);
  }

  //This adds a static object to the horizon line!  The X location and Z location are kept.  We adjust the Y location,
  //  so this element sits on the horizon!  Either above it (obj_edge is BOTTOM), or below it (obj_edge is TOP)..
  addStaticObjectToHorizon(in_game_object, in_obj_edge, in_horizon_offset) {
    this.#staticGameObjects.push(in_game_object);
    //give it the right scale
    in_game_object.sizeScale = this.#parentWindow.windowScale;
    //now we need to give it its new location!
    let tmp_y = this.#layerHorizonHeight;
    if (in_obj_edge === SceneLayer.TOP) {
      //adjust the height..  subtract height of game object!
      tmp_y -= in_game_object.size.height;
    }
    //and now adjust any offset...
    tmp_y += in_horizon_offset;
    //MAYBE that'll do it??
    in_game_object.location = new Location(in_game_object.location.x, tmp_y, in_game_object.location.z);
    //and now the scene loc... no scaling or changing of location for scene loc, since we're static.
    in_game_object.sceneLocation = new Location(in_game_object.location.x, in_game_object.location.y, in_game_object.location.z);
    this.#element.appendChild(in_game_object.element);
  }

  //this goes through each gameObject and checks if we need to update the object's visual position..
  update() {

    let deletedObjs = [];

    this.#gameObjects.forEach((vv_object, vv_index, vv_array) => {
      //if it's deleted, BYE!
      if (vv_object.deleted) {
        deletedObjs.push(vv_index);
      }
      else if (vv_object.hidden) {
        //hide it!?  Maybe it's already hidden..?  just remove it from view?  Hmm... how best to do this one..
        //  maybe in the gameObject.   TODO
      }
      else if (vv_object.disabled) {
        //again, what do we do with this one??  TODO
      }
      //if the scene view changed OR the gameObject's location changed, then we need to update!
      else if (this.#parentWindow.viewChange || vv_object.locChange) {
        let tmp_size_scale = this.#parentWindow.windowScale;
        let tmp_x = 0;
        let tmp_y = 0;
        let tmp_z = 0;

        tmp_x = vv_object.location.x;
        tmp_y = vv_object.location.y;
        tmp_z = vv_object.location.z;
        //check if its out of view??  Maybe move those to a different gameObject list?? well... we'd need to
        //  check if its back in view, anyway, sooo maybe not..

        //if it WAS out of view, and is now in view, we need to add it back to our element.

        //if it WAS in view, and is now out of view, we need to remove it from our element.

        //aaand give it its new infoz!
        //first give it size scale...
        vv_object.sizeScale = tmp_size_scale;
        //now we can give it location.  it takes care of putting these numbers to its element.
        vv_object.sceneLocation = new Location(tmp_x, tmp_y, tmp_z);
      }
      //else we don't need to update this guy.....
    });

    //if there are any deleted, we need to remove them!  go backwards through our deletedObj list.
    for (let i=deletedObjs.length-1; i >= 0; i--) {
      gameObjects.splice(deletedObjs[i], 1);
    }

  }

  defineLayerHorizonHeightBySize(in_pixels) {
    this.#layerHorizonHeight = in_pixels;
  }
  defineLayerHorizonHeightByObject(in_game_object) {
    //just call by size...
    this.defineLayerHorizonHeightBySize(in_game_object.size.height);
  }

  get horizonHeight() {
    return this.#layerHorizonHeight;
  }
}

//Here's the game window...?  OK, making it so I can use multiple of these, and they will be tied to the 
//  size of a parent..
//  we'll use 2 ways...  borderRatio and parentRatio.
//  borderRatio - construct our size by calculating the border/padding between us and parent
//  parentRatio - construct our size so we're a % size of parent.
class GameWindow {
  //we want the page size, and we want some sorta top/bottom left/right min border..
  //we also want a height/width ratio
  #borderRatio;
  #parentRatio;
  #widthHeightRatio = 12/8;
  #parentElement;
  #width;
  #height;
  #borderPadding;
  #windowElement;
  #windowBorderElement;
  #windowScale;

  #topLeftLoc = [0, 0];

  #viewChange;

  //maybe I don't even need a list of elements..?  Unless this guy determines what is and ISN'T visable..
  #elements = [];
  #scenes = [];

  #bodyWidth;
  #bodyHeight;

  constructor(in_parent_element, in_parent_ratio, in_border_ratio, in_width_height_ratio) {
    if (!in_parent_ratio && !in_border_ratio) {
      throw "GameWindow must have a size ratio provided!";
    }
    this.#parentElement = in_parent_element
    this.#bodyWidth = in_parent_element.clientWidth;
    this.#bodyHeight = in_parent_element.clientHeight;

    this.#borderRatio = in_border_ratio;
    //umm... if borderRatio is provided, calc paretRatio..
    if (in_border_ratio > 0) {
      const tmp_parent_ratio = 1 - (2 * in_border_ratio);

      //now do I care about this...??
      if (in_parent_ratio > 0 && tmp_parent_ratio > in_parent_ratio) {
        //this means that the provided parent ratio is smaller than expected based on border ratio..
        //soo...  this guy's size PLUS border is less than parent..  do I use the parent ratio, then?
        //  I guess so.
        this.#parentRatio = in_parent_ratio;
      }
      else {
        this.#parentRatio = tmp_parent_ratio;
      }
    }
    else {
      this.#parentRatio = in_parent_ratio;
    }

    if (in_width_height_ratio > 0) {
      this.#widthHeightRatio = in_width_height_ratio;
    }

    this.#updateSize();
  }

  //TODO:  Ummm.....  when I created this with borderRatio, I had to make sure we were smaller on all 4 sides..
  //  now that I'm doing a parent ratio, do I do the same thing???  Liiike, 25% of width OR height??  Or just 1?
  #updateSize() {
    //let tmp_width_max = Math.floor(this.#bodyWidth * (1 - 2*this.#minBorderRatio));
    //let tmp_height_max = Math.floor(this.#bodyHeight * (1 - 2*this.#minBorderRatio));

    let tmp_width_max = Math.floor(this.#bodyWidth * this.#parentRatio);
    let tmp_height_max = Math.floor(this.#bodyHeight * this.#parentRatio);

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

    //TODO: change this to something that either uses a padding OR the borderRatio
    if (this.#borderRatio > 0) {
      this.#borderPadding = Math.floor(this.#bodyWidth * this.#borderRatio);
    }

    console.log("window will be: " + this.#width + " x " + this.#height);
    console.log("webpage is: " + this.#bodyWidth + " x " + this.#bodyHeight);
    console.log("padding is: " + this.#borderPadding)
    //bam.
  }

  buildWindow() {
    //let's build the windowww...
    this.#windowBorderElement = document.createElement("div");
    this.#windowBorderElement.classList.add("gameWindowBorder");
    this.#windowElement = document.createElement("div");
    this.#windowElement.classList.add("gameWindow");

    this.#windowBorderElement.appendChild(this.#windowElement);
    document.body.appendChild(this.#windowBorderElement);

    //now set the size..
    this.#windowElement.style.width = this.#width + "px";
    this.#windowElement.style.height = this.#height + "px";
    if (this.#borderPadding > 0) {
      this.#windowBorderElement.style.top = this.#borderPadding + "px";
      this.#windowBorderElement.style.left = this.#borderPadding + "px";
    }
    else {
      this.#windowBorderElement.style.top = this.#topLeftLoc[1] + "px";
      this.#windowBorderElement.style.left = this.#topLeftLoc[0] + "px";
    }
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

  //This adds a scene.  The scene handles its own scaling (by checking this guys scaling)
  addScene(in_scene) {
    this.#scenes.push(in_scene);
    this.#windowElement.appendChild(in_scene);
  }

  //I guess each element can disable itself, if it's not just gone.

  get windowElement() {
    return this.#windowElement;
  }
  set widthHeightRatio(in_ratio) {
    this.#widthHeightRatio = in_ratio;
  }
  set location(in_loc) {
    this.#topLeftLoc = in_loc;
  }
  get size() {
    return { width: this.#width, height: this.#height };
  }
  get windowScale() {
    return this.#windowScale;
  }
  get viewChange() {
    return this.#viewChange;
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

    const myPromise = new Promise((vv_resolve) => {
      setTimeout(() => {
        vv_resolve();
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

    in_promise.then(vv_completed => {
      if (vv_completed) {
        imagesLoaded();
      }
      else {
        //create a new promise
        const myPromise = new Promise((vv_resolve) => {
          setTimeout(() => {
            vv_resolve();
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

//This guy goes along with our FileLoader... we can add images to this guy and it'll load them all when we are ready.
class PreloadHandler {
  static #instance = null;
  #fileList;
  #fileType = "img"

  constructor() {
    if (PreloadHandler.#instance != null) {
      throw "PreloadHandler is a Singleton!  Use PreloadHandler.Instance()."
    }
    this.#fileList = [];
  }

  static Instance() {
    if (PreloadHandler.#instance != null) {
      return PreloadHandler.#instance;
    }
    else {
      PreloadHandler.#instance = new PreloadHandler();
      return PreloadHandler.#instance;
    }
  }

  addFile(in_file) {
    //do I care if it's already in there?  Might as well...
    if (this.#fileList.findIndex(vv_file => vv_file === in_file) === -1) {
      //great!  we don't have it!
      this.#fileList.push(in_file);
    }
    //and that's it!
  }

  //aaand load them all!
  loadAll(in_callback) {
    this.#fileList.forEach(vv_file => FileLoader.Instance().loadFile(vv_file, this.#fileType, in_callback));
    FileLoader.Instance().okToContinue = true;
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

const pastureList = [];
const farFieldList = [];
const hillList = [];
const skyList = [];  //umm... the sun??  stuff to cover it?
//umm...should it just be a function?
function hillLayerPreBuild() {
  //Well.... we pick a couple random hills, and then place them.  Not much to it.

  let tmp_hills_to_pick = 2;

  //pick our color ..  will this be based on season??  let's not get ahead of myself here...  no seasons til it's
  //  actually done first, thank you very much!
  let tmp_color = HILL_COLORS[0];

  //now we pick however many..
  let tmp_hills = [];
  let tmp_num;
  for (let i=0; i<tmp_hills_to_pick; i++) {
    tmp_num = Math.floor((Math.random() * HILL_OPTIONS)) + 1;  //(add 1, since our first hill is 1, not zero)
    //only do this check if we have more hills than how many we need!  (if we have less hill options than we need,
    //  then we will get repeats guaranteed..)
    while (HILL_OPTIONS > tmp_hills_to_pick && tmp_hills.findIndex(vv_val => vv_val === tmp_num) !== -1) {
      tmp_num += 1;
      if (tmp_num > HILL_OPTIONS) {
        //start back at the first one.  which is 1 (not zero)
        tmp_num = 1;
      }
    }
    tmp_hills.push(tmp_num);
  }

  for (let i=0; i<tmp_hills.length; i++) {  
    hillList.push(HILL_NAME + (tmp_hills[i] < 10 ? "0" : "") + tmp_hills[i] + "_" + tmp_color + "." + IMG_TYPE);
  }
}
//In my little mockup, the hills were 318 px down from top edge.. (of height 900)..  318/900.
function hillLayerBuild(in_window) {
  const heightRatio = 320/900;
  const zIndex = -10;

  //constructor(in_depth, in_ratio_horizontal, in_ratio_vertical, in_relative_height, in_parent_window)
  let tmp_layer = new SceneLayer(zIndex, 0.01, 0, heightRatio, in_window);

  //nooow create these objects??
  let tmp_avg_start = in_window.windowElement.clientWidth / hillList.length;
  let tmp_offset = in_window.windowElement.clientWidth * 0.15;
  let tmp_range = tmp_offset * 2;
  let tmp_horizontal = 0;
  let tmp_count = 0;
  hillList.forEach(vv_hill => {
    let tmp_hill = new GameObject();
    tmp_hill.setImage(vv_hill, FileLoader.Instance().getFile(vv_hill));
    //for our hill locations, we want to start at the left side, and give-or-take move over width / #hills..
    //  let's do +/- 15%?
    tmp_horizontal = (tmp_count * tmp_avg_start) + (Math.random() * tmp_range) - tmp_offset;
    tmp_hill.location = new Location(tmp_horizontal, 0, 0);
    tmp_layer.addObject(tmp_hill);
    tmp_count++;
  });

  return tmp_layer;
}
function farFieldLayerPreBuild() {
  farFieldList.push("assets/farfield.png");
  farFieldList.push("assets/farfield_top_edge.png");
  farFieldList.push("assets/field.png");
}
function farFieldLayerBuild(in_window) {
  const heightRatio = 516/900;
  const zIndex = -5;

  let tmp_layer = new SceneLayer(zIndex, 0.06, 0, heightRatio, in_window);

  //gotta create our images!  ohhh...  umm... the grass and top edge are static, huh?
  let tmp_obj = new GameObject();
  tmp_obj.setImage("assets/farfield.png", FileLoader.Instance().getFile("assets/farfield.png"));
  //this guy is at the bottom..
  tmp_obj.location = new Location(0, 0, -2);
  tmp_layer.addStaticObject(tmp_obj);
  tmp_layer.defineLayerHorizonHeightByObject(tmp_obj);

  tmp_obj = new GameObject();
  tmp_obj.setImage("assets/farfield_top_edge.png", FileLoader.Instance().getFile("assets/farfield_top_edge.png"));
  //this guy is at the top edge of the grass we just created..
  //the height is....  height of horizon in layer, minus our height..??  but it's our height after its been 
  //  scaled... and it doesn't get scaled until we add it to the layer...???  that's MESSY!  Fuck.  HMmm....
  tmp_obj.location = new Location(0, 0, -1);
  //tmp_layer.addStaticObject(tmp_obj);
  tmp_layer.addStaticObjectToHorizon(tmp_obj, SceneLayer.TOP, -1);

  return tmp_layer;
}
function skyLayerPreBuild() {
  skyList.push("assets/sky.png");
}
function skyLayerBuild(in_window) {
  const heightRatio = 372/900;
  const zIndex = -15;

  let tmp_layer = new SceneLayer(zIndex, 0, 0, heightRatio, in_window);


  return tmp_layer;
}
function pastureLayerPreBuild() {
  pastureList.push("assets/pasture.png");
  pastureList.push("assets/frontpasture_top_edge.png");

  for (let i=1; i <= GRASS_S_OPTIONS; i++) {
    pastureList.push(GRASS_S_NAME + (i < 10 ? "0" : "") + i + "." + IMG_TYPE);
  }
  for (let i=1; i <= GRASS_L_OPTIONS; i++) {
    pastureList.push(GRASS_L_NAME + (i < 10 ? "0" : "") + i + "." + IMG_TYPE);
  }

  //OMG!!  ADD THE COW DUH!!!!
  pastureList.push("assets/cow.png");
}
function pastureLayerBuild(in_window) {
  const heightRatio = 1;
  const zIndex = -1;  

  let tmp_layer = new SceneLayer(zIndex, 1, 0, heightRatio, in_window);

  //create the pasture and top edge..
  let tmp_obj = new GameObject();
  tmp_obj.setImage("assets/pasture.png", FileLoader.Instance().getFile("assets/pasture.png"));
  //this guy is at the bottom..
  tmp_obj.location = new Location(0, 0, -1);
  tmp_layer.addStaticObject(tmp_obj);
  tmp_layer.defineLayerHorizonHeightByObject(tmp_obj);

  tmp_obj = new GameObject();
  tmp_obj.setImage("assets/frontpasture_top_edge.png", FileLoader.Instance().getFile("assets/frontpasture_top_edge.png"));
  //this guy is at the top edge of the grass we just created..
  //the height is....  height of horizon in layer, minus our height..??  but it's our height after its been 
  //  scaled... and it doesn't get scaled until we add it to the layer...???  that's MESSY!  Fuck.  HMmm....
  tmp_obj.location = new Location(0, 0, 0);
  tmp_layer.addStaticObjectToHorizon(tmp_obj, SceneLayer.TOP, -1);

  //le moo!
  tmp_obj = new GameObject();
  tmp_obj.locationPoint = GameObject.LOC_BC;
  let tmp_cow_file = FileLoader.Instance().getFile("assets/cow.png");
  tmp_obj.setImage("assets/cow.png", tmp_cow_file);
  let tmp_x = Math.random() * (in_window.windowElement.clientWidth - (tmp_cow_file.naturalWidth * 1.2)) + (tmp_cow_file.naturalWidth * 0.6);
  let tmp_y = Math.random() * (tmp_layer.horizonHeight - (tmp_cow_file.naturalHeight * 0.4)) + (tmp_cow_file.naturalHeight * 0.2);
  tmp_obj.location = new Location(tmp_x, tmp_y, 0);
  tmp_layer.addObject(tmp_obj);


  return tmp_layer;
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

let gameWindow = new GameWindow(document.documentElement, 0, 0.18, 12/9);
gameWindow.buildWindow();
let charWindow = new GameWindow(gameWindow.windowElement, 0.3, 0, 3/2);
//let adWindow = new GameWindow(gameWindow.windowElement, 0.25, 0, 3/2);

//top location is....... (parent's height - my height) * .3 ...  that's like 30% padding top, 60% bottom..
charWindow.location = [gameWindow.windowElement.getBoundingClientRect().left, 
    (gameWindow.windowElement.getBoundingClientRect().top - charWindow.size.height) * .35];
charWindow.buildWindow();

//here's our canvas overlay..
//let tmp_canvas = document.createElement("img");
//tmp_canvas.src = "assets/canvas_36tpi_2x2_288.png";
//gameWindow.addElement(tmp_canvas);

//const tmp_canvas = new CanvasOverlay("assets/canvas_36tpi_2x2_288.png", 0.5, gameWindow.windowElement);
//tmp_canvas.createCanvas();

/*
FileLoader.Instance().loadFile("assets/canvas_36tpi_2x2_288.png", "img", imagesLoaded);
FileLoader.Instance().loadFile("assets/canvas_edge_v_light.png", "img", imagesLoaded);
FileLoader.Instance().loadFile("assets/canvas_edge_h_light.png", "img", imagesLoaded);
FileLoader.Instance().loadFile("assets/canvas_edge_v_right.png", "img", imagesLoaded);
FileLoader.Instance().loadFile("assets/canvas_edge_h_top.png", "img", imagesLoaded);
FileLoader.Instance().okToContinue = true;
console.log("ready ready");
*/

PreloadHandler.Instance().addFile("assets/canvas_36tpi_2x2_288.png");
PreloadHandler.Instance().addFile("assets/canvas_edge_v_light.png");
PreloadHandler.Instance().addFile("assets/canvas_edge_h_light.png");
PreloadHandler.Instance().addFile("assets/canvas_edge_v_right.png");
PreloadHandler.Instance().addFile("assets/canvas_edge_h_top.png");
skyLayerPreBuild();
hillLayerPreBuild();
farFieldLayerPreBuild();
pastureLayerPreBuild();

skyList.forEach(vv_img => PreloadHandler.Instance().addFile(vv_img));
hillList.forEach(vv_img => PreloadHandler.Instance().addFile(vv_img));
farFieldList.forEach(vv_img => PreloadHandler.Instance().addFile(vv_img));
pastureList.forEach(vv_img => PreloadHandler.Instance().addFile(vv_img));

PreloadHandler.Instance().loadAll(imagesLoaded);
console.log("ready ready");

//let success = FileLoader.Instance().waitUntilComplete();
//console.log("success" + success);

//TODO: build some visual loading screen / bar ... as we load the files?

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

  const tmp_char_canvas = new CanvasOverlay("assets/canvas_36tpi_2x2_288.png", .5, charWindow.windowElement);
  tmp_char_canvas.zIndex = 10;
  tmp_char_canvas.left = "assets/canvas_edge_v_light.png";
  tmp_char_canvas.bottom = "assets/canvas_edge_h_light.png";
  tmp_char_canvas.right = "assets/canvas_edge_v_right.png";
  tmp_char_canvas.top = "assets/canvas_edge_h_top.png";
  tmp_char_canvas.createCanvas();

  let tmp_sky_scene = skyLayerBuild(gameWindow);
  let tmp_hill_scene = hillLayerBuild(gameWindow);
  let tmp_farfield_scene = farFieldLayerBuild(gameWindow);
  let tmp_pasture_scene = pastureLayerBuild(gameWindow);
  //console.log("picked hills:");
  //tmp_hills.forEach(vv_img => console.log(vv_img));
  //tmp_sky_scene.update();
  tmp_hill_scene.update();
  tmp_farfield_scene.update();
  tmp_pasture_scene.update();
}
