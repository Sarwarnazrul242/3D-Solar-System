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
camera.position.set(-90, 140, 140);
orbit.update();

const ambient = new THREE.AmbientLight(0x333333, 40 ,100);
scene.add(ambient);

const textureLoader = new THREE.TextureLoader();

// Create the Sun
const sunGeo = new THREE.SphereGeometry(16, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const pointLight = new THREE.PointLight(0xffffff, 3, 300);
scene.add(pointLight);

function createPlanet(size, texture, distanceFromSun, orbitRadius, orbitSpeed, ring) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshPhongMaterial({ map: textureLoader.load(texture) });
  const planet = new THREE.Mesh(geometry, material);
  const planetObj = new THREE.Object3D();
  planetObj.add(planet);
  scene.add(planetObj);

  planet.position.x = distanceFromSun;

  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load(ring.texture),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -0.5 * Math.PI;
    planetObj.add(ringMesh);
  }

  return { planet, planetObj, orbitRadius, orbitSpeed };
}

// Create Planets based on the image
const planets = [
  createPlanet(1.5, mercuryTexture, 28, 20, 0.004), // Mercury
  createPlanet(3.5, venusTexture, 50, 40, 0.0015), // Venus
  createPlanet(4, earthTexture, 75, 60, 0.001), // Earth
  createPlanet(2.5, marsTexture, 115, 80, 0.0008), // Mars
  createPlanet(11, jupiterTexture, 200, 120, 0.0003), // Jupiter
  createPlanet(9, saturnTexture, 300, 160, 0.0002, {
    innerRadius: 11,
    outerRadius: 20,
    texture: saturnRingTexture
  }), // Saturn with Rings
  createPlanet(7, uranusTexture, 400, 200, 0.0001, {
    innerRadius: 7.5,
    outerRadius: 15,
    texture: uranusRingTexture
  }), // Uranus with Rings
  createPlanet(6.5, neptuneTexture, 500, 240, 0.00005), // Neptune
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
    planet.planetObj.position.x = planet.orbitRadius * Math.cos(planet.planetObj.rotation.y);
    planet.planetObj.position.z = planet.orbitRadius * Math.sin(planet.planetObj.rotation.y);
  });

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
