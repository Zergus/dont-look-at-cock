(function () {
	const GAME = {
		status: {
			0: 'Game Over',
			1: 'Game Started',
			3: 'Game Inactive'
		}
	}
	var duration = 5000;
	var score = 0;
    var seekAnim;

    AFRAME.registerComponent('collider-check', {
    	dependencies: ['raycaster'],
    	init() {
    		let sceneEl = document.querySelector('#scene');
    		this.el.addEventListener('raycaster-intersected', ()=> {
      			sceneEl.emit('game', { score, status: GAME.status[0] });
    		});
    		this.el.addEventListener('raycaster-intersected-cleared', ()=> {
      			sceneEl.emit('game', { score, status: GAME.status[1] });
    		});
    	}
    });

    AFRAME.registerComponent('camera-seeker', {
    	init() {
            this.CAMERA = document.querySelector('#player');
            this.newCords = {};
            this.setupAnimation();
    	},

        setupAnimation () {
            let el = this.el;
            seekAnim = new AFRAME.TWEEN.Tween(this.el.getAttribute('rotation'))
                .to(this.newCords, 30000)
                .easing(AFRAME.TWEEN.Easing.Quadratic.Out)
                .onUpdate(function () {
                    el.setAttribute('rotation', `${this.x}, ${this.y}, ${this.z}`);
                })
                .repeat(Infinity);
        },

    	tick () {
            if (!this.el.getAttribute('visible')) return;

    		if (AFRAME.utils.coordinates.stringify(this.CAMERA.getAttribute('rotation')) !== AFRAME.utils.coordinates.stringify(this.el.getAttribute('rotation'))) {
                Object.assign(this.newCords, this.CAMERA.getAttribute('rotation'));
    		}
    	}
    });

    AFRAME.registerComponent('main-scene', {
    	init () {

            var this_ = this;
            this.el.addEventListener('loaded', function onLoaded () {
                this_.el.removeEventListener('loaded', onLoaded);
            });

    		this.el.addEventListener('game', ({ detail }) => {
    			this.onGameStatusUpdate(detail.status);
    		});
    	},

        onGameStatusUpdate (status) {
            if (!this.el.getAttribute('visible')) return;
            if (status !== this.el.gameStatus) {
                this.el.gameStatus = status;
                switch (status) {
                    case GAME.status[0]:
                        this.stopGame();
                        break;
                    case GAME.status[1]:
                        this.startGame();
                        break;
                    default:
                        break;
                }
            }
        },

        stopGame () {
            seekAnim.stop();
        },

        startGame () {
            document.querySelector('[sound]').emit('gameStart');
            duration = 5000;
            score = 0;
            seekAnim.start();
        },

    	tick() {
            if (!this.el.getAttribute('visible')) return;

    		if (this.el.gameStatus === GAME.status[1]) {
			   score += 1;
    		}
    	}
    });

    AFRAME.registerComponent('menu', {
        init() {
        }
    });

    AFRAME.registerComponent('hover', {
        dependencies: ['raycaster'],
        schema: {
            type: 'color',
        },
        init() {

            function changeColor (fromColor, toColor) {
                return new AFRAME.TWEEN.Tween(fromColor).to(toColor).start();
            }

            var swap = (function (events) {
                this.el.addEventListener(events[0], swap);
                this.el.removeEventListener(events[1], swap);
                events.reverse();
            }).bind(this, ['raycaster-intersected', 'raycaster-intersected-cleared']);

            swap();

            // var onHover = (function  () {
            //     this.el.removeEventListener('raycaster-intersected', onHover);
            //     this.el.addEventListener('raycaster-intersected-cleared', onBlur);
            // }).bind(this);

            // var onBlur = (function  () {
            //     this.el.addEventListener('raycaster-intersected', onHover);
            //     this.el.removeEventListener('raycaster-intersected-cleared', onBlur);
            // }).bind(this);

            // onBlur();
        }
    });

})();