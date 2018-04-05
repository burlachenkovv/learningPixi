'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/////////////////////////////////
class Character {
	constructor(name, role, x, scale, app, blockRatio = 0) {
		this.app = app;

		this.role = role;
		this.name = name;
		this.blockRatio = blockRatio;
		this.hp = 100;

		this.actions = [
			"idle",
			"idleblock",
			"walk",
			"fastpunch",
			"punch",
			"facehit",
			"knockout",
			"victory2"
		];

		this.frameSheet = {};
		this.fillFrameSheet();

		this.sprite = this.createAnimatedSprite();
		this.sprite.scale.x = scale;
		this.sprite.x = x;
		this.sprite.y = 390;
		this.sprite.vx = 0;
		this.sprite.vy = 0;
		this.app.stage.addChild(this.sprite);

		this.action = "idle";
		this.destination = scale;
		this.attack = false;
		this.readyToAttack = 1;
	}

	remove() {
		this.app.stage.removeChild(this.sprite);
	}

	fillFrameSheet() {
		if(!PIXI.loader.resources[this.name]) {
			console.log(`Textures for "${this.name}" not found`);
			return null;
		}

		let actionsTextures = Object.keys(PIXI.loader.resources[this.name].textures);
		this.actions.forEach((action) => {
			let actionFrames = actionsTextures.reduce((actionArray, texture) => {
				if(texture.indexOf(`-${action}-`) > -1) {
					actionArray.push(PIXI.Texture.fromFrame(texture));
					return actionArray;
				}

				return actionArray;
			}, []);

			this.frameSheet[action] = actionFrames;
		});
	}

	createAnimatedSprite() {
		let sprite = new PIXI.extras.AnimatedSprite(this.frameSheet["idle"]);
			sprite.anchor.set(0, 1);
			sprite.animationSpeed = 0.08;
			sprite.play();

		return sprite;
	}

	idle() {
		if(this.action != "knockout" && !this.attack) {
			this.action = "idle";
			this.attack = false;

			this.sprite.textures = this.frameSheet["idle"];
			this.sprite.animationSpeed = 0.08;
			this.sprite.loop = true;
			this.sprite.onComplete = "";
			this.sprite.play();
			this.sprite.vx = 0;
		} else {
			// console.log("Module IDLE, else block. Action: " + this.action + "Attack: " + this.attack);
		}
	}

	walk(destination) {
		if(!this.attack) {
			this.action = "walk";

			this.sprite.textures = this.frameSheet["walk"];
			this.sprite.animationSpeed = 0.3;
			this.sprite.play();
			this.sprite.vx = 5 * this.destination;
		}
	}

	fastpunch() {
		if(this.readyToAttack === 1) {
			this.attack = "fastpunch";

			this.sprite.vx = 0;
			this.sprite.textures = this.frameSheet["fastpunch"];
			this.sprite.animationSpeed = 0.18;
			this.sprite.loop = false;
			this.sprite.onComplete = () => {
				this.attack = false;
				return (this.action === "idleblock") ? this.idle() : this[this.action]();
			};

			this.sprite.gotoAndStop(1);
			this.sprite.play();

			this.readyToAttack = 0.2;

			return {
				distance: 1.6,
				damage: 10,
				penalty: 0
			};
		}
	}

	punch() {
		if(this.readyToAttack === 1) {
			this.attack = "punch";

			this.sprite.vx = 0;
			this.sprite.textures = this.frameSheet["punch"];
			this.sprite.animationSpeed = 0.18;
			this.sprite.loop = false;
			this.sprite.onComplete = () => {
				this.attack = false;
				this.idle();
			}

			this.sprite.gotoAndStop(2);
			this.sprite.play();

			this.readyToAttack = -1;

			return {
				distance: 1.3,
				damage: 20,
				penalty: 0
			};
		}
	}

	idleblock() {
		if(this.action != "facehit" && !this.attack) {
			this.action = "idleblock";

			this.sprite.textures = this.frameSheet["idleblock"];
			this.sprite.animationSpeed = 0.1;
			this.sprite.play();
			this.readyToAttack = 0.5;
		}
	}

	loweringHP(loss) {
		this.hp -= loss;

		if(this.hp <= 0) {
			this.knockout();
		}
	}

