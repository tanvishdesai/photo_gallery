
// import * as THREE from '../node_modules/three/build/three.module.js'; 
//above is the alternate import as sometimes the below import was not working eventually it did work but i kept it as a comment as a reference
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';


const scene = new THREE.Scene();

//camera technicalities this thing is almost like the template which is almost used in every project
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
//after making any component we add that to scene to make it visible
scene.add(camera);


//let there be light

//Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040, 6); // Soft white light
scene.add(ambientLight);

//Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // White light
directionalLight.position.set(10, 10, 10); // Position the light

// to help visualize the directional lighgt add dl to scene also, otherwise ignore dl
const dl = new  THREE.DirectionalLightHelper(directionalLight)
directionalLight.castShadow = true; // Enable shadows
scene.add(directionalLight);



//attaching the renderer to index.html
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);


//as a programmer you are obligated to write hello world firsst, just like that in 3D you are obligated to make a cube first
let geometry = new THREE.BoxGeometry(1,1,1);
let material = new THREE.MeshStandardMaterial({color : 0xff090});
let cube = new THREE.Mesh(geometry, material);

scene.add(cube);

//making a room


//this is the floor
const textureloader = new THREE.TextureLoader();
const floortexture = textureloader.load('assests/floor.jpg')
floortexture.wrapS = THREE.RepeatWrapping
floortexture.wrapT = THREE.RepeatWrapping
floortexture.repeat.set(40,40);

let planegeometry = new THREE.PlaneGeometry(50,50)
let planematerial = new THREE.MeshStandardMaterial({
  side : THREE.DoubleSide,
  map : floortexture
});
let floorplane = new THREE.Mesh(planegeometry, planematerial)
floorplane.rotation.x = Math.PI / 2
floorplane.position.y = -Math.PI 

scene.add(floorplane)


//general structure of 4 vertical walls, we make it because all of them will be identical expect their positions
const textureloaderwall = new THREE.TextureLoader();
const walltexture = textureloaderwall.load('assests/wall.jpg')
walltexture.wrapS = THREE.RepeatWrapping
walltexture.wrapT = THREE.RepeatWrapping
walltexture.repeat.set(10,10);
const wallgroup = new THREE.Group();

scene.add(wallgroup)

//front wall
const frontwall = new THREE.Mesh(
  new THREE.BoxGeometry(50, 20 ,0.001),
  new THREE.MeshStandardMaterial({ side : THREE.DoubleSide,
    map : walltexture})
);
frontwall.position.z = -20

//backwall
const backwall = new THREE.Mesh(
  new THREE.BoxGeometry(50, 20 ,0.001),
  new THREE.MeshStandardMaterial({ side : THREE.DoubleSide,
    map : walltexture})
);
backwall.position.z = 20

//leftwall
const leftwall = new THREE.Mesh(
  new THREE.BoxGeometry(50, 20 ,0.001),
  new THREE.MeshStandardMaterial({ side : THREE.DoubleSide,
    map : walltexture})
  );
leftwall.rotation.y = Math.PI / 2
leftwall.position.x = -20

//rightwall
const rightwall = new THREE.Mesh(
  new THREE.BoxGeometry(50, 20 ,0.001),
  new THREE.MeshStandardMaterial({ side : THREE.DoubleSide,
    map : walltexture})
);
rightwall.rotation.y = Math.PI / 2
rightwall.position.x = 20


//adding wall the walls to parent wall group, and we have already added wallgroup to scene, we dont need to add these separetly to scene
wallgroup.add(rightwall, leftwall, frontwall, backwall)


//ceiling
const textureloaderceiling = new THREE.TextureLoader();
const ceilingtexture = textureloaderceiling.load('assests/image.png')
ceilingtexture.wrapS = THREE.RepeatWrapping
ceilingtexture.wrapT = THREE.RepeatWrapping
ceilingtexture.repeat.set(10,10);

const ceilingeometry = new THREE.PlaneGeometry(50,50);
const ceilingmaterial = new THREE.MeshStandardMaterial({
  side : THREE.DoubleSide,
  map : ceilingtexture})

const ceilingplane = new THREE.Mesh(ceilingeometry, ceilingmaterial)

ceilingplane.rotation.x = Math.PI / 2
ceilingplane.position.y = 10.7

scene.add(ceilingplane)


//making bounding box for each wall

for (let index = 0; index < wallgroup.children.length; index++) {
  wallgroup.children[index].BoundingBox = new THREE.Box3();
  wallgroup.children[index].BoundingBox.setFromObject(wallgroup.children[index]);
}

