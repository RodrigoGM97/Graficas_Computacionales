//Rodrigo Garcia
//A01024595

var renderer = null;
var scene = null;
var camera = null;

var starDestoyer = null;
var solarSystem = null;
var mercuryGroup = null;
var venusGroup = null;
var marsGroup = null;
var asteroidsRing = null;
var jupiterGroup = null;
var saturnGroup = null;
var saturnMoons = null;
var uranusGroup = null;
var uranusMoons = null;
var neptuneGroup = null;
var plutoGroup = null;

var sun = null;
var mercury = null;
var venus = null;
var earth = null;
var mars = null;
var asteroid = null;
var jupiter = null;
var saturn = null;
var saturnRings = null;
var uranus = null;
var uranusRings = null;
var neptune = null;
var pluto = null;
var orbit = null;

var earthGroup = null;
var earth = null;
var moon = null;
var earthOrbit = null;


var duration = 5000; // ms
var currentTime = Date.now();

var geometry = null;
var texture = null;
var material = null;
var textureMap = null;
var bumpMap = null;
var textureUrl = null;
var bumpUrl = null;
var mapUrl = null;

function animate() {
  var now = Date.now();
  var deltat = now - currentTime;
  currentTime = now;
  var fract = deltat / duration;
  var angle = Math.PI * 2 * fract;

  //Sun rotation
  sun.rotation.y -= angle / 8;
  solarSystem.rotation.y += angle / 8;

  //Planet and moon rotation
  mercury.rotation.y += angle;
  venus.rotation.y += angle;
  earth.rotation.y += angle;
  earthGroup.rotation.y -= angle / 2;
  moon.rotation.y += angle;
  mars.rotation.y += angle;
  marsGroup.rotation.y -= angle / 2;
  asteroidsRing.rotation.y -= angle / 7;
  jupiter.rotation.y += angle;
  jupiterGroup.rotation.y -= angle / 2;
  saturn.rotation.y += angle;
  saturnMoons.rotation.y -= angle / 2;
  uranus.rotation.y += angle;
  uranusMoons.rotation.y -= angle;
  neptune.rotation.y += angle;
  neptuneGroup.rotation.y -= angle;
  pluto.rotation.y += angle;
  plutoGroup.rotation.y -= angle;
}

function run() {
  requestAnimationFrame(function () { run(); });

  camera_control.update();

  // Render the scene
  renderer.render(scene, camera);

  // Spin the cube for next frame
  animate();
}

//Get Material and texture
function createElement(texUrl) {
  texture = new THREE.TextureLoader().load(texUrl);
  material = new THREE.MeshPhongMaterial({ map: texture });
  return new THREE.Mesh(geometry, material);
}

//Assign bump
function createBump(texUrl, bumpUrl) {
  textureMap = new THREE.TextureLoader().load(texUrl);
  bumpMap = new THREE.TextureLoader().load(bumpUrl);

  var moon_material = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.01 });
  return new THREE.Mesh(geometry, moon_material);
}

//Set orbit trayectory
function createOrbit(radius) {
  var geometry = new THREE.RingGeometry(radius, radius - 0.5, 30, 10);
  var material = new THREE.MeshBasicMaterial({ color: 0xffff80, side: THREE.DoubleSide });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, -4, 0);
  mesh.rotation.x += Math.PI / 180 * 90;
  solarSystem.add(mesh);
}

//Planet rings for Saturn and Uranus
function createRings(texUrl, planetSize, ringSize) {
  geometry = new THREE.RingGeometry(planetSize + ringSize * 2, planetSize + ringSize * 4, 30, 10);
  textureMap = new THREE.TextureLoader().load(texUrl);
  material = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });
  return new THREE.Mesh(geometry, material);
}

