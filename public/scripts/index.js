(function () {
	const GAME = {
		status: {
			over: 'Game Over',
			start: 'Game Started',
			menu: 'Game Menu',
            starting: 'Game Starting'
		}
	}
	var score = 0;
    var seekAnim;

    function changeColor (el, duration = 1000, times) {
        var this_ = this;
        return new AFRAME.TWEEN.Tween(new AFRAME.THREE.Color(el.getAttribute('material').color))
            .to(new AFRAME.THREE.Color(chance.color({format: 'shorthex'})), duration)
            .onUpdate(function () {
                el.setAttribute('material', { color: `#${this.getHexString()}` });
            })
            .onComplete(function () {
                times === Infinity && changeColor(el, duration, times);
            })
            .start();
    }

    function pressButton (el, duration) {
        var this_ = this;
        return new AFRAME.TWEEN.Tween(el.getAttribute('position'))
            .to({ z: 0 }, duration)
            .onUpdate(function () {
                el.setAttribute('position', `${this.x}, ${this.y}, ${this.z}`);
            })
            .start();
    }

    function swapEvents (events) {
        var swap = (function (events) {
            this.el.addEventListener(events[0], swap);
            this.el.removeEventListener(events[1], swap);
            events.reverse();
            this.onEvent(events[0]);
        }).bind(this, ['raycaster-intersected', 'raycaster-intersected-cleared']);
        swap();
    }

    function updateGameStatus (status) {
        document.querySelector('#main-scene').emit('game', { score, status });
    }

    function toggleMenu () {
        document.querySelector('#menu-scene').setAttribute('visible', !document.querySelector('#menu-scene').getAttribute('visible'));
        document.querySelector('#petuh-scene').setAttribute('visible', !document.querySelector('#petuh-scene').getAttribute('visible'));
    }

    function isGameStart () {
        return document.querySelector('#main-scene').gameStatus === GAME.status.start;
    }

    AFRAME.registerComponent('petuh', {
    	init() {
            this.el.addEventListener('hover', this.onHover.bind(this));
            this.el.addEventListener('blur', this.onBlur.bind(this));
    	},
        onHover () {
            if (!isGameStart()) return;
            updateGameStatus(GAME.status.stop);
        },
        onBlur () {
            //
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
            var this_ = this;
            seekAnim = new AFRAME.TWEEN.Tween(this.el.getAttribute('rotation'))
                .to(this.newCords, 32000)
                .easing(AFRAME.TWEEN.Easing.Quadratic.Out)
                .onUpdate(function () {
                    el.setAttribute('rotation', `${this.x}, ${this.y}, ${this.z}`);
                })
                .repeat(Infinity);
        },

    	tick () {
            if (!isGameStart()) return;
    		if (AFRAME.utils.coordinates.stringify(this.CAMERA.getAttribute('rotation')) !== AFRAME.utils.coordinates.stringify(this.el.getAttribute('rotation'))) {
                Object.assign(this.newCords, this.CAMERA.getAttribute('rotation'));
    		}
    	}
    });

    AFRAME.registerComponent('main-scene', {
    	init () {

            var this_ = this;
            this.timer = null;
            updateGameStatus(GAME.status.menu);
            this.el.addEventListener('loaded', function onLoaded () {
                this_.el.removeEventListener('loaded', onLoaded);
            });

    		this.el.addEventListener('game', ({ detail }) => {
    			this.onGameStatusUpdate(detail.status);
    		});
    	},

        onGameStatusUpdate (status) {
            if (status !== this.el.gameStatus) {
                this.el.gameStatus = status;
                switch (status) {
                    case GAME.status.stop:
                        this.stopGame();
                        break;
                    case GAME.status.start:
                        this.startGame();
                        break;
                    case GAME.status.menu:
                        this.stopGameStart();
                        break;
                    case GAME.status.starting:
                        this.timerBeforeStart();
                        break;
                    default:
                        break;
                }
            }
        },

        timerBeforeStart (time = 2000) {
            this.timer = setTimeout(() => {
                updateGameStatus(GAME.status.start);
            }, time)
        },

        stopGameStart () {
            window.clearTimeout(this.timer);
        },

        stopGame () {
            toggleMenu();
            seekAnim.stop();
        },

        startGame () {
            toggleMenu();
            document.querySelector('[sound]').emit('gameStart');
            score = 0;
            seekAnim.start();
        },

    	tick() {
            //
    	}
    });

    AFRAME.registerComponent('menu', {
        init() {

        }
    });

    AFRAME.registerComponent('hover', {
        dependencies: ['raycaster'],
        init() {
            swapEvents.call(this, ['raycaster-intersected', 'raycaster-intersected-cleared']);
        },
        onEvent(event) {
            switch(event) {
                case 'raycaster-intersected':
                    this.el.emit('hover');
                    break;
                case 'raycaster-intersected-cleared':
                    this.el.emit('blur');
                    break;
                default:
                    break;
            }
        },
    });

    AFRAME.registerComponent('random-blink', {
        schema: {
            type: 'int'
        },
        init() {
            changeColor(this.el, this.data, Infinity);
        },

    })
    AFRAME.registerComponent('button', {
        schema: {
            type: 'string'
        },
        init () {
            this.pressAnim = null;
            this.origPosition_ = AFRAME.utils.coordinates.stringify(this.el.getAttribute('position'));
            this.activeAnimation = null;
            this.el.addEventListener('hover', this.onHover.bind(this));
            this.el.addEventListener('blur', this.onBlur.bind(this));
        },
        onHover () {
            if (isGameStart()) return;
            this.pressAnim = pressButton(this.el, 2000);
            switch (this.data) {
                case 'start':
                    updateGameStatus(GAME.status.starting)
                    break;
                case 'leaderboard':
                    //
                    break;
                default:
                    break;
            }
        },
        onBlur () {
            if (isGameStart()) return;
            updateGameStatus(GAME.status.menu)
            AFRAME.TWEEN.remove(this.pressAnim);
            this.el.setAttribute('position', this.origPosition_);
        },
        tick() {
            //
        }
    });

})();