	facehit(penalty = 0) {
		this.action = "facehit";
		this.attack = false;

		this.readyToAttack = -1;

		this.sprite.textures = this.frameSheet["facehit"];
		this.sprite.animationSpeed = 0.2;
		this.sprite.loop = false;
		this.sprite.onComplete = () => {
			this.idle();
		}

		this.sprite.play();
	}

	knockout() {
		this.action = "knockout";

		this.sprite.textures = this.frameSheet["knockout"];
		this.sprite.animationSpeed = 0.2;
		this.sprite.loop = false;
		this.sprite.onComplete = () => {
			//console.log(`${this.name} lose.`);
		}

		this.sprite.play();
	}

	victory(callback) {
		setTimeout(() => {
			this.action = "victory";

			this.sprite.textures = this.frameSheet["victory2"];
			this.sprite.animationSpeed = 0.06;
			this.sprite.loop = false;
			this.sprite.onComplete = callback;
			
			this.sprite.play();
		}, 500);
	}
}
class Button {
	constructor(x, y, text, width, callback) {
		this.container = new PIXI.DisplayObjectContainer();
		this.container.position.set(x, y);

		this.draw(text, callback, width);
	}

	draw(text, callback, widthDraw) {
		let width = widthDraw;
		let height = 40;
		let basicAlpha = 0.7;

		let button = new PIXI.Graphics();
			button.beginFill(0x000000);
			button.drawRoundedRect(0, 0, width, height, 5);
			button.endFill();
			button.alpha = basicAlpha;

			button.interactive = true;
			button.buttonMode = true;

			button.on("pointerdown", callback)
				  .on("pointerover", () => { button.alpha = 1 })
				  .on("pointerout", () => { button.alpha = basicAlpha });

		let style = {
			font: "25px Monsters Attack!",
			align: "center",
			tint: 0xff0000
		}
		let buttonText = new PIXI.extras.BitmapText(text, style);

		buttonText.anchor.set(0.5, 0.5);
		buttonText.x = width / 2;
		buttonText.y = height / 2;

		this.container.addChild(button);
		button.addChild(buttonText);
		
		return this.container;
	}

	remove() {
		app.stage.removeChild(this.container);
	}

	hide() {
		this.container.visible = false;
	}
}
class CharacterSelect {
	constructor(app) {
		this.app = app;

		this.background = this.createBackground();
		this.font = {
			font: "25px Monsters Attack!",
			tint: 0xFFFFFF,
		};

		this.characters = this.getCharsArray();
		this.portraitContainers = {
			left: null,
			right: null,	
		}

		this.selectedCharacters = [];
		
		this.portraitListContainer = this.showPortraitsList();
		this.createPortraitContainers(this.portraitContainers);
	}

	createBackground() {
		const { textures } = PIXI.loader.resources.backgrounds;
		const backgroundTexture = textures["select-background.jpg"];
		const helperTexture = textures["controls-help.jpg"];

		let container = new PIXI.Container();

		let background = new PIXI.Sprite(backgroundTexture);

		let controls = new PIXI.Sprite(helperTexture);
			controls.anchor.set(0.5, 1);
			controls.x = this.app.view.width / 2;
			controls.y = this.app.view.height - 20;
			controls.alpha = 0.6;

		container.addChild(background);
		container.addChild(controls);
		this.app.stage.addChild(container);

		return container;
	}

	createPortraitContainers(container) {
		Object.keys(container).forEach((item, i) => {
			container[item] = new PIXI.Container();
			container[item].x = i * 500 + 50;
			container[item].y = 40;
			this.app.stage.addChild(container[item]);
		});
	}

	getCharsArray() {
		let charsArray = Object.entries(PIXI.loader.resources).reduce((result, itemChar) => {
			// Searching "character" entries: key with "char..." and without "...image"
			if(itemChar[0].indexOf("char") > -1
			   && itemChar[0].indexOf("image") === -1)
			{
				// If character entry found
				// 1. Get all portrait objects
				let portrait = Object.entries(itemChar[1].textures).reduce((result, itemPortrait) => {
					if(itemPortrait[0].indexOf("profile") > -1) {
						return [...result, itemPortrait[1]];
					}

					return [...result];
				}, []);

				// 2. Create animated sprite from portraits
				// 3. Push final "char" object to "charsArray" array
				return [...result, {
					"name": itemChar[0],
					"portrait": portrait,
					"sprite": new PIXI.extras.AnimatedSprite(portrait)
				}];
			}
			
			return [...result];
		}, []);

		return charsArray;
	}

