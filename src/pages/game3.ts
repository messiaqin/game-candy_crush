namespace pages {
	export class Game3Page extends BaseGamePage  {

		constructor() {
			super();
		}

		protected get groupList(): string[] {
			return ["page-game3"];
		}

		public nextPage()
		{
			alert('总共只有三关');
		}

		public onAddedToStage(event: egret.Event) : void {
			super.onAddedToStage(event);

			let bgSprite: layer.ui.BitmapUI = new layer.ui.BitmapUI('bg_png');
			this.addChild(bgSprite);

			this.scorebarSprite = new pages.ScorebarSprite();
			this.scorebarSprite.stageNumber = 3;
			this.addChild(this.scorebarSprite);

			// let frameSprite: layer.ui.BitmapUI = new layer.ui.BitmapUI("game3_frame_png");
			// frameSprite.x = 21;
			// frameSprite.y = 373;
			// this.addChild(frameSprite);

			let gameUI = new ui.GameUI(60);
			gameUI.x = 31;
			gameUI.y = 181;
			gameUI.width = 689;
			gameUI.height = 889;
			gameUI.blocks = [0, 1, 8, 9, 6, 7, 14, 15, 80, 81, 88, 89, 86, 87, 94, 95];
			this.addChild(gameUI);

			this.readySprite.animating().then(() => {
				gameUI.start();
			});
		}

		protected onGameStart(event: GameEvent): void {
			super.onGameStart(event);

			this.bgmChannel = layer.media.Sound.play('stage-3_mp3');
		}

		protected onGameStop(event: GameEvent) : void {

			super.onGameStop(event);
			window['score'] += event.score;
			let nextStageSprite: NextStageSprite = new NextStageSprite(window['score'], this.nextPage);
			this.addChild(nextStageSprite);
		}
	}
}
