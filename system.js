class System {
    // divisionSize is the side length of the square of each division
    // divisions are how many areas of space the particles are grouped into
    /* settings is a JSON:
    {
        updateInterval: number,
        friction: number between 0 and 1
    }
    */
    constructor(divisionSize, xDivisions, yDivisions, settings) {
        this.settings = settings;
        this.numUpdates = 0; // goes up by one every time update is run

        this.divisionSize = divisionSize;
        this.space = new Array(yDivisions);
        for (let i = 0; i < yDivisions; i ++)
            this.space[i] = new Array(xDivisions);
        for (let i = 0; i < this.space.length; i ++)
            for (let j = 0; j < this.space[i].length; j ++)
                this.space[i][j] = new ParticleSet({x: j, y: i});
        
        this.allParticles = new Set();
    }

    // stop after seconds, optional
    start(seconds) {
        this.timeInterval = setInterval(this.update.bind(this), this.settings.updateInterval);
        if (seconds)
            setTimeout(this.stop.bind(this), seconds * 1000);
    }
    stop() {
        clearInterval(this.timeInterval);
    }

    // adds a particle to this system
    addParticle(particle) {
        this.allParticles.add(particle);

        const division = this.getDivision(particle.position.x, particle.position.y);
        this.space[division.y][division.x].add(particle);
        particle.division = this.space[division.y][division.x];
    }

    // main update function
    update() {
        this.allParticles.forEach(particle => {
            particle.updateForces(this.getNeighbors(particle));
        });
        this.allParticles.forEach(particle => {
            const newPos = particle.update(this.settings.friction);
            const newDivisionCoords = this.getDivision(newPos.x, newPos.y);
            const newDivision = this.space[newDivisionCoords.y][newDivisionCoords.x];
            if (particle.division === newDivision)
                return; // don't do the rest
            particle.division.delete(particle);
            newDivision.add(particle);
            particle.division = newDivision;
        });

        this.numUpdates ++;
    }
    // returns a set of particles that are within influence radius
    getNeighbors(particle) {
        const regionsInCircle = new Set(); // regions for sure in the circle
        const possibleRegions = new Set(); // regions whose particles should be checked

        const posMinVals = this.getDivision(particle.position.x - particle.influenceRadius/2, particle.position.y - particle.influenceRadius/2);
        const posMaxVals = this.getDivision(particle.position.x + particle.influenceRadius/2, particle.position.y + particle.influenceRadius/2);
        for (let y = posMinVals.y; y < Math.ceil(posMaxVals.unroundedY); y ++) // minVals is already Math.floored
            for (let x = posMinVals.x; x < Math.ceil(posMaxVals.unroundedX); x ++)
                possibleRegions.add(this.space[y][x]);
        const inMinVals = this.getDivision(particle.position.x - particle.influenceRadius/2/Math.sqrt(2), particle.position.y - particle.influenceRadius/2/Math.sqrt(2));
        const inMaxVals = this.getDivision(particle.position.x + particle.influenceRadius/2/Math.sqrt(2), particle.position.y + particle.influenceRadius/2/Math.sqrt(2));
        for (let y = Math.ceil(inMinVals.unroundedY); y < inMaxVals.y; y ++) // maxVALS is already Math.ceiled
            for (let x = Math.ceil(inMinVals.unroundedX); x < inMaxVals.x; x ++) {
                regionsInCircle.add(this.space[y][x]);
                possibleRegions.delete(this.space[y][x]); // if it is in the circle, it doesn't need to be checked
            }
        
        const particlesInRadius = new Set();
        regionsInCircle.forEach(region => {
            region.forEach(regionParticle => {
                particlesInRadius.add(regionParticle);
            });
        });
        possibleRegions.forEach(region => {
            const worldCoords = this.getWorldCoord(region);
            const closestCorner = [
                (particle.position.x - worldCoords.x > 0)? worldCoords.x + this.divisionSize/2: worldCoords.x - this.divisionSize/2,
                (particle.position.y - worldCoords.y > 0)? worldCoords.y + this.divisionSize/2: worldCoords.y - this.divisionSize/2
            ];
            if (particle.inInfluence(...closestCorner))
                region.forEach(regionParticle => {
                    if (particle.inInfluence(regionParticle.position.x, regionParticle.position.y))
                        particlesInRadius.add(regionParticle);
                });
        });
        return particlesInRadius;
    }
    // returns {x, y, unroundedX, unroundedY}
    getDivision(xPos, yPos) {
        return {
            x: Math.floor(xPos / this.divisionSize), y: Math.floor(yPos / this.divisionSize),
            unroundedX: xPos / this.divisionSize, unroundedY: yPos / this.divisionSize,
        };
    }
    // returns world coords of the middle of a division {x, y}
    getWorldCoord(region) {
        return {
            x: (region.position.x + 1/2) * this.divisionSize,
            y: (region.position.y + 1/2) * this.divisionSize
        }
    }

}