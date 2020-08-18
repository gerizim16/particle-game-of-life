function getRandomInt(min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function game(sketch) {
    const COLORS = {
        darkGreen: [38, 70, 83],
        yellow: [233, 196, 106],
        orange: [244, 162, 97],
        red: [220, 140, 140],
        bluegreen: [42, 157, 143],
        white: [220, 220, 220],
    }

    function sliderChanged(slider) {
        if (slider.oldValue != slider.value()) {
            slider.oldValue = slider.value();
            return true;
        }
        return false;
    }

    class Particle {
        constructor(position, others, type) {
            this.position = sketch.createVector(...position);
            this.others = others;
            this.type = type ?? getRandomInt(Particle.NTYPES);

            this.radius = Particle.RADIUS[this.type];
            this.velocity = sketch.createVector(0, 0);

            this.behaviorParams = Particle.BEHAVIOR_PARAMETERS[this.type];
            this.applyForceFrom = function (other) {
                if (this == other) return;
                const toOther = p5.Vector.sub(other.position, this.position);
                const dist = toOther.mag();
                const collisionRadius = (this.radius + other.radius);
                if (dist >= this.behaviorParams.maxRadius) return;

                if (dist < collisionRadius) {
                    this.velocity.add(toOther.setMag(-Math.abs(2 * this.behaviorParams.peak * (Math.tanh(dist - collisionRadius) - 1))));
                }
                if (dist >= this.behaviorParams.minRadius) {
                    this.velocity.add(toOther.setMag(this.behaviorParams.polarity * other.behaviorParams.polarity * this.behaviorParams.peak * Math.sin(Math.PI * (dist - collisionRadius) / (this.behaviorParams.maxRadius - collisionRadius))));
                }
            };
        }

        update() {
            this.velocity.setMag(Math.min(Particle.MAXVEL, this.velocity.mag()));
            this.position.add(p5.Vector.mult(this.velocity, sketch.deltaTime / 100));
            this.friction();
            this.bound();
            // this.edgeLoop();
        }

        updateBehavior() {
            for (const other of this.others) {
                this.applyForceFrom(other);
            }
        }

        friction() {
            const velMag = this.velocity.mag();
            this.velocity.setMag(Math.max(0, velMag - velMag * 0.1 * sketch.deltaTime / 100));
        }

        bound() {
            if (this.position.x < 0 && this.velocity.x < 0) this.velocity.x = Math.abs(this.velocity.x);
            if (this.position.y < 0 && this.velocity.y < 0) this.velocity.y = Math.abs(this.velocity.y);
            if (this.position.x >= sketch.width && this.velocity.x > 0) this.velocity.x = -Math.abs(this.velocity.x);
            if (this.position.y >= sketch.height && this.velocity.y > 0) this.velocity.y = -Math.abs(this.velocity.y);
        }

        edgeLoop() {
            if (this.position.x < 0) this.position.x = sketch.width - 1;
            if (this.position.y < 0) this.position.y = sketch.height - 1;
            if (this.position.x >= sketch.width) this.position.x = 0;
            if (this.position.y >= sketch.height) this.position.x = 0;
        }

        draw() {
            sketch.push();
            sketch.stroke(Particle.COLOR[this.type]);
            sketch.strokeWeight(this.radius * 2);
            sketch.point(this.position);
            sketch.pop();
        }
    }

    Particle.MAXVEL = Infinity;

    Particle.NTYPES = 20;
    Particle.TYPE = {};
    Particle.COLOR = {};
    Particle.RADIUS = {};
    Particle.BEHAVIOR_PARAMETERS = {};

    for (let i = 0; i < Particle.NTYPES; i++) {
        Particle.TYPE[i] = i;
        Particle.COLOR[i] = [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
        Particle.RADIUS[i] = getRandomInt(4, 8);
        const minRadius = getRandomInt(Particle.RADIUS[i], Particle.RADIUS[i] * 1.5);
        const maxRadius = getRandomInt(minRadius + 10, minRadius * 3 + 30);
        const polarity = i % 2 ? -1 : 1;

        Particle.BEHAVIOR_PARAMETERS[i] = {
            minRadius: minRadius,
            maxRadius: maxRadius,
            peak: Math.random() * 2 - 1,
            polarity: polarity,
        }
    }

    let particles;
    let diversity, diversitySlider;

    function reset() {
        diversity = diversitySlider.value();
        particles = [];
        for (let i = 0; i < sketch.width * sketch.height / 2000; i++) {
            particles.push(new Particle([getRandomInt(sketch.width), getRandomInt(sketch.height)], particles, getRandomInt(diversity)));
        }
    }

    sketch.preload = function () {
    };

    sketch.setup = function () {
        let canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        canvas.style('display', 'block');
        // sketch.frameRate(30);
        sketch.textSize(20);

        diversitySlider = sketch.createSlider(1, Particle.NTYPES, 6, 1);
        diversitySlider.position(20, 20);
        diversitySlider.style('width', '200px');

        reset();
    };

    sketch.draw = function () {
        if (sliderChanged(diversitySlider)) {
            reset();
        }

        sketch.background(0);

        particles.forEach(element => {
            element.updateBehavior();
        });

        particles.forEach(element => {
            element.update();
            element.draw();
        });

        sketch.stroke(COLORS.white);
        sketch.strokeWeight(4);
        sketch.textAlign(sketch.LEFT);
        sketch.text('diversity', 240, 37);
    };

    sketch.mouseMoved = function () {
    };

    sketch.mouseClicked = function () {
    };

    sketch.keyPressed = function () {
    };

    sketch.keyReleased = function () {
    };

    sketch.windowResized = function () {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
    };
}

let p5Sketch = new p5(game, 'gameContainer');

window.addEventListener("keydown", function (e) {
    // space and arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);