	showPortraitsList() {
		let container = new PIXI.Container();

		this.characters.forEach((item, i) => {
			let portrait = new PIXI.Sprite(item.portrait[0]);
				portrait.anchor.set(0.5);
				portrait.scale.set(-0.6, 0.6);
				portrait.x = 70 * i + portrait.width / 2;
				portrait.y = portrait.height / 2 + 50;
				portrait.filters = [new PIXI.filters.GlowFilter(50, 2, 0, 0x000000, 0.5)];

				portrait.interactive = true;
				portrait.buttonMode = true;

				portrait.on("pointerdown", () => {
					this.showPortrait(item, portrait);
				});

			container.addChild(portrait);
		});

		container.pivot.set(container.width / 2, 1);
		container.x = this.app.view.width / 2;
		container.y = 20;
		this.app.stage.addChild(container);

		this.showTitle(container);

		return container;
	}

	showTitle(container) {
		let { length } = this.selectedCharacters;
		let textRole = (length === 0) ? "-Player-" : "-AI-";

		let title = new PIXI.extras.BitmapText(`Select ${textRole}`, this.font);
		title.anchor.set(0.5, 0);
		title.x = container.width / 2;

		if(length > 0) {
			container.removeChildAt(container.children.length - 1);
		}

		container.addChild(title);
	}

	showPortrait({name, sprite}, portrait) {
		let { length } = this.selectedCharacters;
		let container = (length === 0) ? "left" : "right";

		if(length < 2) {
			this.portraitContainers[container].removeChildren();
			sprite.anchor.set(0, 1);
			sprite.loop = false;
			sprite.animationSpeed = 0.1;
			sprite.position.set(10, 110);
			sprite.filters = [new PIXI.filters.GlowFilter(50, 2, 0, 0xFF0000, 0.5)];
			sprite.gotoAndPlay(0);


			this.portraitContainers[container].addChild(sprite);
			//console.log(this.portraitContainers.left.children);

			let characterName = new PIXI.extras.BitmapText(name.substring(4), this.font);
				characterName.anchor.set(0);
				characterName.x = 5;
				characterName.y = 120;
						
			this.portraitContainers[container].addChild(characterName);

			let buttonOk = new Button(5, 170, "Ok", sprite.width + 10, () => {
				buttonOk.hide();
				portrait.interactive = false;
				portrait.buttonMode = false;
				portrait.alpha = 0.5;

				this.selectCharacter(name);
			});
			this.portraitContainers[container].addChild(buttonOk.container);
		}
	}

	selectCharacter(name) {
		if(this.selectedCharacters.length < 2) {
			this.selectedCharacters.push(name);
			this.showTitle(this.portraitListContainer);

			if(this.selectedCharacters.length === 2) {
				this.fight();
			}
		}
	}

	fight() {		
		this.portraitListContainer.removeChildren();
		this.portraitContainers.left.removeChildren();
		this.portraitContainers.right.removeChildren();

		this.app.stage.removeChild(this.background);
		this.background = null;

		let fight = new Fight(this.selectedCharacters, this.app);
		
		this.selectedCharacters = [];
	}
}
class HorizontalBar {
	constructor(y, scale, app) {
		this.app = app;
		// Width = (half of app width) - (5%)
		this.width = (this.app.view.width / 2) - (5 / 100 * this.app.view.width);
		// X = (half of app width) + (5px or -5px)
		this.x = (this.app.view.width / 2) + (5 * scale);

		this.container = new PIXI.DisplayObjectContainer();
		this.container.position.set(this.x, y);
		this.container.scale.x = scale;
		this.container.bar;

		this.draw();
	}

	draw() {
		let background = new PIXI.Graphics();
			background.beginFill(0x000000);
			background.drawRect(0, 0, this.width, 10);
			background.endFill();

		let bar = new PIXI.Graphics();
			bar.beginFill(0xFF3300);
			bar.drawRect(0, 0, this.width, 10);
			bar.endFill();

		this.container.bar = bar;
		this.container.addChild(background);
		this.container.addChild(bar);

		this.app.stage.addChild(this.container);
	}

	change(valueToDisplay) {
		let percents = valueToDisplay / 100 * this.width;
		this.container.bar.width = (percents < 0) ? 0 : percents;
	}