//taking bounding box of players and walls, we calculate if there is any collision, this is to prevent the passing thorugh wall problem
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
//now the evironment is setup

//painting creation, we go with the nomenclature that photos will be called painting, because i have wriiten too much to go & change it

//this function creates a painting and return it as a object, this is not painting creation, but rather a template
function createpainting(imageurl, width, height, position){
  const textureloader = new THREE.TextureLoader()
  const paintingtexture = textureloader.load(imageurl)
  
  paintingtexture.minFilter = THREE.LinearFilter;
  paintingtexture.magFilter = THREE.LinearFilter;
  paintingtexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    
  renderer.outputEncoding = THREE.sRGBEncoding;
  paintingtexture.encoding = THREE.sRGBEncoding;

  const paintingmaterial = new THREE.MeshStandardMaterial({ map : paintingtexture})
  const paintinggeometry = new THREE.PlaneGeometry(width, height)
  const painting = new THREE.Mesh(paintinggeometry, paintingmaterial)
  painting.position.set(position.x, position.y, position.z)

  return painting;
}

//making an group of paintings
const paintings = []

//we add info card to each painting, we add a distance threshold, if the palyer crosses it the pop-up card will be displayed
const distanceThreshold = 7;
let activeCard = null;


// Function to create a pop-up card
function createPopupCard(info) {

  const card = document.createElement('div');
  card.className = 'popup-card';
  card.style.position = 'absolute';
  card.style.background = 'rgba(0, 0, 0, 0.8)';
  card.style.color = 'white';
  card.style.padding = '10px';
  card.style.borderRadius = '5px';
  card.style.top = '10%';
  card.style.left = '10%';
  card.style.zIndex = '1000';
  card.innerHTML = `<h3>${info.title}</h3><p>${info.description}</p>`;
  document.body.appendChild(card);
  return card;

}

// removing the card in case the users moves away from it
function removePopupCard() {
  if (activeCard) {
    document.body.removeChild(activeCard);
    activeCard = null;
  }
}

// logics of making work
function updatePopupCard() {
  let paintingToShow = null;

  paintings.forEach((painting) => {
    const distanceToPainting = camera.position.distanceTo(painting.position);
    if (distanceToPainting < distanceThreshold) {
      paintingToShow = painting;
    }
  });

  if (paintingToShow && paintingToShow.userData.info) {

    if (!activeCard || activeCard.dataset.paintingId !== paintingToShow.id) {
      removePopupCard();
      activeCard = createPopupCard(paintingToShow.userData.info);
      activeCard.dataset.paintingId = paintingToShow.id;
    }

  } else {
    removePopupCard();
  }
}

// Call updatePopupCard in render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  updatePopupCard();
}

//using the templates to make the paintings


//painting of frontwalls


  //painting 1 front
  const painting1front = createpainting(
  '/artworks/0.jpg',
    8,
    6,
    new THREE.Vector3(-10, 2, -19.999)
  );
  painting1front.userData.info = {
    title: 'Women Outside Pathikasharam',
    description: ''
  };

  //painting 2 front
  const painting2front = createpainting(
    '/artworks/1.jpg',
    8,
    6,
    new THREE.Vector3(10, 2, -19.999)
  );
  painting2front.userData.info = {
    title: 'Artificial Culture',
    description: 'From the youth festival, outside the Folkdance competition'
  };

  //adding front paintings to scene
  paintings.push(painting2front, painting1front);
  scene.add(painting2front, painting1front);


//painting of left wall

  //painting 1 left
  const painting1left = createpainting(
    '/artworks/2.jpg',
    6,
    8,
    new THREE.Vector3(-19.999, 2, 12)
  );

  painting1left.rotation.y = Math.PI / 2

  painting1left.userData.info = {
    title: 'Couples Goals',
    description: 'After completing the folkdance, couple leaves the premises'
  };
  


  //painting 2 left
  const painting2left = createpainting(
    '/artworks/3.jpg',
    8,
    6,
    new THREE.Vector3(-19.999, 2, 0)
  );

  painting2left.rotation.y = Math.PI / 2

  painting2left.userData.info = {
    title: 'Roadside Tailor',
    description: 'Tailor on the roadside serving the poors'
  };
  

  // painting 3 left
  const painting3left = createpainting(
    '/artworks/4.jpg',
    6,
    8,
    new THREE.Vector3(-19.999, 2, -12)
  );

  painting3left.rotation.y = Math.PI / 2

  painting3left.userData.info = {
    title: 'Side Sadhu',
    description: 'Sadhu driving a mustang on a pump station'
  };


  paintings.push(painting3left, painting2left, painting1left);
  scene.add(painting3left, painting2left, painting1left)


