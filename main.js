import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import sunTexture from './src/img/sun.jpg';
import marsTexture from './src/img/mars.jpg';
import earthTexture from './src/img/earth.jpg';
import saturnTexture from './src/img/saturn.jpg';
import saturnRingTexture from './src/img/saturnRing.jpg'; // Ensure you have this texture

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

const ambient = new THREE.AmbientLight(0x333333);
scene.add(ambient);

const textureLoader = new THREE.TextureLoader();

// Create the Sun
const sunGeo = new THREE.SphereGeometry(12, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({
  map: textureLoader.load(sunTexture)
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const pointLight = new THREE.PointLight(0xffffff, 3, 300);
scene.add(pointLight);

// Function to create planets
function createPlanet(size, texture, position, ring) {
    const geometry = new THREE.SphereGeometry(size, 25, 20);
    const material = new THREE.MeshPhongMaterial({
      map: textureLoader.load(texture)
    });
    const planet = new THREE.Mesh(geometry, material);
    const planetObj = new THREE.Object3D;
    planetObj.add(planet);
    scene.add(planetObj);
    planetObj.position.x = position;

    if (ring) {
      const ringGeo = new THREE.RingGeometry(
        ring.innerRadius,
        ring.outerRadius, 64
      );
      const ringMat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(ring.texture),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -0.5 * Math.PI; // Rotate the ring to be horizontal
      planetObj.add(ringMesh); // Add ringMesh to the same planetObj as the planet
    }
    return {planet, planetObj};
}

// Create Mars
const mars = createPlanet(5, marsTexture, 20);
const earth = createPlanet(6, earthTexture, 40);

// Create Saturn with Rings
const saturn = createPlanet(8, saturnTexture, 80, {
  innerRadius: 10,
  outerRadius: 20,
  texture: saturnRingTexture
});

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
  mars.planet.rotation.y += 0.005;
  mars.planetObj.rotation.y += 0.001; 
  earth.planet.rotation.y += 0.005;
  earth.planetObj.rotation.y += 0.001;
  saturn.planet.rotation.y += 0.005;
  saturn.planetObj.rotation.y += 0.001; 

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
