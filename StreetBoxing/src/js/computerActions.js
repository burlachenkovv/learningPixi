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