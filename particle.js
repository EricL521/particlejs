class Particle {
    /* options:
    {
        mass, position,
        optionals:
        velocity, targetDistance
    }
    */
    // onUpdate is a function (this)
    constructor (options, onUpdate) {
        this.mass = options.mass;
        this.acceleration = {x: 0, y: 0};
        this.velocity = options.velocity? options.velocity: {x: 0, y: 0};
        this.position = options.position;
        
        // represented by particle's apparent size/radius
        // preferred distance from center that other particles' size should be should be
        // should be less than influence radius
        this.targetDistance = options.targetDistance? options.targetDistance: 25;
        this.radius = this.targetDistance;
        // strength of the force that pushes particles towards the optimal distance
        this.strength = 10;

        // sphere where the particle can influence other particles
        // should be calced based on optimal distance, and strength
        this.influenceRadius = this.strength * this.targetDistance;

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
        // sort particles by distance (closest first) into an array
        const particles = this.sortParticles(particlesInInfleunce);

        // when a particle is updated, it blocks particles behind it
        const blockedAngles = new Set();
        for (const value of particles) {
            const particle = value.particle;

            // determine how much of the particle is blocked by other particles
            const particleRange = Particle.getRange(value.angle, particle.radius, value.distance);
            const particleAngle = (particleRange[1] - particleRange[0]) % (2 * Math.PI); // size of the angle that the particle takes up
            let blockedAngle = 0; // size of the angle that is blocked
            for (const range of blockedAngles) {
                if (range[0] <= particleRange[0] && particleRange[0] <= range[1])
                    blockedAngle += range[1] - particleRange[0];
                if (range[0] <= particleRange[1] && particleRange[1] <= range[1])
                    blockedAngle += particleRange[1] - range[0];
            }
            
            // if blocked
            if (blockedAngle > 0) {
                // if not totally blocked, interact with particle
                if (blockedAngle <= particleAngle)
                    particle.interact(this, 1 - (blockedAngle/particleAngle));
                
                Particle.mergeRange(blockedAngles, particleRange);
            }
            // if unblocked
            else {
                particle.interact(this, 1);

                // add range to blocked angles
                blockedAngles.add(particleRange);
            }
        };
    }
    // returns an array that is sorted by increasing distance
    sortParticles(set) {
        const array = new Array(set.size);
        let i = 0;
        set.forEach(particle => {
            const x = particle.position.x;
            const y = particle.position.y;
            array[i] = {
                particle: particle,
                distance: Math.sqrt(Math.pow(this.position.x - x, 2) + Math.pow(this.position.y - y, 2)),
                angle: Math.atan2(this.position.y - y, this.position.x - x)
            }

            i ++;
        });
        // subtract radius b/c a larger radius can mean a closer difference
        array.sort((a, b) => (a.distance - a.particle.radius) - (b.distance - b.particle.radius));

        return array;
    }
    // returns the angle range around an angle
    static getRange(angle, radius, distance) {
        const circumference = 2 * Math.PI * distance;
        const angleDifference = radius / circumference * 2 * Math.PI;
        return [(angle - angleDifference) % (2 * Math.PI), (angle + angleDifference) % (2 * Math.PI)];
    }
    // merges a range with other ranges in a set
    // edits rangeSet, so returns nothing
    static mergeRange(rangeSet, newRange) {
        let lowerRange;
        let higherRange;
        rangeSet.forEach(range => {
            if (range[0] <= newRange[0] && newRange[0] <= range[1])
                lowerRange = range;
            if (range[0] <= newRange[1] && newRange[1] <= range[1])
                higherRange = range;
        });
        const mergedRange = new Array(newRange);
        // merge with ranges
        if (lowerRange) {
            rangeSet.delete(lowerRange);
            mergedRange[0] = lowerRange[0];
        }
        if (higherRange) {
            rangeSet.delete(higherRange);
            mergedRange[1] = lowerRange[1];
        }
        rangeSet.add(mergedRange);
        
    }
    // interacts with this particle from that position at that strength
    // the strength is multiplied by the scalar
    interact (particle, scalar) {
        const x = particle.position.x;
        const y = particle.position.y;
        const strength = particle.strength * scalar;
        const targetDistance = particle.targetDistance + this.targetDistance;

        const distance = Math.sqrt(Math.pow(this.position.x - x, 2) + Math.pow(this.position.y - y, 2));
        const pushMagnitude = strength / Math.pow(distance/targetDistance, Math.E); // magnitude of the push away
        const pullMagnitude = strength / Math.pow(distance/targetDistance, 2); // magnitude of the pull towards
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