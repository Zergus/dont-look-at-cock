(function () {
	var activeMessage;
	function message (text, timer) {
		window.clearTimeout(activeMessage);
		var messageEl = document.querySelector('#message');
		messageEl.innerHTML = text;
		activeMessage = timer ? setTimeout(function () {
			messageEl.innerHTML = '';
		}, timer) : null;
	}

	const GAME = {
		status: {
			0: 'Game Over',
			1: 'Game Started',
			3: 'Game Inactive'
		}
	}
	var duration = 5000;
	var score = 0;

    AFRAME.registerComponent('collider-check', {
    	dependencies: ['raycaster'],
    	init() {
    		this.sceneEl = document.querySelector('#scene');
    		this.el.addEventListener('raycaster-intersected', ()=> {
      			this.sceneEl.emit('game', { score, status: GAME.status[0] });
    		});
    		this.el.addEventListener('raycaster-intersected-cleared', ()=> {
      			this.sceneEl.emit('game', { score, status: GAME.status[1] });    				
    		});
    	}
    });

    AFRAME.registerComponent('camera-seeker', {
    	init() {
    		let el = this.el;
    		setInterval(() => {
    			duration = duration > 100 ? duration - 100 : duration;
    		}, 1000)
    		this.sceneEl = document.querySelector('#scene');
			this.CAMERA = document.querySelector('#player');
    		this.newCords = {};
    		this.seekAnim = new AFRAME.TWEEN.Tween(this.el.getAttribute('rotation'))
    			.easing(AFRAME.TWEEN.Easing.Linear.None)
    			.onUpdate(function () {
    				el.setAttribute('rotation', { x: this.x, y: this.y, z: this.z });
    			});
    	},
    	tick () {
    		if (AFRAME.utils.coordinates.stringify(this.CAMERA.getAttribute('rotation')) !== AFRAME.utils.coordinates.stringify(this.el.getAttribute('rotation'))) {
    			this.seekAnim.stop();
    			this.seekAnim.to(this.CAMERA.getAttribute('rotation'), duration).start();	
    		}
    	}
    });

    AFRAME.registerComponent('ui', {
    	init () {
    		this.scoreBlock = document.querySelector('#score');
    		this.el.addEventListener('game', ({ detail }) => {
    			if (detail.status !== this.el.gameStatus) {
    				this.el.gameStatus = detail.status;
	    			switch (detail.status) {
	    				case GAME.status[0]:
	    					message(`Game over! Your score ${ detail.score}! Move head to start new game!`);
	    					break;
						case GAME.status[1]:
							document.querySelector('[sound]').emit('gameStart');
							message(`Game STARTED! SURVIVE FROM COCK EYES!`, 3000);
							duration = 5000;
	      					score = 0;
	      					break;
						default:
							break;
	    			}
    			}
    		});
    	},

    	tick() {
    		if (this.el.gameStatus === GAME.status[1]) {
    			this.scoreBlock.innerHTML = score += 1;
    		}
    	}
    })
})();