	remove() {
		this.app.stage.removeChild(this.container);
	}
}
class actionsAI {
	constructor(charPlayer, charAI) {
		this.charPlayer = charPlayer;
		this.charAI = charAI;

		this.distance = false;
		this.moving = 1;
	}

	actionLoop() {
		this.checkDistance();
		this.distanceCut();

		let att = this.attack();
		if(att) return att;

		this.block();
	}

	checkDistance() {
		let touchpointAI = this.charAI.sprite.x - this.charAI.sprite.width;
		let touchpointPlayer = this.charPlayer.sprite.x + this.charPlayer.sprite.width;

		if(touchpointAI >= touchpointPlayer) {	
			this.distance = false;
			this.moving = this.moving + 0.02;
		} else {
			this.distance = true;
			this.moving = 0;
		}
	}

	block() {
		if(this.charPlayer.attack) {
			this.charAI.idleblock();
		} else {
			if(this.charAI.action != "idle" && this.distance) {
				this.charAI.attack = false;
				this.charAI.idle();
			}
		}
	}

	attack() {
		let { action } = this.charAI;

		if(this.distance && action != "facehit" && action != "idleblock") {
			let randomDecision = Math.random() * 1000;

			if(randomDecision > 980) {
				return this.charAI.punch();
			} else if(randomDecision > 930) {
				return this.charAI.fastpunch();
			}
		}

		return false;
	}

	distanceCut() {
		let { action } = this.charAI;

		if(!this.distance && this.moving >= 1) {
			if(action != "walk" && action != "facehit") {
				this.charAI.walk();
			}
		} else {			
			if(action != "idle" && action != "facehit") {
				this.charAI.idle();
				this.moving = 0;
			}
		}
	}
}
class Fight {
	constructor(characters, app) {
		this.app = app;
		this.difficultyLevel = 3;
		this.keyboardActive = true;

		this.charPlayer = "";
		this.charAI = "";
		this.actionsAI = "";

		this.ticker = (delta) => this.gameLoop(
			delta,
			this.charPlayer,
			this.charAI
		);

		this.listeners = [];

		this.controls = {
			right: this.keyboard(39),
			left: this.keyboard(37),
			fastpunch: this.keyboard(65),
			punch: this.keyboard(83),
			block: this.keyboard(68),
		}

		this.controller();
		this.createStage();
		this.setup(characters);
	}

	createStage() {
		const { textures } = PIXI.loader.resources.backgrounds;
		const backgroundTexture = textures["stage-monastery3.jpg"];

		let sprite = new PIXI.Sprite(backgroundTexture);
		this.app.stage.addChild(sprite);
	}

	controller() {
		let { right, left, fastpunch, punch, block } = this.controls;

		right.press = () => {
			this.charPlayer.destination = 1;
			this.charPlayer.walk();
		}
		right.release = () => {
			this.charPlayer.idle();
		}

		left.press = () => {
			this.charPlayer.destination = -1;
			this.charPlayer.walk();
		}
		left.release = () => {
			this.charPlayer.idle();
		}

		fastpunch.press = () => {
			let punch = this.charPlayer.fastpunch();
			if(punch) {
				this.checkHit(this.charAI, this.charPlayer, punch);
			}
		}

		punch.press = () => {
			let punch = this.charPlayer.punch();
			if(punch) {
				this.checkHit(this.charAI, this.charPlayer, punch);
			}
		}

		block.press = () => {
			this.charPlayer.idleblock();
		}
		block.release = () => {
			this.charPlayer.idle();
		}
	}

	checkHit(victim, puncher, punch) {
		let result = () => {
			let blockSpeed = Math.random() * 10;

			if (victim.role === "AI" && blockSpeed > victim.blockRatio) {
				//console.log("AI blocked players kick: ", blockSpeed);
			} else if (victim.role === "Player" && victim.action === "idleblock") {
				//console.log("Player blocked AI kick.");
			} else {
				//console.log("Hit!");
				victim.facehit(punch.penalty);
				victim.loweringHP(punch.damage);
				victim.bar.change(victim.hp);
			}

			if(victim.action === "knockout") {
				puncher.victory(() => this.victoryMessage(puncher.role));	
				this.keyboardActive = false;
			}
		}

		if(puncher.sprite.scale.x === 1) {
			if((puncher.sprite.x + puncher.sprite.width)
				> (victim.sprite.x - victim.sprite.width / punch.distance))
			{
				result();
			}
		} else {
			if((puncher.sprite.x - puncher.sprite.width)
				< (victim.sprite.x + victim.sprite.width / punch.distance))
			{
				result();
			}
		}
	}

