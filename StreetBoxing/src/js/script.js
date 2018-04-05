/////////////////////////////////
//= character.js
//= button.js
//= characterSelect.js
//= horizontalBar.js
//= computerActions.js
//= fight.js
/////////////////////////////////

class Game {
	constructor() {
		this.app = this.createApp();
		this.setup();
	}

	createApp() {
		let application = new PIXI.Application({
			width: 700,
			height: 400,
			backgroundColor: 0xCCCCCC,
		});

		document.body.appendChild(application.view);

		return application;
	}

	setup() {
		let char = new CharacterSelect(this.app);
	}

}

// Load textures
PIXI.loader
	.add('fontMonster', './fonts/monsters.fnt')
	.add('startCounter', './img/startCounter.json')
	.add('charZangief', './img/zangief-basic.json')
	.add('charBarlog', './img/barlog-basic.json')
	.add('charSaagatt', './img/sagat-basic.json')
	.add('backgrounds', './img/backgrounds.json')
	.load(() => new Game());