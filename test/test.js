var svgns = "http://www.w3.org/2000/svg";
const particleContainer = document.getElementById("particle-container");

// allow dragging
const mouseParticle = new Particle({
    position: {x: 0, y: 0},
    targetDistance: 0,
    strength: 50,
    mass: 100
});
window.addEventListener("mousemove", (e) => {
    const size = particleContainer.getBoundingClientRect();
    mouseParticle.position = {x: e.offsetX * 1920 / size.width, y: e.offsetY * 1080 / size.height};
});
let onUpdate = () => {
    if (selectedParticle && 
        selectedParticle.targetDistance + mouseParticle.targetDistance <= Math.sqrt(Math.pow(selectedParticle.position.x - mouseParticle.position.x, 2) + Math.pow(selectedParticle.position.y - mouseParticle.position.y, 2)))
        selectedParticle.interact(mouseParticle, 1);
};

const system = new System(100, 20, 10, {
    updateInterval: 5, // milliseconds
    friction: Math.E/25,
    onUpdate: onUpdate
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
let distances = []
let strengths = [];
const height = 4;
for (let j = 0; j < 4; j ++)
    for (let i = 0; i < height; i ++) {
        const particle = new Particle({
            mass: masses[height*j+i],
            position: {
                x: 800 + 55*j,
                y: 400 + 55*i
            },
            strength: strengths[height*j+i],
            targetDistance: distances[height*j+i],
            velocity: velocities[height*j+i]
        }, (thisParticle) => {
            circle.setAttributeNS(null, "cx", thisParticle.position.x);
            circle.setAttributeNS(null, "cy", thisParticle.position.y);
        });

        system.addParticle(particle);

        const circle = document.createElementNS(svgns, "circle");
        circle.id = "particle" + (height*j+i);
        circle.setAttributeNS(null, "r", particle.radius);
        circle.setAttributeNS(null, "cx", particle.position.x);
        circle.setAttributeNS(null, "cy", particle.position.y);
        circle.setAttributeNS(null, "draggable", true);
        circle.setAttributeNS(null, "fill", `rgb(${particle.mass/2}, ${particle.strength * 10}, 0)`);
        particleContainer.appendChild(circle);

        circle.addEventListener("mousedown", () => {
            selectedParticle = particle;
        });
    }
let selectedParticle = null;
window.addEventListener("mouseup", () => {
    selectedParticle = null;
});

system.start();