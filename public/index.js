import * as THREE from './vendors/three.js/three.module.js';

import Stats from './vendors/three.js/stats.module.js';

import { STLLoader } from './vendors/three.js/STLLoader.js';
import { OBJLoader } from './vendors/three.js/OBJLoader.js';
import { OrbitControls } from './vendors/three.js/OrbitControls.js';

let container, stats, camera, scene, renderer, controls;

// Getting file name from current URI
const fileName = window.location.pathname;
const matches = fileName.match(/\.(stl|obj)$/);
if (matches === null || matches.length === 0) {
    handleError('Invalid URI. Please retry.');
}

commonInit();

if (matches[0] === '.stl') {
    initSTL('./objects' + fileName);
} else if (matches[0] === '.obj') {
    initOBJ('./objects' + fileName);
} else {
    throw new Error('Logic error');
}

// Adding stats, with a toggle on the S key
stats = new Stats();
stats.dom.style.display = 'none';
document.addEventListener('keydown', (event) => {
    if (event.key.toUpperCase() === 'S') {
        if (stats.dom.style.display === 'none') {
            stats.dom.style.display = 'block';
        } else {
            stats.dom.style.display = 'none';
        }
    }
});
container.appendChild( stats.dom );

// Listening to events
window.addEventListener( 'resize', onWindowResize );

// Allowing enduser to control scene
controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(.25,0,0);

// Animation loop
animate();

function handleError(errorText) {
    document.getElementById('main').innerHTML = '<h1>' + errorText + '</h1>';
    throw new Error(errorText);
}

function scaleAndAddModel(model) {
    
    var box = new THREE.Box3().setFromObject( model );
    var size = new THREE.Vector3();
    box.getSize( size );
    var scaleVec = new THREE.Vector3(1, 1, 1).divide( size );
    var scale = Math.min( scaleVec.x, Math.min( scaleVec.y, scaleVec.z ));
    model.scale.setScalar( scale );

    model.castShadow = true;
    model.receiveShadow = true;

    let center = box.getCenter();
    model.position.set( 0, 0, 0 );
    

    scene.add( model );

}

function commonInit() {
    
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 50 );
    camera.position.set( .25, -2, 1 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x181818 );
    scene.fog = new THREE.Fog( 0x181818, 2, 15 );
    
    scene.add( new THREE.HemisphereLight( 0x776666, 0x776666 ) );

    addShadowedLight( -3, -3, 3, 0xffffff, 0.25 );

}

function initSTL(filePath) {

    // ASCII file

    const loader = new STLLoader();

    // Binary files

    const material = new THREE.MeshPhongMaterial( { color: 0xAAAAAA, specular: 0x111111, shininess: 200 } );

    // Colored binary STL
    loader.load( filePath, function ( geometry ) {

        let meshMaterial = material;

        if ( geometry.hasColors ) {

            meshMaterial = new THREE.MeshPhongMaterial( { opacity: geometry.alpha, vertexColors: true } );

        }

        const mesh = new THREE.Mesh( geometry, meshMaterial );

        scaleAndAddModel(mesh);

    }, ()=>{}, (err) => { console.log(err); handleError('File might be expired or non existant. Please retry.'); } );

    // renderer

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.shadowMap.enabled = true;

    container.appendChild( renderer.domElement );
}

function initOBJ(filePath) {
    
    let object;
    
    // manager

    function loadModel() {

        object.traverse( function ( child ) {

            if ( child.isMesh ) child.material.map = texture;

        } );

        scaleAndAddModel(object);

    }

    const manager = new THREE.LoadingManager( loadModel );

    // texture

    const textureLoader = new THREE.TextureLoader( manager );
    const texture = textureLoader.load( './vendors/three.js/tri_pattern.jpg' );

    const loader = new OBJLoader( manager );
    loader.load( filePath, function ( obj ) {

        object = obj;

    }, ()=>{}, () => { handleError('File might be expired or non existant. Please retry.'); } );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
}

function addShadowedLight( x, y, z, color, intensity ) {

    const directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z );
    scene.add( directionalLight );

    directionalLight.castShadow = true;

    const d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.bias = - 0.002;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );
    stats.update();
}