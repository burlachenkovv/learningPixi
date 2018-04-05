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