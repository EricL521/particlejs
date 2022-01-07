class Particle {
    constructor () {
        this.mass = 10;
        this.acceleration = {x: 0, y: 0};
        this.speed = {x: 0, y: 0};
        this.position = {x: 0, y: 0};

        // sphere where the particle can influence other particles
        // should be calced based on optimal distance, and strength
        this.influenceRadius = 10;
        
        // represented by particle's apparent size/radius
        // preferred distance from center that other particles' size should be should be
        // should be less than influence radius
        this.optimalDistance = 5;
        // strength of the force that pushes particles towards the optimal distance
        this.strength = 10;

        this.division;
    }

    // returns if another location is in the influence of this particle
    inInfluence(x, y) {
        return (Math.pow(this.influenceRadius, 2) >= 
        Math.pow(this.position.x - x, 2) + 
        Math.pow(this.position.y - y, 2));
    }

    // updates all accelerations
    updateForces(particlesInInfleunce) {
        particlesInInfleunce.forEach(particle => {
            particle.interact(this);
        });
    }
    // interacts with this particle from that position at that strength
    interact (particle) {
        const x = particle.position.x;
        const y = particle.position.y;
        const strength = particle.strength;
        const targetDistance = particle.targetDistance;

        const distance = Math.sqrt(Math.pow(this.position.x - x, 2) + Math.pow(this.position.y - y, 2));
        const accelerationMagnitude = strength / distance;
        const angle = Math.atan2(this.position.x - x, this.position.y - y);

        // this particle is pulled towards that location
        if (targetDistance < distance) {
            const accelerationX = - (accelerationMagnitude * Math.cos(angle)) / this.mass;
            const accelerationY = - (accelerationMagnitude * Math.sin(angle)) / this.mass;
        }
        // this particle is pulled away from that location
        else if (targetDistance > distance) {
            const accelerationX = (accelerationMagnitude * Math.cos(angle)) / this.mass;
            const accelerationY = (accelerationMagnitude * Math.sin(angle)) / this.mass;
        }
        
        // update this accleration
        this.acceleration.x += accelerationX;
        this.acceleration.y += accelerationY;
        // update other particle with the opposite
        particle.acceleration.x += accelerationX;
        particle.acceleration.y += accelerationY;
        
    }

    // update position, speed, and acceleration
    // returns new position
    update() {
        this.speed.x += this.acceleration.x;
        this.speed.y += this.acceleration.y;
        
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        // reset acceleration because it will be updated next cycle
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        return this.position;
    }
}