//right wall paintings

  //painting 1 right
  const painting1right = createpainting(
    '/artworks/5.jpg',
    8,
    6,
    new THREE.Vector3(19.999, 2, 12)
  );

  painting1right.rotation.y = -Math.PI / 2

  painting1right.userData.info = {
    title: 'Stay with Me',
    description: 'Couple enjoying meal under the bridge'
  };
  paintings.push(painting1right);
  scene.add(painting1right);

  //painting 2 right
  const painting2right = createpainting(
    '/artworks/6.jpg',
    8,
    6,
    new THREE.Vector3(19.999, 2, 0)
  );

  painting2right.rotation.y = -Math.PI / 2

  painting2right.userData.info = {
    title: 'Awaiting Destiny',
    description: 'Old Man waiting waiting waiting'
  };
  paintings.push(painting2right);
  scene.add(painting2right);

  //painting 3 right
  const painting3right = createpainting(
    '/artworks/7.jpg',
    8,
    6,
    new THREE.Vector3(19.999, 2, -12)
  );

  painting3right.rotation.y = -Math.PI / 2
  
  painting3right.userData.info = {
    title: 'Adjacent Women',
    description: 'Women sat who next to me in Bus. I do not know her'
  };

  paintings.push(painting3right, painting2right, painting1right);
  scene.add(painting3right, painting2right, painting1right);


// Back wall paintings

 //paiting 1 back
 const painting1back = createpainting(
  '/artworks/8.jpg',
    8,
    6,
    new THREE.Vector3(-10, 2, 19.999)
  );
  painting1back.userData.info = {
    title: 'Pinki',
    description: 'little sunshine I found on the college campus'
  };
  painting1back.rotation.y = Math.PI

  //painting 2 back
  const painting2back = createpainting(
    '/artworks/9.jpg',
    8,
    6,
    new THREE.Vector3(10, 2, 19.999)
  );
  painting2back.userData.info = {
    title: 'The Only Women of Importance',
    description: 'Mom'
  };
  painting2back.rotation.y = Math.PI

  //adding back paintings to scene
  paintings.push(painting2back, painting1back);
  scene.add(painting2back, painting1back);


animate();



//controls

document.addEventListener('keydown', onkeydown, false)
//pointer lock allows the mouse pointer to act as the eye of the viewer moving the pointer moves the camera
const controls = new PointerLockControls(camera, document.body);
let controlsActive = false; // Flag to track if controls are active

//lock the mouse and hide the menu
function startexperience() {
  controls.lock();
  hidemenu();
}

const playbutton = document.getElementById('play_button');
playbutton.addEventListener('click', startexperience);

function hidemenu() {
  const menu = document.getElementById('ab');
  menu.style.display = "none";
}

function showmenu() {
  const menu = document.getElementById('ab');
  menu.style.display = "block";
}

controls.addEventListener('unlock', () => {
  showmenu();
  controlsActive = false; // Set controlsActive to false when unlocked
});

controls.addEventListener('lock', () => {
  controlsActive = true; // Set controlsActive to true when locked
});

const keypressed = {
  arrowup: false,
  arrowdown: false,
  arrowleft: false,
  arrowright: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

// when we presss esc is releases the pointer and restricts the movement by the keys 
document.addEventListener('keydown', (event) => {
  if (controlsActive && event.key in keypressed) {
    keypressed[event.key] = true;
  }
}, false);

document.addEventListener('keyup', (event) => {
  if (controlsActive && event.key in keypressed) {
    keypressed[event.key] = false;
  }
}, false);

//use this to make the movemenet independent of the framerate of the device
const clock = new THREE.Clock();

function updatemovement(deltaa) {
  const movespeed = 5 * deltaa;
  const previousposition = camera.position.clone();

  if (keypressed.arrowright || keypressed.d) {
    controls.moveRight(movespeed);
  }
  if (keypressed.arrowleft || keypressed.a) {
    controls.moveRight(-movespeed);
  }
  if (keypressed.arrowup || keypressed.w) {
    controls.moveForward(movespeed);
  }
  if (keypressed.arrowdown || keypressed.s) {
    controls.moveForward(-movespeed);
  }
  if (checkcollision()) {
    camera.position.copy(previousposition);
  }
}


// render function which takes the things to be rendered, it is also like template
let render = function() {
 const deltaa = clock.getDelta()
 updatemovement(deltaa)
  renderer.render(scene, camera);
  requestAnimationFrame(render);
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
}


render();