const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();

// Camera params: field of view, aspect ratio, near, far
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // Transparent bg to blend with CSS bg-color
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Fog for depth
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);

// Objects
const shapes = [];

// Helper to create wireframe shapes
function createWireframeShape(geometry, color, x, y, z) {
    const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    shapes.push({ mesh, speedX: Math.random() * 0.01, speedY: Math.random() * 0.01 });
    return mesh;
}

// Add some Icosahedrons
for (let i = 0; i < 5; i++) {
    const geometry = new THREE.IcosahedronGeometry(Math.random() * 4 + 2, 0);
    const color = Math.random() > 0.5 ? 0x00f2ff : 0xff00ff; // Cyan or Magenta
    const x = (Math.random() - 0.5) * 50;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 20 - 10;
    createWireframeShape(geometry, color, x, y, z);
}

// Starfield particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100; // Spread out
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse interaction tracking
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate shapes
    shapes.forEach(item => {
        item.mesh.rotation.x += item.speedX;
        item.mesh.rotation.y += item.speedY;
    });

    // Rotate starfield slowly
    particlesMesh.rotation.y += 0.0005;
    particlesMesh.rotation.x += 0.0002;

    // Slight parallax on camera based on mouse
    camera.position.x += (mouseX * 0.001 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.001 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});
