import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene Setup
const container = document.querySelector('#app')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();

const handleResize = () => {
  renderer.setSize( window.innerWidth, window.innerHeight );
  // camera.setAsp = window.innerWidth / window.innerHeight
}

handleResize();

window.addEventListener("resize", () => {
  handleResize()
})

// Load Model
let model;

const loader = new GLTFLoader();
loader.load( '/creed_bottle.glb', (glb) => {
  model = glb
  // console.log(glb)
  const bottle = glb.scene.children[2]
  bottle.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0,  
    transmission: 1,  
    thickness: 0.95, // Add refraction!
  })
  scene.add( glb.scene );
}, undefined, function ( error ) {
	console.error( error );
} );

// Add Light
const light = new THREE.PointLight()
light.intensity = 10
light.position.y = 1
light.position.z = 1
scene.add(light)


camera.position.y = 0.05;
camera.position.z = 0.2;

function animate() {

  if (model) model.scene.rotation.y += 0.01

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

container.appendChild( renderer.domElement );