	setup(characters) {
		const appCenter = this.app.view.width / 2;
		const offset = 50 / 100 * appCenter;
		const positiveScale = 1;
		const negativeScale = -1;
		const barY = 20;

		// Creating Player and AI characters
		this.charAI = new Character(
			characters[1],
			"AI",
			appCenter + offset,
			negativeScale,
			this.app,
			this.difficultyLevel
		);

		this.charPlayer = new Character(
			characters[0],
			"Player",
			appCenter - offset,
			positiveScale,
			this.app
		);

		// Creating health bars
		this.charPlayer.bar = new HorizontalBar(barY, negativeScale, this.app);
		this.charAI.bar = new HorizontalBar(barY, positiveScale, this.app);

		// Activating AI's actions
		this.actionsAI = new actionsAI(this.charPlayer, this.charAI);
		
		// Start countdown and fight
		this.startTimeout();
	}

	startTimeout() {
		let counterTextures = Object.keys(PIXI.loader.resources["startCounter"].textures);
		let counterArray = counterTextures.map((item) => {
			return PIXI.Texture.fromFrame(item);
		});

		let counterSprite = new PIXI.extras.AnimatedSprite(counterArray);
			counterSprite.anchor.set(0.5, 0.5);
			counterSprite.x = this.app.view.width / 2;
			counterSprite.y = 100;
			counterSprite.loop = false;
			counterSprite.animationSpeed = 0.02;
			counterSprite.onComplete = () => {
				this.app.stage.removeChild(counterSprite);
				this.app.ticker.add(this.ticker);
				this.app.ticker.start();
			}
			counterSprite.play();

		this.app.stage.addChild(counterSprite);
	}

	gameLoop(delta, char1, char2) {
		// Restoring "readyToAttack" values and updating coords
		[char1, char2].forEach((item) => {
			item.readyToAttack = (item.readyToAttack < 1) ? item.readyToAttack + 0.03 : 1;

			item.sprite.x += item.sprite.vx;
			item.sprite.y += item.sprite.vy;
		});

		// Nulling VX for the left character because of beyond the frames
		if((char1.sprite.x <= 0 && char1.destination === -1)
			|| (char1.sprite.x + char1.sprite.width)
				>= (char2.sprite.x - char2.sprite.width / 2)
				&& char1.destination === 1)
		{
			char1.sprite.vx = 0;
		}

		// Nulling VX for the right character because of beyond the frames
		if((char2.sprite.x) >= 700 && char2.destination === 1
			|| (char2.sprite.x - char2.sprite.width)
				<= (char1.sprite.x + char1.sprite.width / 2) 
				&& char2.destination === -1)
		{
			char2.sprite.vx = 0;
		}

		// If both characters on the feet, launching AI actions
		if(char1.action != "knockout" && char2.action != "knockout") {
			let compAttack = this.actionsAI.actionLoop();
			if(compAttack) {
				this.checkHit(char1, char2, compAttack);
			}
		}
	}

	victoryMessage(winner) {
		// Settings
		const appCenter = this.app.view.width / 2;
		const buttonWidth = 120;
		const buttonY = 150;
		const buttonMenuX = appCenter + 30;
		const buttonRestartX = appCenter - buttonWidth - 30;

		const menuCallback = () => {
			this.menuButton();
		}

		const restartCallback = (container) => { 
			this.restartButton();
			this.app.stage.removeChild(message);
			this.app.stage.removeChild(buttonContainer);
			container.visible = false;
		}

		const textStyle = {
			font: "60px Monsters Attack!",
			align: "center",
			tint: 0xff0000
		}

		// Remove fight ticker
		this.app.ticker.remove(this.ticker);

		// Add win message
		let text = `${winner.toLowerCase()} win`;

		let message = new PIXI.extras.BitmapText(text, textStyle);
			message.anchor.set(0.5, 0.5);
			message.x = appCenter;
			message.y = 80;

		this.app.stage.addChild(message);

		// Add "restart" and "menu" buttons
		let buttonContainer = new PIXI.DisplayObjectContainer();

		let menu = new Button(
			buttonMenuX,
			buttonY,
			"Menu",
			buttonWidth,
			menuCallback
		);

		let restart = new Button(
			buttonRestartX,
			buttonY,
			"Restart",
			buttonWidth,
			restartCallback
		);

		buttonContainer.addChild(menu.container);
		buttonContainer.addChild(restart.container);
		this.app.stage.addChild(buttonContainer);
	}

