function rotate ({ x, y, z }, angle) {
    x = Math.cos(angle) - Math.sin(angle);
    z = Math.sin(angle) + z * Math.cos(angle);

    return {x, y, z};
}

(function () {

    AFRAME.registerComponent('seeker', {
        init () {
            var el = this.el;
            var camera_ = this.camera_ = document.querySelector('#player');
            this.lastCameraPosition = this.camera_.getAttribute('rotation');
            this.tween_ = new AFRAME.TWEEN.Tween(this.el.getAttribute('rotation'))
                .easing(AFRAME.TWEEN.Easing.Linear.None)
                .onUpdate(function() {
                    el.setAttribute('rotation', { x: this.x, y: this.y, z: this.z });
                })
                .start();
        },
        tick () {
            if (AFRAME.utils.coordinates.stringify(this.lastCameraPosition) !== AFRAME.utils.coordinates.stringify(this.camera_.getAttribute('rotation'))) {
                this.lastCameraPosition = this.camera_.getAttribute('rotation');
                this.tween_.stop();
            }
            if (AFRAME.utils.coordinates.stringify(this.el.getAttribute('rotation')) !== AFRAME.utils.coordinates.stringify(this.camera_.getAttribute('rotation'))) {
                this.tween_.to(this.camera_.getAttribute('rotation'), 1000).start();
            }

        }
    });

    AFRAME.registerComponent('target', {
        init () {
            this.origRotation_ = AFRAME.utils.coordinates.stringify(this.el.getAttribute('rotation'));
        },
        tick () {
            // if (this.origRotation_ !== AFRAME.utils.coordinates.stringify(this.el.getAttribute('rotation'))) {
            //     this.origRotation_ = AFRAME.utils.coordinates.stringify(this.el.getAttribute('rotation'));
            //     document.querySelector('#petuh-holder').emit('seek', this.el.getAttribute('rotation'), false);
            // }
        }
    });
})();