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

//supposedly I can't reference classes that are created below where I'm using them??
//OK, I looked it up.  It's called hoisting.  class declarations are hoisted.  But if you try to use a class
//  before the class is hit in the file, then you'll get a reference error.
//Since allllll of this code is classes, and nothing really runs until after all classes are hit, then we
//  don't actually have a problem.  Snazzywazzy.
//  https://developer.mozilla.org/en-US/docs/Glossary/Hoisting

//what kind of time should I have a day be??  What a question..  20?

const IMG_TYPE = "png";
const HILL_OPTIONS = 4;
const HILL_COLORS = ["g"];
const HILL_NAME = "assets/hill/hill_"
const GRASS_S_NAME = "assets/grass/grass_s";
const GRASS_S_OPTIONS = [7, 10, 6];  //how many at each blade-of-grass amounts.. +1 index for # blades
const GRASS_M_NAME = "assets/grass/grass_m";
const GRASS_M_OPTIONS = [8, 8, 7];
const GRASS_L_NAME = "assets/grass/grass_l";
const GRASS_L_OPTIONS = [8, 8, 8];
const FLOWER_OPTIONS = 4;
const TREE_OPTIONS = 4;
const GROUND_EFFECTS_OPTIONS = 4;
const FADE_COLORS = ["assets/black_200.png", "assets/white_200.png"];
const TIME_IN_DAY_MINUTES = 0.4;
const GAME_SPEED_MANUAL = 1;
const GAME_SPEED_AUTO = 3;  //maybe let it be adjustable??
//I want to include a game speed!  So when no one's playing, and the game is auto-playing, it plays in faster
//  time???  TODO

const FPS_FPS = 30;
const SECONDS_TO_RUN = 15;

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
	#dayEnded;
	#startNewDay;

	#counter = 0;
	#totalTimeElapsed = 0;
	#gameTimeElapsed = 0;
	#lastFrameTimes = [];

	#elementTimeUpdate = null;

	#runBegin = [];
	#runEarlyUpdate = [];
	#runUpdate = [];
	#runLateUpdate = [];
	#runUpdateDayEnd = [];
	#runUpdateDayNew = [];

	#gameWindow;
	#charWindow;
	//other window(s)...

	//game control / flow flags
	#paused;
	#dayEnding;
	#dayEndingCompleted;

	//wow, I don't really have much tracking stuff... I think I want to put the day here..
	#currentDay = 1;

	constructor(in_FPS) {
		this.#gameTime = new GameTime();
		this.#gameTimer = new GameTimer();
		this.#gameTimer.registerTimer(this.#gameTime)
		this.#targetFPS = in_FPS? in_FPS : 15;
		this.#targetFrameTime = 1000 / this.#targetFPS;
		this.#dayEnded = false;
		this.#startNewDay = false;
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

	//this guy gets called before looping?  I guess this isn't so much as start as it is "OnAwake" 
	//  or whatever.
	start() {
		//add this guy to the inputhandler..
		InputHandler.Instance().addInputListener(this, true);

		this.#elementTimeUpdate = document.getElementById("timeUpdate");

		//and do I call the gameloop from here??  Or have it called externally?
	}

	//this guy is our looper..
	//hmmm.... watching the numbers, we get back here like 5 ms too late, pretty often, even when trying to adjust..
	//  I probably need to track every few, and adjust?  is it worth it?
	//create an array that looks at the last 3 or 5 frames, and adjusts based on that?
	gameLoop() {
		//update our gameTimer..
		this.#gameTimer.update(this.#gameTime);

		//here's total time elapsed..
		this.#totalTimeElapsed += this.#gameTimer.timeElapsed;
		//do I want to differentiate between paused time and played time?  Do I use totalTimeElapsed for anything...?

		//SO... IF WE ARE PAUSED....  WHAT DO WE DO??  We skip running stuff..
		if (this.#paused) {
			//just call the timeout and return.  at least for the moment...

			this.#gameLoopRepeat();
			return;
		}

		//the end of a day!!  What do we do here?  Call anythign that has updateDayEnd()
		//  one of those things will be our update scene!
		if (this.#dayEnded) {

			//check if we now have a new day!
			if (this.#startNewDay) {
				//ohh!  New day!!
				this.#dayEnded = false;
				this.#startNewDay = false;
				//increment our day!
				this.#currentDay += 1;

				//call anything with updateDayNew()!
				this.#runUpdateDayNew.forEach(vv_object => vv_object.updateDayNew());

				//do I call the loop, or do we go straight into update??
			}
			else {
				//once faded to black, runUpdateDay() objects??
				this.#runUpdateDayEnd.forEach(vv_object => vv_object.updateDayEnd());

			}

			this.#gameLoopRepeat();
			return;
		}

		//update gameTimeElapsed..
		this.#gameTimeElapsed += this.#gameTimer.timeElapsed;
		//this.#counter++;

		//if (this.#elementTimeUpdate === null) {
		//  this.#elementTimeUpdate = document.getElementById("timeUpdate");
		//}
		this.#elementTimeUpdate.innerText = this.#counter + " time elapsed: " + this.#gameTimer.timeElapsed + ", target: " + this.#targetFrameTime;

		//now go through all our objects....
		//first any begins...
		this.#runBegin.forEach(vv_object => vv_object.begin());
		//now we can clear our begin list.
		this.#runBegin.length = 0;  //we'll go with this one..
		//this.#runBegin = [];  //this works, too..

		//TODO: check if each one is disabled, deleted, etc.. if so, extract from the list, and add to disabled
		//  or deleted, etc list....  Then I guess we need to check if there are any undisabled?
		//now go through all earlyUpdates, then updates, then lateUpdates.
		this.#runEarlyUpdate.forEach(vv_object => vv_object.earlyUpdate());
		this.#runUpdate.forEach(vv_object => vv_object.update());
		this.#runLateUpdate.forEach(vv_object => vv_object.lateUpdate());


		//finally, we need to call the loop again!
		this.#gameLoopRepeat();
		//the gameloop ends...
	}

	#gameLoopRepeat() {
		//we need to call the loop again!  using setTimeout!
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
		document.getElementById("elapsedTime").innerText = "game time: " + this.#gameTimeElapsed + " | total time: " + this.#totalTimeElapsed;

		//if (this.#counter < SECONDS_TO_RUN * FPS_FPS) {
		if (this.#currentDay < 3) {
			setTimeout(() => { this.gameLoop() }, tmp_remaining_time > 0 ? tmp_remaining_time : 0);
		}
	}

	//sooOOOooo.... objects.  Game.  Every object handed here needs to be updated at some point.
	//we can check it for earlyUpdate, update, and lateUpdate...
	addObject(in_object) {
		if (typeof in_object.begin === "function") { 
				//it has the function!
				this.#runBegin.push(in_object);
				//umm... If it's begin, do we call begin AND update in the same loop??
				//  a) if YES: add to all lists here.
				//  b) if NO: only add to begin list, and then add to other lists after the loop where begin was called
				//for the moment, we are doing A.
		}
		if (typeof in_object.earlyUpdate === "function") { 
				//it has the function!
				this.#runEarlyUpdate.push(in_object);
		}
		if (typeof in_object.update === "function") { 
				//it has the function!
				this.#runUpdate.push(in_object);
		}
		if (typeof in_object.lateUpdate === "function") { 
				//it has the function!
				this.#runLateUpdate.push(in_object);
		}
		if (typeof in_object.updateDayEnd === "function") { 
				//it has the function!
				this.#runUpdateDayEnd.push(in_object);
		}
		if (typeof in_object.updateDayNew === "function") { 
				//it has the function!
				this.#runUpdateDayNew.push(in_object);
		}
	}

	//The day has ended! We must flag things
	dayEnded() {
		//flag that the day has ended..
		this.#dayEnded = true;
	}
	startNewDay() {
		this.#startNewDay = true;
	}

	//OK.. let's give this guy a try.  onKeyUp... do we just leave it at that?  And have this object
	//  check the specific key??  It's that or something crazy like "register a onKeyUpEscape" etc..
	//  This should be fine...
	onKeyUp(in_key_action) {
		//we care if they've hit the escape key!
		if (in_key_action.name !== "Escape") {
			//don't caaare
			return;
		}

		//now the question is: are we pausing or UNpausing!
		if (this.#paused) {
			//we're unpausing.
			this.#unpause();
		}
		else {
			//we must pause!  do we do it immediately??  Or do we wait til the game loop?  And by "do it immediately",
			//  I mean call anything that's of the "onPause()" type!
			//just call pause() ..
			this.#pause();
		}
	}
	
	#pause() {
		this.#paused = true;
		//we need to call our Pause scene fader.

		//we need to call anything with an onPause() .. pretty much have anything that reads input ignore input.
		//  can we have that handled at the input level??
		//Also anything that takes input needs to clear its input flags.. ie...  "key down, so moving..".  If 
		//  the key is down, then hit escape, then hit escape again to get out, while still holding down a key..
		//  do I let them keep on going?  Probably... Then I guess that really just means we don't have to do 
		//  anything...??  Well.... No. beacuse they can't load up on clicks n shit.  Imagine if we were a
		//  shooting game...  key key key key key.  then unpause, and it would unlooooad!  Okay.  Clear and 
		//  ignore..  hmm...
	}

	#unpause() {
		this.#paused = false;
		//we need to call our Pause scene fader.

		//do we need to anything else?
	}

	set gameWindow(in_value) {
		this.#gameWindow = in_value;
	}
	get gameWindow() {
		return this.#gameWindow;
	}
	set characterWindow(in_value) {
		this.#charWindow = in_value;
	}
	get characterWindow() {
		return this.#charWindow;
	}
	get currentDay() {
		return this.#currentDay;
	}

	//TODO I gotta have a function that feeds serialized game info so I can build a game with everything
	//  from saved state!
	//Probably don't really care about most things...  I need:
	//  cow info (personality, age, how it's aging, etc)
	//  field size
	//  big things in the field / nearby (buildings, tractors, ponds, trees, etc..)
	//  day in the game
	//  do I care about the other cows in the field??
	//  should I have critter friends??  Critters that keep coming back to the same spot at same time
	//    if cow keeps going to that spot, etc.. (and maybe does soemthing interesting like jump or eat
	//    or nap)
}

//Our Day class!  This, umm... tracks a day!
//At the end of a day:
//  call all objects that have updateDay()
//  increase our day..
//  Somehow start a new day / trigger some kind of animation / visual that goes dark, and comes back up...
//    this would need to pause the game play?  Needs to be able to talk to Game object to do that?
class Day {
	#currentTime = 0;

	#timeInDayMillis;

	#dayEnded;

	constructor(in_time_in_day_minutes) {
		this.#timeInDayMillis = in_time_in_day_minutes * 60 * 1000;
	}

	update() {
		//update our day timer...
		this.#currentTime += Game.Instance().timer.timeElapsed;

		//I will move all of this to DayScene!

		//throughout the day, change stuff like background, lighting, etc...  maybe certain things only
		//  come out at certain times of the day??

		//if it's the end of the day, do we flag that?  And then things magically happen?  Or do we
		//  just start doing shit???  I think flag it..
		if (this.#currentTime >= this.#timeInDayMillis) {
			//end of the day!!
			this.#currentTime = this.#timeInDayMillis;
			this.#dayEnded = true;
		}
	}

	//this bumps us to the new day!
	newDay() {
		this.#currentTime = 0;
		this.#dayEnded = false;
	}

	get howMuchOfDayCompleted() {
		return this.#currentTime / this.#timeInDayMillis;
	}
	get dayEnded() {
		return this.#dayEnded;
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
	#currentMap = new Map();
	#completed = [];
	#completedMap = new Map();
	#all = [];
	#overlayElement;
	#allHTMLElements = [];

	//list of listeners for the available actions...
	#runOnKeyUp = [];
	#runOnKeyDown = [];
	#runOnClick = [];  //should this be on click UP??
	#runOnClickDown = [];
	#runOnKeyUpPause = [];
	#runOnKeyDownPause = [];
	#runOnClickPause = [];
	#runOnClickDownPause = [];

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

	//any objects that want to listen for input call here!  And have one (or more) of the following methods:
	//  onKeyUp(in_key)
	//  onKeyDown(in_key)
	//  onClick(in_click)
	//  onClickDown(in_click)
	//  any others??
	addInputListener(in_listener, in_listen_on_pause) {
		//check if the listener has any of the methods!
		if (typeof in_listener.onKeyUp === "function") {
			if (in_listen_on_pause) {
				this.#runOnKeyUpPause.push(in_listener);
			}
			this.#runOnKeyUp.push(in_listener);
		}
		if (typeof in_listener.onKeyDown === "function") {
			if (in_listen_on_pause) {
				this.#runOnKeyDownPause.push(in_listener);
			}
			this.#runOnKeyDown.push(in_listener);
		}
		if (typeof in_listener.onClick === "function") {
			if (in_listen_on_pause) {
				this.#runOnClickPause.push(in_listener);
			}
			this.#runOnClick.push(in_listener);
		}
		if (typeof in_listener.onClickDown === "function") {
			if (in_listen_on_pause) {
				this.#runOnClickDownPause.push(in_listener);
			}
			this.#runOnClickDown.push(in_listener);
		}
	}

	removeInputListener(in_listener, in_listen_on_pause) {
		//uhhh.... shittake..
		let tmp_found = -1;
		if (typeof in_listener.onKeyUp === "function") {
			if (in_listen_on_pause) {
				tmp_found = this.#runOnKeyUpPause.findIndex(in_listener);
				if (tmp_found > -1) {
					this.#runOnKeyUpPause.splice(tmp_found, 1);
				}
			}
			tmp_found = this.#runOnKeyUp.findIndex(in_listener);
			if (tmp_found > -1) {
				this.#runOnKeyUp.splice(tmp_found, 1);
			}
		}
		if (typeof in_listener.onKeyDown === "function") {
			if (in_listen_on_pause) {
				tmp_found = this.#runOnKeyDownPause.findIndex(in_listener);
				if (tmp_found > -1) {
					this.#runOnKeyDownPause.splice(tmp_found, 1);
				}
			}
			tmp_found = this.#runOnKeyDown.findIndex(in_listener);
			if (tmp_found > -1) {
				this.#runOnKeyDown.splice(tmp_found, 1);
			}
		}
		if (typeof in_listener.onClick === "function") {
			if (in_listen_on_pause) {
				tmp_found = this.#runOnClickPause.findIndex(in_listener);
				if (tmp_found > -1) {
					this.#runOnClickPause.splice(tmp_found, 1);
				}
			}
			tmp_found = this.#runOnClick.findIndex(in_listener);
			if (tmp_found > -1) {
				this.#runOnClick.splice(tmp_found, 1);
			}
		}
		if (typeof in_listener.onClickDown === "function") {
			if (in_listen_on_pause) {
				tmp_found = this.#runOnClickDownPause.findIndex(in_listener);
				if (tmp_found > -1) {
					this.#runOnClickDownPause.splice(tmp_found, 1);
				}
			}
			tmp_found = this.#runOnClickDown.findIndex(in_listener);
			if (tmp_found > -1) {
				this.#runOnClickDown.splice(tmp_found, 1);
			}
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
					//we found it!  We can just return...  I think...
					//So if we've found it in pressed down..  do we ignore that?  Or could it be that they did the press,
					//  leave focus from the page, and then came back and pressed again...  Probably should send again
					//  just in case.  They'll know if they already have onKeyDown pressed.
					//We DON'T need to re-draw the key-press, though.. that's already up.

					//we need to let any onKeyDown listeners know!
					this.#runOnKeyDown.forEach(vv_object => vv_object.onKeyDown(tmp_pressed));

					return;
				}
				else {
					//greate!  it wasn't found.  we create it and add it!
					tmp_pressed = new InputAction(InputAction.TYPE_KEY, inn_event.code, tmp_now);
					this.#current.push(tmp_pressed);
					this.#currentMap.set(tmp_pressed.name, tmp_pressed);
					//we also need to add it to all!
					this.#all.push(tmp_pressed);
					//and we KNOW the index in all (last location), so we can save that!
					tmp_all_index = this.#all.length - 1;
				}

				//no idea why these are outside the ELSE statement... weird.  but whatever.

				//now draw/update the overlay!
				this.#drawOverlay(tmp_all_index, tmp_pressed);

				//we need to let any onKeyDown listeners know!
				this.#runOnKeyDown.forEach(vv_object => vv_object.onKeyDown(tmp_pressed));

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
			this.#completedMap.delete(tmp_pressed.name);
			this.#current.push(tmp_pressed);
			this.#currentMap.set(tmp_pressed.name, tmp_pressed);

			//now draw/update the overlay!
			this.#drawOverlay(tmp_all_index, tmp_pressed);

			//we need to let any onKeyDown listeners know!
			this.#runOnKeyDown.forEach(vv_object => vv_object.onKeyDown(tmp_pressed));

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
					this.#completedMap.set(tmp_pressed.name, tmp_pressed);
					//we also need to add it to all!
					this.#all.push(tmp_pressed);
					//and we KNOW the index in all (last location), so we can save that!
					tmp_all_index = this.#all.length - 1;
				}
				//now draw/update the overlay!
				this.#drawOverlay(tmp_all_index, tmp_pressed);

				//we need to let any onKeyUp listeners know!
				this.#runOnKeyUp.forEach(vv_object => vv_object.onKeyUp(tmp_pressed));

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
			this.#currentMap.delete(tmp_pressed.name);
			//and add it to completed!
			this.#completed.push(tmp_pressed);
			this.#completedMap.set(tmp_pressed.name, tmp_pressed);

			//now draw/update the overlay!  tmp_all_index is -1...
			this.#drawOverlay(tmp_all_index, tmp_pressed);

			//we need to let any onKeyUp listeners know!
			this.#runOnKeyUp.forEach(vv_object => vv_object.onKeyUp(tmp_pressed));

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
	checkIsDown(in_action) {
		//check our down buttons for this one..  I guess I should have a hash?  I dunno..
		let tmp_input = this.#currentMap.get(in_action);
		if (tmp_input) {
			//great!  TRUE!
			return true;
		}
		return false;
	}
	checkWasDown(in_action) {
		let tmp_input = this.#completedMap.get(in_action);
		if (tmp_input) {
			//great!  TRUE!  check if it was just deactivated?
			if (tmp_input.released) {
				//it was just released this frame!  true!
				return true;
			}
		}
		return false;
	}

	//wipe anything that is "just released"
	lateUpdate() {
		this.#completed.forEach(vv_obj => {
			if (vv_obj.released) {
				vv_obj.released = false;
			}
		});
	}
}


