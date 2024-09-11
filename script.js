// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create sphere geometry with small dots (particles)
const particleCount = 1000;
const geometry = new THREE.SphereGeometry(2, 32, 32);
const particles = new THREE.BufferGeometry();
const positions = [];

for (let i = 0; i < particleCount; i++) {
    const vertex = new THREE.Vector3();
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);

    vertex.x = 2 * Math.sin(theta) * Math.cos(phi);
    vertex.y = 2 * Math.sin(theta) * Math.sin(phi);
    vertex.z = 2 * Math.cos(theta);

    positions.push(vertex.x, vertex.y, vertex.z);
}

particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

camera.position.z = 5;

// Animation variables
let mouseX = 0;
let mouseY = 0;
let randomRotationSpeed = 0.0005; // Slower initial speed
const maxSpeed = 0.0015; // Limit for random speed

// Animate the sphere and make it react to cursor movement
function animate() {
    requestAnimationFrame(animate);

    particleSystem.rotation.y += randomRotationSpeed;
    particleSystem.rotation.x += randomRotationSpeed;

    // React to mouse movement with 'exploding' effect
    const distanceFromCenter = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
    if (distanceFromCenter < 50) {
        randomRotationSpeed = 0; // Stop rotating near the center
    } else {
        randomRotationSpeed = Math.random() * maxSpeed; // Random speed away from center
    }

    // Smooth follow effect for the mouse
    particleSystem.rotation.y += (mouseX / window.innerWidth - 0.5) * 0.02;
    particleSystem.rotation.x += (mouseY / window.innerHeight - 0.5) * 0.02;

    renderer.render(scene, camera);
}

// Update mouse movement
document.addEventListener('mousemove', function(event) {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
});

// Adjust camera and renderer when window is resized
window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Color animation, slower transition
let colorOffset = 0;
function updateColor() {
    colorOffset += 0.001;
    const color = new THREE.Color(`hsl(${(colorOffset * 360) % 360}, 100%, 50%)`);
    particleMaterial.color = color;

    // Update the footer glow color to match the sphere
    const footer = document.getElementById('footer');
    footer.style.boxShadow = `0 0 15px ${color.getStyle()}`;

    requestAnimationFrame(updateColor);
}

// Start the animations
animate();
updateColor();
