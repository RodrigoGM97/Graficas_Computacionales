var renderer = null,
scene = null,
camera = null;

var solarSystem = null,
    mercuryGroup = null,
    venusGroup = null,
    marsGroup = null,
    asteroidsRing = null,
    jupiterGroup = null,
    saturnGroup = null,
    saturnMoons = null,
    uranusGroup = null,
    uranusMoons = null;
    neptuneGroup = null,
    plutoGroup = null;

var sun = null,
    mercury = null,
    venus = null,
    earth = null,
    mars = null,
    asteroid =null,
    jupiter = null,
    saturn = null,
    saturnRings = null,
    uranus = null,
    uranusRings = null,
    neptune = null,
    pluto = null,
    orbit = null;

var earthGroup = null,
    earth = null,
    moon = null;
    earthOrbit = null;


var duration = 5000; // ms
var currentTime = Date.now();

var geometry = null, texture = null, material = null;
var textureMap = null, bumpMap = null;
var textureUrl = null, bumpUrl = null, mapUrl = null;

function animate()
{
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    // Rotate the cube about its Y axis
    sun.rotation.y -= angle/8;
      solarSystem.rotation.y += angle/8;

    // Rotate the sphere group about its Y axis
    //earthGroup.rotation.y -= angle / 2;
    mercury.rotation.y +=angle;
    venus.rotation.y +=angle;
    earth.rotation.y += angle;
    earthGroup.rotation.y -= angle/2;
    moon.rotation.y += angle;

    mars.rotation.y += angle;
    marsGroup.rotation.y -= angle/2;

    asteroidsRing.rotation.y -=angle/7;

    jupiter.rotation.y += angle;
    jupiterGroup.rotation.y -= angle/2;

    saturn.rotation.y += angle;
    saturnMoons.rotation.y -= angle/2;

    uranus.rotation.y += angle;
    uranusMoons.rotation.y -= angle;

    neptune.rotation.y += angle;
    neptuneGroup.rotation.y -= angle;

    pluto.rotation.y += angle;
    plutoGroup.rotation.y -= angle;
}

function run() {
    requestAnimationFrame(function() { run(); });

    camera_control.update();

        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        animate();
}

function createElement(texUrl)
{
  texture = new THREE.TextureLoader().load(texUrl);
  material = new THREE.MeshPhongMaterial({ map: texture });
  return new THREE.Mesh(geometry, material);
}

function createBump(texUrl, bumpUrl)
{
    textureMap = new THREE.TextureLoader().load(texUrl);
    bumpMap = new THREE.TextureLoader().load(bumpUrl);

    var moon_material = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.01 });
     return new THREE.Mesh(geometry, moon_material);
}

function createOrbit(inner, outer)
{
  var geometry = new THREE.RingGeometry(inner, outer, 30, 10 /*phi segments*/);
  var material = new THREE.MeshBasicMaterial( { color: 0xffff80, side: THREE.DoubleSide} );
  var mesh = new THREE.Mesh( geometry, material );
  //meshVen.rotation.x = Math.PI / 2;

  mesh.position.set(0,-4,0);
  mesh.rotation.x += Math.PI/180 * 90 ;
  solarSystem.add(mesh);
}

function createRings(texUrl, planetSize, ringSize)
{
    geometry = new THREE.RingGeometry(planetSize+ringSize*2, planetSize+ringSize*4, 30, 10 /*phi segments*/);
    textureMap = new THREE.TextureLoader().load(texUrl);
    material = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide });

    //var ring_material = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.01, side: THREE.DoubleSide });
    return new THREE.Mesh(geometry, material);
}

function createScene(canvas)
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

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
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera_control = new THREE.OrbitControls(camera, canvas);
    camera.position.z = 10;
    camera_control.update();
    scene.add(camera);

    // Create a group to hold all the objects
    solarSystem = new THREE.Object3D;
    //solarSystem.rotation.x += Math.PI/180 * 45 ; //inclination of the rings


    var pointLight = new THREE.PointLight(0xffffff, 2.5,0,1);
    solarSystem.add(pointLight);

    // Create the sun geometry
    geometry = new THREE.SphereGeometry(20, 20, 20);

    // And put the geometry and material together into a mesh
    texture = new THREE.TextureLoader().load("../images/sunmap3.jpg");
    material = new THREE.MeshBasicMaterial({ map: texture });
    sun = new THREE.Mesh(geometry, material);

    // Add the cube mesh to our group
    solarSystem.add( sun );


    // Now add the group to our scene
    createPlanets();
    scene.add( solarSystem );
}


