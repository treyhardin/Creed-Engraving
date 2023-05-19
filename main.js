import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


// Scene Setup
const container = document.querySelector('#app')
const scene = new THREE.Scene();
scene.background = new THREE.Color('#F0F0F0')
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 20 );
camera.position.z = 0.2; 

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

THREE.ColorManagement.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = false;

const controls = new OrbitControls( camera, renderer.domElement );

const handleResize = () => {
  renderer.setSize( window.innerWidth, window.innerHeight );
}

handleResize();

window.addEventListener("resize", () => {
  handleResize()
})

// SCENE

const sceneGroup = new THREE.Group
const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

// Load Model
let model, envMap;

loader.load( '/CreedBottle_Optimized_NoTexture.glb', (glb) => {

  model = glb.scene

  const meshes = model.children[0].children
  
  // Cap
  let cap = meshes[0]
  cap.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.0173,
    color: new THREE.Color('#090909')
  })


  // Cap Top
  let capTop = meshes[1]
  capTop.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.0173,
    color: new THREE.Color('#090909'),
  })

  textureLoader.load('textures/T_Material_001_N.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    capTop.material.normalMap= texture
  })
  
  // Label Front
  let labelFront = meshes[2]
  labelFront.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#232323'),
    normalScale: new THREE.Vector2(0.1, 0.1),
    envMap: envMap,
    envMapIntensity: 0.6,
  })

  textureLoader.load('textures/T_AVENTUS_HOURSE_B.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    labelFront.material.map = texture
  })

  textureLoader.load('/textures/T_AVENTUS_HOURSE_MRA.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    labelFront.material.roughnessMap = texture
    labelFront.material.metalnessMap = texture
  })


  // Logo
  let logo = meshes[3]
  logo.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.0173,
    metalness: 0,
    color: new THREE.Color('#191919'),
    normalScale: new THREE.Vector2(0.1, 0.1),
  })

  // Glass
  let glass = meshes[4]
  glass.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.01,  
    transmission: 0.95,  
    metalness: 0,
    thickness: 0.25,
    normalScale: new THREE.Vector2(0.05, 0.05),
  })

  // Label Back
  let labelBack = meshes[5]
  labelBack.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#191919'),
    normalScale: new THREE.Vector2(0.1, 0.1),
  })

  textureLoader.load('/textures/T_Backplate_B.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    labelBack.material.map = texture
  })

  textureLoader.load('/textures/T_Backplate_MRA.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    labelBack.material.roughnessMap = texture
    labelBack.material.metalnessMap = texture
  })

  // Foil
  let foil = meshes[6]
  foil.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#090909'),
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 5,
    metalness: 1,
    side: THREE.DoubleSide
    // envMapIntensity: 20,
  })

  textureLoader.load('/textures/T_Material_001_MRA.jpg', (texture) => {
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

  // Environment
  const hdrLoader = new RGBELoader;
  hdrLoader.load('/env.hdr', (texture) => {

    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace
    envMap = texture
    meshes.forEach((mesh) => {
      mesh.material.envMap = envMap
      mesh.material.envMapIntensity = 0.8
      // mesh.material.needUpdate = true
    })
  })

  sceneGroup.add(model)
  sceneGroup.position.y = -0.06;

}, undefined, function ( error ) {
	console.error( error );
} );

// Lights
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 1, 0.3, 1 );
spotLight.lookAt(0, 0, 0)
spotLight.intensity = 15
spotLight.angle = Math.PI / 4

const backLight = new THREE.SpotLight( 0xffffff );
backLight.position.set( -0.4, 0.8, -1 );
backLight.lookAt(0, 0, -0.12)
backLight.intensity = 20
backLight.angle = Math.PI / 3

// const spotHelper = new THREE.SpotLightHelper(backLight)
// scene.add(spotHelper)

// const pointLight = new THREE.PointLight( 0xffffff );
// pointLight.position.set( -0.5, 0.1, -1.5 );
// backLight.intensity = 500

// const helper = new THREE.PointLightHelper(pointLight)
// scene.add(helper)

scene.add( sceneGroup, spotLight, backLight );

// Animate
function animate() {

  controls.update();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

container.appendChild( renderer.domElement );
