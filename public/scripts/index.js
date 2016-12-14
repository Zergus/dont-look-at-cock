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
    var duration = 3000;
    var seekAnim;
    var shotgun = false;

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
            return seekAnim = new AFRAME.TWEEN.Tween(document.querySelector('#petuh-holder').getAttribute('rotation'))
                .to(this.getCoords(document.querySelector('#player').getAttribute('rotation')), duration)
                .easing(AFRAME.TWEEN.Easing.Linear.None)
                .onUpdate(function () {
                    el.setAttribute('rotation', `${this.x}, ${this.y}, ${this.z}`);
                })
                .onComplete(() => {
                    if (!shotgun && duration > 300) duration -= 100;
                    if (shotgun) duration = 300;
                    this.setupAnimation().start();
                });
        },

        getCoords(coords) {
            if (!coords) return null;
            if (shotgun) {
                return {
                    x: chance.floating({min: coords.x - 360, max: coords.x + 360}),
                    y: chance.floating({min: coords.y - 360, max: coords.y + 360}),
                    z: chance.floating({min: coords.z - 360, max: coords.z + 360})
                }
            }
            return coords;
        },

    	tick () {
            //
    	}
    });

    AFRAME.registerComponent('main-scene', {
    	init () {
            var this_ = this;
            this.timer = null;
            this.gunTimer = null;
            this.getShotgun_ = null;
            this.startFire_ = null;
            this.hideShotgun_ = null;
            updateGameStatus(GAME.status.menu);
            this.el.addEventListener('loaded', function onLoaded () {
                this_.el.removeEventListener('loaded', onLoaded);
            });

    		this.el.addEventListener('game', ({ detail }) => {
    			this.onGameStatusUpdate(detail.status);
    		});
            document.querySelector('#gun-explosion').setAttribute('visible', false);

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
            }, time);
        },

        timerBeforeShotgun (time = 10000) {
            this.gunTimer = setTimeout(() => {
                this.getShotgun();
            }, time); 
        },

        stopGameStart () {
            window.clearTimeout(this.timer);
        },

        stopGame () {
            this.gunTimer && window.clearTimeout(this.gunTimer);
            AFRAME.TWEEN.remove(this.getShotgun_);
            AFRAME.TWEEN.remove(this.startFire_);
            AFRAME.TWEEN.remove(this.hideShotgun_);
            this.hideShotgun();
            toggleMenu();
            seekAnim.stop();
        },

        startGame () {
            toggleMenu();
            document.querySelector('#petuh-song').emit('gameStart');
            duration = 3000;
            score = 0;
            seekAnim.start();
            this.timerBeforeShotgun();
        },

        getShotgun () {
            if (shotgun) return;
            this.getShotgun_ = new AFRAME.TWEEN.Tween(document.querySelector('#gun').getAttribute('position'))
                .to({ y: -1.5 }, 10000)
                .easing(AFRAME.TWEEN.Easing.Linear.None)
                .onStart(function () {
                    shotgun = true;
                    document.querySelector('#reload-gun').components.sound.playSound();
                })
                .onUpdate(function () {
                    document.querySelector('#gun').setAttribute('position', { y: this.y })
                })
                .onComplete(() => {
                    this.startFire();
                })
                .start();
        },

        startFire () {
            if (!shotgun) return;
            var fire = true;
            var iter;
            new AFRAME.TWEEN.Tween({ z: 1 })
                .to({ z: 0 }, 980)
                .easing(AFRAME.TWEEN.Easing.Linear.None)
                .onStart(function () {
                    document.querySelector('#fire-from-gun').components.sound.playSound();
                    document.querySelector('#gun-explosion').setAttribute('visible', true);
                    setTimeout (function () {
                        document.querySelector('#gun-explosion').setAttribute('visible', false);
                    }, 200);
                    iter = setInterval(function () {
                        document.querySelector('#gun-explosion').setAttribute('visible', true);
                        setTimeout (function () {
                            document.querySelector('#gun-explosion').setAttribute('visible', false);
                        }, 200);
                    }, 980);
                })
                .onStop(function () {
                    iter && window.clearInterval(iter);
                })
                .onUpdate(function () {
                    document.querySelector('#gun').setAttribute('position', { z: this.z });
                })
                .onComplete(() => {
                    iter && window.clearInterval(iter);
                    this.hideShotgun();
                })
                .repeat(5)
                .start();
        },

        hideShotgun () {
            if (!shotgun) return;
            new AFRAME.TWEEN.Tween(document.querySelector('#gun').getAttribute('position'))
                .to({ y: -10 }, 1500)
                .easing(AFRAME.TWEEN.Easing.Linear.None)
                .onStart(function () {
                    duration += 1000;
                    shotgun = false;
                    document.querySelector('#fire-from-gun').components.sound.isPlaying = true;
                    document.querySelector('#fire-from-gun').components.sound.pause();
                })
                .onUpdate(function () {
                    document.querySelector('#gun').setAttribute('position', { y: this.y })
                })
                .onComplete(() => {
                    if (isGameStart()) {
                        this.timerBeforeShotgun();    
                    }
                })
                .start();
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
                    updateGameStatus(GAME.status.starting);
                    break;
                case 'leaderboard':
                    //
                    break;
                default:
                    break;
            }
        },
        onBlur () {
            AFRAME.TWEEN.remove(this.pressAnim);
            this.el.setAttribute('position', this.origPosition_);
            if (isGameStart()) return;
            updateGameStatus(GAME.status.menu)
        },
        tick() {
            //
        }
    });

})();