function createMoons(group, moons, distance, interval)
{
  for(var i = 0; i < moons; i++)
  {
    geometry = new THREE.SphereGeometry(0.3, 6, 8);
    asteroid = createBump("../images/moon_1024.jpg", "../images/moon_bump.jpg");
    var r = distance;
    var t = 2*Math.random() * Math.PI * 2;
        var x = r * Math.cos(t);
        var y = r * (Math.random() * (-0.3 - 0.3) + 0.3).toFixed(4);
        var z = r * Math.sin(t);
        asteroid.position.set(x, y, z);
    group.add(asteroid);
  }
}

function getX(grad)
{
  return Math.sin(grad*Math.PI/180);
}

function getZ(grad)
{
  return Math.cos(grad*Math.PI/180);
}
function createPlanets()
{
      //mercury
      mercuryGroup = new THREE.Object3D;
      solarSystem.add(mercuryGroup);
      mercuryGroup.position.set(0,-4,-30);
      geometry = new THREE.SphereGeometry(0.8, 20, 20);
      mercury = createBump("../images/mercurymap.jpg", "../images/mercurybump.jpg");
      mercuryGroup.add(mercury);
      createOrbit(-29.5 /*inner radius*/, -30.5 /*outer*/);

      //venus
      venusGroup = new THREE.Object3D;
      solarSystem.add(venusGroup);
      venusGroup.position.set(43,-4,0);
      geometry = new THREE.SphereGeometry(1.3, 20, 20);
      venus = createBump("../images/venusmap.jpg", "../images/venusbump.jpg");
      venusGroup.add(venus);
      createOrbit(-42.5 /*inner radius*/, -43.5 /*outer*/);


      // Create a group for the sphere
      earthGroup = new THREE.Object3D;
      solarSystem.add(earthGroup);

      // Move the sphere group up and back from the cube
      earthGroup.position.set(getX(35)*-55,-4, getZ(35)*-55);
      // Create the earth geometry
      geometry = new THREE.SphereGeometry(3, 20, 20);
      // And put the geometry and material together into a mesh
      //earth uses normalmap
      var map = new THREE.TextureLoader().load("../images/earth_atmos_2048.jpg");
      var normalMap = new THREE.TextureLoader().load("../images/earth_normal_2048.jpg");
      var specularMap = new THREE.TextureLoader().load("../images/earth_specular_spec_1k.jpg");
      var earth_map = new THREE.MeshPhongMaterial({ map: map, normalMap: normalMap, specularMap: specularMap });
      earth = new THREE.Mesh(geometry, earth_map);
      earth.visible = true;

      // Add the sphere mesh to our group
      earthGroup.add( earth );
      createOrbit(-54.5 /*inner radius*/, -55.5 /*outer*/);

      // Create the moon geometry
      geometry = new THREE.SphereGeometry(0.5,20,20);

      // And put the geometry and material together into a mesh
      moon = createBump("../images/moon_1024.jpg", "../images/moon_bump.jpg");
      moon.visible =true;
      // Move the cone up and out from the sphere
      moon.position.set(4, 1, -1);
      // Add the cone mesh to our group
      earthGroup.add( moon );

      //mars
      marsGroup = new THREE.Object3D;
      solarSystem.add(marsGroup);
      marsGroup.position.set(getX(163)*-75,-4,getZ(163)*-75);
      geometry = new THREE.SphereGeometry(4, 20, 20);
      mars = createBump("../images/marsmap1k.jpg", "../images/marsbump1k.jpg");
      marsGroup.add(mars);
      createOrbit(-74.5 /*inner radius*/, -75.5 /*outer*/);
      createMoons(marsGroup, 2, 5.5, 170);


      //asteroids
      asteroidsRing = new THREE.Object3D;
      asteroidsRing.position.set(0,-4,0);
      

      geometry = new THREE.SphereGeometry(0.4, 4, 4);
      asteroid = createBump("../images/moon_1024.jpg", "../images/moon_bump.jpg");
     
      for(var i = 1; i < 500; i++)
      { 
        asteroid = createBump("../images/moon_1024.jpg", "../images/moon_bump.jpg");
        asteroidsRing.add(asteroid);
        var r = 95;
        var t = 2*Math.random() * Math.PI * 2;
        var x = r * Math.cos(t);
        var y = r * (Math.random() * (-0.01 - 0.01) + 0.01).toFixed(4);
        var z = r * Math.sin(t);
        asteroid.position.set(x, y, z);
      }

      solarSystem.add(asteroidsRing);

      //Jupiter
      jupiterGroup = new THREE.Object3D;
      solarSystem.add(jupiterGroup);
      jupiterGroup.position.set(getX(250)*-135,-4,getZ(250)*-135);
      geometry = new THREE.SphereGeometry(10, 20 ,20);
      jupiter = createElement("../images/jupitermap.jpg");
      jupiterGroup.add(jupiter);
      createOrbit(-134.5 /*inner radius*/, -135.5 /*outer*/);

      //Jupiter moons
      createMoons(jupiterGroup, 79, 12, 4);

      //saturn
      saturnGroup = new THREE.Object3D;
      saturnMoons = new THREE.Object3D;
      solarSystem.add(saturnGroup);
      saturnGroup.position.set(0,-4, -170);
      geometry = new THREE.SphereGeometry(7, 20 ,20);
      saturn = createElement("../images/saturnmap.jpg");
      saturnGroup.add(saturn);
      createOrbit(-169.5 /*inner radius*/, -170.5 /*outer*/);
      saturnRings = createRings("../images/saturnringcolor.jpg", 5, 2)
      saturnRings.rotation.x += Math.PI/180 * -70 ; //inclination of the rings
      saturnGroup.add(saturnRings);
      saturnGroup.add(saturnMoons);
      createMoons(saturnMoons, 62, 9, 7);

      //uranus
      uranusGroup = new THREE.Object3D;
      uranusMoons = new THREE.Object3D;
      solarSystem.add(uranusGroup);
      uranusGroup.position.set(getX(135)*-200,-4,getZ(135)*-200);
      geometry = new THREE.SphereGeometry(5, 20, 20);
      uranus = createElement("../images/uranusmap.jpg");
      uranusGroup.add(uranus);
      createOrbit(-199.5 /*inner radius*/, -200.5 /*outer*/);
      uranusRings = createRings("../images/uranusringcolour.jpg", 5, 0.5);
      uranusGroup.add(uranusRings);
      uranusGroup.add(uranusMoons);
      createMoons(uranusMoons, 27, 7, 11);

      //neptune
      neptuneGroup = new THREE.Object3D;
      solarSystem.add(neptuneGroup);
      neptuneGroup.position.set(getX(300)*-230,-4,getZ(300)*-230);
      geometry = new THREE.SphereGeometry(5, 20, 20);
      neptune = createElement("../images/neptunemap.jpg");
      neptuneGroup.add(neptune);
      createOrbit(-229.5 /*inner radius*/, -230.5 /*outer*/);
      createMoons(neptuneGroup, 14, 7, 22);


      //pluto
      plutoGroup = new THREE.Object3D;
      solarSystem.add(plutoGroup);
      plutoGroup.position.set(0,-4,259);
      geometry = new THREE.SphereGeometry(1, 20 ,20);
      pluto = createBump("../images/plutomap1k.jpg", "../images/plutomap1k.jpg");
      plutoGroup.add(pluto);
      createOrbit(-259.9 /*inner radius*/, -260.3 /*outer*/);
      createMoons(plutoGroup, 5, 2, 72);

      //Star destroyer OBJ

      var objLoader = new THREE.OBJLoader();
        objLoader.load('../death-star/imperial.obj', function(object) {
            object.position.set(120,0,-25);
            object.scale.set(0.001,0.001,0.001);
            //object.rotation.set(30);
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