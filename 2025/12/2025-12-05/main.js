import './style.css'
import * as THREE from 'three'

// --- Scene Setup ---
const scene = new THREE.Scene();
// Add a subtle fog to blend objects into the background
scene.fog = new THREE.FogExp2(0x1a1a1a, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg-canvas'),
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased intensity
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffd700, 2, 100); // Increased intensity
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const blueLight = new THREE.PointLight(0x4444ff, 1.5, 100); // Increased intensity
blueLight.position.set(-10, -5, 5);
scene.add(blueLight);

// --- Particles (Stars/Dust) ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  // Spread particles wide
  posArray[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.02,
  color: 0xffd700,
  transparent: true,
  opacity: 0.8,
  // blending: THREE.AdditiveBlending // Removed to match solid style
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- Floating 3D Objects (Cubes with Textures) ---
// Since we don't have actual 3D models, we'll use Cubes textured with the generated images
// to represent the "objects" floating in the background.

const loader = new THREE.TextureLoader();

// Helper to create a floating object
function createFloatingObject(imagePath, x, y, z, size = 1.5) {
  const geometry = new THREE.BoxGeometry(size, size, 0.1); // Flat box like a card
  // Custom ShaderMaterial to key out black background
  const material = new THREE.ShaderMaterial({
    uniforms: {
      textureMap: { value: loader.load(imagePath) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D textureMap;
      varying vec2 vUv;
      void main() {
        vec4 color = texture2D(textureMap, vUv);
        // Calculate brightness
        float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        // If black (or very dark), discard
        if (brightness < 0.1) discard;
        gl_FragColor = vec4(color.rgb, 1.0); // Force full opacity for non-black pixels
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);

  // Random initial rotation
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;

  scene.add(mesh);
  return {
    mesh,
    speedX: (Math.random() - 0.5) * 0.005,
    speedY: (Math.random() - 0.5) * 0.005,
    rotSpeedX: (Math.random() - 0.5) * 0.01,
    rotSpeedY: (Math.random() - 0.5) * 0.01
  };
}

// Helper to create a floating object with video texture
function createVideoObject(videoPath, x, y, z, size = 1.5) {
  const video = document.createElement('video');
  video.src = videoPath;
  video.loop = true;
  video.muted = true; // Required for autoplay
  video.play();

  const videoTexture = new THREE.VideoTexture(video);
  const geometry = new THREE.BoxGeometry(size, size, 0.1);
  const material = new THREE.MeshBasicMaterial({ // Use BasicMaterial for video to be bright
    map: videoTexture,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);

  // Random initial rotation
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;

  scene.add(mesh);
  return {
    mesh,
    speedX: (Math.random() - 0.5) * 0.005,
    speedY: (Math.random() - 0.5) * 0.005,
    rotSpeedX: (Math.random() - 0.5) * 0.01,
    rotSpeedY: (Math.random() - 0.5) * 0.01
  };
}

const floatingObjects = [
  // Objects removed as requested
];

// --- Mouse Interaction ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;

  const elapsedTime = clock.getElapsedTime();

  // Rotate particles slowly
  particlesMesh.rotation.y = elapsedTime * 0.05;
  particlesMesh.rotation.x = mouseY * 0.0001;

  // Animate floating objects
  floatingObjects.forEach(obj => {
    obj.mesh.rotation.x += obj.rotSpeedX;
    obj.mesh.rotation.y += obj.rotSpeedY;

    // Gentle floating movement
    obj.mesh.position.y += Math.sin(elapsedTime + obj.mesh.position.x) * 0.002;

    // Mouse parallax effect on objects
    obj.mesh.rotation.x += 0.05 * (targetY - obj.mesh.rotation.x);
    obj.mesh.rotation.y += 0.05 * (targetX - obj.mesh.rotation.y);
  });

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
}

animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- Card Video Hover Logic ---
document.querySelectorAll('.glass-card').forEach(card => {
  const video = card.querySelector('.card-video');
  if (video) {
    card.addEventListener('mouseenter', () => {
      video.play().catch(e => console.log('Video play failed:', e));
    });
    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0; // Reset to start
    });
  }
});