function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  // Set the viewport size
  renderer.setSize(canvas.width, canvas.height);

  // Create a new Three.js scene
  scene = new THREE.Scene();

  // Set the background color
  texture = new THREE.TextureLoader().load("../images/nebula.jpg");
  material = new THREE.MeshPhongMaterial({ map: texture });
  //scene.background = new THREE.Color( 0.3, 0.3, 0.3 );
  scene.background = texture;
  // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
  camera_control = new THREE.OrbitControls(camera, canvas);
  camera.position.z = 10;
  camera_control.update();
  scene.add(camera);

  // Create a group to hold all the objects
  solarSystem = new THREE.Object3D;
  //Ambient light
  var pointLight = new THREE.PointLight(0xffffff, 2.5, 0, 1);
  solarSystem.add(pointLight);

  //Sun
  geometry = new THREE.SphereGeometry(20, 20, 20);
  texture = new THREE.TextureLoader().load("../images/sunmap3.jpg");
  material = new THREE.MeshBasicMaterial({ map: texture });
  sun = new THREE.Mesh(geometry, material);
  solarSystem.add(sun);

  // Now add the group to our scene
  createPlanets();
  scene.add(solarSystem);
}

//Create moons and their rotations
function createMoons(group, moons, distance) {
  for (var i = 0; i < moons; i++) {
    geometry = new THREE.SphereGeometry(0.3, 6, 8);
    asteroid = createBump("../images/moon_1024.jpg", "../images/moon_bump.jpg");
    var r = distance;
    var t = 2 * Math.random() * Math.PI * 2;
    var x = r * Math.cos(t);
    var y = r * (Math.random() * (-0.3 - 0.3) + 0.3).toFixed(4);
    var z = r * Math.sin(t);
    asteroid.position.set(x, y, z);
    group.add(asteroid);
  }
}

