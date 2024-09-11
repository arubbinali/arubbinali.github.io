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

// Set up the new explosion effect
const explosionDuration = 1000; // 1 second
const maxExplosionParticles = 500;

// Create a container for explosion particles
const explosionContainer = document.createElement('div');
explosionContainer.className = 'explosion';
document.body.appendChild(explosionContainer);

function createExplosion(x, y) {
    const explosionGeometry = new THREE.BufferGeometry();
    const explosionParticles = [];
    const positions = [];

    for (let i = 0; i < maxExplosionParticles; i++) {
        const vertex = new THREE.Vector3();
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 2;

        vertex.x = distance * Math.cos(angle);
        vertex.y = distance * Math.sin(angle);
        vertex.z = Math.random() * 2 - 1;

        positions.push(vertex.x, vertex.y, vertex.z);
    }

    explosionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const explosionMaterial = new THREE.PointsMaterial({
        color: 0xff0000,
        size: 0.1,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 1
    });

    const explosionSystem = new THREE.Points(explosionGeometry, explosionMaterial);
    scene.add(explosionSystem);

    setTimeout(() => {
        scene.remove(explosionSystem);
    }, explosionDuration);

    // CSS animation for visual explosion effect
    const explosionDiv = document.createElement('div');
    explosionDiv.style.width = '100px';
    explosionDiv.style.height = '100px';
    explosionDiv.style.borderRadius = '50%';
    explosionDiv.style.background = 'radial-gradient(circle, rgba(255,0,0,1) 0%, rgba(255,255,255,0) 70%)';
    explosionDiv.style.position = 'absolute';
    explosionDiv.style.top = `${y}px`;
    explosionDiv.style.left = `${x}px`;
    explosionDiv.style.transform = 'translate(-50%, -50%)';
    explosionDiv.style.pointerEvents = 'none';
    explosionDiv.style.animation = `explode ${explosionDuration}ms forwards`;
    explosionContainer.appendChild(explosionDiv);

    setTimeout(() => {
        explosionContainer.removeChild(explosionDiv);
    }, explosionDuration);
}

// Add event listener to the button
document.getElementById('explosionButton').addEventListener('click', (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createExplosion(x, y);
});

updateColor();
animate();