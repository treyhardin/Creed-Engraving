import './style.css'
import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// import creedModel from './public/'

// Scene Setup
const container = document.querySelector('#app')
const scene = new THREE.Scene();
scene.background = new THREE.Color('#F0F0F0')
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 2 );

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  envMapIntensity: 10,
  // logarithmicDepthBuffer: true,
});

THREE.ColorManagement.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls( camera, renderer.domElement );


const handleResize = () => {
  renderer.setSize( window.innerWidth, window.innerHeight );
}

handleResize();

window.addEventListener("resize", () => {
  handleResize()
})

// Load Model
let model;

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();


loader.load( '/CreedBottle_Optimized.glb', (glb) => {

  model = glb.scene
  const meshes = model.children[0].children
  let cap = meshes[0]
  let capTop = meshes[1]
  let labelFront = meshes[2]
  let logo = meshes[3]
  let glass = meshes[4]
  let labelBack = meshes[5]
  let foil = meshes[6]

  console.log(meshes)

  // Cap
  cap.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.0173,
    color: new THREE.Color('#090909')
  })


  // Cap Top
  capTop.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.0173,
    color: new THREE.Color('#090909'),
    // specularColor: 0xE7E7E7,
    // specularIntensity: 0.5,
  })

  textureLoader.load('textures/T_Material_001_N.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    capTop.material.normalMap= texture
  })
  

  // Label Front
  labelFront.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#232323'),
    normalScale: new THREE.Vector2(0.1, 0.1)
  })

  textureLoader.load('textures/T_AVENTUS_HOURSE_B.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    labelFront.material.map = texture
  })

  textureLoader.load('/textures/T_AVENTUS_HOURSE_MRA.png', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    labelFront.material.roughnessMap = texture
    labelFront.material.metalnessMap = texture
  })

  // Logo
  logo.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.0173,
    metalness: 0,
    color: new THREE.Color('#191919'),
    normalScale: new THREE.Vector2(0.1, 0.1),
  })

  // Label Back
  labelBack.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#191919'),
    normalScale: new THREE.Vector2(0.1, 0.1),
  })

  textureLoader.load('/textures/T_Backplate_B.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    labelBack.material.map = texture
  })

  textureLoader.load('/textures/T_Backplate_MRA.png', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    labelBack.material.roughnessMap = texture
    labelBack.material.metalnessMap = texture
  })

  // Foil
  foil.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#090909'),
    normalScale: new THREE.Vector2(1.0, 1.0),
  })

  textureLoader.load('/textures/T_Material_001_MRA.png', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    foil.material.roughnessMap = texture
    foil.material.metalnessMap = texture
  })

  textureLoader.load('/textures/T_Material_N.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    foil.material.normalMap = texture
  })
  

  // Glass
  glass.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.01,  
    transmission: 1,  
    metalness: 0,
    thickness: 0.5,
    clearcoat: 1.0,
    // ior: 2.0,
    clearcoatRoughness: 0.01,
    normalScale: new THREE.Vector2(0.05, 0.05),
    // side: THREE.DoubleSide
  })


  // Noise Normals
  textureLoader.load('/textures/Noise_Normal_Map.jpg', (texture) => {
    texture.flipY = false
    labelFront.material.normalMap = texture
    logo.material.normalMap = texture
    // glass.material.normalMap = texture
  })

  cap.material.needUpdate = true
  capTop.material.needUpdate = true
  labelFront.material.needUpdate = true
  logo.material.needUpdate = true
  glass.material.needUpdate = true;
  labelBack.material.needUpdate = true
  foil.material.needUpdate = true

  // Environment
  textureLoader.load('/env.hdr', (texture) => {
    scene.environment = texture
    texture.colorSpace = THREE.SRGBColorSpace
    texture.mapping = THREE.EquirectangularReflectionMapping
    meshes.forEach((mesh) => {
      mesh.material.envMap = texture
      mesh.material.envMapIntensity = 1.5
    })
  })

  glb.scene.position.y = -0.06;
  scene.add( glb.scene );

}, undefined, function ( error ) {
	console.error( error );
} );

// Add Light
// const light = new THREE.PointLight()
// light.intensity = 10
// light.position.y = 0
// light.position.z = 3
// scene.add(light)

// const ambientLight = new THREE.AmbientLight( 0xffffff);
// ambientLight.intensity = 3;
// scene.add(ambientLight)

const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 0, 3, 3 );
spotLight.lookAt(0, 0, 0)
spotLight.intensity = 10

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 10;

scene.add( spotLight );

// const width = 100;
// const height = 100;
// const intensity = 100;
// const rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
// rectLight.position.set( 5, 5, 0 );
// rectLight.lookAt( 0, 0, 0 );
// scene.add( rectLight )


camera.position.z = 0.2; 

function animate() {

  // if (model) model.rotation.y += 0.01

  controls.update();

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

container.appendChild( renderer.domElement );
