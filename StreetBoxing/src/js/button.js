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