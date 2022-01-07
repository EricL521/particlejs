class ParticleSet extends Set {
    // stores a position, which should be {x, y}
    constructor(position, ...args) {
        super(...args);

        this.position = position;
    }
}