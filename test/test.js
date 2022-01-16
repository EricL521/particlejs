var svgns = "http://www.w3.org/2000/svg";
const particleContainer = document.getElementById("particle-container");
function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const system = new System(100, 20, 10, {
    updateInterval: 7.5, // milliseconds
    friction: Math.E/500
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
}, {
    x: 0, y: 0
}];
let masses = [];
let distances = [30];
let strengths = [];
for (let j = 0; j < 1; j ++)
    for (let i = 0; i < 3; i ++) {
        const particle = new Particle({
            mass: masses[3*j+i]? masses[3*j+i]: 100,
            position: {
                x: 900 + 50*j,
                y: 500 + 50*i
            },
            strength: strengths[3*j+i],
            targetDistance: distances[3*j+i],
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
        circle.setAttributeNS(null, "fill", rgbToHex(particle.mass/2, particle.strength * 10, 0));
        particleContainer.appendChild(circle);
    }

system.start();