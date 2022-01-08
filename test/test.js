var svgns = "http://www.w3.org/2000/svg";
const particleContainer = document.getElementById("particle-container");

const system = new System(100, 20, 10, {
    updateInterval: 20 // milliseconds
});

let locations = [{
    x: 990, y: 500
}, {
    x: 1050, y: 500
}, {
    x: 1000, y: 550
}];
let velocities = [{
    x: 1, y: 0
}];
let masses = [1, 5, 20];
for (let i = 0; i < 3; i ++) {
    const particle = new Particle({
        mass: masses[i],
        position: locations[i],
        velocity: velocities[i]
    }, (thisParticle) => {
        circle.setAttributeNS(null, "cx", thisParticle.position.x);
        circle.setAttributeNS(null, "cy", thisParticle.position.y);
    });

    const circle = document.createElementNS(svgns, "circle");
    circle.id = "particle" + i;
    circle.setAttributeNS(null, "r", particle.targetDistance);
    circle.setAttributeNS(null, "cx", particle.position.x);
    circle.setAttributeNS(null, "cy", particle.position.y);
    particleContainer.appendChild(circle);

    system.addParticle(particle);

}

system.start();