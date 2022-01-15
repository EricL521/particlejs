var svgns = "http://www.w3.org/2000/svg";
const particleContainer = document.getElementById("particle-container");

const system = new System(100, 20, 10, {
    updateInterval: 7.5 // milliseconds
});

let locations = [{
    x: 950, y: 500
}, {
    x: 1001, y: 500
}, {
    x: 950, y: 551
}, {
    x: 1001, y: 551
}];
let velocities = [{
    x: 0, y: 0
}];
let masses = [10, 10, 10, 10, 10, 10];
for (let j = 0; j < 3; j ++)
    for (let i = 0; i < 3; i ++) {
        const particle = new Particle({
            mass: 100,
            position: {
                x: 900 + 51*j,
                y: 400 + 51*i
            },
            velocity: velocities[3*j+i]
        }, (thisParticle) => {
            circle.setAttributeNS(null, "cx", thisParticle.position.x);
            circle.setAttributeNS(null, "cy", thisParticle.position.y);
        });

        system.addParticle(particle);

        const circle = document.createElementNS(svgns, "circle");
        circle.id = "particle" + (3*j+i);
        circle.setAttributeNS(null, "r", particle.radius);
        circle.setAttributeNS(null, "cx", particle.position.x);
        circle.setAttributeNS(null, "cy", particle.position.y);
        circle.setAttributeNS(null, "draggable", true);
        particleContainer.appendChild(circle);
    }

system.start();