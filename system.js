class System {
    // divisionSize is the side length of the square of each division
    // divisions are how many areas of space the particles are grouped into
    /* settings is a JSON:
    {
        updateInterval: number,
        friction: number between 0 and 1

        optional:
        onUpdate: function called on update
        accuracy: number, higher accuracy means slower run, acceleration is divided by accuracy
        gravity: {x, y}, acceleration every time
    }
    */
    constructor(divisionSize, xDivisions, yDivisions, settings) {
        this.settings = settings;
        this.numUpdates = 0; // goes up by one every time update is run
        this.stopat; // if numupdates is equal to stopat, it will stop

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
            this.stopat = Math.round(1000 * seconds / this.settings.updateInterval + this.numUpdates);
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
    update(logTime) {
        const startTime = new Date();
        
        let particlePromises = [];
        this.allParticles.forEach(particle => {
            particlePromises.push(new Promise(res => {
                this.getNeighbors(particle).then(neighbors => {
                    res(particle.updateForces(neighbors));
                });
            }));
        });
        Promise.all(particlePromises).then(_ => {
            particlePromises = [];
            this.allParticles.forEach(particle => {
                particlePromises.push(new Promise(res => {
                    const newPos = particle.update(this.settings.gravity, this.settings.friction, 1 / this.settings.accuracy);
                    const newDivisionCoords = this.getDivision(newPos.x, newPos.y);

                    // if not out of bounds
                    if (0 <= newDivisionCoords.y && newDivisionCoords.y < this.space.length && 
                        0 <= newDivisionCoords.x && newDivisionCoords.x < this.space[newDivisionCoords.y].length) {
                        
                        const newDivision = this.space[newDivisionCoords.y][newDivisionCoords.x];
                        if (particle.division === newDivision)
                            return; // don't do the rest
                        if (particle.division)
                            particle.division.delete(particle);
                        newDivision.add(particle);
                        particle.division = newDivision;
                    } else if (particle.division) { // if particle was in bounds before
                        particle.division.delete(particle);
                        particle.division = null;
                    }
                }));
            });

            Promise.all(particlePromises).then(_ => {
                if (this.settings.onUpdate)
                    this.settings.onUpdate();

                this.numUpdates ++;
                if (this.numUpdates === this.stopat)
                    this.stop();

                if (logTime)
                    console.log(new Date() - startTime);
            });
        });

    }
    // returns a set of particles that are within influence radius
    async getNeighbors(particle) {
        const regionsInCircle = new Set(); // regions for sure in the circle
        const possibleRegions = new Set(); // regions whose particles should be checked

        const posMinVals = this.getDivision(particle.position.x - particle.influenceRadius/2, particle.position.y - particle.influenceRadius/2);
        const posMaxVals = this.getDivision(particle.position.x + particle.influenceRadius/2, particle.position.y + particle.influenceRadius/2);
        for (let y = posMinVals.y; y < Math.ceil(posMaxVals.unroundedY); y ++) // minVals is already Math.floored
            for (let x = posMinVals.x; x < Math.ceil(posMaxVals.unroundedX); x ++)
                if (0 <= y && y < this.space.length && 0 <= x && x < this.space[y].length) {// if not out of bounds 
                    possibleRegions.add(this.space[y][x]);
                    if (!this.space[y][x])
                        console.log(y, x)
                }
        const inMinVals = this.getDivision(particle.position.x - particle.influenceRadius/2/Math.sqrt(2), particle.position.y - particle.influenceRadius/2/Math.sqrt(2));
        const inMaxVals = this.getDivision(particle.position.x + particle.influenceRadius/2/Math.sqrt(2), particle.position.y + particle.influenceRadius/2/Math.sqrt(2));
        for (let y = Math.ceil(inMinVals.unroundedY); y < inMaxVals.y; y ++) // maxVALS is already Math.ceiled
            for (let x = Math.ceil(inMinVals.unroundedX); x < inMaxVals.x; x ++)
                if (0 <= y && y < this.space.length && 0 <= x && x < this.space[y].length) {
                    regionsInCircle.add(this.space[y][x]);
                    possibleRegions.delete(this.space[y][x]); // if it is in the circle, it doesn't need to be checked
                }
        
        const particlesInRadius = new Set();
        regionsInCircle.forEach(region => {
            region.forEach(regionParticle => {
                particlesInRadius.add(regionParticle);
            });
        });
        let regionPromises = [];
        possibleRegions.forEach(region => {
            regionPromises.push(new Promise(res => {
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
                res();
            }));
        });
        await Promise.all(regionPromises);
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