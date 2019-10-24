var renderer = null, 
scene = null, 
camera = null,
raycaster = null,
mouse = new THREE.Vector2(),
INTERSECTED,
CLICKED,
root = null,
robot_idle = null,
robot_attack = null,
group = null;
robot_group = new THREE.Object3D;
clones = 5;
var animator = null;
var animator_attack = null;
var startGame = null;
var game_duration = 59;
var start = true;
var time_left = null;
var play = true;
var pause = false;
var restart = false;
var high_score = 0;

var spawn_z = 80;
var rand_lim = 62;
var spawn_it = 0;
var robot_new = null;
var robot_new_arr = [];
var robot_mixer = {};
var robotAnimations = {};
var robot_mixer_arr = [];
var robot_old = null;
var robot_mixer_old = {};
var center_x = 2;
var center_z = 60;
var score = 0;
var attacked = false;

var currClicked = null;

var duration = 20000; // ms
var currentTime = Date.now();

//var animation = "idle";

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    load_time = Date.now();
    loadRobotFBX();
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 15, 120);
    scene.add(camera);
        
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 8, -10);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create the objects
    //loadFBX();
    
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);
    root.add(robot_group);
    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    
    // Now add the group to our scene
    scene.add( root );

    createRaycaster();
}

function loadRobotFBX() {
    var loader = new THREE.FBXLoader();
    loader.load( '../models/Robot/robot_idle.fbx', function ( object ) 
    {
        object.scale.set(0.02, 0.02, 0.02);
        rand = Math.floor(Math.random() * spawn_z);
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        robot_new = object;

        robot_new.position.x -= 0;
        robot_new.position.z -= 0;
        robot_new.position.y -= 0;
        robot_new.death = false;
        
        robot_new.rotation.y = Math.atan(rand/(spawn_z+120));
        
        robotAnimations.idle = object.animations[0];
        loader.load( '../models/Robot/robot_atk.fbx', function ( object )
        {
        // ADD Animation Attack
        robotAnimations.attack = object.animations[0];
        } );
    
        loader.load( '../models/Robot/robot_run.fbx', function ( object )
        {
        // ADD Animation run
        robotAnimations.run = object.animations[0];
        
        } );
    
        loader.load( '../models/Robot/robot_walk.fbx', function ( object )
        {
        // ADD Animation walk
        robotAnimations.walk = object.animations[0];
        } );
    })
}

function addRandomRobot() {
    
    // Clone robot fbx
    var newRobot = cloneFbx(robot_new);
    newRobot.traverse((node) => {
        if (node.isMesh) {
          node.material = node.material.clone();
        }
      });
  
    newRobot.death = false;
    
    robot_new_arr.push(newRobot);
    
    // Add new animation mixer
    var newRobotMixer = new THREE.AnimationMixer(newRobot);
    robot_mixer_arr.push(newRobotMixer);
    
    // Set random position
    rand = getRndInteger(-rand_lim, rand_lim);
    newRobot.position.x -= rand;
    newRobot.position.z -= spawn_z;
    newRobot.position.y -= 4;
    
    newRobot.rotation.y = Math.atan(rand/(spawn_z+120));

    createDeadAnimation(newRobot);

    robot_group.add(newRobot);
  }

function createDeadAnimation(robot)
{
    robot.animator = new KF.KeyFrameAnimator;
    robot.animator.init({ 
        interps:
            [
                { 
                    keys:[0, 1], 
                    values:[
                            { y: 0, z : 0 },
                            { y: 0, z : Math.PI / 1.65  },
                            ],
                },
                { 
                    keys:[0, 0.25, 0.5, 0.95, 1], 
                    values:[
                            { y : -4 },
                            { y : -2 },
                            { y : 0 },
                            { y : 1 },
                            { y : -8 },
                            ],
                },
            ],
        duration:1 * 1000,
        
    });
}

function createAttackAnimation()
{
    animator_attack = new KF.KeyFrameAnimator;
    animator_attack.init({ 
        interps:
            [
                { 
                    keys:[0, 1], 
                    values:[
                            { y: 0, z : 0 },
                            { y: 0, z : Math.PI / 1.65  },
                            ],
                },
                { 
                    keys:[0, 0.25, 0.5, 0.95, 1], 
                    values:[
                            { y : -4 },
                            { y : -2 },
                            { y : 0 },
                            { y : 1 },
                            { y : -8 },
                            ],
                },
            ],
        duration:1 * 1000,
        
    });
}

function playAnimations(CLICKED)
{
    CLICKED.animator.start();
}

