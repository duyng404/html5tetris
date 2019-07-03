# html5tetris
My attempt at a tetris clone using html5 and js. Created using Phaser game engine.

## Overview

It's a tetris game that runs in web browser! Also included a web server written in nodejs for handling highscore. Some features include:

- Experience tetris everywhere from every browser. Even from phones.
- A highscore leaderboard system. There is a weekly scoreboard and an all-time scoreboard. Try to get the highest score!
- Cool cyberpunk-ish graphics (or at least I tried. graphics is hard.)
- Easy to spin up your own version (but the code is hard to read LOL)

Ya can play the game anytime from this link: [tetris.anythingbut.me](http://tetris.anythingbut.me)

## Scoring system

For some of you hardcore players out there:

- You get points for lowering the brick. One row = One points.
- Score multiplier is initially 1x at level 1. Every two levels increase the multiplier by 1. The cap is 6x at level 11.
- Falling speed is 1500ms at level 1. Becomes faster gradually by level. Max speed is 300ms at level 11.
- Multiple line-clear awards more points: One line for 100. Two lines for 250. Three lines for 500. Four lines for 800.
- Consecutive line clears award 250 bonus points.

## Planned features

Although this is initially supposed to be just a one-shot project, some people (like about 10 of them??) actually liked the game and keep playing regularly! These upcoming features are for you guys. Can't promise the delivery dates though. But it will be something for me to spend my free time on, instead of being a lazy piece of s...

- Revamp the scoring system and difficulty scale, as well as some new mechanics to make the game harder later on. Why? Cuz I feel like currently the game is drawn on for too long while not offering much of a challenge for the player. The result is a game dependent on how much time you are willing to spend. The game become grindy just to get a spot on the highscore board.
- Weekly challenges: A scenario-ish kind of game. The board will be prefilled with tiles of some pattern. Your goal is to eliminate rows until there are only 2 rows left, using the least amount of blocks possible. The blocks you get will not be random, but instead predefined, and you get the same block every playthrough.
- 2 Players co-op: 2 Players, One keyboard. Two blocks are active at one time. Try not to step onto each other's toes!!
- ????????????

## Set up your own version

Hey, this game isn't open source for no reason! All the source code is in the github repo, and you can freely modify it to make your own version! Here is how to set it up.

Note that this instruction is applicable to only Linux, because that's my dev environment. Or macOS too, if you know what you're doing.

- Ensure requirements are installed: node js, npm.
- `git clone https://github.com/ferb96/html5tetris`
- `cd` into repo
- `npm install`
- Installation is complete. Run the server with `node highscoreServer.js`
- Open up your browser and go to `localhost:6000`. Enjoy your own tetris!!

## Source code explanation

Game is written using the [Phaser](http://phaser.io/) game engine.

- `highscoreServer.js` is a one-file [Expressjs](https://expressjs.com/) server that serves the game and manages the highscore.
- `html` folder is where most of the stuff goes. `html/index.html` is the main page that loads up the game. The first js file that is loaded is `html/main.js`. This file will load up the splash screen.
- The splash screen's purpose is to load up everything else. It is done this way so that the game will be able to start as quickly as possible, rather than showing a black screen to the user. After that, other resources are gradually loaded in. These resources include images and script that is quite large in size.
- All the scripts of the game are at `html/gameResources/states/`. One file for one "states" of the game. The main game file is `html/gameResources/states/thegame.js`. Beware, it is a monolithic son of a ***** with 1000 lines of code. Spaghetti. I know. Sorry it was this way.
- All the image assets are at `html/gameResources/assets`. Other folders in `html/gameResources/` include other things as well.
- The highscore file is at `html/highscore.html`. This one is a super simple [Angularjs](https://angularjs.org/) app that simply load in ONE template. The files related to this angularjs app is located at `html/highscoreResources/`

You are more than welcome to look at the source code and change it. However it is actually more of a challenge than rewriting the whole game yourself. lol.

## Bugs ??

If you spot any bugs, open up an issue on [github issue tracker](https://github.com/ferb96/html5tetris/issues), or email me, or whatever.

This is kind of lengthy. Too lengthy for such an insignificant game, actually. It's not even original!!! But anyway, if you read this far, you really did have interest in this. Thanks for that!