//Create planets
function createPlanets() {
  //Mercury
  mercuryGroup = new THREE.Object3D;
  solarSystem.add(mercuryGroup);
  mercuryGroup.position.set(0, -4, -30);
  geometry = new THREE.SphereGeometry(0.8, 20, 20);
  mercury = createBump("../images/mercurymap.jpg", "../images/mercurybump.jpg");
  mercuryGroup.add(mercury);
  createOrbit(-29.5);

  //Venus
  venusGroup = new THREE.Object3D;
  solarSystem.add(venusGroup);
  venusGroup.position.set(43, -4, 0);
  geometry = new THREE.SphereGeometry(1.3, 20, 20);
  venus = createBump("../images/venusmap.jpg", "../images/venusbump.jpg");
  venusGroup.add(venus);
  createOrbit(-42.5);

  //Earth
  earthGroup = new THREE.Object3D;
  solarSystem.add(earthGroup);
  earthGroup.position.set(Math.sin(35 * Math.PI / 180) * -55, -4, Math.cos(35 * Math.PI / 180) * -55);
  
  geometry = new THREE.SphereGeometry(3, 20, 20);
  //Assign the different textures for earth (normal, specular, bump)
  var map = new THREE.TextureLoader().load("../images/earth_atmos_2048.jpg");
  var normalMap = new THREE.TextureLoader().load("../images/earth_normal_2048.jpg");
  var specularMap = new THREE.TextureLoader().load("../images/earth_specular_spec_1k.jpg");
  var earth_map = new THREE.MeshPhongMaterial({ map: map, normalMap: normalMap, specularMap: specularMap });
  earth = new THREE.Mesh(geometry, earth_map);
  earth.visible = true;
  earthGroup.add(earth);
  createOrbit(-54.5);

  //Moon
  geometry = new THREE.SphereGeometry(0.5, 20, 20);
  moon = createBump("../images/moon_1024.jpg", "../images/moon_bump.jpg");
  moon.visible = true;
  moon.position.set(4, 1, -1);
  earthGroup.add(moon);

  //Mars
  marsGroup = new THREE.Object3D;
  solarSystem.add(marsGroup);
  marsGroup.position.set(Math.sin(163 * Math.PI / 180) * -75, -4, Math.cos(163 * Math.PI / 180) * -75);
  geometry = new THREE.SphereGeometry(4, 20, 20);
  mars = createBump("../images/marsmap1k.jpg", "../images/marsbump1k.jpg");
  marsGroup.add(mars);
  createOrbit(-74.5);
  createMoons(marsGroup, 2, 5.5);

  //Asteroids
  asteroidsRing = new THREE.Object3D;
  asteroidsRing.position.set(0, -4, 0);
  geometry = new THREE.SphereGeometry(0.4, 4, 4);
  asteroid = createBump("../images/moon_1024.jpg", "../images/moon_bump.jpg");
  //Create 500 asteroids
  for (var i = 1; i < 500; i++) {
    asteroid = createBump("../images/moon_1024.jpg", "../images/moon_bump.jpg");
    asteroidsRing.add(asteroid);
    var r = 95;
    var t = 2 * Math.random() * Math.PI * 2;
    var x = r * Math.cos(t);
    var y = r * (Math.random() * (-0.01 - 0.01) + 0.01).toFixed(4);
    var z = r * Math.sin(t);
    asteroid.position.set(x, y, z);
  }
  solarSystem.add(asteroidsRing);

  //Jupiter
  jupiterGroup = new THREE.Object3D;
  solarSystem.add(jupiterGroup);
  jupiterGroup.position.set(Math.sin(250 * Math.PI / 180) * -135, -4, Math.cos(250 * Math.PI / 180) * -135);
  geometry = new THREE.SphereGeometry(10, 20, 20);
  jupiter = createElement("../images/jupitermap.jpg");
  jupiterGroup.add(jupiter);
  createOrbit(-134.5);
  //Jupiter moons
  createMoons(jupiterGroup, 79, 12);

  //Saturn
  saturnGroup = new THREE.Object3D;
  saturnMoons = new THREE.Object3D;
  solarSystem.add(saturnGroup);
  saturnGroup.position.set(0, -4, -170);
  geometry = new THREE.SphereGeometry(7, 20, 20);
  saturn = createElement("../images/saturnmap.jpg");
  saturnGroup.add(saturn);
  createOrbit(-169.5);
  saturnRings = createRings("../images/saturnringcolor.jpg", 5, 2)
  saturnRings.rotation.x += Math.PI / 180 * -70;
  saturnGroup.add(saturnRings);
  saturnGroup.add(saturnMoons);
  createMoons(saturnMoons, 62, 9);

  //Uranus
  uranusGroup = new THREE.Object3D;
  uranusMoons = new THREE.Object3D;
  solarSystem.add(uranusGroup);
  uranusGroup.position.set(Math.sin(135 * Math.PI / 180) * -200, -4, Math.cos(135 * Math.PI / 180) * -200);
  geometry = new THREE.SphereGeometry(5, 20, 20);
  uranus = createElement("../images/uranusmap.jpg");
  uranusGroup.add(uranus);
  createOrbit(-199.5);
  uranusRings = createRings("../images/uranusringcolour.jpg", 5, 0.5);
  uranusGroup.add(uranusRings);
  uranusGroup.add(uranusMoons);
  createMoons(uranusMoons, 27, 7);

  //Neptune
  neptuneGroup = new THREE.Object3D;
  solarSystem.add(neptuneGroup);
  neptuneGroup.position.set(Math.sin(300 * Math.PI / 180) * -230, -4, Math.cos(300 * Math.PI / 180) * -230);
  geometry = new THREE.SphereGeometry(5, 20, 20);
  neptune = createElement("../images/neptunemap.jpg");
  neptuneGroup.add(neptune);
  createOrbit(-229.5);
  createMoons(neptuneGroup, 14, 7);

  //Pluto
  plutoGroup = new THREE.Object3D;
  solarSystem.add(plutoGroup);
  plutoGroup.position.set(0, -4, 259);
  geometry = new THREE.SphereGeometry(1, 20, 20);
  pluto = createBump("../images/plutomap1k.jpg", "../images/plutomap1k.jpg");
  plutoGroup.add(pluto);
  createOrbit(-259.9);
  createMoons(plutoGroup, 5, 2);

  //Star destroyer OBJ
  var objLoader = new THREE.OBJLoader();
  objLoader.load('../death-star/imperial.obj', function (object) {
    starDestoyer = object;
    starDestoyer.position.set(120, 0, -25);
    starDestoyer.scale.set(0.001, 0.001, 0.001);
    solarSystem.add(object);
  });
  /*var objLoader = new THREE.OBJLoader();
  objLoader.load('../death-star/imperial.obj', function(object) {
      object.position.set(150,0,0);
      object.scale.set(0.001,0.001,0.001);
      //object.rotation.set(30);
      solarSystem.add(object);
  });
  var objLoader = new THREE.OBJLoader();
  objLoader.load('../death-star/imperial.obj', function(object) {
      object.position.set(180,0,-25);
      object.scale.set(0.001,0.001,0.001);
      //object.rotation.set(30);
      solarSystem.add(object);
  });*/
}