//class for animated actions of objects?  I dunoo.....
//Soo... for animations.... do I have them do their own timeout?  Or do I tie them to the game loop?
//  I'll have to think how I want to organize them, I guess.
class Animation {
	#name;
	#numFrames;
	#frameImgs;
	#timeLength;
	#frameTimes;  //ratio of how long each frame lasts over the whole length...

	#element;

	#timeSinceLastFrame;
	#timeTilNextFrame;
	#currentFrame;

	constructor(in_name, in_frames_list, in_anim_length_millis, in_img_element, in_frame_times) {
		if (in_frames_list.length < 2) {
			throw "What is an animation with 1 frame??  Not an animation, that's for sure!";
		}
		this.#name = in_name;
		this.#numFrames = in_frames_list.length;
		this.#frameImgs = in_frames_list;
		this.#timeLength = in_anim_length_millis;
		this.#frameTimes = in_frame_times;
		this.#element = in_img_element;

		this.#timeSinceLastFrame = 0;
		this.#timeTilNextFrame = 0;
		this.#currentFrame = 0;

		//calc frame times...
		this.#frameTimes = [];
		if (in_frame_times) {
			//ummm.. if in_frame_times doesn't add up to 1, we have a problem...
			if (in_frame_times.reduce((vv_sum, vv_time) => sum + time, 0) != 1) {
				throw "Animation frame times is provided, and the sum is not 1!!  This should add to 1, if used."
			}
			//there are specific time ratios to use.
			for (let i=0; i<this.#numFrames; i++) {
				this.#frameTimes[i] = this.#timeLength * in_frame_times[i];
			}
		}
		else {
			//no specific time ratios to use..  calc average..
			//anim_length / numFrames.  easy.
			let tmp_time = this.#timeLength / this.#numFrames;
			for (let i=0; i<this.#numFrames; i++) {
				this.#frameTimes[i] = tmp_time;
			}
		}

	}

	//begin?? start with frame 1???
	begin() {
		//let's dooo this!?
		this.#element.src = this.#frameImgs[this.#currentFrame];
		this.#timeSinceLastFrame = 0;
		//grab time that THIS frame exists for.  That's how long until the next one!
		this.#timeTilNextFrame = this.#frameTimes[this.#currentFrame];
	}

	//aaand... update.
	update() {
		//pretty much check if we need to update the image...
		this.#timeSinceLastFrame += Game.Instance().timer.timeElapsed;

		//is it time to update our image??
		if (this.#timeSinceLastFrame >= this.#timeTilNextFrame) {
			//yup!
			//we gotta go up to the next frame!
			this.#currentFrame += 1;
			if (this.#currentFrame == this.#numFrames) {
				this.#currentFrame = 0;
			}
			this.#element.src = this.#frameImgs[this.#currentFrame];
			//now add in our "overtime" for this frame..
			this.#timeSinceLastFrame = this.#timeSinceLastFrame - this.#timeTilNextFrame;
			//grab time that THIS frame exists for.  That's how long until the next one!
			this.#timeTilNextFrame = this.#frameTimes[this.#currentFrame];
		}
		//else nope... we just do nothing, I guess...
	}
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

	equals(in_other) {
		if (in_other instanceof Location) {
			if (this.#x === in_other.x && this.#y === in_other.y && this.#z === in_other.z) {
				//they are identical!
				return true;
			}
		}
		//else..
		return false;
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
	#visualOffset;

	//do I wrap this guy in a div?  Or just have a floating image?
	#element;

	#sceneLocation;
	#xyOffset;

	#naturalSize;
	#specificSize = null;
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
		this.#visualOffset = new Location(0,0,0);
		this.#animationMap = new Map();
		this.#locChange = true;  //it needs to be drawn initially...
		this.#hidden = false;
		this.#disabled = false;
		this.#deleted = false;
	}