function onDocumentMouseMove( event ) 
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( robot_group.children, true );

    if ( intersects.length > 0 ) 
    {
        //console.log("INTERSECTS: " + intersects);
        let closer = intersects.length - 1;

        if ( INTERSECTED != intersects[ closer ].object ) 
        {
            if ( INTERSECTED )
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            //console.log(INTERSECTED);
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else 
    {
        if ( INTERSECTED ) 
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;
    }
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( robot_group.children, true );

    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ 0 ].object;

        CLICKED.material.emissive.setHex( 0x00ff00 );
        if(!CLICKED.parent.animator.running)
        {
            CLICKED.parent.animator.interps[0].target = CLICKED.parent.rotation;
            CLICKED.parent.animator.interps[1].target = CLICKED.parent.position;
            addRandomRobot();
            CLICKED.parent.death = true;
            score += 1;
            $("#score").text(parseInt(score));
            playAnimations(CLICKED.parent);
        }        

        currClicked = CLICKED.parent;
    } 
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );

        CLICKED = null;
    }
}

function createRaycaster(){
    raycaster = new THREE.Raycaster();

    document.addEventListener( 'mousemove', onDocumentMouseMove );
    document.addEventListener('mousedown', onDocumentMouseDown);
}

function run() {     
    continues = 0;
    $("[id=start_id]").hide();
    requestAnimationFrame(function() { run(); });
    if(play && pause == false) {
        // Render the scene
        renderer.render( scene, camera );
        KF.update();
        animate();
        console.log("Start: "+start);
        if (start) {
            startGame = Date.now();
            start = false;
        }
        time_left = parseInt((game_duration - (Date.now() - startGame)/1000));
        
        if (time_left < 0) {
            for (var i=0;i<robot_new_arr.length;i++)
            {
                robot_group.remove(robot_new_arr[i]);
            }
            if (score > high_score)
                high_score = score;
            score = 0;
            $("#score").text(parseInt(score));
            
            start = true;
            play = false;
        }
        if(currClicked != null) {
            if(currClicked.position.y < -5)
            {
                robot_group.remove(currClicked);
            }
        }
        
    }       
    if (pause) {
        continues++;
    } $("#score").text(parseInt(score));
    $("#time_left").text(time_left);
    $("#high_score").text(parseInt(high_score));
}


function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    if (robotAnimations.walk && robot_new_arr.length < 5) {
        addRandomRobot();
    }

    //Run animation as default
    for(var i=0; i<robot_mixer_arr.length; i++)
    {
        robot_mixer_arr[i].clipAction(robotAnimations.run).play();
        robot_mixer_arr[i].update(deltat * 0.001);
    }    
    var i = 0;
    for (var robotMixer of robot_mixer_arr) {
        // Actualizar animaciones
        if (robot_new_arr[i] != null) {
            if(robot_new_arr[i].death == true)
            {
                robotMixer.clipAction(robotAnimations.attack).stop();
                robotMixer.clipAction(robotAnimations.walk).play();
                robotMixer.update(deltat * 0.00001);
            }
            else
            {
                if (robot_new_arr[i].position.z == 81) {
                    robot_group.remove(robot_new_arr[i]);
                    score -= 1;
                    $("#score").text(parseInt(score));
                    addRandomRobot();
                }
                if(robot_new_arr[i].position.z < center_z)
                {
                    robot_new_arr[i].position.z += 0.5;
    
                    if(robot_new_arr[i].position.x >= (center_x + i))
                    {
                        robot_new_arr[i].position.x -= 0.1;
                    }
                    else 
                    {
                        if(robot_new_arr[i].position.x <= (-center_x + i))
                        {
                            robot_new_arr[i].position.x += 0.1;
                        }
                    } 
                    robotMixer.update(deltat * 0.00001);
                }
                else
                {
                    robotMixer.clipAction(robotAnimations.attack).play();
                    robotMixer.update(deltat * 0.00001);
                    robot_new_arr[i].position.z += 1;
                    
                }
            }
        }
        
        i++;
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function restartButton() {
    console.log("Restart");
    play = true;
    for (var i=0;i<robot_new_arr.length;i++)
    {
        robot_group.remove(robot_new_arr[i]);
    }
    robot_new_arr = [];
    start = true;
    score = 0;
    $("#score").text(parseInt(score));
    time_left = game_duration;
    $("#time_left").text(time_left);
    if (pause)    
        stop();
}

function stop() {
    if(pause == false) {
        for(var i=0; i<robot_new_arr.length; i++){
            robot_new_arr[i].pause = true;
        }
        pause = true;
    }else{
        for(var i=0; i<robot_new_arr.length; i++){
            robot_new_arr[i].pause = false;
        }
        pause = false;
    }
}
