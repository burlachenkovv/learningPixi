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