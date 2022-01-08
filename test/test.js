var svgns = "http://www.w3.org/2000/svg";
const particleContainer = document.getElementById("particle-container");

const system = new System(100, 20, 10, {
    updateInterval: 50 // milliseconds
});

let locations = [990, 1050]
for (let i = 0; i < 2; i ++) {
    const particle = new Particle({x: locations[i], y: 500}, (thisParticle) => {
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