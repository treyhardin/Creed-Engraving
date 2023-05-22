import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Scene
const container = document.querySelector('#app')
const scene = new THREE.Scene();
scene.background = new THREE.Color('#000000')
THREE.ColorManagement.enabled = true;

// Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 20 );

camera.position.set(0, 0, 0.2);
camera.rotation.x = 0;
let cameraTarget = new THREE.Vector3(0, 0, 0.2);
let cameraLocked = false;

// Toggle Preview
const previewButton = document.querySelector('#preview-button')

const lockCamera = () => {
  cameraLocked = true;
  cameraTarget = new THREE.Vector3(-0.02, -0.01, -0.09);
  controls.enabled = false;
  previewButton.innerHTML = 'Exit'
}

const unlockCamera = () => {
  cameraTarget = new THREE.Vector3(0, 0, 0.2);
  controls.enabled = true;
  previewButton.innerHTML = 'Preview'
  setTimeout(() => {
    cameraLocked = false
  }, 1000)
}

const handlePreviewClick = () => {
  cameraLocked ? unlockCamera() : lockCamera()
}

previewButton.addEventListener("click", handlePreviewClick)

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  powerPreference: "high-performance",
  outputColorSpace: THREE.SRGBColorSpace,
  logarithmicDepthBuffer: true,
  shadowMap: {
    enabled: false,
  },
  lookAt: (0, 0, 0)
});
renderer.setPixelRatio(window.devicePixelRatio)

// Controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxPolarAngle = Math.PI / 2
controls.minPolarAnge = 0



// Resize
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

document.addEventListener('focusout', handleResize)

handleResize();

window.addEventListener("resize", () => {
  handleResize()
})


// Loading Manager
const preloader = document.querySelector('#preloader')
const progress = document.querySelector('#progress')

const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
  const progressPercentage = itemsLoaded / itemsTotal
  progress.style.width = progressPercentage * 100 + '%'
};
loadingManager.onLoad = function ( ) {
	preloader.classList.add('hidden')
};

// Loaders
const loader = new GLTFLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath( 'draco/gltf/' );
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);
const hdrLoader = new RGBELoader(loadingManager);


// Load Model
let model, envMap;
const sceneGroup = new THREE.Group

loader.load('/aventus.glb', (glb) => {

  model = glb.scene

  const meshes = model.children[0].children
  
  // Cap
  let cap = meshes[6]
  cap.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.2,
    metalness: 0.8,
    color: new THREE.Color('#000000')
    // color: new THREE.Color('#1C1C1C')
  })


  // Cap Top
  let capTop = meshes[5]
  capTop.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.2,
    color: new THREE.Color('#090909'),
  })

  textureLoader.load('textures/logo_NORMAL.png', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    capTop.material.normalMap = texture
  })
  
  // Label Front
  let labelFront = meshes[1]
  labelFront.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#f0f0f0'),
    normalScale: new THREE.Vector2(0.2, 0.2),
    metalness: 1,
    roughness: 0.1,
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
  let logo = meshes[2]
  logo.material = new THREE.MeshPhysicalMaterial({ 
    roughness: 0.4,
    metalness: 0.9,
    // color: new THREE.Color('#191919'),
    color: new THREE.Color('#000000'),
    normalScale: new THREE.Vector2(0.1, 0.1),
  })

  // Glass
  let glass = meshes[0]
  glass.material = new THREE.MeshPhysicalMaterial({ 
    // color: new THREE.Color('#f6f6f6'),
    roughness: 0.05,  
    // transmission: 0.95,
    transmission: 0.999,  
    metalness: 0,
    // thickness: 0.01,
    normalScale: new THREE.Vector2(0.05, 0.05),
  })

  // Label Back
  let labelBack = meshes[3]
  labelBack.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#232323'),
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
  let foil = meshes[4]
  foil.material = new THREE.MeshPhysicalMaterial({ 
    color: new THREE.Color('#090909'),
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 5,
    metalness: 1,
    side: THREE.DoubleSide
  })

  textureLoader.load('/textures/T_Material_001_MRA.jpg', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    foil.material.roughnessMap = texture
    foil.material.metalnessMap = texture
  })

  textureLoader.load('/textures/T_Material_001_N.png', (texture) => {
    texture.flipY = false
    texture.colorSpace = THREE.SRGBColorSpace
    foil.material.normalMap = texture
    capTop.material.normalMap= texture
  })

  // Environment
  
  hdrLoader.load('/env_studio.hdr', (texture) => {

    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    envMap = texture
    meshes.forEach((mesh) => {
      mesh.material.envMap = envMap
      mesh.material.envMapIntensity = 1
    })
  })

  sceneGroup.add(model)
  // sceneGroup.position.y = -0.06;

}, undefined, function ( error ) {
	console.error( error );
} );

