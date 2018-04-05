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