	restartButton() {
		const appCenter = this.app.view.width / 2;
		const offset = 50 / 100 * appCenter;

		this.keyboardActive = true;

		// Restore default state for both characters
		[this.charPlayer, this.charAI].forEach((item) => {
			item.action = "idle";
			item.idle();
			item.sprite.x = appCenter - offset * item.sprite.scale.x;
			item.hp = 100;
			item.bar.change(100);

		});

		this.app.ticker.add(this.ticker);
	}

	menuButton() {
		// Remove all event listeners before exit
		this.listeners = [...this.listeners].reduce((res, listener) => {
			window.removeEventListener(
				"keydown", listener, false
			);

			return res;
		}, []);

		// Remove all elements and clear stage
		this.charPlayer.bar.remove();
		this.charAI.bar.remove();
		this.charPlayer.remove();
		this.charAI.remove();

		while(this.app.stage.children.length) {
			this.app.stage.removeChild(this.app.stage.children[0]);
		}

		let char = new CharacterSelect(this.app);
	}

	keyboard(keyCode) {
	  let key = {};
	  key.code = keyCode;
	  key.isDown = false;
	  key.isUp = true;
	  key.press = undefined;
	  key.release = undefined;

	  //The "downHandler"
	  key.downHandler = event => {
	    if (event.keyCode === key.code) {
	      if (key.isUp && key.press && this.keyboardActive) key.press();
	      key.isDown = true;
	      key.isUp = false;
	    }
	    event.preventDefault();
	  };

	  //The "upHandler"
	  key.upHandler = event => {
	    if (event.keyCode === key.code) {
	      if (key.isDown && key.release && this.keyboardActive) key.release();
	      key.isDown = false;
	      key.isUp = true;
	    }
	    event.preventDefault();
	  }

	  //Attaching event listeners and pushing callbacks to the array in "listener" property
	  let downListener = key.downHandler.bind(key);
	  let upListener = key.upHandler.bind(key);
	  this.listeners.push(downListener);
	  this.listeners.push(upListener);

	  window.addEventListener(
	    "keydown", downListener, false
	  );
	  window.addEventListener(
	    "keyup", upListener, false
	  );

	  return key;
	}
}
/////////////////////////////////

var Game = function () {
	function Game() {
		_classCallCheck(this, Game);

		this.app = this.createApp();
		this.setup();
	}

	_createClass(Game, [{
		key: 'createApp',
		value: function createApp() {
			var application = new PIXI.Application({
				width: 700,
				height: 400,
				backgroundColor: 0xCCCCCC
			});

			document.body.appendChild(application.view);

			return application;
		}
	}, {
		key: 'setup',
		value: function setup() {
			var char = new CharacterSelect(this.app);
		}
	}]);

	return Game;
}();

// Load textures


