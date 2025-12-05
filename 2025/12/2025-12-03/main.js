import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// --- Configuration ---
const SCENE_CONFIG = {
    bgColor: 0x050510,
    cameraPos: { x: 0, y: 0, z: 12 }
};

// --- State ---
let scene, camera, renderer, controls;
let raycaster, mouse;
let hoveredObj = null;
let draggedObj = null;
let dragPlane = null;

// Gesture State
let handLandmarker = null;
let webcamRunning = false;
let lastVideoTime = -1;
let gestureMode = false;
let isPinching = false;

// Objects
const objects = [];
let mainGroup = null;

// DOM Elements
const uiLoading = document.getElementById('loading');
const uiInfo = document.getElementById('info-panel');
const uiTitle = document.getElementById('info-title');
const uiDesc = document.getElementById('info-desc');
const btnClose = document.getElementById('close-info');
const btnGesture = document.getElementById('btn-gesture');
const video = document.getElementById('webcam');
const camPreview = document.getElementById('cam-preview');
const gestureGuide = document.getElementById('gesture-guide');
const virtualCursor = document.getElementById('virtual-cursor');

// --- Initialization ---
init();
initMediaPipe();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
        antialias: true,
        alpha: true // Important for background
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Controls (Disable rotation if we want a static "desk" feel, but user might still want to look around)
    // User said "background don't move". Usually this means 2D background.
    // We will keep controls but maybe limit them or just rely on drag.
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 20;
    controls.minDistance = 5;
    controls.enabled = false; // Disable camera movement to keep background static relative to objects? 
    // Actually, if background is scene.background, it moves WITH camera (it's a skybox). 
    // If we want it static like a wallpaper, we use CSS or a fullscreen quad.
    // Let's use CSS for the background to ensure it is absolutely static.

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffddaa, 3, 100);
    sunLight.position.set(10, 10, 10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    dragPlane = new THREE.Plane();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    btnClose.addEventListener('click', closeInfo);
    btnGesture.addEventListener('click', toggleGestureControl);

    // Load Assets & Build Scene
    loadAssets();
}

async function initMediaPipe() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
    });
    console.log("MediaPipe HandLandmarker loaded");
}

