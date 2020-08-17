function game(sketch) {
    const COLORS = {
        darkGreen: [38, 70, 83],
        yellow: [233, 196, 106],
        orange: [244, 162, 97],
        red: [220, 140, 140],
        bluegreen: [42, 157, 143],
        white: [220, 220, 220],
    }

    class Particle {
        constructor(position, others, type) {
            this.position = sketch.createVector(...position);
            this.others = others;
            this.type = type ?? getRandomInt(Particle.NTYPES);

            this.radius = Particle.RADIUS[this.type];
            this.velocity = sketch.createVector(0, 0);

            const behaviorParams = Particle.BEHAVIOR_PARAMETERS[this.type];
            this.applyForceFrom = function (other) {
                if (this == other) return;
                const toOther = p5.Vector.sub(other.position, this.position);
                const dist = toOther.mag();
                const collisionRadius = this.radius + other.radius;
                if (dist >= behaviorParams.maxRadius) return;

                if (dist < collisionRadius) {
                    this.velocity.add(toOther.setMag(1 / collisionRadius - 1 / dist));
                } else if (dist >= behaviorParams.minRadius) {
                    this.velocity.add(toOther.setMag(behaviorParams.peak * Math.sin(Math.PI * (dist - collisionRadius) / (behaviorParams.maxRadius - collisionRadius))));
                }
            };
        }

        update() {
            this.velocity.setMag(Math.min(Particle.MAXVEL, this.velocity.mag()));
            this.position.add(p5.Vector.mult(this.velocity, sketch.deltaTime));
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
            this.velocity.setMag(Math.max(0, velMag - velMag * 0.0005 * sketch.deltaTime));
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

    Particle.MAXVEL = 1;

    Particle.NTYPES = 6;

    Particle.TYPE = Object.freeze({
        red: 0,
        yellow: 1,
        green: 2,
        blue: 3,
        white: 4,
        orange: 5,
    });

    Particle.COLOR = Object.freeze({
        [Particle.TYPE.red]: COLORS.red,
        [Particle.TYPE.yellow]: COLORS.yellow,
        [Particle.TYPE.green]: COLORS.darkGreen,
        [Particle.TYPE.blue]: COLORS.bluegreen,
        [Particle.TYPE.white]: COLORS.white,
        [Particle.TYPE.orange]: COLORS.orange,
    });

    Particle.RADIUS = Object.freeze({
        [Particle.TYPE.red]: 5,
        [Particle.TYPE.yellow]: 8,
        [Particle.TYPE.green]: 5,
        [Particle.TYPE.blue]: 5,
        [Particle.TYPE.white]: 7,
        [Particle.TYPE.orange]: 6,
    });

    Particle.BEHAVIOR_PARAMETERS = Object.freeze({
        [Particle.TYPE.red]: {
            minRadius: 25,
            maxRadius: 50,
            peak: 0.0008,
        },
        [Particle.TYPE.yellow]: {
            minRadius: 20,
            maxRadius: 60,
            peak: 0.0007,
        },
        [Particle.TYPE.green]: {
            minRadius: 10,
            maxRadius: 40,
            peak: -0.0004,
        },
        [Particle.TYPE.blue]: {
            minRadius: 5,
            maxRadius: 20,
            peak: 0,
        },
        [Particle.TYPE.white]: {
            minRadius: 15,
            maxRadius: 90,
            peak: 0.0005,
        },
        [Particle.TYPE.orange]: {
            minRadius: 40,
            maxRadius: 80,
            peak: 0.0006,
        },
    });

    let particles = [];

    sketch.preload = function () {
    };

    sketch.setup = function () {
        let canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
        canvas.style('display', 'block');
        // sketch.frameRate(30);

        for (let i = 0; i < sketch.width * sketch.height / 4000; i++) {
            particles.push(new Particle([getRandomInt(sketch.width), getRandomInt(sketch.height)], particles));
        }
    };

    sketch.draw = function () {
        sketch.background(0);

        particles.forEach(element => {
            element.updateBehavior();
        });

        particles.forEach(element => {
            element.update();
            element.draw();
        });
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