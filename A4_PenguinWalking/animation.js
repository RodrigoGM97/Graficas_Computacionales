var renderer = null;
var scene = null;
var camera = null;
var group = null;
var father = null;
var directionalLight = null;
var floor = null;
var camera_control = null;

var duration = 10, // sec
crateAnimator = null,
waveAnimator = null,
lightAnimator = null,
waterAnimator = null,
animateCrate = true,
animateWaves = true,
animateLight = true,
animateWater = true,
loopAnimation = false;

var right_circle_anim;
var first_trav_anim;

var rotateHeadCoords = [];
var rotateHeadKeys = [];

first_line = [{x:0,y:0,z:0},{x:30,y:0,z:-10}]
loop_coords = [];
loop_keys = [];
loop_coords_sun = [];
loop_coords_sun_keys = [];
loop_coords_balance = [];
loop_coords_balance_keys = [];

x_size = 50;
radius = 20;


var floorMapURL = 'snow_texture1550.jpg';

function run()
{
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Update the animations
        KF.update();

        // Update the camera controller
        camera_control.update();
}

function createScene(canvas) 
{
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Create a new Three.js scene
    scene = new THREE.Scene();


    texture = new THREE.TextureLoader().load("../images/nebula.jpg");
    material = new THREE.MeshPhongMaterial({ map: texture });
    //scene.background = new THREE.Color( 0.3, 0.3, 0.3 );
    scene.background = texture;

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera_control = new THREE.OrbitControls(camera, canvas);
    camera.position.z = 100;
    camera_control.update();
    scene.add(camera);

    root = new THREE.Object3D;

   // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(0, 1, 2);
    root.add(directionalLight);

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create a group to hold the objects
    group = new THREE.Object3D;
    father = new THREE.Object3D;
    root.add(group);
    root.add(father);

    // Create a texture map
    var waterMap = new THREE.TextureLoader().load(floorMapURL);
    waterMap.wrapS = waterMap.wrapT = THREE.RepeatWrapping;
    waterMap.repeat.set(4, 4);

    var color = 0xffffff;
    
    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    waves = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:waterMap, side:THREE.DoubleSide}));
    waves.rotation.x = -Math.PI / 2;
    waves.position.y = -1.02;
    
    // Add the waves to our group
    root.add( waves );

    // Create the cube geometry
    map = new THREE.TextureLoader().load(floorMapURL);
    geometry = new THREE.CubeGeometry(2, 2, 2);
    
    // And put the geometry and material together into a mesh
    var color = 0xffffff;
    ambient = 0x888888;

    var objLoader = new THREE.OBJLoader();
    objLoader.load('Penguin_obj/penguin.obj', function (object) {
        penguin = object;
        penguin.position.set(-0.5, -0.5, -0.5);
        penguin.scale.set(0.5, 0.5, 0.5);

        group.add(penguin);
        
        penguinMap = new THREE.TextureLoader().load('Penguin_obj/peng_texture.jpg');
        penguin.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = penguinMap;
            }
        } );
    });

    geometry = new THREE.SphereGeometry(10, 10, 10);
    texture = new THREE.TextureLoader().load("../images/sunmap2.jpg");
    material = new THREE.MeshBasicMaterial({ map: texture });
    sun = new THREE.Mesh(geometry, material);
    //sun.position.set(0,40,-20);
    root.add(sun);
    father.add(group);
    
    loop_coords_f();
    rotationCoords();
    balanceCoords();
    sunCoords();
    playAnimations();
    
    // Now add the group to our scene
    scene.add( root );
}

function playAnimations()
{
    step();
    loop_translate();
    animate_light();
    //rotate_body();
    rotateSun();
    
}

function loop_coords_f()
{
    var coords = {x:0, y:0, z:0};
    var x=30;
    var y=0;

    //First line
    x=0;
    z=0;
    coords =  {x,y,z};
    loop_coords.push(coords);
    x=x_size;
    z=-radius;
    coords = {x,y,z};
    loop_coords.push(coords);

    loop_keys = [0, 0.125];

    //Right-circle
    for (var theta=4.71239; theta<=7.85398; theta+=0.0174533)
    {
        x = radius * Math.cos(theta) + x_size;
        z = radius * Math.sin(theta);
        coords = {x,y,z};
        //console.log("coords: "+coords.z);
        loop_coords.push(coords);
    }
    x=x_size;
    z=radius;
    coords = {x,y,z};
    //console.log("coords: "+coords.z);
    loop_coords.push(coords);
    //.126 - .375
    for (var keys=.126;keys<=.375;keys+=0.001383333)
    {
        loop_keys.push(keys);
    }

    //Second Line
    x=x_size;
    z=radius;
    coords =  {x,y,z};
    loop_coords.push(coords);
    x=-x_size;
    z=-radius;
    coords = {x,y,z};
    loop_coords.push(coords);
    //console.log("Keys: "+loop_keys);
    //console.log("Coords: "+loop_coords);

    //.376 - .625
    loop_keys.push(.376);
    loop_keys.push(.625);
    //Left circle
    for (var theta=4.71239; theta>=1.5708; theta-=0.0174533)
    {
        x = radius * Math.cos(theta) - x_size;
        z = radius * Math.sin(theta);
        coords = {x,y,z};
        loop_coords.push(coords);
    }
    x=-x_size;
    z=radius;
    coords = {x,y,z};
    loop_coords.push(coords);

    //.626 - .875
    for (var keys=.626;keys<=.875;keys+=0.001383333)
    {
        loop_keys.push(keys);
    }


    //Third line
    x=-x_size;
    z=radius;
    coords =  {x,y,z};
    loop_coords.push(coords);
    x=0;
    z=0;
    coords = {x,y,z};
    loop_coords.push(coords);

    //console.log("Coords: "+loop_coords.length);

    loop_keys.push(0.876);
    loop_keys.push(1);    
}

