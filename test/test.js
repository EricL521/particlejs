var svgns = "http://www.w3.org/2000/svg";
const particleContainer = document.getElementById("particle-container");

const system = new System(100, 20, 10, {
    updateInterval: 10 // milliseconds
});

let locations = [{
    x: 990, y: 500
}, {
    x: 1050, y: 500
}, {
    x: 1000, y: 570
}];
let velocities = [{
    x: 0, y: 0.5
}];
let masses = [10, 10, 10];
for (let i = 0; i < 2; i ++) {
    const particle = new Particle({
        mass: 10,
        position: {
            x: 800 + 55 * i,
            y: 500
        },
        velocity: velocities[i]
    }, (thisParticle) => {
        circle.setAttributeNS(null, "cx", thisParticle.position.x);
        circle.setAttributeNS(null, "cy", thisParticle.position.y);
    });

    system.addParticle(particle);

    const circle = document.createElementNS(svgns, "circle");
    circle.id = "particle" + i;
    circle.setAttributeNS(null, "r", particle.targetDistance);
    circle.setAttributeNS(null, "cx", particle.position.x);
    circle.setAttributeNS(null, "cy", particle.position.y);
    circle.setAttributeNS(null, "draggable", true);
    particleContainer.appendChild(circle);
}

system.start();