	//OK!  GameObjects should implement these as needed!  The Game object determines which exist and only calls
	//  those objects.  Makes things faster.
	//begin() {}
	//earlyUpdate() {}
	//update() {}
	//lateUpdate() {}
	//delete() {}

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
		else if (this.#locationPoint === GameObject.LOC_TL) {
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
		//check to see if it changed??
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
			throw "GameObject.image must be assigned before assigning sizeScale!";
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
		if (this.#specificSize != null) {
			this.#size = new Size(in_value * this.#specificSize.width, in_value * this.#specificSize.height);
		}
		else {
			this.#size = new Size(in_value * this.#naturalSize.width, in_value * this.#naturalSize.height);
		}
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
	//what a fucking mess...
	#reapplySizeScale() {
		//We are assuming that all they've really done is update the image and the iamge's size changed..
		//  we're using the already-stored specific size or size scale to do this!
		if (this.#specificSize != null) {
			//this.#size = new Size(this.#sizeScale * this.#specificSize.width, this.#sizeScale * this.#specificSize.height);
			//for specific size, we don't need to do anything.  it should already be the right size!
			return;
		}
		else {
			this.#size = new Size(this.#sizeScale * this.#naturalSize.width, this.#sizeScale * this.#naturalSize.height);
		}
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
	//this can set the image with a specific width/height.
	set specificSize(in_value) {
		if (this.#element == null) {
			//element was never created??  That means they never gave us an image...  Not good!!
			throw "GameObject.image must be assigned before assigning specificSize!";
		}
		if (in_value instanceof Size) {
			//great, it's a size!
			this.#specificSize = in_value;
			this.#size = new Size(this.#sizeScale * in_value.width, this.#sizeScale * in_value.height);
		}
		else {
			//they just sent us 1 number...??  Umm... use it for both width/height??
			this.#specificSize = new Size(in_value, in_value);
			this.#size = new Size(this.#sizeScale * in_value, this.#sizeScale * in_value);
		}
		//now calculate offset
		this.#calcOffset();
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

		//aaand set default size scale.
		this.sizeScale = 1;

	}
	//this is where we are changing the image tied to this game object!
	updateImage(in_value, in_loaded) {
		this.#img = in_value;
		let tmp_old_size = this.#naturalSize;
		this.#naturalSize = new Size(in_loaded.naturalWidth, in_loaded.naturalHeight);
		//update the image's source..
		this.#element.src = in_loaded.src;
		//and now we need to reapply scaling if the image's size changed!
		if (this.#naturalSize.width !== tmp_old_size.width || this.#naturalSize.height !== tmp_old_size.heigth) {
			//reapply scaling!
			this.#reapplySizeScale();
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

		//NOTE: with the z-Index values I'm using at the moment, I need to round/floor that value..  If there are 2 
		//  things near each other, and one is at like 1.8 and 1.6, they will both get floored to 1.  But if we move 
		//  closer, they will be at 2.1 and 1.9.  So the 2-guy will be in front.  IF the 1.9 guy was added later, 
		//  then IT will show as being in front when they are at 1.8 and 1.6.  SOo... I gotta fix that..  I can do it 
		//  by multiplying Z value by 10?  That should do the trick.

		//and now update our location??  this is absolute locations within our parent..
		this.#element.style.zIndex = Math.floor(this.#sceneLocation.z * 100);
		//now set the location to our element!  We do bottom left!  (x and y offsets are already calc'd)
		//console.log("HILL LEFT IS " + (this.#sceneLocation.x + this.#xyOffset.x));
		this.#element.style.left = Math.round(this.#sceneLocation.x + this.#xyOffset.x + this.#visualOffset.x) + "px";
		this.#element.style.bottom = Math.round(this.#sceneLocation.y + this.#xyOffset.y + this.#visualOffset.y) + "px";
	}
	set visualOffset(in_value) {
		if (! in_value instanceof Location) {
			throw "GameObject.sceneLocation must be a Location object!";
		}
		this.#visualOffset = in_value;
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

//Let's turn a camera into an object..
//Do I have the camera track an object?  Liiike, our cow?  follow our cow!
//TODO:  As we track our object, I also want us to have boundaries... so, for example, if we go all the way to
//  the front, tracked object (cow) might come a bit closer to the screen.  Or if we hit an edge left/right.
//  Maybe even back..?  Maybe..
class Camera {
	#trackObject = null;
	#location = null;
	#locationOffset;
	#boundary;
	#movementSpeed = 10;  //10 per second..??
	#trackedLoc = null;
	#trackedLocCheckedThisFrame = false;
	//soo... for offset, I technically don't use the Y value of the camera in the SceneScaler..  I probably should..
	//  I have in the constructor a value of how high up from the ground the camera is ---  wait a minute.  I DON'T??
	//  WTF.  My brain is thrashed.  I so had this figured out yesterday when I created it, and today I no idea.
	//  Classic!  Hmm.. well, whoknowswhatever.  I'll have to figure it out and come back and update this comment.
	constructor(in_object, in_offset) {
		if (in_object instanceof GameObject) {
			//track this 
			this.#trackObject = in_object;
			this.#locationOffset = in_offset;
			this.#setTrackedLocation();
			//aand.. I guess we say we checked the location this timme...?
			this.#trackedLocCheckedThisFrame = true;
		}
		else {
			this.#location = in_object;
		}
	}

	begin() {
		//set our 
	}
	earlyUpdate() {
		//reset our trackedLoc checked this frame!
		this.#trackedLocCheckedThisFrame = false;
	}
	update() {
		//I think we need this..  update camera here...  cause then everything else is drawn to the camera in update!
		//only do this if location isn't null.
		//if it IS null, then we don't need to do anything, since we track an object, and we get that location when
		//  the get location() accessor is called!
		if (this.#location != null) {
			let tmp_x = this.#location.x;
			let tmp_y = this.#location.y;
			let tmp_z = this.#location.z;
			//check if button presses!
			if (InputHandler.Instance().checkIsDown("ArrowLeft")) {
				//we going leeeft
				tmp_x -= (Game.Instance().timer.timeElapsed / 1000) * this.#movementSpeed;
				//now make sure we haven't gone past an edge..
				if (this.#boundary && tmp_x < this.#boundary.left) {
					tmp_x = this.#boundary.left;
				}
			}
			if (InputHandler.Instance().checkIsDown("ArrowRight")) {
				//we going right
				tmp_x += (Game.Instance().timer.timeElapsed / 1000) * this.#movementSpeed;
				//now make sure we haven't gone past an edge..
				if (this.#boundary && tmp_x > this.#boundary.right) {
					tmp_x = this.#boundary.right;
				}
			}
			if (InputHandler.Instance().checkIsDown("ArrowDown")) {
				//we going out toward front
				tmp_z += (Game.Instance().timer.timeElapsed / 1000) * this.#movementSpeed;
				//now make sure we haven't gone past an edge..
				if (this.#boundary && tmp_z > this.#boundary.front) {
					tmp_z = this.#boundary.front;
				}
			}
			if (InputHandler.Instance().checkIsDown("ArrowUp")) {
				//we going innnn
				tmp_z -= (Game.Instance().timer.timeElapsed / 1000) * this.#movementSpeed;
				//now make sure we haven't gone past an edge..
				if (this.#boundary && tmp_z < this.#boundary.rear) {
					tmp_z = this.#boundary.rear;
				}
			}
			//now update our location!
			this.#location = new Location(tmp_x, tmp_y, tmp_z);
		}
	}
	update() {

	}
	lateUpdate() {

	}
	delete() {}

	set boundary(in_value) {
		this.#boundary = in_value;
	}

	#setTrackedLocation() {
			//calc the offset of tracked object!
			//I think just add..  object location is -10.  Our offset is 30.  -10+30 = 20.  Yup.
			//Most likely, x offset will be zero, z will be like -30 or so??  I don't know yet.
			let tmp_x = this.#trackObject.location.x + this.#locationOffset.x;
			let tmp_y = this.#trackObject.location.y + this.#locationOffset.y;
			let tmp_z = this.#trackObject.location.z + this.#locationOffset.z;
			if (this.#boundary && tmp_x < this.#boundary.left) {
				tmp_x = this.#boundary.left;
			}
			if (this.#boundary && tmp_x > this.#boundary.right) {
				tmp_x = this.#boundary.right;
			}
			if (this.#boundary && tmp_z > this.#boundary.front) {
				tmp_z = this.#boundary.front;
			}
			if (this.#boundary && tmp_z < this.#boundary.rear) {
				tmp_z = this.#boundary.rear;
			}
			this.#trackedLoc = new Location(tmp_x, tmp_y, tmp_z)

	}
	get location() {
		//IF we have a boundary, then we need to limit our movement!  Make sure we don't follow tracked 
		//  object outside the boundary!
		if (this.#trackObject != null) {
			//check last tracked..
			if (this.#trackedLocCheckedThisFrame) {
				//we can just send back the tracked loc!
				return this.#trackedLoc;
			}
			//hasn't been checked this frame!
			if (this.#trackedLoc != null && this.#trackedLoc.equals(this.#trackObject.location)) {
				//they're the same.. so nothing has changed, so we can just return it.
				this.#trackedLocCheckedThisFrame = true;
				return this.#trackedLoc;
			}
			//okay.. they are different. we need to update our tracked location!
			this.#setTrackedLocation();
			this.#trackedLocCheckedThisFrame = true;
			return this.#trackedLoc;
		}
		//else..
		return this.#location;
	}
}

//need a game space / boarder area where the cow can't go out of..
//  and a camera will have a min left/right distance and a min far distance, perhaps.

//this badboy converts GAME locations to visual/screen/SCENE locations in our GameWindow!
//A SceneLayer can use multiple of these to adjust different depths different..
//I'm starting with X and Z, but then will figure out Y.
class SceneScaler {
	#hDistanceFront;
	#hDistanceRear;
	#vDistanceFront;
	#vDistanceRear;
	#horizonHeightFront;
	#horizonHeightRear;
	#horizonHeightAtHorizon;

	#scaleSizeAtFront;
	#scaleSizeAtRear;

	#zLocationFront;
	#zLocationRear;
	#zLocationHorizon;

	#zDistance;
	#zDistanceFrontToH;
	#zDistanceHToRear;
	#hDifference;
	#vDifference;
	#vDistanceHorizon;
	#horizonHeightDifferenceFrontToRear
	#horizonHeightDifferenceFrontToHorizon;
	#horizonHeightDifferenceHorizonToRear;
	#zDistanceToBeginSizeScaling;
	#hDistanceWhereBeginScaling;
	#zScalingDifference;
	#zScalingRatio;

	//the view window
	#sceneSize;

	//I need a clipping window..  anything outside this area can be ignored
	#clippingDistance;

	//let's save and reuse our temporary variables..
	#tmp_ratio;
	#tmp_dist;
	#tmp_edge;
	#tmp_scale;
	//this guy I can reuse tmp_edge for, but ehh... I want it a bit more descriptive.  
	//  not that this is at all coherent...
	#tmp_bottom_height_from_horizon;

	constructor(in_horizontal_distance_front, 
							in_vertical_distance_front, 
							in_horizontal_distance_rear, 
							in_vertical_distance_rear, 
							in_z_distance_from_camera_front,
							in_z_distance_from_camera_rear, 
							in_z_distance_from_camera_horizon, 
							in_horizon_height_front, 
							in_horizon_height_rear, 
							in_horizon_height_at_horizon, 
							in_z_distance_begin_scaling,
							in_scene_size, 
							in_clipping_distances,
							in_start_scale_size) {
		this.#hDistanceFront = in_horizontal_distance_front;
		this.#hDistanceRear = in_horizontal_distance_rear;
		this.#vDistanceFront = in_vertical_distance_front;
		this.#vDistanceRear = in_vertical_distance_rear;
		this.#zLocationFront = in_z_distance_from_camera_front;
		this.#zLocationRear = in_z_distance_from_camera_rear;
		this.#zLocationHorizon = in_z_distance_from_camera_horizon;
		this.#horizonHeightFront = in_horizon_height_front;
		this.#horizonHeightRear = in_horizon_height_rear;
		this.#scaleSizeAtFront = in_start_scale_size;
		//umm... I think this one needs to be calc'd for height of game-location numbers??
		//if this comes in as 300.  we know window height is 900.  so .33.  so we calc
		//  game height at horizon location, and multiply by .33??  that's horizon height.
		//we already have it below..  this.#vDistanceHorizon
		//this.#horizonHeightAtHorizon = in_horizon_height_at_horizon;
		this.#zDistanceToBeginSizeScaling = in_z_distance_begin_scaling;
		this.#sceneSize = in_scene_size;
		this.#clippingDistance = in_clipping_distances;
		//console.log("hzHeight: " + in_horizon_height_at_horizon);

		//working with our z-distance as negative, let's say rear is -110, front is -40.
		//  -110 - -40 = -70 distance.  Keep it negative??  We'll see..
		this.#zDistance = this.#zLocationRear - this.#zLocationFront;
		this.#zDistanceFrontToH = this.#zLocationHorizon - this.#zLocationFront;
		this.#zDistanceHToRear = this.#zLocationRear - this.#zLocationHorizon;
		this.#hDifference = this.#hDistanceRear - this.#hDistanceFront;
		this.#vDifference = this.#vDistanceRear - this.#vDistanceFront;

		//calc the horizontal distance at distance to begin scaling!   and then we can get scaling ratio.
		this.#tmp_ratio = 0;
		if (this.#zDistanceToBeginSizeScaling < this.#zLocationFront) {
			//we don't scale until scaling distance...
			this.#tmp_ratio = (this.#zDistanceToBeginSizeScaling - this.#zLocationFront) / (this.#zDistance);
		}
		this.#hDistanceWhereBeginScaling = (this.#tmp_ratio * this.#hDifference) + this.#hDistanceFront;
		this.#zScalingDifference = this.#hDistanceRear - this.#hDistanceWhereBeginScaling;
		this.#zScalingRatio = this.#hDistanceWhereBeginScaling/this.#hDistanceRear;
		//now get the scale at REAR..  will be used by any SceneScalers that are stringed along behind this one.
		//this.#tmp_scale = 1 + ((this.#zScalingRatio - 1) * ((this.#hDistanceRear - this.#hDistanceWhereBeginScaling)/this.#zScalingDifference));
		this.#scaleSizeAtRear = this.#zScalingRatio * this.#scaleSizeAtFront

		//calc the vertical distance at the horizon..
		this.#tmp_ratio = this.#zDistanceFrontToH / this.#zDistance;
		//console.log("HERE!!  " + this.#tmp_ratio + " " + this.#vDifference + " " + this.#vDistanceFront);
		this.#vDistanceHorizon = (this.#tmp_ratio * this.#vDifference) + this.#vDistanceFront;
		//console.log("HERE!!  " + in_horizon_height_at_horizon + " " + this.#sceneSize.height + " " + this.#vDistanceHorizon);
		this.#horizonHeightAtHorizon = (in_horizon_height_at_horizon / this.#sceneSize.height) * this.#vDistanceHorizon;
		//console.log("hzn height: " + this.#horizonHeightAtHorizon);

		//console.log("hzHeightHz " + this.#horizonHeightAtHorizon + ", hzHeightFr " + this.#horizonHeightFront);
		this.#horizonHeightDifferenceFrontToRear = this.#horizonHeightRear - this.#horizonHeightFront;
		this.#horizonHeightDifferenceFrontToHorizon = this.#horizonHeightAtHorizon - this.#horizonHeightFront;
		this.#horizonHeightDifferenceHorizonToRear = this.#horizonHeightRear - this.#horizonHeightAtHorizon;
	}

	//Here we are, folks!!  take in the center point of the scene and a location, and it converts that
	//  location into a scene location/position!
	calcScenePosition(in_loc, in_center) {
					//console.log("---------------------");

		//console.log("gameLocation: " + in_loc.x + ", " + in_loc.y + ", " + in_loc.z);
		//console.log("centLocation: " + in_center.x + ", " + in_center.y + ", " + in_center.z);

		//check if outside clipping zone!
		//UMM... clipping distance z...  positive number means behind the camera..  toward the viewer.
		if (in_loc.x < in_center.x - this.#clippingDistance.left ||
				in_loc.x > in_center.x + this.#clippingDistance.right ||
				in_loc.z > in_center.z + this.#clippingDistance.front ||
				in_loc.z < in_center.z + this.#clippingDistance.rear) {
			//object is outside clipping, we don't need to draw this guy
			//TODO:  umm... flag something to disable it / remove from DOM?
			//console.log("  DO NOT CALC OR DRAW THIS GUY!");
			return;
		}

		let tmp_x = 0;
		let tmp_y = 0;
		let tmp_z = 0;

		//first let's do Z.  this is the ratio, front to back where the location is!
		//NOTE: #zDistance is NEGATIVE.  But in_loc_z is always smaller than zLocationFront, so we'll get
		//  a negative number there, too...  neg divided neg equals postive.  which we want.  So we are GOOD!
		console.log("object loc: " + in_loc.x + ", " + in_loc.y + ", " + in_loc.z);
		console.log("z loc front: " + this.#zLocationFront + ", z loc rear: " + this.#zLocationRear + ", zdist: " + this.#zDistance);
		console.log("front loc: " + (in_center.z + this.#zLocationFront) + ", rear loc: " + (in_center.z + this.#zLocationRear));
		this.#tmp_ratio = (in_loc.z - (in_center.z + this.#zLocationFront)) / this.#zDistance;
		console.log("z ratio (how close to front) " + this.#tmp_ratio);
		console.log("h dist at front: " + this.#hDistanceFront + ", h dist at rear: " + this.#hDistanceRear + ", dif: " + this.#hDifference);

		//Here's our X / horizontal location
		//now we can get the horizontal distance at that z depth..
		//NOTE:  This doesn't consider where hDistanceWhereBeginScaling is!  TODO FIX THIS BUGGY BUG
		this.#tmp_dist = this.#tmp_ratio * this.#hDifference + this.#hDistanceFront;
		console.log("horizontal distance at ratio point: " + this.#tmp_dist);
		//now we determine where on the screen their location is..
		this.#tmp_edge = in_center.x - (this.#tmp_dist * 0.5);
		console.log("edge loc at distance: " + this.#tmp_edge + ", (center.x is: " + in_center.x + ")");
		//now we can get the ratio across that distance we're at, and multiply it by our scene size!
		tmp_x = ((in_loc.x - this.#tmp_edge) / this.#tmp_dist) * this.#sceneSize.width;
		//this ratio is fuckin' wrong.
		let tmp_ratio_across = ((in_loc.x - this.#tmp_edge) / this.#tmp_dist);
		console.log("ratio across: " + tmp_ratio_across);
		console.log("calc'd x is: " + tmp_x);

		//Here's our Z...  umm... everything in front of the horizon distance is positive.  everything behind it is
		//  negative.  Well... we can just make it really simple.  All Z needs us to do is place in front of or 
		//  behind the things relative to itself.  So no exact ratios are needed.
		//  object's location MINUS horizon Z.  The. end.
		//  front: -80.  horizon: -90.  rear:  -120.
		//  our z:  -110.
		//  -110 - -90  = -15.  We are behind the horizon.  BAM!
		//OOPS, gotta consider the camera location.. locationHorizon is a distance from camera!!
		//  camera is at -30, locHorizon is -60.  -30 + -60 = -90.
		//  camera is at 10, locHorizon is at -20.  10 + -20 = -10.
		tmp_z = in_loc.z - (this.#zLocationHorizon + in_center.z);

		//we also need to scale the size..  umm... 50 pixels at the front..  fuck, I gotta write this one down.
		//It's pretty easy.  the scale(ratio) is front width / rear width.  easy.
		//50 px wide at front.  200 px wide at back.  the full 50 will be 1/4 the width at back.  50/200 = 1/4.  YUP.
		//MAYBE??  My brain FELL OUT!!  I understood this stuff yesteday.... today, forget it!!
		//console.log("SCALE NUMS: scaler " + this.#zScalingRatio + ", hdist " + this.#tmp_dist + ", hdistb " + this.#hDistanceWhereBeginScaling + ", scaledif " + this.#zScalingDifference);
		//we need to calc the distance of the object FROM THE CAMERA
		if (this.#tmp_dist <= this.#hDistanceWhereBeginScaling) {
			//our location is closer than where we scale.. so don't scale!
			//TODO: do i have a base scaling?
			this.#tmp_scale = 1 * this.#scaleSizeAtFront;
		}
		else {
			//this.#tmp_scale = 1 + ((this.#zScalingRatio - 1) * ((this.#tmp_dist - this.#hDistanceWhereBeginScaling)/this.#zScalingDifference));
			//TODO: Figure out why our cows scale slow at the front and faster at the reaer...  Is it just because I don't
			//  care about the size of the cows??  I DUNNO!
			//console.log("zScalingRatio: " + this.#zScalingRatio + ", hDisAtLoc: " + this.#tmp_dist + ", hDisAtBegin: " + this.#hDistanceWhereBeginScaling + ", zScalingDif: " + this.#zScalingDifference);
			this.#tmp_scale = 1 - ((1 - this.#zScalingRatio) * ((this.#tmp_dist - this.#hDistanceWhereBeginScaling)/this.#zScalingDifference));
			this.#tmp_scale *= this.#scaleSizeAtFront;
		}
		//console.log("SCALE IS " + this.#tmp_scale);

		//Here's our Y / vertical location... This one is a bit more complicated than X??  As we get farther back toward
		//  the horizon, we need to adjust for that..  Can I just use front/rear vDistance dumbly?
		//So for horizontal, we know where our center is, and we can calc the left edge easy.
		//For vertical, we need to calc based on the horizon!
		//tmp_ratio is still good!
		//OH shit, I forgot I need to do this for front or back of the horizon!!)
		//we do front first, because that's what I calculated first.
		//if ((in_loc.z - in_center.z) >= this.zLocationHorizon) {
		let tmp_loc_ratio_2 = 0;
		if (tmp_z >= 0) {
			console.log("IN FRONT OF HORIZON");
			console.log("in z: " + in_loc.z + ", zFront: " + this.#zLocationFront + ", ftoH: " + this.#zDistanceFrontToH);
			//we need to get the vertical distance at this z depth.
			//get this guy FIRST, because tmp_ratio is already set front to back!
			this.#tmp_dist = (this.#tmp_ratio * this.#vDifference) + this.#vDistanceFront;
			console.log("vertical view height at depth " + this.#tmp_dist + ", vDiff: " + this.#vDifference + ", vDist at front: " + this.#vDistanceFront);
			if (this.#zDistanceFrontToH > this.#zDistance) {
				//console.log("calc to horizon!");
			//console.log("in z: " + in_loc.z + ", zFront: " + this.#zLocationFront + ", ftoH: " + this.#zDistanceFrontToH + ", ftoR: " + this.#zDistance);
			//console.log("vertical view height at depth " + this.#tmp_dist);
				//we need to calc to horizon!  That's the rise we want to use.
				//now we overwrite tmp_ratio to get ratio from front to HORIZON
				this.#tmp_ratio = (in_loc.z - (in_center.z + this.#zLocationFront)) / this.#zDistanceFrontToH;
				//console.log("z ratio " + this.#tmp_ratio);
				//console.log("hz height dif FtoH " + this.#horizonHeightDifferenceFrontToHorizon);
				//console.log("hzHeightFront " + this.#horizonHeightFront);
				this.#tmp_bottom_height_from_horizon = (this.#tmp_ratio * this.#horizonHeightDifferenceFrontToHorizon) + this.#horizonHeightFront;
				//console.log("hz height " + this.#tmp_bottom_height_from_horizon);
			}
			else {
				console.log("calc to rear!");
			//console.log("in z: " + in_loc.z + ", zFront: " + this.#zLocationFront + ", ftoH: " + this.#zDistanceFrontToH + ", ftoR: " + this.#zDistance);
			//console.log("vertical view height at depth " + this.#tmp_dist);
				//calc to rear.  We won't be rising as much!
				//now we overwrite tmp_ratio to get ratio from front to REAR
				//OH.. this is already the ratio......
				//this.#tmp_ratio = (in_loc.z - (in_center.z + this.#zLocationFront)) / this.#zDistance;
				//this.#tmp_ratio = (in_loc.z - this.#zLocationFront) / this.#zDistance;
				//console.log("z ratio " + this.#tmp_ratio);
				//console.log("hz height dif FtoR " + this.#horizonHeightDifferenceFrontToRear);
				//console.log("hzHeightFront " + this.#horizonHeightFront);
				//OK... I need to incorporate the Y distance into this some how...  as we get farther into the distance, Y space
				//  shrinks!
				//  horizon height at front:  100
				//                    rear:   200
				//  vertical front:  25 x .75  = 18 ish..
				//  vertical rear:   100x .75  = 75
				//  100 / 900 (screen height) = 1/9
				//  300 / 900                 = 1/3
				//  200 / 900                 = 2/9 height difference...
				//  front:  zero is at 1/9..  (1-1/9) * 18 = 16 in (8/9)*screenheight.  800/16 = 50
				//  rear:   zero is at 1/3..  (1-1/3) * 75 = 50 in (2/3)*screenheight.  600/50 = 12
				let tmp_front_ratio = this.#sceneSize.height / this.#vDistanceFront;
				let tmp_loc_ratio = this.#sceneSize.height / this.#tmp_dist;
				let tmp_rear_ratio = this.#sceneSize.height / this.#vDistanceRear;
				console.log("v_pixels_per_dist front: " + tmp_front_ratio + ", rear: " + tmp_rear_ratio);
				//50 -> 12    (50-12)*(1-zratio) + 12
				tmp_loc_ratio_2 = (tmp_front_ratio - tmp_rear_ratio) * (1 - this.#tmp_ratio) + tmp_rear_ratio;
				console.log("v_pixels_per_dist: " + tmp_loc_ratio + ", -or- " + tmp_loc_ratio_2);
				//  oh yea.  vertical distance at depth..  18..  900/18 = 50.  50 height per in game y location.
				//  horizon height ratio difference...????  50 front.  12 back.  50/12 = 4.16 ...  12/50 = .24
				//  the tmp_ratio is really ...  (1 - (1/3-1/9) * tmp_z_ratio + 1/9) * verticalHeight.
				this.#tmp_bottom_height_from_horizon = (this.#tmp_ratio * this.#horizonHeightDifferenceFrontToRear) + this.#horizonHeightFront;
				console.log("hz height " + this.#tmp_bottom_height_from_horizon);

			}
			//now we can get the ratio how high up we are from the bottom and multiply by scene height!
			//tmp_y = ((in_loc.y + this.#tmp_bottom_height_from_horizon) / this.#tmp_dist) * this.#sceneSize.height;
			tmp_y = (in_loc.y / this.#tmp_dist) * this.#sceneSize.height + this.#tmp_bottom_height_from_horizon;
			//tmp_y = (in_loc.y * tmp_loc_ratio_2) + this.#tmp_bottom_height_from_horizon;
			console.log("y loc " + tmp_y);
		}
		else {
			//console.log("BEHIND HORIZON");
			//okayyy!  Doing the same thing, essentially, just from horizon to rear, so the horizon goes dooown instead of up.
			//we need to get the vertical distance at this z depth.
			this.#tmp_dist = (this.#tmp_ratio * this.#vDifference) + this.#vDistanceFront;
			//console.log("ver height at depth " + this.#tmp_dist);
			if (this.#zDistanceHToRear > this.zDistance) {
				//we need to calc from horizon to rear!
				this.#tmp_ratio = (in_loc.z - (in_center.z + this.#zLocationHorizon)) / this.#zDistanceHToRear;
				//console.log("ratio " + this.#tmp_ratio);
				//console.log("bleh " + this.#horizonHeightDifferenceHorizonToRear);
				//console.log("hzHeightFront " + this.#horizonHeightAtHorizon);
				this.#tmp_bottom_height_from_horizon = (this.#tmp_ratio * this.#horizonHeightDifferenceHorizonToRear) + this.#horizonHeightAtHorizon;
				//console.log("hz height " + this.#tmp_bottom_height_from_horizon);
			}
			else {
				//we need to calc from front to rear!  front is farther back than horizoN!
				this.#tmp_ratio = (in_loc.z - (in_center.z + this.#zLocationFront)) / this.#zDistance;
				//console.log("ratio " + this.#tmp_ratio);
				//console.log("bleh " + this.#horizonHeightDifferenceHorizonToRear);
				//console.log("hzHeightFront " + this.#horizonHeightAtHorizon);
				this.#tmp_bottom_height_from_horizon = (this.#tmp_ratio * this.#horizonHeightDifferenceFrontToRear) + this.#horizonHeightFront;
				//console.log("hz height " + this.#tmp_bottom_height_from_horizon);
			}
			//now we can get the ratio how high up we are from the bottom and multiply by scene height!
			//tmp_y = ((in_loc.y + this.#tmp_bottom_height_from_horizon) / this.#tmp_dist) * this.#sceneSize.height;
			tmp_y = (in_loc.y / this.#tmp_dist) * this.#sceneSize.height + this.#tmp_bottom_height_from_horizon;
		}
		//tmp_y = 50;

		//console.log("scenLocation: " + tmp_x + ", " + tmp_y + ", " + tmp_z);    

		//OK.. our horizontal position..  We need to know how close we are to the front vs the back.  Use that ratio
		//  to calc the horizontal left-right ratio at that distance.
		return [this.#tmp_scale, new Location(tmp_x, tmp_y, tmp_z)];
		//return [1, new Location(tmp_x, tmp_y, tmp_z)];
	}

	//compare compare...  takes in another sceneScaler and compares which one's front edge is closest to the 
	//  camera.  if this one is closer, return -1.  if other is closer return 1.  if they the same return zero.
	//  if this isn't even a SceneScaler???  fail?
	compareScaler(in_scaler) {
		if (! in_scaler instanceof SceneScaler) {
			throw "Cannot compare non SceneScaler to a SceneScaler!";
		}
		//call the other guy with our number... it returns telling us if we're closer (it'll send a -1);
		return in_scaler.compareZDistance(this.#zLocationFront);
	}
	//another SceneScaler is comparing itself to us!  If THEY are closer, give them -1!
	//  if we are the same, give them 0.
	//  if we are closer, give them 1.
	compareZDistance(in_distance) {
		if (in_distance < this.#zLocationFront) {
			return -1;
		}
		else if (in_distance == this.#zLocationFront) {
			return 0;
		}
		else {
			return 1;
		}
	}

	//this checks against the BACK EDGE only!  It does'nt care if the incoming z-position is 
	//  before the front edge..  (since scene scalers are stored front to back)
	//zLocationRear is NEGATIVE??  shit.
	//  zPosition: -90.  cameraZ is -80.  zLocationRear is -40.
	//  -90 >= -80 + -40 = -90 >= -120.  Yes.
	zInRange(in_z_position, in_camera_z) {
		if (in_z_position >= in_camera_z + this.#zLocationRear) {
			return true;
		}
		return false;
	}

	//this takes in the distance to horizon, the height of horizon, the height at zero, and a distance
	//  in between.  It returns the height at that distance!
	static calcHorizonHeight(in_horizon_distance, in_horizon_height, in_zero_height, in_calc_height_at_distance) {
		//first get our ratio from front to back, that we need to calc at.
		//far distance is -60.  our distance is -40.  40/60 = .67    ..  then .67 * (horizon_height - zero_height)
		//WHAT IF horizon is lower than zero??  (for when we are calc'ing beyond-horizon numbers)
		//  umm...  60..  0.   .66  becomes 20..
		let tmp_ratio = in_calc_height_at_distance / in_horizon_distance;
		let tmp_result = tmp_ratio * (in_horizon_height - in_zero_height) + in_zero_height;
		//if tmp_result is negative..  for example, -40, this still works..  we'd get -40 + 60 = -20. yup!
		return tmp_result;
	}

	//accessors....  the ones that are exposed are mostly used for building SceneScalers that are in front of
	//  or behind..  Liiike, if I create a scene out of a few different scalers...  as we get closer to the 
	//  camera, I want to scale differently than far back.
	get hDistanceRear() {
		return this.#hDistanceRear;
	}
	get vDistanceRear() {
		return this.#vDistanceRear;
	}
	get horizonHeightRear() {
		return this.#horizonHeightRear;
	}
	get horizonHeightAtHorizon() {
		return this.#horizonHeightAtHorizon;
	}
	get zDistanceFromCameraRear() {
		return this.#zLocationRear;
	}
	get zDistanceFromCameraHorizon() {
		return this.#zLocationHorizon;
	}
	get scaleSizeAtRear() {
		return this.#scaleSizeAtRear;
	}

}

//OK, I guess I give up for the moment..  I wanted to have an arbitrarily defineable scene, but I don't like
//  the weird ass scaling, so I'm definiteyl doing something wrong...  I'm gotta go ahead and make a boring 
//  normal one using trig.  I guess I can have horizontal and vertical be their own separate scales?  Maybe 
//  that's all I was really envisioning anyway..??  Buuuut....  soemhow I still need to scale my objects right..
//  Fuck fuck duck!!
class SceneScalerTrig {
	#hDistanceFront;
	#hDistanceRear;
	#vDistanceFront;
	#vDistanceRear;
	#horizonHeightFront;
	#horizonHeightRear;
	#horizonHeightAtHorizon;

	#scaleSizeAtFront;
	#scaleSizeAtRear;

	#zLocationFront;
	#zLocationRear;
	#zLocationHorizon;

	#zDistance;
	#zDistanceFrontToH;
	#zDistanceHToRear;
	#hDifference;
	#vDifference;
	#vDistanceHorizon;
	#horizonHeightDifferenceFrontToRear
	#horizonHeightDifferenceFrontToHorizon;
	#horizonHeightDifferenceHorizonToRear;
	#zDistanceToBeginSizeScaling;
	#hDistanceWhereBeginScaling;
	#zScalingDifference;
	#zScalingRatio;

	//the view window
	#sceneSize;

	//I need a clipping window..  anything outside this area can be ignored
	#clippingDistance;

	//let's save and reuse our temporary variables..
	#tmp_ratio;
	#tmp_dist;
	#tmp_edge;
	#tmp_scale;
	//this guy I can reuse tmp_edge for, but ehh... I want it a bit more descriptive.  
	//  not that this is at all coherent...
	#tmp_bottom_height_from_horizon;
	#tmp_horizon_height_from_bottom;

	#hFieldOfViewHalf;
	#vFieldOfViewHalf;
	#hTan;
	#vTan;
	#hTrueCameraDist;
	#vTrueCameraDist;
	#hTrueCameraOffset;
	#vTrueCameraOffset;

	#horizonFieldOfViewHalf;
	#horizonTan;
	#horizonTrueCameraDist;
	#horizonTrueCameraOffset;


	constructor(in_horizontal_distance_front, 
				in_vertical_distance_front, 
				in_horizontal_distance_rear, 
				in_vertical_distance_rear, 
				in_z_distance_from_camera_front,
				in_z_distance_from_camera_rear, 
				in_z_distance_from_camera_horizon, 
				in_horizon_height_front, 
				in_horizon_height_rear, 
				in_horizon_height_at_horizon, 
				in_z_distance_begin_scaling,
				in_scene_size, 
				in_clipping_distances,
				in_start_scale_size) {
		this.#hDistanceFront = in_horizontal_distance_front;
		this.#hDistanceRear = in_horizontal_distance_rear;
		this.#vDistanceFront = in_vertical_distance_front;
		this.#vDistanceRear = in_vertical_distance_rear;
		//OK, these are more like our clipping / sorting for which scaler...
		this.#zLocationFront = in_z_distance_from_camera_front;
		this.#zLocationRear = in_z_distance_from_camera_rear;
		this.#zLocationHorizon = in_z_distance_from_camera_horizon;
		this.#horizonHeightFront = in_horizon_height_front;
		this.#horizonHeightRear = in_horizon_height_rear;
		this.#scaleSizeAtFront = in_start_scale_size;

		//umm... I think this one needs to be calc'd for height of game-location numbers??
		//if this comes in as 300.  we know window height is 900.  so .33.  so we calc
		//  game height at horizon location, and multiply by .33??  that's horizon height.
		//we already have it below..  this.#vDistanceHorizon
		//this.#horizonHeightAtHorizon = in_horizon_height_at_horizon;
		this.#zDistanceToBeginSizeScaling = in_z_distance_begin_scaling;
		this.#sceneSize = in_scene_size;
		this.#clippingDistance = in_clipping_distances;
		//console.log("hzHeight: " + in_horizon_height_at_horizon);

		//working with our z-distance as negative, let's say rear is -110, front is -40.
		//  -110 - -40 = -70 distance.  Keep it negative??  We'll see..
		this.#zDistance = this.#zLocationRear - this.#zLocationFront;
		this.#zDistanceFrontToH = this.#zLocationHorizon - this.#zLocationFront;
		this.#zDistanceHToRear = this.#zLocationRear - this.#zLocationHorizon;
		this.#hDifference = this.#hDistanceRear - this.#hDistanceFront;
		this.#vDifference = this.#vDistanceRear - this.#vDistanceFront;

		//here's our technical camera POV position, defined by the front and rear views...
		//tan x = (rearHeight-frontHeight) / z distance front to rear
		//This is in radians..
		//we can use atan2(y,x) ...  x will be our z depth.  y will be our height.
		this.#hFieldOfViewHalf = Math.atan2(Math.abs(this.#hDifference * 0.5), Math.abs(this.#zDistance));
		this.#vFieldOfViewHalf = Math.atan2(Math.abs(this.#vDifference * 0.5), Math.abs(this.#zDistance));
		console.log("FoV h: " + this.#hFieldOfViewHalf + ", v: " + this.#vFieldOfViewHalf);

		this.#hTan = Math.tan(this.#hFieldOfViewHalf);
		this.#vTan = Math.tan(this.#vFieldOfViewHalf);
		console.log("TAN h: " + this.#hTan + ", v: " + this.#vTan);

		this.#hTrueCameraDist = (this.#hDistanceFront * 0.5) / this.#hTan;
		this.#vTrueCameraDist = (this.#vDistanceFront * 0.5) / this.#vTan;
		//this is the offset from where the "passed in camera distance" is...  positive means it's more
		//  toward the screen than passed in camera.  negative means it's farther into the screen.
		this.#hTrueCameraOffset = this.#hTrueCameraDist + this.#zLocationFront;
		this.#vTrueCameraOffset = this.#vTrueCameraDist + this.#zLocationFront;
		//camera offset is where the true z position is in relation to the "camera" z position.
		//  true camera:  20.  cameraZ is 0.  0 + 20 = +20
		console.log("DISTANCE from front h: " + this.#hTrueCameraDist + ", v: " + this.#vTrueCameraDist);
		console.log("OFFSET h: " + this.#hTrueCameraOffset + ", v: " + this.#vTrueCameraOffset);

		//I need to create one for the horizon..
		//I did this wrong..  I need to take the front and rear horizon height and get the ratio up that is, 
		//  then get the height in GAME units of that!
		let tmp_horizon_height_front_ratio = this.#horizonHeightFront / this.#sceneSize.height;
		let tmp_horizon_height_rear_ratio = this.#horizonHeightRear / this.#sceneSize.height;
		let tmp_horizon_height_front_game = tmp_horizon_height_front_ratio * this.#vDistanceFront;
		let tmp_horizon_height_rear_game = tmp_horizon_height_rear_ratio * this.#vDistanceRear;
		this.#horizonFieldOfViewHalf = Math.atan2(Math.abs(tmp_horizon_height_rear_game - tmp_horizon_height_front_game), Math.abs(this.#zDistance));
		console.log("horiz rear: " + this.#horizonHeightRear + ", horiz front: " + this.#horizonHeightFront + ", distance: " + this.#zDistance);
		console.log("horiz rear game: " + tmp_horizon_height_rear_game + ", horiz front game: " + tmp_horizon_height_front_game);
		console.log("horiz FoV " + this.#horizonFieldOfViewHalf);
		this.#horizonTan = Math.tan(this.#horizonFieldOfViewHalf);
		console.log("horizTan: " + this.#horizonTan);
		//umm....  if front horizon is lower than rear, we calc to the bottom..  if front horizon is higher, we calc to top..
		if (this.#horizonHeightFront < this.#horizonHeightRear) {
			//calc to botttom..  
			this.#horizonTrueCameraDist = tmp_horizon_height_front_game / this.#horizonTan;
		}
		else {
			//calc to top
			this.#horizonTrueCameraDist = (this.#sceneSize.height - tmp_horizon_height_front_game) / this.#horizonTan;
		}
		this.#horizonTrueCameraOffset = this.#horizonTrueCameraDist + this.#zLocationFront;
		console.log("horiz point distance: " + this.#horizonTrueCameraDist + ", offset: " + this.#horizonTrueCameraOffset);

		//calc the horizontal distance at distance to begin scaling!   and then we can get scaling ratio.
		this.#tmp_ratio = 0;
		if (this.#zDistanceToBeginSizeScaling < this.#zLocationFront) {
			//we don't scale until scaling distance...
			this.#tmp_ratio = (this.#zDistanceToBeginSizeScaling - this.#zLocationFront) / (this.#zDistance);
		}
		this.#hDistanceWhereBeginScaling = (this.#tmp_ratio * this.#hDifference) + this.#hDistanceFront;
		this.#zScalingDifference = this.#hDistanceRear - this.#hDistanceWhereBeginScaling;
		this.#zScalingRatio = this.#hDistanceWhereBeginScaling/this.#hDistanceRear;
		//now get the scale at REAR..  will be used by any SceneScalers that are stringed along behind this one.
		//this.#tmp_scale = 1 + ((this.#zScalingRatio - 1) * ((this.#hDistanceRear - this.#hDistanceWhereBeginScaling)/this.#zScalingDifference));
		this.#scaleSizeAtRear = this.#zScalingRatio * this.#scaleSizeAtFront

		//calc the vertical distance at the horizon..
		this.#tmp_ratio = this.#zDistanceFrontToH / this.#zDistance;
		//console.log("HERE!!  " + this.#tmp_ratio + " " + this.#vDifference + " " + this.#vDistanceFront);
		this.#vDistanceHorizon = (this.#tmp_ratio * this.#vDifference) + this.#vDistanceFront;
		//console.log("HERE!!  " + in_horizon_height_at_horizon + " " + this.#sceneSize.height + " " + this.#vDistanceHorizon);
		this.#horizonHeightAtHorizon = (in_horizon_height_at_horizon / this.#sceneSize.height) * this.#vDistanceHorizon;
		//console.log("hzn height: " + this.#horizonHeightAtHorizon);

		//console.log("hzHeightHz " + this.#horizonHeightAtHorizon + ", hzHeightFr " + this.#horizonHeightFront);
		this.#horizonHeightDifferenceFrontToRear = this.#horizonHeightRear - this.#horizonHeightFront;
		this.#horizonHeightDifferenceFrontToHorizon = this.#horizonHeightAtHorizon - this.#horizonHeightFront;
		this.#horizonHeightDifferenceHorizonToRear = this.#horizonHeightRear - this.#horizonHeightAtHorizon;
	}

	//Here we are, folks!!  take in the center point of the scene and a location, and it converts that
	//  location into a scene location/position!
	calcScenePosition(in_loc, in_center) {
		//console.log("---------------------");

		//console.log("gameLocation: " + in_loc.x + ", " + in_loc.y + ", " + in_loc.z);
		//console.log("centLocation: " + in_center.x + ", " + in_center.y + ", " + in_center.z);

		//check if outside clipping zone!
		//UMM... clipping distance z...  positive number means behind the camera..  toward the viewer.
		if (in_loc.x < in_center.x - this.#clippingDistance.left ||
			in_loc.x > in_center.x + this.#clippingDistance.right ||
			in_loc.z > in_center.z + this.#clippingDistance.front ||
			in_loc.z < in_center.z + this.#clippingDistance.rear) {
			//object is outside clipping, we don't need to draw this guy
			//TODO:  umm... flag something to disable it / remove from DOM?
			//console.log("  DO NOT CALC OR DRAW THIS GUY!");
			return;
		}

		let tmp_x = 0;
		let tmp_y = 0;
		let tmp_z = 0;

		//first let's do Z.  this is the ratio, front to back where the location is!
		//NOTE: #zDistance is NEGATIVE.  But in_loc_z is always smaller than zLocationFront, so we'll get
		//  a negative number there, too...  neg divided neg equals postive.  which we want.  So we are GOOD!
		console.log("--------------");
		console.log("OBJECT LOC: " + in_loc.x + ", " + in_loc.y + ", " + in_loc.z);
		console.log("z loc front: " + this.#zLocationFront + ", z loc rear: " + this.#zLocationRear + ", zdist: " + this.#zDistance);
		console.log("front loc: " + (in_center.z + this.#zLocationFront) + ", rear loc: " + (in_center.z + this.#zLocationRear));
		console.log("trig loc: " + (in_center.z + this.#hTrueCameraOffset));
		console.log("object distance from trig loc: " + ((in_center.z + this.#hTrueCameraOffset) - in_loc.z));
		this.#tmp_dist = ((in_center.z + this.#hTrueCameraOffset) - in_loc.z) * this.#hTan * 2;
		console.log("horizontal width at depth: " + this.#tmp_dist);
		console.log("h dist at front: " + this.#hDistanceFront + ", h dist at rear: " + this.#hDistanceRear);

		//Here's our X / horizontal location
		//now we can get the horizontal distance at that z depth..
		//NOTE:  This doesn't consider where hDistanceWhereBeginScaling is!  TODO FIX THIS BUGGY BUG
		//now we determine where on the screen their location is..
		//this.#tmp_edge = in_center.x - (this.#tmp_dist * 0.5);
		this.#tmp_edge = in_center.x - (this.#tmp_dist * 0.5);
		console.log("edge loc at distance: " + this.#tmp_edge + ", (center.x is: " + in_center.x + ")");
		//now we can get the ratio across that distance we're at, and multiply it by our scene size!
		tmp_x = ((in_loc.x - this.#tmp_edge) / this.#tmp_dist) * this.#sceneSize.width;
		console.log("calc'd x is: " + tmp_x);

		//Here's our Z...  umm... everything in front of the horizon distance is positive.  everything behind it is
		//  negative.  Well... we can just make it really simple.  All Z needs us to do is place in front of or 
		//  behind the things relative to itself.  So no exact ratios are needed.
		//  object's location MINUS horizon Z.  The. end.
		//  front: -80.  horizon: -90.  rear:  -120.
		//  our z:  -110.
		//  -110 - -90  = -15.  We are behind the horizon.  BAM!
		//OOPS, gotta consider the camera location.. locationHorizon is a distance from camera!!
		//  camera is at -30, locHorizon is -60.  -30 + -60 = -90.
		//  camera is at 10, locHorizon is at -20.  10 + -20 = -10.
		tmp_z = in_loc.z - (this.#zLocationHorizon + in_center.z);

		//we also need to scale the size..  umm... 50 pixels at the front..  fuck, I gotta write this one down.
		//It's pretty easy.  the scale(ratio) is front width / rear width.  easy.
		//50 px wide at front.  200 px wide at back.  the full 50 will be 1/4 the width at back.  50/200 = 1/4.  YUP.
		//MAYBE??  My brain FELL OUT!!  I understood this stuff yesteday.... today, forget it!!
		//console.log("SCALE NUMS: scaler " + this.#zScalingRatio + ", hdist " + this.#tmp_dist + ", hdistb " + this.#hDistanceWhereBeginScaling + ", scaledif " + this.#zScalingDifference);
		//we need to calc the distance of the object FROM THE CAMERA
		if (this.#tmp_dist <= this.#hDistanceWhereBeginScaling) {
			//our location is closer than where we scale.. so don't scale!
			this.#tmp_scale = 1 * this.#scaleSizeAtFront;
		}
		else {
			//I now have the right horizontal sizing...  it's just hWhereBegin / hLoc
			this.#tmp_scale = this.#hDistanceWhereBeginScaling / this.#tmp_dist;
			this.#tmp_scale *= this.#scaleSizeAtFront;
		}
		//console.log("SCALE IS " + this.#tmp_scale);

		//our horizon height!  Let's get that first.
		this.#tmp_horizon_height_from_bottom
		//remember, if horizon front is lower, we work from the bottom..  otherwise we need to calc from top!
		if (this.#horizonHeightFront < this.#horizonHeightRear) {
			//calc to botttom..  
			console.log("calc to bottom!");
			console.log("horizonTan: " + this.#horizonTan + ", distance from horizonPoint: " + ((in_center.z + this.#horizonTrueCameraOffset) - in_loc.z) );
			this.#tmp_horizon_height_from_bottom = ((in_center.z + this.#horizonTrueCameraOffset) - in_loc.z) * this.#horizonTan;
			//tmp_horizon_height_from_bottom = ((in_center.z + this.#zLocationFront) - in_loc.z) * this.#horizonTan + this.#horizonHeightFront;
		}
		else {
			//calc to top
			this.#tmp_horizon_height_from_bottom = this.#sceneSize.height - (((in_center.z + this.#horizonTrueCameraOffset) - in_loc.z) * this.#horizonTan);
			//tmp_horizon_height_from_bottom = this.#horizonHeightFront - (((in_center.z + this.#zLocationFront) - in_loc.z) * this.#horizonTan);
		}
		console.log("horizon height from bottom: " + this.#tmp_horizon_height_from_bottom + ", horizon height at front: " + this.#horizonHeightFront);

		//here's our vertical height at location
		this.#tmp_dist = ((in_center.z + this.#vTrueCameraOffset) - in_loc.z) * this.#vTan * 2;

		//we can now convert horizon height from bottom to scene size!
		//OH YEA!  No need to do this.. just add it to the in_loc.y, since it's already in game height.
		//let tmp_horizon_scene_height = (tmp_horizon_height_from_bottom / this.#tmp_dist) * this.#sceneSize.height;
		//console.log("horizon scene height?? " + tmp_horizon_scene_height);

		//console.log("VERTICAL height at distance: " + this.#tmp_dist + ", vert height at front: " + this.#vDistanceFront);
		//umm... now get the screen size pixels per distance...
		let tmp_height_per_Y = this.#sceneSize.height / this.#tmp_dist;
		//now multiply by our Y value and add horizon height????
		//tmp_y = (in_loc.y * tmp_height_per_Y) + tmp_horizon_scene_height;
		tmp_y = ((in_loc.y + this.#tmp_horizon_height_from_bottom) * tmp_height_per_Y);
		//console.log("scenLocation: " + tmp_x + ", " + tmp_y + ", " + tmp_z);    

		return [this.#tmp_scale, new Location(tmp_x, tmp_y, tmp_z)];
	}

	//compare compare...  takes in another sceneScaler and compares which one's front edge is closest to the 
	//  camera.  if this one is closer, return -1.  if other is closer return 1.  if they the same return zero.
	//  if this isn't even a SceneScaler???  fail?
	compareScaler(in_scaler) {
		if (! in_scaler instanceof SceneScaler) {
			throw "Cannot compare non SceneScaler to a SceneScaler!";
		}
		//call the other guy with our number... it returns telling us if we're closer (it'll send a -1);
		return in_scaler.compareZDistance(this.#zLocationFront);
	}
	//another SceneScaler is comparing itself to us!  If THEY are closer, give them -1!
	//  if we are the same, give them 0.
	//  if we are closer, give them 1.
	compareZDistance(in_distance) {
		if (in_distance < this.#zLocationFront) {
			return -1;
		}
		else if (in_distance == this.#zLocationFront) {
			return 0;
		}
		else {
			return 1;
		}
	}

	//this checks against the BACK EDGE only!  It does'nt care if the incoming z-position is 
	//  before the front edge..  (since scene scalers are stored front to back)
	//zLocationRear is NEGATIVE??  shit.
	//  zPosition: -90.  cameraZ is -80.  zLocationRear is -40.
	//  -90 >= -80 + -40 = -90 >= -120.  Yes.
	zInRange(in_z_position, in_camera_z) {
		if (in_z_position >= in_camera_z + this.#zLocationRear) {
			return true;
		}
		return false;
	}

	//this takes in the distance to horizon, the height of horizon, the height at zero, and a distance
	//  in between.  It returns the height at that distance!
	static calcHorizonHeight(in_horizon_distance, in_horizon_height, in_zero_height, in_calc_height_at_distance) {
		//first get our ratio from front to back, that we need to calc at.
		//far distance is -60.  our distance is -40.  40/60 = .67    ..  then .67 * (horizon_height - zero_height)
		//WHAT IF horizon is lower than zero??  (for when we are calc'ing beyond-horizon numbers)
		//  umm...  60..  0.   .66  becomes 20..
		let tmp_ratio = in_calc_height_at_distance / in_horizon_distance;
		let tmp_result = tmp_ratio * (in_horizon_height - in_zero_height) + in_zero_height;
		//if tmp_result is negative..  for example, -40, this still works..  we'd get -40 + 60 = -20. yup!
		return tmp_result;
	}

	//SceneScaler.calcHorizonHeight(-63, tmp_layer.horizonHeight, 0, -36)
	//this takes in the distance to horizon, the height of horizon, the height at zero, and a distance
	//  in between.  It returns the height at that distance!
	//I don't think I actually need the complicated stuff for this one... I don't know..
	static calcHorizonHeightDoesNotWork(in_horizon_distance, 
							in_horizon_height, 
							in_zero_height, 
							in_calc_height_at_distance, 
							in_scene_height,
							in_game_height_front,
							in_game_height_horizon) {

		let tmp_horizon_height_front_ratio = in_zero_height / in_scene_height;
		let tmp_horizon_height_rear_ratio = in_horizon_height / in_scene_height;
		let tmp_horizon_height_front_game = tmp_horizon_height_front_ratio * in_game_height_front;
		let tmp_horizon_height_rear_game = tmp_horizon_height_rear_ratio * in_game_height_horizon;
		let tmp_hz_fov_half = Math.atan2(Math.abs(tmp_horizon_height_rear_game - tmp_horizon_height_front_game), Math.abs(in_horizon_distance));
		//console.log("horiz rear: " + in_horizon_height + ", horiz front: " + in_zero_height + ", distance: " + in_horizon_distance);
		//console.log("horiz rear game: " + tmp_horizon_height_rear_game + ", horiz front game: " + tmp_horizon_height_front_game);
		//console.log("horiz FoV " + this.#horizonFieldOfViewHalf);
		let tmp_hz_tan = Math.tan(tmp_hz_fov_half);
		//console.log("horizTan: " + this.#horizonTan);
		//umm....  if front horizon is lower than rear, we calc to the bottom..  if front horizon is higher, we calc to top..
		let tmp_hz_dist;
		if (in_zero_height < in_horizon_height) {
			//calc to botttom..  
			//this.#horizonTrueCameraDist = this.#horizonHeightFront / Math.tan(this.#hFieldOfViewHalf);
			tmp_hz_dist = tmp_horizon_height_front_game / tmp_hz_tan;
		}
		else {
			//calc to top
			tmp_hz_dist = (in_scene_height - tmp_horizon_height_front_game) / tmp_hz_tan;
		}
		//loc front is zero.
		//this.#horizonTrueCameraOffset = this.#horizonTrueCameraDist + this.#zLocationFront;

		let tmp_horizon_height_from_bottom;
		//remember, if horizon front is lower, we work from the bottom..  otherwise we need to calc from top!
		if (in_zero_height < in_horizon_height) {
			//calc to botttom..  
			//console.log("horizonTan: " + this.#horizonTan + ", distance from horizonPoint: " + in_calc_height_at_distance);
			tmp_horizon_height_from_bottom = (tmp_hz_dist + in_calc_height_at_distance) * tmp_hz_tan;
			//tmp_horizon_height_from_bottom = ((in_center.z + this.#zLocationFront) - in_loc.z) * this.#horizonTan + this.#horizonHeightFront;
		}
		else {
			//calc to top
			tmp_horizon_height_from_bottom = in_scene_height - ((tmp_hz_dist + in_calc_height_at_distance) * tmp_hz_tan);
			//tmp_horizon_height_from_bottom = this.#horizonHeightFront - (((in_center.z + this.#zLocationFront) - in_loc.z) * this.#horizonTan);
		}
		//console.log("horizon height from bottom: " + tmp_horizon_height_from_bottom + ", horizon height at front: " + in_zero_height);

		//here's our vertical height at location..
		let tmp_v_fov_half = Math.atan2(Math.abs(in_game_height_horizon - in_game_height_front), Math.abs(in_horizon_distance));
		let tmp_v_tan = Math.tan(tmp_v_fov_half);
		let tmp_v_distance = (tmp_hz_dist + in_calc_height_at_distance) * tmp_v_tan * 2;

		//we can now convert horizon height from bottom to scene size!
		return (tmp_horizon_height_from_bottom / tmp_v_distance) * in_scene_height;
	}

	//accessors....  the ones that are exposed are mostly used for building SceneScalers that are in front of
	//  or behind..  Liiike, if I create a scene out of a few different scalers...  as we get closer to the 
	//  camera, I want to scale differently than far back.
	get hDistanceRear() {
		return this.#hDistanceRear;
	}
	get vDistanceRear() {
		return this.#vDistanceRear;
	}
	get horizonHeightRear() {
		return this.#horizonHeightRear;
	}
	get horizonHeightAtHorizon() {
		return this.#horizonHeightAtHorizon;
	}
	get zDistanceFromCameraRear() {
		return this.#zLocationRear;
	}
	get zDistanceFromCameraHorizon() {
		return this.#zLocationHorizon;
	}
	get scaleSizeAtRear() {
		return this.#scaleSizeAtRear;
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

	#sceneScalers = [];

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
	lateUpdate() {
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
				//console.log(" !!!!  viewChange: " + this.#parentWindow.viewChange + ", locChange: " + vv_object.locChange);
				//we can reset the loc change
				vv_object.resetLocChange();
				//check if its out of view??  Maybe move those to a different gameObject list?? well... we'd need to
				//  check if its back in view, anyway, sooo maybe not..

				//if it WAS out of view, and is now in view, we need to add it back to our element.

				//if it WAS in view, and is now out of view, we need to remove it from our element.

				if (this.#sceneScalers.length > 0) {
					//we need to get its sceneLocation.. which sceneScaler does the object need?  Goes by size..
					let tmp_scene_scale_info = null;
					for (let i=0; i<this.#sceneScalers.length; i++) {
						if (this.#sceneScalers[i].zInRange(vv_object.location.z, this.#parentWindow.camera.location.z)) {
							if (i === 1) {
								//console.log("found something in middle scaler!");
							}
							tmp_scene_scale_info = this.#sceneScalers[i].calcScenePosition(vv_object.location, this.#parentWindow.camera.location);
							//great!  break!
							break;
						}
					}
					//if the object isn't in range, then... ummm...  don't draw it??
					if (tmp_scene_scale_info != null) {
						//aaand give it its new infoz!
						//first give it size scale...
						//size scale.. umm... this is linear along z distance.
						vv_object.sizeScale = this.#parentWindow.windowScale * tmp_scene_scale_info[0];
						//now we can give it location.  it takes care of putting these numbers to its element.
						vv_object.sceneLocation = tmp_scene_scale_info[1];
					}
				}
				else {
					//we just use the basic stuff..
					//TODO: probably don't have this... I haven't added scene scalers to my other scenes, though, yet, as I 
					//  test it and figure out numbers...
					vv_object.sizeScale = this.#parentWindow.windowScale;
					vv_object.sceneLocation = new Location(vv_object.location.x, vv_object.location.y, vv_object.location.z);
				}
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

	//Add scalers in order of NEAREST to FARTHEST from front of scene.
	addSceneScaler(in_scaler) {
		if (! in_scaler instanceof SceneScaler) {
			throw "addSceneScaler received an object that was not a SceneScaler.";
		}
		for (let i=0; i<this.#sceneScalers; i++) {
			//check if the incoming scaler is closer to the front!  (we'll get a -1)
			if (in_scaler.compare(this.#sceneScalers[i])) {
				//it is closer to the front!  We need to insert it here!
				this.#sceneScalers.splice(i, 0, in_scaler);
				return;
			}
		}
		//aaand, it wasn't closer than any of them.  So add it to the end.
		this.#sceneScalers.push(in_scaler);
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

	#camera;
	#lastCameraLoc;
	#viewChange = false;
	#viewChangeCheckedThisFrame = false;

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

	earlyUpdate() {
		//console.log("   ------ GAME WINDOW VIEW CHANGE RESET ------");
		//reset our viewChange!
		this.#viewChange = false;
		this.#viewChangeCheckedThisFrame = false;
	}

	//TODO:  Ummm.....  when I created this with borderRatio, I had to make sure we were smaller on all 4 sides..
	//  now that I'm doing a parent ratio, do I do the same thing???  Liiike, 25% of width OR height??  Or just 1?
	#updateSize() {
		//let tmp_width_max = Math.floor(this.#bodyWidth * (1 - 2*this.#minBorderRatio));
		//let tmp_height_max = Math.floor(this.#bodyHeight * (1 - 2*this.#minBorderRatio));

		let tmp_width_max = Math.floor(this.#bodyWidth * this.#parentRatio);
		let tmp_height_max = Math.floor(this.#bodyHeight * this.#parentRatio);

		//console.log("max w/h are: " + tmp_width_max + " / " + tmp_height_max);

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

		//console.log("window will be: " + this.#width + " x " + this.#height);
		//console.log("webpage is: " + this.#bodyWidth + " x " + this.#bodyHeight);
		//console.log("padding is: " + this.#borderPadding)
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
		//if we already know the answer, just send it!
		if (this.#viewChangeCheckedThisFrame) {
			return this.#viewChange;
		}
		//we haven't checked this frame yet..  compare camera's loc with our last loc of it.
		if (this.#lastCameraLoc.equals(this.#camera.location)) {
			//it's the same still.  no change.
			this.#viewChangeCheckedThisFrame = true;
			//technically we don't need to do this.. it should be false.  Unless I messed something up somewhere!
			this.#viewChange = false;
		}
		else {
			//change!
			this.#viewChangeCheckedThisFrame = true;
			this.#viewChange = true;
			this.#lastCameraLoc = this.#camera.location;
		}
		return this.#viewChange;
	}
	get camera() {
		return this.#camera;
	}
	set camera(in_camera) {
		this.#camera = in_camera;
		//new camera!  So it's a view change!
		this.#viewChangeCheckedThisFrame = true;
		this.#viewChange = true;
		this.#lastCameraLoc = this.#camera.location;
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
		//console.log("saving to map: " + tmp_file_name);
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
			//console.log("file has loaded.. " + FileLoader.Instance().loadingComplete + ", " + FileLoader.Instance().okToContinue);
			if (FileLoader.Instance().loadingComplete && FileLoader.Instance().okToContinue) {
				next();
			}
			else {
				//console.log("not yet.. " + FileLoader.Instance().okToContinue);
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

	/*
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
	*/

	//this returns a previously loaded file..
	getFile(in_name) {
		//console.log("map size: " + this.#fileMap.size + "..  " + this.#elementToFileMap.get(this.#fileMap.get(in_name)));
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
//TODO Make imperfection tiles and add them..  make liiike 1/4 size tiles of our normal one (100x100).  Have a 
//  perfect one, and then make a whole bunch of different imperfections.  Then can add one, and the other 3 tiles
//  can be perfects (or even another imperfection).
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
			//console.log("gREAT!  file already loaded");
			this.#image = this.#imageElement.src;
			//console.log("iamge is: " + this.#image);
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

		//console.log(this.#parent.clientWidth + ", " + this.#imageElement.naturalWidth + ", " + this.#scale);

		const tmp_horizontal = this.#parent.clientWidth / (this.#imageElement.naturalWidth * this.#scale);
		const tmp_vertical = this.#parent.clientHeight / (this.#imageElement.naturalHeight * this.#scale);
		const tmp_h_rem = this.#parent.clientWidth - (this.#imageElement.naturalWidth * this.#scale) * Math.floor(tmp_horizontal);
		const tmp_v_rem = this.#parent.clientHeight - (this.#imageElement.naturalHeight * this.#scale) * Math.floor(tmp_vertical);
		//aand now I need to add this many...

		//console.log(tmp_horizontal + " x " + tmp_vertical + " rem: " + tmp_h_rem + " x " + tmp_v_rem);

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
				//console.log("natural size is " + tmp_element.naturalWidth);
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
		}

		//now add it to the parent!
		this.#parent.appendChild(this.#canvasElement);
	}
}

class Boundary {
	#left;
	#right;
	#front;
	#back;

	constructor(in_left, in_right, in_front, in_back) {
		this.#left = in_left;
		this.#right = in_right;
		this.#front = in_front;
		this.#back = in_back;
	}

	get left() {
		return this.#left;
	}
	get right() {
		return this.#right;
	}
	get front() {
		return this.#front;
	}
	get back() {
		return this.#back;
	}
}

//---===---===---===---===---
//  Animations...  how do I want to do this..?
//---===---===---===---===---
//SO.  for animations.  I have animation class, but I'm gonna have multiple cows doing the same animations, 
//  so I kinda want to be able to keep saying "give me that one!"  "give me that one!"  So I guess I create
//  a bunch of sub classes?
//	constructor(in_name, in_frames_list, in_anim_length_millis, in_img_element, in_frame_times)
class AnimCowStep extends Animation {
	static animList = ["assets/cow_step_1.png",
						"assets/cow_step_2.png",
						"assets/cow_step_3.png",
						"assets/cow.png"];
	constructor(in_img_element) {
		super("cow_step", 
			  AnimCowStep.animList, 
			  1000,
			  in_img_element);
	}
}


//---===---===---===---===---
//  Game Objects!  ....?
//---===---===---===---===---

//this fades the scene... to whatever image is chosen.
//sooo... let's say this guy isn't tied to the game.  It should be tied to something else that handles
//  it...  PauseSceneLayer?
//What happens if we're in the middle of fading, and we get itnerrupted?  I guess we need to flag that
//  we're in the middle of fading.  And have a checker.
class SceneFader extends GameObject {
	static FADE_BLACK = 1;
	static FADE_WHITE = 2;

	#currentFade;
	#maxFade;
	#fadeSpeed;
	#frameTime;

	#timer;

	#fadingIn = false;
	#fadingOut = false;

	constructor(in_fade_to_color, in_max_fade, in_fade_speed_seconds) {
		super();
		this.#currentFade = 0;
		this.#maxFade = in_max_fade;
		this.#fadeSpeed = in_fade_speed_seconds * 1000;
		this.#frameTime = Math.round(1000/60);

		this.location = new Location(0, 0, 0);

		let tmp_file_name;
		if (in_fade_to_color === SceneFader.FADE_BLACK) {
			//use black color!
			tmp_file_name = FADE_COLORS[0];
		}
		else {
			tmp_file_name = FADE_COLORS[1];
		}
		this.setImage(tmp_file_name, FileLoader.Instance().getFile(tmp_file_name));
		this.element.style.opacity = this.#currentFade;
	}

	//this fades from zero to whatever %
	fadeIn(in_callback, in_speed_seconds_optional) {
		//let's see if we're fading already...
		if (this.#fadingIn) {
			//we're already fading in.. sooo, we can ignore this fadeIn call.....???
			return;
		}
		if (this.#fadingOut) {
			//we've interrupted fade-out!
			this.#fadingOut = false;
		}
		this.#fadingIn = true;

		//create our own timer.
		this.#timer = new GameTime();

		let tmp_speed = this.#fadeSpeed;
		if (in_speed_seconds_optional) {
			//override the default!
			tmp_speed = in_speed_seconds_optional * 1000;
		}
		this.#fadeInInternal(in_callback, tmp_speed);
	}

	//should I not bother having all the checks in the one above, and just call a specific function for the 
	//  repeating?
	#fadeInInternal(in_callback, in_speed_millis) {
		//check if we've been interrupted and fading is now going the other way...???
		if (this.#fadingOut) {
			//fadingIn is now flagged as true.. soo... we stop fading out.  DO WE CALL THE CALLBACK??
			//  I don't think we do...
			return;
		}

		//keep calling ourself until fully faded, then call the callback to let it know!
		this.#timer.update();
		//console.log("elapsed: " + this.#timer.timeElapsed + ", speed: " + in_speed_millis + ", maxFade: " + this.#maxFade);
		this.#currentFade += (this.#timer.timeElapsed / in_speed_millis) * this.#maxFade;
		//console.log("Fade IN! " + this.#currentFade);
		if (this.#currentFade >= this.#maxFade) {
			//we are done!
			this.#currentFade = this.#maxFade;
			this.element.style.opacity = this.#currentFade;
			//clear our timer...?  We don't really need to, but we'll be replacing it the next time we're called,
			//  so might as well...?
			this.#timer = null;
			this.#fadingIn = false;
			in_callback();
			return;
		}
		else {
			//keep going!
			this.element.style.opacity = this.#currentFade;

			setTimeout(() => { this.#fadeInInternal(in_callback, in_speed_millis) }, this.#frameTime);
		}
	}

	//this fades from whatever % we're at, back to zero
	fadeOut(in_callback, in_speed_seconds_optional) {
		//let's see if we're fading already...
		if (this.#fadingOut) {
			//we're already fading out.. sooo, we can ignore this fadeOut call.....???
			return;
		}
		if (this.#fadingIn) {
			//we've interrupted fade-in!
			this.#fadingIn = false;
		}
		this.#fadingOut = true;

		//create our own timer.
		this.#timer = new GameTime();

		let tmp_speed = this.#fadeSpeed;
		if (in_speed_seconds_optional) {
			//override the default!
			tmp_speed = in_speed_seconds_optional * 1000;
		}
		this.#fadeOutInternal(in_callback, tmp_speed);
	}

	#fadeOutInternal(in_callback, in_speed_millis) {
		//check if we've been interrupted and fading is now going the other way...???
		if (this.#fadingIn) {
			//fadingIn is now flagged as true.. soo... we stop fading out.  DO WE CALL THE CALLBACK??
			//  I don't think we do...
			return;
		}

		//keep calling ourself until fully faded, then call the callback to let it know!
		this.#timer.update();
		//console.log("elapsed: " + this.#timer.timeElapsed + ", speed: " + in_speed_millis + ", maxFade: " + this.#maxFade);
		this.#currentFade -= (this.#timer.timeElapsed / in_speed_millis) * this.#maxFade;
		//console.log("Fade OUT! " + this.#currentFade);
		if (this.#currentFade <= 0) {
			//we are done!
			this.#currentFade = 0;
			this.element.style.opacity = this.#currentFade;
			//clear our timer...?  We don't really need to, but we'll be replacing it the next time we're called,
			//  so might as well...?
			this.#timer = null;
			this.#fadingOut = false;
			in_callback();
			return;
		}
		else {
			//keep going!
			this.element.style.opacity = this.#currentFade;

			setTimeout(() => { this.#fadeOutInternal(in_callback, in_speed_millis) }, this.#frameTime);
		}
	}

	//the speeeed.  The default is 60, I guess...
	set framesPerSecond(in_value) {
		this.#frameTime = 1000 / in_value;
	}
}

//--------------------
//   COW
//--------------------
//What's a cooowwwwww?
class Cow extends GameObject {
	#boundary;

	constructor() {
		//we can probably pick the cow image here..  some kind of cow builder for all cows.
		super();
		this.#boundary = new Boundary(0, 60, 0, -60);
	}

	//cow definitely needs an udpate.  To mooOOOooove!
	//Cows will, umm...  move along slowly..  will they eat real grass?  Or do they not really need
	//  to eat.. so we can have them visually eat, but not take away the sweet sweet precious blades
	//  of grass our sim cow needs to survive and thrive!
	update() {

	}

}

//Here's the cow we actually control!  Umm... Do I have it extend cow??  Will I give every cow 
//  different personas?  I guess I could..  but maybe I just want them to be more normal cows..
//For the mooment, this guy will be its own thing.
class ControllableCow extends GameObject {
	#boundary;
	#movementSpeed = 6;

	#currentAnim;

	constructor() {
		//we can probably pick the cow image here..  some kind of cow builder for all cows.
		super();
		this.#boundary = new Boundary(0, 60, 0, -60);
	}

	begin() {
		//add this guy to the inputhandler..
		InputHandler.Instance().addInputListener(this, false);
		//TODO add event listening as methods rather than in the update..

		//TODO..  I forget how to do it... have object movement be a bit of its own entity..  So we can 
		//  easily swap between person input and automated control
	}

	//cow definitely needs an udpate.  To mooOOOooove!
	update() {
		//for the moooment, I'm just gonna check presses from heeeere.
		let tmp_x = super.location.x;
		let tmp_y = super.location.y;
		let tmp_z = super.location.z;
		let tmp_input = false;
		//check if button presses!
		if (InputHandler.Instance().checkIsDown("ArrowLeft")) {
			//we going leeeft
			tmp_input = true;
			tmp_x -= (Game.Instance().timer.timeElapsed / 1000) * this.#movementSpeed;
			//now make sure we haven't gone past an edge..
			if (this.#boundary && tmp_x < this.#boundary.left) {
				tmp_x = this.#boundary.left;
			}
			//aaand new animatioN!!
			//if there was an old animation, we need to delete it!  TODO
			if (!this.#currentAnim) {
				this.#currentAnim = new AnimCowStep(this.element);
				Game.Instance().addObject(this.#currentAnim);
			}
		}
		if (InputHandler.Instance().checkIsDown("ArrowRight")) {
			//we going right
			tmp_input = true;
			tmp_x += (Game.Instance().timer.timeElapsed / 1000) * this.#movementSpeed;
			//now make sure we haven't gone past an edge..
			if (this.#boundary && tmp_x > this.#boundary.right) {
				tmp_x = this.#boundary.right;
			}
		}
		if (InputHandler.Instance().checkIsDown("ArrowDown")) {
			//we going out toward front
			tmp_input = true;
			tmp_z += (Game.Instance().timer.timeElapsed / 1000) * this.#movementSpeed;
			//now make sure we haven't gone past an edge..
			if (this.#boundary && tmp_z > this.#boundary.front) {
				tmp_z = this.#boundary.front;
			}
		}
		if (InputHandler.Instance().checkIsDown("ArrowUp")) {
			//we going innnn
			tmp_input = true;
			tmp_z -= (Game.Instance().timer.timeElapsed / 1000) * this.#movementSpeed;
			//now make sure we haven't gone past an edge..
			if (this.#boundary && tmp_z < this.#boundary.rear) {
				tmp_z = this.#boundary.rear;
			}
		}
		if (tmp_input === true) {
			//now update our location!
		 super.location = new Location(tmp_x, tmp_y, tmp_z);
	 }
	}

	//Cow needs to know when we move..  How'm I doing this??  In update?  Or do I do some register-ee shit?  Or
	//  even something like: "onKeyDown" and "onKeyUp"  and in Game, also look for those fuckers!  Probably should
	//  do that....
	//TODO
}

//Grass class!  Umm..  Should this and flower both be children of plant??  Maybe probably.
//Grass..  it grows!
//  Cows eat it.  Yummmnummnommmm!
//  will it wilt?  not really.  but will it die???  It can turn to hay-ish?
//What age should I have it go from small to tall to fall??
//  literal game days??  day 1: small.  day 5: tall??  day 15: fall??  day 20: almost gone.  day: 25 gone
//  should I have a medium size??
class Grass extends GameObject {
	#age;
	#name;
	#bladeCount;

	constructor(in_location, in_age) {
		super();
		if (in_age) {
			this.#age = in_age;      
		}
		else {
			this.#age = 1;
		}
		this.location = in_location;
		this.locationPoint = GameObject.LOC_BC;
		this.visualOffset = new Location(0, -1, 0);
		//we need a new grass img for this guy.
		let tmp_rand;
		this.#bladeCount = Math.floor(Math.random() * 3) + 1;  //1 to 3 blades...;
		let tmp_file_name;
		if (this.#age < 5) {
			tmp_rand = Math.floor(Math.random() * GRASS_S_OPTIONS[this.#bladeCount-1]) + 1;
			this.#name = Grass.grassNameBuilder(GRASS_S_NAME, this.#bladeCount, tmp_rand);
			tmp_file_name = this.#name + "." + IMG_TYPE;
		}
		else if (this.#age < 10) {
			tmp_rand = Math.floor(Math.random() * GRASS_M_OPTIONS[this.#bladeCount-1]) + 1;
			this.#name = Grass.grassNameBuilder(GRASS_M_NAME, this.#bladeCount, tmp_rand);
			tmp_file_name = this.#name + "." + IMG_TYPE;
		}
		else if (this.#age < 18) {
			tmp_rand = Math.floor(Math.random() * GRASS_L_OPTIONS[this.#bladeCount-1]) + 1;
			this.#name = Grass.grassNameBuilder(GRASS_L_NAME, this.#bladeCount, tmp_rand);
			tmp_file_name = this.#name + "." + IMG_TYPE;
		}
		else {
			tmp_rand = Math.floor(Math.random() * GRASS_L_OPTIONS[this.#bladeCount-1]) + 1;
			this.#name = Grass.grassNameBuilder(GRASS_L_NAME, this.#bladeCount, tmp_rand) + "_d";
			tmp_file_name = this.#name + "." + IMG_TYPE;
		}

		this.setImage(tmp_file_name, FileLoader.Instance().getFile(tmp_file_name));
	}

	//do I want small pieces of grass to die?  Or just big pieces?  We'll start with just big ones.. meaning
	//  it's an age/size thing.  (rather than dead/color for all age/sizes)
	static grassNameBuilder(in_file_name_start, in_blade_count, in_choice) {
		return in_file_name_start + in_blade_count + "_" + (in_choice < 10? "0" : "") + in_choice;
	}

	updateDayNew() {
		//increment our age!
		this.#age++;

		//do we need to die??
		if (this.#age > 24) {
			//we deeead!
			//TODO Delete / disable..
		}

		//do we need to grow??
		//Do I have a % chance where when it grows, it loses a blade of grass?  Meh... I gotta do more with this
		//  thing than just make stupid grass.
		if (this.#age === 5) {
			//we are growing to meeediuM!
			let tmp_rand = Math.floor(Math.random() * GRASS_M_OPTIONS[this.#bladeCount-1]) + 1;
			this.#name = Grass.grassNameBuilder(GRASS_M_NAME, this.#bladeCount, tmp_rand);
			let tmp_file_name = this.#name + "." + IMG_TYPE;
			this.updateImage(tmp_file_name, FileLoader.Instance().getFile(tmp_file_name));
		}
		else if (this.#age === 10) {
			//we are growing to large!!
			let tmp_rand = Math.floor(Math.random() * GRASS_L_OPTIONS[this.#bladeCount-1]) + 1;
			this.#name = Grass.grassNameBuilder(GRASS_L_NAME, this.#bladeCount, tmp_rand);
			let tmp_file_name = this.#name + "." + IMG_TYPE;
			this.updateImage(tmp_file_name, FileLoader.Instance().getFile(tmp_file_name));
		}
		else if (this.#age === 18) {
			//we have turned to haaaaayyyyy!
			//this one is easy....  take our large name, and add _d to it.
			this.#name = this.#name + "_d";
			let tmp_file_name = this.#name + "." + IMG_TYPE;
			this.updateImage(tmp_file_name, FileLoader.Instance().getFile(tmp_file_name));
		}
	}


	//Grass builder...
	static factory(in_boundary, in_padding, in_amount, in_age) {
		let tmp_grass = [];
		let tmp_age = 0;
		if (in_age >= 0) {
			tmp_age = in_age;
		}
		else {
			in_age = -1;
		}

		//build from (a) -10 to (b) 200..
		//  Math.random * (b - a) + a.
		const tmp_left = in_boundary.left - in_padding;
		const tmp_right = in_boundary.right + in_padding;
		const tmp_front = in_boundary.front + in_padding;
		const tmp_rear = in_boundary.back - in_padding;
		for (let i=0; i<in_amount; i++) {
			if (in_age === -1) {
				tmp_age = Math.floor(Math.random() * 24);
			}
			tmp_grass.push(new Grass(new Location(Math.random()*(tmp_right-tmp_left)+tmp_left, 
																0, 
																Math.random()*(tmp_front-tmp_rear)+tmp_rear), tmp_age));
		}

		//and we're done
		return tmp_grass;
	}

	get age() {
		return this.#age;
	}
}

class Flower {

}

class Tree {

}

//This is kiinda like a Scene layer, but isn't as complicated, so I'm making it its own thing.
//Well.. this is just 1.  I could make this a singleton...??
class PauseScene {
	#baseDepth;
	#parentWindow;

	#element;
	#fader;

	#active;

	constructor(in_parent_window) {
		this.#baseDepth = 9;
		this.#parentWindow = in_parent_window;
		this.#active = false;
		this.#fader = new SceneFader(SceneFader.FADE_BLACK, 0.5, .1);
		this.#fader.framesPerSecond = 120;
		this.#fader.specificSize = new Size(in_parent_window.windowElement.clientWidth, in_parent_window.windowElement.clientHeight);

		this.#element = document.createElement("div");
		this.#element.style.zIndex = this.#baseDepth;
		this.#element.classList.add("sceneLayer");
		//RIGHT HERE:  TODO  GameObject doesn't support overridden sizes..  TODO.  Could do this as a size scale...
		//  size scale 200 x 6 = 1200.
		this.#element.style.width = in_parent_window.windowElement.clientWidth + "px";
		this.#element.style.height = in_parent_window.windowElement.clientHeight + "px";

		this.addStaticObject(this.#fader);

		//let's register ourself with the input handler!
		InputHandler.Instance().addInputListener(this, true);
	}

	addStaticObject(in_game_object) {
		//this.#staticGameObjects.push(in_game_object);
		//give it the right scale, and we should be good...
		//in_game_object.sizeScale = this.#parentWindow.windowScale;
		//no scaling or changing of location for scene loc
		in_game_object.sceneLocation = new Location(in_game_object.location.x, in_game_object.location.y, in_game_object.location.z);
		this.#element.appendChild(in_game_object.element);
	}


	onKeyUp(in_key_action) {
		if (in_key_action.name !== "Escape") {
			//don't caaare
			return;
		}

		//OK... are we paused at the moment??
		if (this.#active) {
			//we are paused!  We need to unfade and remove ourself from the DOM.
			//flag that we're not paused anyomre
			this.#active = false;
			this.#fader.fadeOut(() => {this.fadeComplete()});
		}
		else {
			//flag that we're Paused!
			this.#active = true;
			//we need to pause!  Add ourself to the DOM and hit the fader.
			this.#parentWindow.windowElement.appendChild(this.#element);
			//NOTE the wrapped "this.fadeComplete()"..  it's wrapped in a function, since otherwise, "this"
			//  doesn't get the right context..
			//  (if we were to do the second line, then "this" gets interpreted as the window..)
			//  see: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
			//  bind() is something that can also be used.. I didn't really read it, since this works.
			this.#fader.fadeIn(() => {this.fadeComplete()});
			//this.#fader.fadeIn(this.fadeComplete);
		}
	}

	fadeComplete() {
		//cool.  the fader is done!  If we're unpaused, we remove ourself from the DOM..
		//if we're paused, do we add the other PAUSE overlay stuff?
		if (this.#active) {
			//umm..  add othre stuff?
		}
		else {
			//remove ourself from the dom!
			this.#parentWindow.windowElement.removeChild(this.#element);
		}
	}
}

//I guess I do this for Day, too.. our Day "scene"..?  Hmm..  PauseScene literally handles Pause and does it all
//  on its own.  Is that what DayScene should do?  Or should the Day guy handle it, and pop up a DayScene at the
//  end of the day?  Like it even fucking matters!  JUST PICK ONE AND START CODING!
//Yup, going with DayScene.  Think of it more like DayHandler..  It'll use the Day class to know how long a day
//  is, when it's done, etc..  and then will handle whatever happens at the end of a day.
class DayScene {
	#baseDepth;
	#parentWindow;

	#element;
	#fader;
	#day;

	#active;

	constructor(in_parent_window) {
		this.#baseDepth = 8;
		this.#parentWindow = in_parent_window;
		this.#active = false;
		this.#fader = new SceneFader(SceneFader.FADE_BLACK, 0.8, 1.2);
		this.#fader.specificSize = new Size(in_parent_window.windowElement.clientWidth, in_parent_window.windowElement.clientHeight);

		this.#element = document.createElement("div");
		this.#element.style.zIndex = this.#baseDepth;
		this.#element.classList.add("sceneLayer");
		this.#element.style.width = in_parent_window.windowElement.clientWidth + "px";
		this.#element.style.height = in_parent_window.windowElement.clientHeight + "px";

		//how much time are we putting in a day??
		this.#day = new Day(TIME_IN_DAY_MINUTES);
		//soo... the day has its own update...  do I create the day here??  Do I register it with Game??
		//  Do I handle everything the Day is doing?  Probably..
		Game.Instance().addObject(this.#day);
		//also add us to the game!
		Game.Instance().addObject(this);

		this.addStaticObject(this.#fader);
	}

	addStaticObject(in_game_object) {
		//this.#staticGameObjects.push(in_game_object);
		//give it the right scale, and we should be good...
		//in_game_object.sizeScale = this.#parentWindow.windowScale;
		//no scaling or changing of location for scene loc
		in_game_object.sceneLocation = new Location(in_game_object.location.x, in_game_object.location.y, in_game_object.location.z);
		this.#element.appendChild(in_game_object.element);
	}

	//We have an update...  umm.. is it earlyUpdate??  If we hit end of day, then bam, end of day before 
	//  all them updates??  That or let it flag the next loop. It doesn't really matter.
	//Stuff happens, yada yada.  Then in lateUpdate, this guy ups the day time.  I kinda dig it...??
	//We start with lateUpdate, and maybe I'll change it later.
	lateUpdate() {
		//if our day is end of day, let the game know!
		if (this.#day.dayEnded && !this.#active) {
			this.#active = true;
			//we need to pause!  Add ourself to the DOM and hit the fader.
			this.#parentWindow.windowElement.appendChild(this.#element);
			this.#fader.fadeIn(() => {this.fadeDayEnd()});

			//let's create a timeout to call newDay, for testing..
			setTimeout(() => {this.newDay()}, 10000);
		}
	}

	//this'll get called from a button that we crate and put in the end day overlay.
	newDay() {
		//reset our day!
		this.#day.newDay();
		this.#active = false;

		//tell the game it's a new day..?
		Game.Instance().startNewDay();

		//kick off whatever has the night sky flip in a 180 circle to come back to day sky.

		//and we want to fade back out!  Do I want to do this one faster than the fade in?
		this.#fader.fadeOut(() => {this.fadeDayNew()}, 0.5);
	}

	fadeDayEnd() {
		//I like the idea of calling Game with dayEnded AFTER we've finished fading.
		Game.Instance().dayEnded();

		//umm.  no we add the other stuff to the DOM, talking about the day, stuff they can do,
		//  etc etc..  maybe a "Next Day" button??

		//also kick off however I'm going to have the day sky turn to night with moon..

		//also have the % chance that they get to play a night time...  (some low % chance)
		//  maybe it'll be a dream??  Something cute and silly, or a scary dream..
		//  counting sheep?
		//  lots of bees chasing cow?
		//  moths flying here and there..
	}
	fadeDayNew() {
		//remove ourself from the dom!
		this.#parentWindow.windowElement.removeChild(this.#element);
	}
}

//---===---===---===---===---
//  END Game Objects
//---===---===---===---===---

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

	let tmp_obj = new GameObject();
	tmp_obj.setImage("assets/sky.png", FileLoader.Instance().getFile("assets/sky.png"));
	//this guy is at the bottom..
	tmp_obj.location = new Location(0, 0, -10);
	tmp_layer.addStaticObject(tmp_obj);

	return tmp_layer;
}
function pastureLayerPreBuild() {
	pastureList.push("assets/pasture.png");
	pastureList.push("assets/frontpasture_top_edge.png");

	//1 for each blade count amount..
	for (let j=0; j<3; j++) {
		for (let i=1; i <= GRASS_S_OPTIONS[j]; i++) {
			pastureList.push(Grass.grassNameBuilder(GRASS_S_NAME, j+1, i) + "." + IMG_TYPE);
		}
		for (let i=1; i <= GRASS_M_OPTIONS[j]; i++) {
			pastureList.push(Grass.grassNameBuilder(GRASS_M_NAME, j+1, i) + "." + IMG_TYPE);
		}
		for (let i=1; i <= GRASS_L_OPTIONS[j]; i++) {
			pastureList.push(Grass.grassNameBuilder(GRASS_L_NAME, j+1, i) + "." + IMG_TYPE);
			pastureList.push(Grass.grassNameBuilder(GRASS_L_NAME, j+1, i) + "_d." + IMG_TYPE);
		}
	}

/*
	for (let i=1; i <= GRASS_S_OPTIONS; i++) {
		pastureList.push(GRASS_S_NAME + (i < 10 ? "0" : "") + i + "." + IMG_TYPE);
	}

	for (let i=1; i <= GRASS_L_OPTIONS; i++) {
		pastureList.push(GRASS_L_NAME + (i < 10 ? "0" : "") + i + "." + IMG_TYPE);
	}
*/
	//OMG!!  ADD THE COW DUH!!!!
	pastureList.push("assets/cow.png");
	//moomoomations??
	pastureList.push("assets/cow_step_1.png");
	pastureList.push("assets/cow_step_2.png");
	pastureList.push("assets/cow_step_3.png");
}
function pastureLayerBuild(in_window) {
	const heightRatio = 1;
	const zIndex = -1;  

	let tmp_layer = new SceneLayer(zIndex, 1, 0, heightRatio, in_window);

	//create the pasture and top edge..
	let tmp_obj = new GameObject();
	tmp_obj.setImage("assets/pasture.png", FileLoader.Instance().getFile("assets/pasture.png"));
	//this guy is at the bottom..
	tmp_obj.location = new Location(0, 0, 0);
	tmp_layer.addStaticObject(tmp_obj);
	tmp_layer.defineLayerHorizonHeightByObject(tmp_obj);

	//create SceneScaler for this layer!  This is probably going to take a bit of playing with to figure out..
	//I started the game camera at 40, 15, 10  ... sooo, we'll work with that.
	/*
		constructor(in_horizontal_distance_front, 
							in_vertical_distance_front, 
							in_horizontal_distance_rear, 
							in_vertical_distance_rear, 
							in_z_distance_from_camera_front,
							in_z_distance_from_camera_rear, 
							in_z_distance_from_camera_horizon, 
							in_horizon_height_front, 
							in_horizon_height_rear, 
							in_horizon_height_at_horizon, 
							in_z_distance_begin_scaling,
							in_scene_size) {
	*/
	//I need multiple scene scalers...
	//  a) the front area, which does not scale.
	//  b) from back edge of front to horizon
	//  c) from horizon to beyond.
	//Shittttt, I need to do some more math to amke this work...  I rely on horizon height front/rear
	//  but when I need to calculate that like horizon is BEHIND our rear, what do I do??
	/*
	let tmp_scaler = new SceneScaler(22.5, 22.5 * (9/12),
																		40, 40 * (9/12),
																		0, -60, -60,
																		0, 0, tmp_layer.horizonHeight,
																		-30, in_window.size,
																		new Boundary(50, 50, 20, -100));
	tmp_layer.addSceneScaler(tmp_scaler);
	*/
	let tmp_scaler = new SceneScaler(25, 25 * (9/12),
																		25, 25 * (9/12),
																		0, -36, -63,
																		0, SceneScaler.calcHorizonHeight(-63, tmp_layer.horizonHeight, 0, -36), tmp_layer.horizonHeight,
																		//0, SceneScalerTrig.calcHorizonHeight(-63, tmp_layer.horizonHeight, 0, -36, in_window.size.height, 25, 25), tmp_layer.horizonHeight,
																		-36, in_window.size,
																		new Boundary(23, 23, 20, -36), 
																		1);
	//TODO: above scaler:  +20 for front boundary doesn't cut off other cows... soo...  need to either remove them on clip, or
	//  change the boundary...  what do I do about a giant tree??  That's what I want to know..
	tmp_layer.addSceneScaler(tmp_scaler);
	tmp_scaler = new SceneScalerTrig(tmp_scaler.hDistanceRear, tmp_scaler.vDistanceRear,
																		100, 100 * (9/12),
																		tmp_scaler.zDistanceFromCameraRear, -63, tmp_scaler.zDistanceFromCameraHorizon,
																		tmp_scaler.horizonHeightRear, tmp_layer.horizonHeight, tmp_layer.horizonHeight,
																		-36, in_window.size,
																		new Boundary(90, 90, tmp_scaler.zDistanceFromCameraRear, -63),
																		tmp_scaler.scaleSizeAtRear);
	tmp_layer.addSceneScaler(tmp_scaler);
	tmp_scaler = new SceneScalerTrig(tmp_scaler.hDistanceRear, tmp_scaler.vDistanceRear,
																		300, 300 * (9/12),
																		tmp_scaler.zDistanceFromCameraRear, -200, tmp_scaler.zDistanceFromCameraHorizon,
																		tmp_layer.horizonHeight, 0, tmp_layer.horizonHeight,
																		-36, in_window.size,
																		new Boundary(100, 100, tmp_scaler.zDistanceFromCameraRear, -200),
																		tmp_scaler.scaleSizeAtRear);
																		//the back boundary is behnd the horizon, so we shouldn't even have to go to 100 left/right..
	tmp_layer.addSceneScaler(tmp_scaler);



	tmp_obj = new GameObject();
	tmp_obj.setImage("assets/frontpasture_top_edge.png", FileLoader.Instance().getFile("assets/frontpasture_top_edge.png"));
	//this guy is at the top edge of the grass we just created..
	//the height is....  height of horizon in layer, minus our height..??  but it's our height after its been 
	//  scaled... and it doesn't get scaled until we add it to the layer...???  that's MESSY!  Fuck.  HMmm....
	tmp_obj.location = new Location(0, 0, 0);
	tmp_layer.addStaticObjectToHorizon(tmp_obj, SceneLayer.TOP, -1);

	//le moo!
	for (let i=0; i<0; i++) {
		tmp_obj = new GameObject();
		tmp_obj.locationPoint = GameObject.LOC_BC;
		let tmp_file = FileLoader.Instance().getFile("assets/cow.png");
		tmp_obj.setImage("assets/cow.png", tmp_file);
		//let tmp_x = Math.random() * (in_window.windowElement.clientWidth - (tmp_file.naturalWidth * 1.2)) + (tmp_file.naturalWidth * 0.6);
		//let tmp_y = Math.random() * (tmp_layer.horizonHeight - (tmp_file.naturalHeight * 0.4)) + (tmp_file.naturalHeight * 0.2);
		tmp_obj.location = new Location(27.5 + (5*i), 0, 0);
		tmp_layer.addObject(tmp_obj);
		Game.Instance().addObject(tmp_obj);

		/*
		if (i == 0) {
				in_window.camera = new Camera(tmp_obj, new Location(0, 0, 25));
		}
	*/
	}
	for (let i=0; i<21; i++) {
		
		if (i % 4 == 2) {
			continue;
		}
		tmp_obj = new GameObject();
		tmp_obj.locationPoint = GameObject.LOC_BC;
		let tmp_file = FileLoader.Instance().getFile("assets/cow.png");
		tmp_obj.setImage("assets/cow.png", tmp_file);
		//let tmp_x = Math.random() * (in_window.windowElement.clientWidth - (tmp_file.naturalWidth * 1.2)) + (tmp_file.naturalWidth * 0.6);
		//let tmp_y = Math.random() * (tmp_layer.horizonHeight - (tmp_file.naturalHeight * 0.4)) + (tmp_file.naturalHeight * 0.2);
		tmp_obj.location = new Location(0 + (5*i), 0, -80);
		tmp_layer.addObject(tmp_obj);
		Game.Instance().addObject(tmp_obj);
		
		/*
		if (i == 0) {
				in_window.camera = new Camera(tmp_obj, new Location(0, 0, 25));
		}
	*/
	}


	tmp_obj = new ControllableCow();
	tmp_obj.locationPoint = GameObject.LOC_BC;
	let tmp_file = FileLoader.Instance().getFile("assets/cow.png");
	tmp_obj.setImage("assets/cow.png", tmp_file);
	//let tmp_x = Math.random() * (in_window.windowElement.clientWidth - (tmp_file.naturalWidth * 1.2)) + (tmp_file.naturalWidth * 0.6);
	//let tmp_y = Math.random() * (tmp_layer.horizonHeight - (tmp_file.naturalHeight * 0.4)) + (tmp_file.naturalHeight * 0.2);
	tmp_obj.location = new Location(40, 0, -28);
	tmp_layer.addObject(tmp_obj);
	Game.Instance().addObject(tmp_obj);
	//ohhh.... something's messsssssed upppppp.  Cows be everywhere when this is close to the cow.  (since this is the far cow)
	//What camera distance do I like?????  35 is okay...  Remember, 36 is where we start scaling..
	in_window.camera = new Camera(tmp_obj, new Location(0, 0, 28));
	//give the camera a boundary...?
	in_window.camera.boundary = new Boundary (10, 780, 5, -760);
	Game.Instance().addObject(in_window.camera);



	//let's put some grass down.
	let tmp_boundary = new Boundary(20, 50, 0, -50);
	//let tmp_boundary = new Boundary(0, 100, 20, -120);
	let tmp_grass = Grass.factory(tmp_boundary, 10, 120, -1);
	tmp_grass.forEach(vv_object => {
		tmp_layer.addObject(vv_object);
		Game.Instance().addObject(vv_object);
	});

	return tmp_layer;
}

function PauseOverlayPreBuild() {

}
function PauseOverlayBuild(in_window) {
	const zIndex = 10;

	//What the fuck are paramters 2 and 3?? horizontal and vertical ratio??  To what?  They aren't used at all..
	//  I wonder what the plan for those was...  hmmmm....
	let tmp_layer = new SceneLayer(zIndex, 1, 0, 1, in_window);

	//gotta create our scene..
	//first is the background... we'll use a scene fader..
	let tmp_obj = new SceneFader(SceneFader.FADE_BLACK, 0.6, 0.4);
	//this guy is at the back of our scene..
	tmp_obj.location = new Location(0, 0, -2);
	tmp_layer.addStaticObject(tmp_obj);

	return tmp_layer;

}
function DayEndOverlayPreBuild() {

}
function DayEndOverlayBuild(in_window) {
	const zIndex = 9;

	//What the fuck are paramters 2 and 3?? horizontal and vertical ratio??  To what?  They aren't used at all..
	//  I wonder what the plan for those was...  hmmmm....
	let tmp_layer = new SceneLayer(zIndex, 1, 0, 1, in_window);

	//gotta create our scene..
	//first is the background... we'll use a scene fader..
	let tmp_obj = new SceneFader(SceneFader.FADE_BLACK, 0.8, 2);
	//this guy is at the back of our scene..
	tmp_obj.location = new Location(0, 0, -2);
	tmp_layer.addStaticObject(tmp_obj);

	return tmp_layer;
}

function buildTestGrid(in_layer) {
	let tmp_rand;
	let tmp_file_name;
	let i = 0;
	for (i=0; i<28; i++) {
		for (let j = 0; j < 1; j++) {
			tmp_obj = new GameObject();
			tmp_obj.locationPoint = GameObject.LOC_BC;
			tmp_file_name = "assets/25x25_circle.png";
			tmp_obj.setImage(tmp_file_name, FileLoader.Instance().getFile(tmp_file_name));
			if (i < 37) {
				tmp_obj.location = new Location(27.5 + (j*5), 0, -36 - (i*1));
				//tmp_obj.location = new Location(27.5 + (j*5), 0, -20 - (i*4));
			}
			else {
				tmp_obj.location = new Location(27.5 + (j*5), 0, -24 - (i*3));
			}
			in_layer.addObject(tmp_obj);
		}
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
game.targetFPS = FPS_FPS;
game.start();
game.gameLoop();

//how do we get the screen width and height??
let tmp_screen_width = document.body.clientWidth;
let tmp_screen_height = document.body.clientHeight;
//alert("h x w: " + tmp_screen_height + " x " + tmp_screen_width);

let gameWindow = new GameWindow(document.documentElement, 0, 0.18, 12/9);
Game.Instance().gameWindow = gameWindow;
Game.Instance().addObject(gameWindow);
gameWindow.buildWindow();
//it needs a camera..  I don't think I did anything that actually requires the camera's Y value...
//  this is a "game" location.
//TODO:
//  1) Camera tracks Cow!
//  2) Camera gets boundaries
//  3) Cow gets movement
//  4) Profit!  (Maybe it'll work!)
//gameWindow.camera = new Camera(new Location(40, 10, 10));
//TODO: maybe if we change cameras, have a flat that "flies" the camera to the new location?

let charWindow = new GameWindow(gameWindow.windowElement, 0.3, 0, 3/2);
//let adWindow = new GameWindow(gameWindow.windowElement, 0.25, 0, 3/2);

//top location is....... (parent's height - my height) * .3 ...  that's like 30% padding top, 60% bottom..
charWindow.location = [gameWindow.windowElement.getBoundingClientRect().left, 
		(gameWindow.windowElement.getBoundingClientRect().top - charWindow.size.height) * .35];
charWindow.buildWindow();
Game.Instance().characterWindow = charWindow;

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

PreloadHandler.Instance().addFile("assets/25x25_circle.png");
PreloadHandler.Instance().addFile("assets/50x50_circle.png");
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
FADE_COLORS.forEach(vv_img => PreloadHandler.Instance().addFile(vv_img));

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

	let tmp_pause_scene = new PauseScene(gameWindow);
	//aand we don't need to do anything else with PauseScene!
	let tmp_day_scene = new DayScene(gameWindow);

	let tmp_sky_scene = skyLayerBuild(gameWindow);
	let tmp_hill_scene = hillLayerBuild(gameWindow);
	let tmp_farfield_scene = farFieldLayerBuild(gameWindow);
	let tmp_pasture_scene = pastureLayerBuild(gameWindow);
	buildTestGrid(tmp_pasture_scene);
	//console.log("picked hills:");
	//tmp_hills.forEach(vv_img => console.log(vv_img));
	//tmp_sky_scene.update();
	//tmp_hill_scene.update();
	//tmp_farfield_scene.update();
	//tmp_pasture_scene.update();
	Game.Instance().addObject(tmp_sky_scene);
	Game.Instance().addObject(tmp_hill_scene);
	Game.Instance().addObject(tmp_farfield_scene);
	Game.Instance().addObject(tmp_pasture_scene);

}
