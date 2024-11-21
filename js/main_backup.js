
// import * as THREE from '../node_modules/three/build/three.module.js';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene.add(camera);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);


let sunLight = new THREE.DirectionalLight(0xddddd, 1.0);
sunLight.position.y = 15;
scene.add(sunLight)

let geometry = new THREE.BoxGeometry(1,1,1);
let material = new THREE.MeshBasicMaterial({color : 0xff090});
let cube = new THREE.Mesh(geometry, material);

scene.add(cube);

//controls
document.addEventListener('keydown', onkeydown, false)

const textureloader = new THREE.TextureLoader();
const floortexture = textureloader.load('img/floor.jpg')
floortexture.wrapS = THREE.RepeatWrapping
floortexture.wrapT = THREE.RepeatWrapping
floortexture.repeat.set(20,20);

let planegeometry = new THREE.PlaneGeometry(50,50)
let planematerial = new THREE.MeshBasicMaterial({
  
  side : THREE.DoubleSide,
  map : floortexture
});

let floorplane = new THREE.Mesh(planegeometry, planematerial)

floorplane.rotation.x = Math.PI / 2
floorplane.position.y = -Math.PI 
scene.add(floorplane)


// walls
const wallgroup = new THREE.Group();
scene.add(wallgroup)

const frontwall = new THREE.Mesh(
  new THREE.BoxGeometry(50, 20 ,0.001),
  new THREE.MeshBasicMaterial({color : 'green'})
);
// wallgroup.add(frontwall)

frontwall.position.z = -20

const leftwall = new THREE.Mesh(
  new THREE.BoxGeometry(50, 20 ,0.001),
  new THREE.MeshBasicMaterial({color : 'red'})
);
// wallgroup.add(leftwall)

leftwall.rotation.y = Math.PI / 2
leftwall.position.x = -20


const rightwall = new THREE.Mesh(
  new THREE.BoxGeometry(50, 20 ,0.001),
  new THREE.MeshBasicMaterial({color : 'blue'})
);

rightwall.rotation.y = Math.PI / 2
rightwall.position.x = 20

wallgroup.add(rightwall, leftwall, frontwall)


for (let index = 0; index < wallgroup.children.length; index++) {
  wallgroup.children[index].BoundingBox = new THREE.Box3();
  wallgroup.children[index].BoundingBox.setFromObject(wallgroup.children[index]);
  
}

function checkcollision(){
  const playerboundingbox = new THREE.Box3();
  const cameraworldposition = new THREE.Vector3();
  camera.getWorldPosition(cameraworldposition)
  playerboundingbox.setFromCenterAndSize(cameraworldposition, new THREE.Vector3(1,1,1))

  for (let i = 0; i<wallgroup.children.length; i++){
    const wall = wallgroup.children[i]
    if(playerboundingbox.intersectsBox(wall.BoundingBox)){
      return true
    }
  }

  return false
}





const ceilingeometry = new THREE.PlaneGeometry(50,50);
const ceilingmaterial = new THREE.MeshBasicMaterial({color : 'yellow'})

const ceilingplane = new THREE.Mesh(ceilingeometry, ceilingmaterial)

ceilingplane.rotation.x = Math.PI / 2
ceilingplane.position.y = 10.7

scene.add(ceilingplane)



function createpainting(imageurl, width, height, position){
  const textureloader = new THREE.TextureLoader()
  const paintingtexture = textureloader.load(imageurl)
  const paintingmaterial = new THREE.MeshBasicMaterial({ map : paintingtexture})
  const paintinggeometry = new THREE.planegeometry(width, height)
  const painting = new THREE.Mesh(paintinggeometry, paintingmaterial)
  painting.position.set(position.x, position.y, posit.z)

  return painting;
}




const controls = new PointerLockControls(camera, document.body)


function startexperience(){
  controls.lock()
  hidemenu()
}

const playbutton =document.getElementById('play_button')
playbutton.addEventListener('click', startexperience)


function hidemenu(){
  const menu = document.getElementById('ab')
  menu.style.display = "none"
}

function showmenu(){
  const menu = document.getElementById('ab')
  menu.style.display = "block"
}

controls.addEventListener('unlock', showmenu)


const keypressed ={
  arrowup : false,
  arrowdown : false,
  arrowleft : false,
  arrowright : false,
  w : false,
  a : false,
  s : false,
  d : false,
}


document.addEventListener(
  'keydown',
(event) => {
  if (event.key in keypressed){
    keypressed[event.key] = true;
  }
},
  false
)


document.addEventListener(
  'keyup',
  (event) => {
    if (event.key in keypressed){
    keypressed[event.key] = false;
  }
},
  false 
)


const clock = new THREE.Clock()

function updatemovement(deltaa){
  const movespeed = 5* deltaa
  const previousposition = camera.position.clone()

  if(keypressed.arrowright || keypressed.d){
    controls.moveRight(movespeed)
  }
  if(keypressed.arrowleft || keypressed.a){
    controls.moveRight(-movespeed)
  }
  if(keypressed.arrowup || keypressed.w){
    controls.moveForward(movespeed)
  }
  if(keypressed.arrowdown|| keypressed.s){
    controls.moveForward(-movespeed)
  }

  if (checkcollision()){
    camera.position.copy(previousposition)
  }
}

















let render = function() {
 const deltaa = clock.getDelta()
 updatemovement(deltaa)
  renderer.render(scene, camera);
  requestAnimationFrame(render);

}
render();