// Lights
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 1, 0.6, 1 );
spotLight.lookAt(-0.2, -0.6, 0)
// spotLight.intensity = 15
spotLight.intensity = 5
spotLight.angle = Math.PI / 4

const backLight = new THREE.SpotLight( 0xffffff );
backLight.position.set( -0.4, 0.5, -0.5 );
backLight.lookAt(0, 0, -2.5)
// backLight.intensity = 20
backLight.intensity = 10
backLight.angle = Math.PI / 8

// const ambientLight = new THREE.AmbientLight( 0xffffff );
// ambientLight.intensity = 20


// const spotHelper = new THREE.SpotLightHelper(backLight)
// scene.add(spotHelper)

scene.add( sceneGroup, spotLight, backLight );



// Load Font
const fontLoader = new FontLoader();

let calibriFont, garamondFont, carattereFont
let textMaterial
let textMeshLine1, textMeshLine2
let currentFont

// Text Material
textMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color('white'),
})

// Update Engraving
const updateLine1 = () => {
  lockCamera()
  updateText(engravingTextLine1.value, 1, 0.02)
}

const updateLine2 = () => {
  lockCamera()
  updateText(engravingTextLine2.value, 2, 0.014)
}

// Live Text Input
const engravingTextLine1 = document.querySelector('#engraving-text-line1')
engravingTextLine1.addEventListener("input", updateLine1)

const engravingTextLine2 = document.querySelector('#engraving-text-line2')
engravingTextLine2.addEventListener("input", updateLine2)

// Live Text Font
const engravingFont = document.querySelector('#engraving-font')
engravingFont.addEventListener("change", () => { 
  updateLine1() 
  updateLine2() 
})

const updateText = (text, line, positionY) => {

  let mesh
  currentFont = engravingFont.value

  if (line == 1 && textMeshLine1) {
    scene.remove(textMeshLine1)
  }

  if (line == 2 && textMeshLine2) {
    scene.remove(textMeshLine2)
  }

  const createTextGeometry = (font, mesh) => {

    const textGeometry = new TextGeometry( text, {
      font: font,
      size: 0.004,
      height: 0.0001,
      curveSegments: 12,
    } );

    if (line == 1) {
      textMeshLine1 = mesh = new THREE.Mesh(textGeometry, textMaterial)
      mesh = textMeshLine1
    }

    if (line == 2) {
      textMeshLine2 = mesh = new THREE.Mesh(textGeometry, textMaterial)
      mesh = textMeshLine2
    }

    textGeometry.computeBoundingBox();
    const center = textGeometry.boundingBox.getCenter(new THREE.Vector3());

    mesh.position.x = center.x
    mesh.position.y = positionY
    mesh.position.z = -0.014
    mesh.rotateY(Math.PI)

    scene.add(mesh)
  }

  if (currentFont == 'garamond' && !garamondFont) {
    fontLoader.load( '/fonts/Garamond_Regular.json', function ( font ) {
      createTextGeometry(font, mesh)
      garamondFont = font
    } );
  }

  if (currentFont == 'calibri' && !calibriFont) {
    fontLoader.load( '/fonts/Calibri_Regular.json', function ( font ) {
      createTextGeometry(font, mesh)
      calibriFont = font
    } );
  }

  if (currentFont == 'carattere' && !carattereFont) {
    fontLoader.load( '/fonts/Carattere_Regular.json', function ( font ) {
      createTextGeometry(font, mesh)
      carattereFont = font
    } );
  }

  if (currentFont == 'garamond' && garamondFont) {
    createTextGeometry(garamondFont, mesh)
  }

  if (currentFont == 'calibri' && calibriFont) {
    createTextGeometry(calibriFont, mesh)
  }

  if (currentFont == 'carattere' && carattereFont) {
    createTextGeometry(carattereFont, mesh)
  }

}

const animateCamera = () => {

}

// Animate
function animate() {

  if (cameraLocked) {
    camera.position.lerp(cameraTarget, 0.1);
  }
  
  controls.update();
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}
animate();

container.appendChild( renderer.domElement );
