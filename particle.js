class Particle {
    /* options:
    {
        mass, position,
        optionals:
        velocity, 
    }
    */
    // onUpdate is a function (this)
    constructor (options, onUpdate) {
        this.mass = options.mass;
        this.acceleration = {x: 0, y: 0};
        this.velocity = options.velocity? options.velocity: {x: 0, y: 0};
        this.position = options.position;

        // sphere where the particle can influence other particles
        // should be calced based on optimal distance, and strength
        this.influenceRadius = 150;
        
        // represented by particle's apparent size/radius
        // preferred distance from center that other particles' size should be should be
        // should be less than influence radius
        this.targetDistance = 25;
        // strength of the force that pushes particles towards the optimal distance
        this.strength = 10;

        this.division;

        this.onUpdate = onUpdate;
    }

    // returns if another location is in the influence of this particle
    inInfluence(x, y) {
        return (Math.pow(this.influenceRadius, 2) >= 
        Math.pow(this.position.x - x, 2) + 
        Math.pow(this.position.y - y, 2));
    }

    // updates all accelerations
    updateForces(particlesInInfleunce) {
        particlesInInfleunce.delete(this); // remove this particle
        particlesInInfleunce.forEach(particle => {
            particle.interact(this);
        });
    }
    // interacts with this particle from that position at that strength
    interact (particle) {
        const x = particle.position.x;
        const y = particle.position.y;
        const strength = particle.strength;
        const targetDistance = particle.targetDistance + this.targetDistance;

        const distance = Math.sqrt(Math.pow(this.position.x - x, 2) + Math.pow(this.position.y - y, 2));
        const pushMagnitude = 10 * strength / distance; // magnitude of the push away
        const pullMagnitude = strength / (targetDistance - distance + (targetDistance > distance)? strength/2 : -strength/2)  // magnitude of the pull towards
        const angle = Math.atan2(this.position.y - y, this.position.x - x);

        let accelerationX = 0, accelerationY = 0;
        accelerationX += (pushMagnitude * Math.cos(angle));
        accelerationY += (pushMagnitude * Math.sin(angle));
        accelerationX -= (pullMagnitude * Math.cos(angle));
        accelerationY -= (pullMagnitude * Math.sin(angle));

        // update this accleration
        this.acceleration.x += accelerationX / this.mass;
        this.acceleration.y += accelerationY / this.mass;
        // update other particle with the opposite
        particle.acceleration.x -= accelerationX / particle.mass;
        particle.acceleration.y -= accelerationY / particle.mass;
        
    }

    // update position, velocity, and acceleration
    // returns new position
    update() {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // reset acceleration because it will be updated next cycle
        this.acceleration.x = 0;
        this.acceleration.y = 0;

        this.onUpdate(this);

        return this.position;
    }
}