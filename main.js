import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import sunTexture from './src/img/sun.jpg';
import mercuryTexture from './src/img/mercury.jpg';
import venusTexture from './src/img/venus.jpg';
import earthTexture from './src/img/earth.jpg';
import marsTexture from './src/img/mars.jpg';
import jupiterTexture from './src/img/jupiter.jpg';
import saturnTexture from './src/img/saturn.jpg';
import saturnRingTexture from './src/img/saturnRing.jpg';
import uranusTexture from './src/img/uranus.jpg';
import uranusRingTexture from './src/img/uranusRing.jpg';
import neptuneTexture from './src/img/neptune.jpg';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(-200, 300, 300);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333, 40, 100);
scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();

// Create the Sun
const sunGeo = new THREE.SphereGeometry(16, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
scene.add(pointLight);

// Function to create planets and add orbit paths
function createPlanet(size, texture, distanceFromSun, orbitSpeed, ring) {
  const planetObj = new THREE.Object3D();
  scene.add(planetObj);

  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshPhongMaterial({ map: textureLoader.load(texture) });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.x = distanceFromSun;
  planetObj.add(planet);

  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load(ring.texture),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.x = distanceFromSun; // Ensure the ring is centered on the planet
    ringMesh.rotation.x = -0.5 * Math.PI; // Rotate the ring to be horizontal
    planetObj.add(ringMesh); // Add the ring to the planetObj
  }

  // Orbit Path (Ellipse)
  const orbitPath = new THREE.EllipseCurve(0, 0, distanceFromSun, distanceFromSun);
  const pathPoints = orbitPath.getPoints(64);
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const pathMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbitLine = new THREE.Line(pathGeometry, pathMaterial);
  orbitLine.rotation.x = Math.PI / 2; // Rotate to be flat in the XY plane
  scene.add(orbitLine);

  return { planet, planetObj, orbitSpeed };
}

// Create Planets based on the image
const planets = [
  createPlanet(1.5, mercuryTexture, 28, 0.04), // Mercury
  createPlanet(3.5, venusTexture, 45, 0.015), // Venus
  createPlanet(4, earthTexture, 60, 0.01), // Earth
  createPlanet(2.5, marsTexture, 75, 0.008), // Mars
  createPlanet(11, jupiterTexture, 100, 0.003), // Jupiter
  createPlanet(9, saturnTexture, 140, 0.002, {
    innerRadius: 11,
    outerRadius: 20,
    texture: saturnRingTexture
  }), // Saturn with Rings
  createPlanet(7, uranusTexture, 175, 0.001, {
    innerRadius: 7.5,
    outerRadius: 15,
    texture: uranusRingTexture
  }), // Uranus with Rings
  createPlanet(6.5, neptuneTexture, 200, 0.0005), // Neptune
];

// Create stars background
function createStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

  const starVertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

createStars();

function animate() {
  sun.rotation.y += 0.001;

  planets.forEach((planet) => {
    planet.planet.rotation.y += 0.005;
    planet.planetObj.rotation.y += planet.orbitSpeed;
    planet.planetObj.position.x = planet.planetObj.position.x;
    planet.planetObj.position.z = planet.planetObj.position.z;
  });

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
