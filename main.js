import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Flow } from 'three/addons/modifiers/CurveModifier.js';
import { MeshBasicMaterial } from 'three';

THREE.ColorManagement.enabled = true;
const cursor = document.querySelector('#custom-cursor')

// Scene
const container = document.querySelector('#app')
const scene = new THREE.Scene();
scene.background = new THREE.Color('#000000')

// Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 20 );
let cameraTarget = new THREE.Vector3(0, 0, 0.15);
camera.position.copy(cameraTarget)
camera.rotation.x = 0;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  outputColorSpace: THREE.SRGBColorSpace,
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
controls.maxPolarAngle = Math.PI / 1.5
controls.minPolarAngle = Math.PI / 6
controls.autoRotate = true
controls.autoRotateSpeed = 1
controls.update()

let orbitTarget

// Resize
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

handleResize();

window.addEventListener("resize", handleResize)
// window.visualViewport.addEventListener('resize', handleResize);


// Camera Animation
const lockCamera = () => {
  orbitTarget = new THREE.Vector3(cameraTarget.x, cameraTarget.y, - cameraTarget.z)
  controls.enabled = false
}

const unlockCamera = () => {
  orbitTarget = null
  controls.enabled = true
}

// Custom Cursor

const moveCustomCursor = (e) => {

  const posX = e.pageX
  const posY = e.pageY

  cursor.style.top = posY + 'px'
  cursor.style.left = posX + 'px'

  const windowX = posX / window.innerWidth
  const windowY = posY / window.innerHeight

  const threshold = .3

  threshold < windowX < 1 - threshold

  if ( threshold > windowX || windowX > 1 - threshold || threshold > windowY || windowY > 1 - threshold) {
    cursor.classList.add('hidden')
  } else {
    cursor.classList.remove('hidden')
  }

}

const handleMouseDown = (e) => {
  cursor.classList.add('clicked')
  container.style.cursor = 'grabbing'
}

const handleMouseUp = (e) => {
  cursor.classList.remove('clicked')
  container.style.cursor = 'grab'
}

window.addEventListener("mousemove", moveCustomCursor)
window.addEventListener("mousedown", handleMouseDown)
window.addEventListener("mouseup", handleMouseUp)

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
let model;
const sceneGroup = new THREE.Group

loader.load('/aventus.glb', (glb) => {

  model = glb.scene

  const meshes = model.children[0].children

  const bottle = meshes[0]
  const glass = meshes[1]

  bottle.geometry.computeVertexNormals(true);
  glass.geometry.computeVertexNormals(true);

  bottle.material = new THREE.MeshPhysicalMaterial({ 
    side: THREE.DoubleSide,
    roughness: 5,
    flatShading: false,
    normalScale: new THREE.Vector2(1, -1),
  })

  const loadTextures = () => {

    const colorMap = textureLoader.load('textures/T_DefaultMaterial_B.png', (texture) => {
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
    })

    const mraMap = textureLoader.load('textures/T_DefaultMaterial_MRA.png', (texture) => {
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
    }) 

    const normalMap = textureLoader.load('textures/T_DefaultMaterial_N.png', (texture) => {
      texture.flipY = false
      texture.colorSpace = THREE.SRGBColorSpace
    }) 

    const envMap = hdrLoader.load('/env_studio.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
    })


    // Glass
    glass.material = new THREE.MeshPhysicalMaterial({
      roughness: 0.05,
      transmission: 0.999,
      metalness: 0,
      normalScale: new THREE.Vector2(0.05, 0.05),
    })

    bottle.material.map = colorMap

    bottle.material.roughnessMap = mraMap
    bottle.material.metalnessMap = mraMap

    bottle.material.normalMap = normalMap;
    glass.material.normalMap = normalMap

    bottle.material.envMap = envMap
    glass.material.envMap = envMap
    bottle.material.envMapIntensity = 0.2
    // glass.material.envMapIntensity = 0.5

    bottle.material.needsUpdate = true
    glass.material.needsUpdate = true

  }

  loadTextures()

  model.position.y = -0.01
  sceneGroup.add(model)

}, undefined, function ( error ) {
	console.error( error );
} );

// Lights
const spotLightTarget = new THREE.Object3D()
spotLightTarget.position.set(-0.1, 0, 0)

const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 0.2, 0.2, 0.2 );
spotLight.target = spotLightTarget;
spotLight.intensity = 1.5
spotLight.angle = Math.PI / 6
spotLight.distance = 3

const backLightTarget = new THREE.Object3D()
backLightTarget.position.set(-0.025, 0, 0)

const backLight = new THREE.SpotLight( 0xffffff );
backLight.position.set( -0.15, 0.25, -0.3 );
backLight.target = backLightTarget
backLight.intensity = 0.75
spotLight.distance = 1
backLight.angle = Math.PI / 8

// const spotHelper = new THREE.SpotLightHelper(backLight)
// scene.add(spotHelper)

scene.add( sceneGroup, spotLight, spotLightTarget, backLight, backLightTarget );

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
  updateText(engravingTextLine1.value, 1, 0.006)
}

const updateLine2 = () => {
  lockCamera()
  updateText(engravingTextLine2.value, 2, 0.002)
}

// Live Text Input
const engravingTextLine1 = document.querySelector('#engraving-text-line1')
engravingTextLine1.addEventListener("input", updateLine1)
engravingTextLine1.addEventListener("blur", unlockCamera)

const engravingTextLine2 = document.querySelector('#engraving-text-line2')
engravingTextLine2.addEventListener("input", updateLine2)
engravingTextLine2.addEventListener("blur", unlockCamera)

// Live Text Font
const engravingFont = document.querySelector('#engraving-font')
engravingFont.addEventListener("change", () => { 
  updateLine1() 
  updateLine2() 
})

const updateText = (text, line, positionY) => {

  let mesh, flow
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
      size: 0.002,
      height: 0.0001,
      curveSegments: 12,
    } );

    textGeometry.center();
    textGeometry.rotateY(Math.PI);

    // Offset Vertices to Avoid Clipping
    const vertices = textGeometry.attributes.position.array
    for(let i = 0; i < textGeometry.attributes.position.count; i++){
      vertices[ i * 3 + 2 ] -= Math.abs(vertices[ i * 3 + 0 ]) ** 1.55
    }
    textGeometry.attributes.position.needsUpdate = true;

    if (line == 1) {
      textMeshLine1 = mesh = new THREE.Mesh(textGeometry, textMaterial);
      mesh = textMeshLine1;
    }

    if (line == 2) {
      textMeshLine2 = mesh = new THREE.Mesh(textGeometry, textMaterial);
      mesh = textMeshLine2;
    }

    mesh.position.y = positionY
    mesh.position.z = -0.0145
    scene.add( mesh );
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

// Animate
function animate() { 

  if (orbitTarget) {
    controls.object.position.lerp( orbitTarget, 0.1 );
  }
  
  controls.update();
	renderer.render( scene, camera );

  requestAnimationFrame( animate );
}
animate();

container.appendChild( renderer.domElement );
