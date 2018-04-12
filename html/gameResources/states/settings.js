var Settings = function() {};

Settings.prototype = {
	gvar:  {
		beenHereBefore: false,
		xBG: 0,
		yBG: 0,
		xBack: 350,
		yBack: 920,
		wButton: 207,
		hButton: 59,

		xP1Left: 371, yP1Left: 243,
		xP1Right: 371, yP1Right: 303,
		xP1DownSlow: 371, yP1DownSlow: 363,
		xP1DownInstant: 371, yP1DownInstant: 423,
		xP1Rotate: 371, yP1Rotate: 483,
		xP1Hold: 371, yP1Hold: 543,
		xPause: 371, yPause: 663,
		xRemember: 371, yRemember: 723,

		P1LeftButton: null,
		P1RightButton: null,
		P1DownSlowButton: null,
		P1DownInstantButton: null,
		P1RotateButton: null,
		P1HoldButton: null,
		PauseButton: null
	},

	preload: function(){
		// fixes all the positions
		if (!this.gvar.beenHereBefore){
			this.gvar.beenHereBefore = true;
			for (var i in this.gvar){
				if (i.startsWith('x'))
					this.gvar[i] += gameSettings.xOffset / 2;
				if (i.startsWith('y'))
					this.gvar[i] += gameSettings.yOffset / 2;
			}
		}
	},

	create: function(){



		// background
		game.add.sprite(this.gvar.xBG,this.gvar.yBG,'settingsbg');

		// create a bunch of buttons
		this.makeButton(this.gvar.P1LeftButton, "p1Left", this.gvar.xP1Left, this.gvar.yP1Left);
		this.makeButton(this.gvar.P1RightButton, "p1Right", this.gvar.xP1Right, this.gvar.yP1Right);
		this.makeButton(this.gvar.P1DownSlowButton, "p1DownSlow", this.gvar.xP1DownSlow, this.gvar.yP1DownSlow);
		this.makeButton(this.gvar.P1DownInstantButton, "p1DownInstant", this.gvar.xP1DownInstant, this.gvar.yP1DownInstant);
		this.makeButton(this.gvar.P1RotateButton, "p1Rotate", this.gvar.xP1Rotate, this.gvar.yP1Rotate);
		this.makeButton(this.gvar.P1HoldButton, "p1Hold", this.gvar.xP1Hold, this.gvar.yP1Hold);
		this.makeButton(this.gvar.PauseButton, "pauseButton", this.gvar.xPause, this.gvar.yPause);

		// here we create a shitty "remember settings" function

		// first, the text
		var rememberText = game.add.bitmapText(this.gvar.xRemember+this.gvar.wButton/2, this.gvar.yRemember+this.gvar.hButton/2, 'primepink', '', 21);
		rememberText.anchor.x = 0.5;
		rememberText.anchor.y = 0.7;
		var explainText = game.add.bitmapText(this.gvar.xRemember+10, this.gvar.yRemember+60, 'primepink', 'Settings will be reset\non page reload', 16);
		if (gameSettings.rememberSettings){
			rememberText.text = 'Yes';
			explainText.visible = false;
		} else {
			rememberText.text = 'No';
			explainText.visible = true;
		}

		// next, the button, with the listener and shit
		var rememberButton = game.add.button(this.gvar.xRemember, this.gvar.yRemember,
			'textureAtlas',
			function(){
				if (gameSettings.rememberSettings){
					gameSettings.rememberSettings = false;
					rememberText.text = "No";
					explainText.visible = true;
					localStorage.removeItem('settings');
				} else {
					gameSettings.rememberSettings = true;
					rememberText.text = "Yes";
					explainText.visible = false;
					localStorage.setItem('settings',JSON.stringify(gameSettings));
				}
			},
			this,
			'settingbutton_over', 'settingbutton_normal'
		);

		// go back button
		var backtomenu = game.add.button(this.gvar.xBack, this.gvar.yBack,
			'textureAtlas',
			function() {
				if (gameSettings.rememberSettings){
					localStorage.removeItem('settings');
					localStorage.setItem('settings',JSON.stringify(gameSettings));
				}
				game.state.start("Menu");
			},
			this,
			'back_over', 'back_normal'
		);
		backtomenu.anchor.x = 0.5;
		backtomenu.anchor.y = 0.5;

	},

	// this function will create a button, and assign proper listener to it
	makeButton: function(buttonContainer, settingVar, xPos, yPos){
		var xText = xPos + this.gvar.wButton / 2;
		var yText = yPos + this.gvar.hButton / 2;
		buttonContainer = {};
		buttonContainer.settingVar = settingVar;
		buttonContainer.button = game.add.button(xPos, yPos, 'textureAtlas', this.keyListener, buttonContainer, 'settingbutton_over','settingbutton_normal');
		buttonContainer.text = game.add.bitmapText(xText, yText, 'primepink', '', 21);
		buttonContainer.text.text = gameSettings[buttonContainer.settingVar][1];
		buttonContainer.text.anchor.x = 0.5;
		buttonContainer.text.anchor.y = 0.7;
	},

	// the listener of a keybind button. When clicked, freeze the button, listen for a keyboard
	// event, update proper variables, and then unfreeze the button.
	keyListener: function (){
		var thisContainer = this;
		// freeze the button
		thisContainer.button.freezeFrames = true;
		// listen for a keyboard event
		game.input.keyboard.onDownCallback = function(e) {
			// update the proper setting variable
			gameSettings[thisContainer.settingVar][0] = e.keyCode;
			gameSettings[thisContainer.settingVar][1] = e.code;
			// update the button text
			thisContainer.text.text = e.code;
			// delete the keyboard event listener
			game.input.keyboard.onDownCallback = null;
			// unfreeze the button
			thisContainer.button.freezeFrames = false;
			thisContainer.button.frameName = 'settingbutton_normal';
		}
	}

};