PIXI.loader.add('fontMonster', './fonts/monsters.fnt').add('startCounter', './img/startCounter.json').add('charZangief', './img/zangief-basic.json').add('charBarlog', './img/barlog-basic.json').add('charSaagatt', './img/sagat-basic.json').add('backgrounds', './img/backgrounds.json').load(function () {
	return new Game();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6WyJHYW1lIiwiYXBwIiwiY3JlYXRlQXBwIiwic2V0dXAiLCJhcHBsaWNhdGlvbiIsIlBJWEkiLCJBcHBsaWNhdGlvbiIsIndpZHRoIiwiaGVpZ2h0IiwiYmFja2dyb3VuZENvbG9yIiwiZG9jdW1lbnQiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJ2aWV3IiwiY2hhciIsIkNoYXJhY3RlclNlbGVjdCIsImxvYWRlciIsImFkZCIsImxvYWQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0lBRU1BLEk7QUFDTCxpQkFBYztBQUFBOztBQUNiLE9BQUtDLEdBQUwsR0FBVyxLQUFLQyxTQUFMLEVBQVg7QUFDQSxPQUFLQyxLQUFMO0FBQ0E7Ozs7OEJBRVc7QUFDWCxPQUFJQyxjQUFjLElBQUlDLEtBQUtDLFdBQVQsQ0FBcUI7QUFDdENDLFdBQU8sR0FEK0I7QUFFdENDLFlBQVEsR0FGOEI7QUFHdENDLHFCQUFpQjtBQUhxQixJQUFyQixDQUFsQjs7QUFNQUMsWUFBU0MsSUFBVCxDQUFjQyxXQUFkLENBQTBCUixZQUFZUyxJQUF0Qzs7QUFFQSxVQUFPVCxXQUFQO0FBQ0E7OzswQkFFTztBQUNQLE9BQUlVLE9BQU8sSUFBSUMsZUFBSixDQUFvQixLQUFLZCxHQUF6QixDQUFYO0FBQ0E7Ozs7OztBQUlGOzs7QUFDQUksS0FBS1csTUFBTCxDQUNFQyxHQURGLENBQ00sYUFETixFQUNxQixzQkFEckIsRUFFRUEsR0FGRixDQUVNLGNBRk4sRUFFc0IseUJBRnRCLEVBR0VBLEdBSEYsQ0FHTSxhQUhOLEVBR3FCLDBCQUhyQixFQUlFQSxHQUpGLENBSU0sWUFKTixFQUlvQix5QkFKcEIsRUFLRUEsR0FMRixDQUtNLGFBTE4sRUFLcUIsd0JBTHJCLEVBTUVBLEdBTkYsQ0FNTSxhQU5OLEVBTXFCLHdCQU5yQixFQU9FQyxJQVBGLENBT087QUFBQSxRQUFNLElBQUlsQixJQUFKLEVBQU47QUFBQSxDQVBQIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy89IGNoYXJhY3Rlci5qc1xyXG4vLz0gYnV0dG9uLmpzXHJcbi8vPSBjaGFyYWN0ZXJTZWxlY3QuanNcclxuLy89IGhvcml6b250YWxCYXIuanNcclxuLy89IGNvbXB1dGVyQWN0aW9ucy5qc1xyXG4vLz0gZmlnaHQuanNcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcblxyXG5jbGFzcyBHYW1lIHtcclxuXHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuYXBwID0gdGhpcy5jcmVhdGVBcHAoKTtcclxuXHRcdHRoaXMuc2V0dXAoKTtcclxuXHR9XHJcblxyXG5cdGNyZWF0ZUFwcCgpIHtcclxuXHRcdGxldCBhcHBsaWNhdGlvbiA9IG5ldyBQSVhJLkFwcGxpY2F0aW9uKHtcclxuXHRcdFx0d2lkdGg6IDcwMCxcclxuXHRcdFx0aGVpZ2h0OiA0MDAsXHJcblx0XHRcdGJhY2tncm91bmRDb2xvcjogMHhDQ0NDQ0MsXHJcblx0XHR9KTtcclxuXHJcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFwcGxpY2F0aW9uLnZpZXcpO1xyXG5cclxuXHRcdHJldHVybiBhcHBsaWNhdGlvbjtcclxuXHR9XHJcblxyXG5cdHNldHVwKCkge1xyXG5cdFx0bGV0IGNoYXIgPSBuZXcgQ2hhcmFjdGVyU2VsZWN0KHRoaXMuYXBwKTtcclxuXHR9XHJcblxyXG59XHJcblxyXG4vLyBMb2FkIHRleHR1cmVzXHJcblBJWEkubG9hZGVyXHJcblx0LmFkZCgnZm9udE1vbnN0ZXInLCAnLi9mb250cy9tb25zdGVycy5mbnQnKVxyXG5cdC5hZGQoJ3N0YXJ0Q291bnRlcicsICcuL2ltZy9zdGFydENvdW50ZXIuanNvbicpXHJcblx0LmFkZCgnY2hhclphbmdpZWYnLCAnLi9pbWcvemFuZ2llZi1iYXNpYy5qc29uJylcclxuXHQuYWRkKCdjaGFyQmFybG9nJywgJy4vaW1nL2JhcmxvZy1iYXNpYy5qc29uJylcclxuXHQuYWRkKCdjaGFyU2FhZ2F0dCcsICcuL2ltZy9zYWdhdC1iYXNpYy5qc29uJylcclxuXHQuYWRkKCdiYWNrZ3JvdW5kcycsICcuL2ltZy9iYWNrZ3JvdW5kcy5qc29uJylcclxuXHQubG9hZCgoKSA9PiBuZXcgR2FtZSgpKTsiXX0=