function rotationCoords()
{
    var angle;
    x = 0;
    y = 0;
    z = 0;
    coords =  {x,y,z};
    
    //First Line
    angle = Math.atan(radius / x_size);
    y = angle + 1.5708;
    coords =  {x,y,z};
    rotateHeadCoords.push(coords);
    rotateHeadCoords.push(coords);
    rotateHeadKeys = [0, 0.125];

    console.log("angle: "+angle);

    //Right Circle

    //Second Line

    x = 0;
    y = 0;
    z = 0;
    coords =  {x,y,z};
    
    angle = Math.atan(radius / x_size);
    y = angle - Math.PI/1.2;
    coords =  {x,y,z};
    rotateHeadCoords.push(coords);
    rotateHeadCoords.push(coords);
    rotateHeadKeys.push(.376);
    rotateHeadKeys.push(.625);

    //Left Circle

    //Third Line
    angle = Math.atan(radius / x_size);
    y = angle + 1.5708;
    coords =  {x,y,z};
    rotateHeadCoords.push(coords);
    rotateHeadCoords.push(coords);
    rotateHeadKeys.push(0.876);
    rotateHeadKeys.push(1); 
}

function balanceCoords()
{
    for (var i=2; i<=361/5; i+=1)
    {      
        x = 0;
        y = 0;
        z = 0;
        coords = {x,y,z};
        //console.log("coords: "+coords.z);
        loop_coords_balance.push(coords);

        x = 0;
        y = 0;
        z = 0.05;
        coords = {x,y,z};
        //console.log("coords: "+coords.z);
        loop_coords_balance.push(coords);
        x = 0;
        y = 0;
        z = 0;
        coords = {x,y,z};
        //console.log("coords: "+coords.z);
        loop_coords_balance.push(coords);
        x = 0;
        y = 0;
        z = -0.05;
        coords = {x,y,z};
        //console.log("coords: "+coords.z);
        loop_coords_balance.push(coords);
        x = 0;
        y = 0;
        z = 0;
        coords = {x,y,z};
        //console.log("coords: "+coords.z);
        loop_coords_balance.push(coords);
    }
    //.126 - .375
    for (var keys=0.001;keys<=1;keys+=1/360)
    {
        loop_coords_balance_keys.push(keys);
    }

    console.log("Coords: "+ loop_coords_balance.length);
}

function loop_translate()
{
    right_circle_anim = new KF.KeyFrameAnimator;
    right_circle_anim.init({ 
        interps:
            [
                { 
                    keys:loop_keys, 
                    values:loop_coords,
                    target:father.position
                },
                { 
                    keys:rotateHeadKeys, 
                    values:rotateHeadCoords,
                    target:father.rotation
                }
            ],
        loop: true,
        duration:20 * 1000,
        //easing:TWEEN.Easing.Exponential.Out,

    });


    right_circle_anim.start();
}

function step()
{
    stepAnimator = new KF.KeyFrameAnimator;
        stepAnimator.init({ 
            interps:
                [
                    { 
                        //364 keys
                        keys:loop_coords_balance_keys, 
                        values:loop_coords_balance,
                        target:group.rotation
                    }
                ],
            loop: true,
            duration:20 * 1000,
            //easing:TWEEN.Easing.Bounce.InOut,

        });
        stepAnimator.start();
}

function rotate_body()
{
    stepAnimator = new KF.KeyFrameAnimator;
        stepAnimator.init({ 
            interps:
                [
                    { 
                        keys:rotateHeadKeys, 
                        values:rotateHeadCoords,
                        target:father.rotation
                    }
                ],
            duration:20 * 1000,
            //easing:TWEEN.Easing.Bounce.InOut,

        });
        stepAnimator.start();
}

function animate_light()
{
    lightAnimator = new KF.KeyFrameAnimator;
        lightAnimator.init({ 
            interps:
                [
                    { 
                        keys:[0, 0.2, 0.4, 0.6, 0.8, 1], 
                        values:[
                                { r: 0.5, g : 0.5, b: 0.5 },
                                { r: 1, g : 1, b: 1 },
                                { r: 0.5, g : 0.5, b: 0.5 },
                                { r: 0, g : 0, b: 0 },
                                { r: 0, g : 0, b: 0 },
                                { r: 0, g : 0, b: 0 },
                                ],
                        target:directionalLight.color
                    },
                ],
            loop: true,
            duration:10 * 1000,
        });
    
        lightAnimator.start();
}

function sunCoords()
{
    
    for (var theta=0; theta<=Math.PI*2; theta+=0.0174533)
    {
        x = 100 * Math.cos(theta);
        y = 100 * Math.sin(theta);
        z = -20;
        coords = {x,y,z};
        //console.log("coords: "+coords.z);
        loop_coords_sun.push(coords);
    }

    for(var i=0;i<1;i+=1/358)
    {
        loop_coords_sun_keys.push(i);
    }
    loop_coords_sun_keys.push(1);
    //console.log("Suncoords: "+loop_coords_sun.length);
    //console.log("Sunkeys: "+loop_coords_sun_keys);


}

function rotateSun()
{
    sunAnimator = new KF.KeyFrameAnimator;
        sunAnimator.init({ 
            interps:
                [
                    { 
                        keys:loop_coords_sun_keys, 
                        values:loop_coords_sun,
                        target:sun.position
                    },
                ],
            loop: true,
            duration:duration * 1000,
            //easing:TWEEN.Easing.Sinusoidal.In,
        });
    
        sunAnimator.start();
}