function loadAssets() {
    const textureLoader = new THREE.TextureLoader();
    const fontLoader = new FontLoader();

    // Load Textures
    const cardTexture = textureLoader.load('assets/card.jpg');
    const moonTexture = textureLoader.load('assets/moon.png');
    const parchmentTexture = textureLoader.load('assets/parchment.png');
    const mercuryTexture = textureLoader.load('assets/mercury.png');
    const roverTexture = textureLoader.load('assets/rover.png');
    const ps1Texture = textureLoader.load('assets/ps1.png');

    // Set Background via CSS for true static behavior
    document.body.style.backgroundImage = `url('assets/card.jpg')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    // Darken it
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.zIndex = '-1';
    document.body.appendChild(overlay);

    // Load Font
    fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/optimer_bold.typeface.json', (font) => {
        buildScene(moonTexture, parchmentTexture, mercuryTexture, roverTexture, ps1Texture, font);
        uiLoading.style.display = 'none';
    });
}

function buildScene(moonTex, parchmentTex, mercuryTex, roverTex, ps1Tex, font) {
    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Helper to create a "Sprite" (Plane with texture)
    const createSprite = (name, tex, x, y, z, w, h, title, desc) => {
        const geo = new THREE.PlaneGeometry(w, h);
        const mat = new THREE.MeshStandardMaterial({
            map: tex,
            transparent: true,
            alphaTest: 0.5,
            side: THREE.DoubleSide,
            roughness: 0.4
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.userData = { id: name, title, desc, isDraggable: true };

        // Add a backing box for thickness/shadow
        const boxGeo = new THREE.BoxGeometry(w * 0.8, h * 0.8, 0.1);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.z = -0.1;
        mesh.add(box);

        mainGroup.add(mesh);
        objects.push(mesh);
        return mesh;
    };

    // 1. Mercury (Left)
    createSprite('mercury', mercuryTex, -4, 0, 0, 3, 5,
        'Mercury (Hermes)',
        'The messenger of the gods. Today is Wednesday (Mercury Day).');

    // 2. Moon Rover (Center-Right)
    createSprite('rover', roverTex, 2, -2, 1, 3, 3,
        'Moon Rover',
        'ESA announces successful deployment of a new resource exploration rover on the lunar surface.');

    // 3. PlayStation (Bottom Right)
    createSprite('ps1', ps1Tex, 5, -3, 2, 2, 2,
        'PlayStation (1994)',
        'On this day in 1994, Sony released the original PlayStation (PS1).');

    // 4. The Moon (Top Right)
    const moonGeo = new THREE.SphereGeometry(1.5, 64, 64);
    const moonMat = new THREE.MeshStandardMaterial({
        map: moonTex,
        roughness: 0.8,
        bumpMap: moonTex,
        bumpScale: 0.05
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(3, 3, -1);
    moon.castShadow = true;
    moon.userData = {
        id: 'moon',
        title: 'ESA Moon Mission',
        desc: 'Large amounts of water ice found at the South Pole.',
        isDraggable: true
    };
    mainGroup.add(moon);
    objects.push(moon);

    // 5. Floating Text
    createFloatingText('Ozzy Osbourne', font, -4, 3, 0, {
        title: 'Musician Birthday',
        desc: 'Happy Birthday to the Prince of Darkness!'
    });
}

function createFloatingText(textStr, font, x, y, z, info) {
    const textGeo = new TextGeometry(textStr, {
        font: font,
        size: 0.3,
        height: 0.05,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 5
    });
    textGeo.center();

    const textMat = new THREE.MeshStandardMaterial({ color: 0xc0a062, metalness: 0.6, roughness: 0.2 });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(x, y, z);
    textMesh.lookAt(0, 0, 10);
    textMesh.userData = info;
    info.isDraggable = true;

    const box = new THREE.Box3().setFromObject(textMesh);
    const size = new THREE.Vector3();
    box.getSize(size);
    const planeGeo = new THREE.PlaneGeometry(size.x + 0.5, size.y + 0.5);
    const planeMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitPlane = new THREE.Mesh(planeGeo, planeMat);
    hitPlane.position.copy(textMesh.position);
    hitPlane.position.z -= 0.1;
    hitPlane.userData = info;

    mainGroup.add(textMesh);
    mainGroup.add(hitPlane);
    objects.push(hitPlane);
}

// --- Interaction ---

function onMouseMove(event) {
    if (gestureMode) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    handleDrag();
}

function onMouseDown(event) {
    if (gestureMode) return;
    if (hoveredObj) {
        startDrag(hoveredObj);
    }
}

function onMouseUp(event) {
    if (gestureMode) return;
    stopDrag();
}

function startDrag(obj) {
    draggedObj = obj;
    // Create a plane at the object's position facing the camera
    dragPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(dragPlane.normal), obj.position);

    // Optional: Visual feedback
    document.body.style.cursor = 'grabbing';
}

function stopDrag() {
    draggedObj = null;
    document.body.style.cursor = 'default';
}

function handleDrag() {
    if (draggedObj) {
        raycaster.setFromCamera(mouse, camera);
        const target = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane, target);
        if (target) {
            draggedObj.position.copy(target);
        }
    }
}

function onClick(event) {
    if (gestureMode) return;
    // Click logic is now handled by MouseDown/Up for drag, 
    // but we still want to show info if it was a click (short duration).
    // For simplicity, let's show info on hover or separate click?
    // Let's keep it simple: Drag to move. Click (without moving much) to show info.
}

function showInfo(data) {
    if (!data || !data.title) return;
    uiTitle.innerText = data.title;
    uiDesc.innerText = data.desc;
    uiInfo.classList.remove('hidden');
}

function closeInfo() {
    uiInfo.classList.add('hidden');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Gesture Control ---

function toggleGestureControl() {
    if (!handLandmarker) {
        alert("Gesture recognition is still loading. Please wait.");
        return;
    }

    if (webcamRunning) {
        webcamRunning = false;
        gestureMode = false;
        btnGesture.innerText = "Enable Gesture Control";
        camPreview.classList.add('hidden');
        gestureGuide.classList.remove('visible');
        virtualCursor.classList.remove('active');
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    } else {
        const constraints = { video: true };
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            video.srcObject = stream;
            video.addEventListener("loadeddata", () => {
                webcamRunning = true;
                gestureMode = true;
                btnGesture.innerText = "Disable Gesture Control";
                camPreview.classList.remove('hidden');
                gestureGuide.classList.add('visible');
                virtualCursor.classList.add('active');
            });
        });
    }
}

function predictWebcam() {
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        const startTimeMs = performance.now();
        const results = handLandmarker.detectForVideo(video, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];

            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];

            const rawX = 1 - indexTip.x;
            const rawY = indexTip.y;

            virtualCursor.style.left = `${rawX * 100}%`;
            virtualCursor.style.top = `${rawY * 100}%`;

            mouse.x = rawX * 2 - 1;
            mouse.y = -rawY * 2 + 1;

            const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);

            // Pinch Logic for Dragging
            if (pinchDist < 0.05) {
                virtualCursor.classList.add('clicking');
                if (!isPinching) {
                    isPinching = true;
                    // Start Drag if hovering
                    raycaster.setFromCamera(mouse, camera);
                    const intersects = raycaster.intersectObjects(objects);
                    if (intersects.length > 0) {
                        startDrag(intersects[0].object);
                        showInfo(intersects[0].object.userData); // Also show info
                    }
                }
            } else {
                virtualCursor.classList.remove('clicking');
                if (isPinching) {
                    isPinching = false;
                    stopDrag();
                }
            }

            // Update Drag Position
            handleDrag();
        }
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    if (webcamRunning) {
        predictWebcam();
    }

    const time = Date.now() * 0.0005;

    // Moon Rotation
    const moon = scene.children.find(c => c.userData && c.userData.id === 'moon');
    if (moon) {
        moon.rotation.y += 0.002;
    }

    // Raycasting for Hover
    if (!draggedObj) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (hoveredObj !== obj) {
                hoveredObj = obj;
                if (obj.material && obj.material.emissive) {
                    obj.currentHex = obj.material.emissive.getHex();
                    obj.material.emissive.setHex(0x444444);
                }
            }
        } else {
            if (hoveredObj) {
                if (hoveredObj.material && hoveredObj.material.emissive) {
                    hoveredObj.material.emissive.setHex(hoveredObj.currentHex);
                }
                hoveredObj = null;
            }
        }
    }

    controls.update();
    renderer.render(scene, camera);
}
