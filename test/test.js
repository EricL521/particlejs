var svgns = "http://www.w3.org/2000/svg";
const particleContainer = document.getElementById("particle-container");

// allow dragging
const mouseParticle = new Particle({
    position: {x: 0, y: 0},
    targetDistance: 0,
    strength: 100,
    stationary: true
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

const system = new System(100, 20, 11, {
    updateInterval: 5, // milliseconds, note: update testing with ~ 200 particle, update calculating time took around 1 ms
    // friction: Math.E/100,
    accuracy: 10, // higher accuracy means more accuracy, but slower run
    gravity: {x: 0, y: 0},
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
}, {
    x: 0, y: 0
}];
let masses = [1600];
let distances = [100];
let strengths = [100];
const height = 6;
for (let j = 0; j < 6; j ++)
    for (let i = 0; i < height; i ++) {
        const particle = new Particle({
            mass: masses[height*j+i],
            position: {
                x: 800 + 40*j,
                y: 400 + 40*i
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
        circle.setAttributeNS(null, "fill", `rgb(${particle.mass/2}, ${particle.strength * 10}, ${255 * Math.random()})`);
        particleContainer.appendChild(circle);

        circle.addEventListener("mousedown", () => {
            selectedParticle = particle;
        });
    }

for (let j = 0; j < 2; j ++)
    for (let i = 0; i < 64; i ++) {
        const particle = new Particle({
            stationary: true,
            position: {x: 30 * i, y: 1080 * j},
            strength: 20,
            targetDistance: 40,
            influenceRadius: 60,
            repelOnly: true,
            unblockable: true,
        });
        system.addParticle(particle);
    }
for (let i = 0; i < 2; i ++)
    for (let j = 0; j < 36; j ++) {
        const particle = new Particle({
            stationary: true,
            position: {x: 1920 * i, y: 30 * j},
            strength: 20,
            targetDistance: 40,
            influenceRadius: 60,
            repelOnly: true,
            unblockable: true,
        })
        system.addParticle(particle);
    }

let selectedParticle = null;
window.addEventListener("mouseup", () => {
    selectedParticle = null;
});

system.start();