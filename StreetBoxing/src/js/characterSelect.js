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