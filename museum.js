
let scene, camera, renderer, mesh, controls, raycaster, particleSystem, particleCount, particles, onKeyDown, onKeyUp;
let objects = [];
var meshFloor;

// var keyboard = {};
var player = { height:1.8, speed:0.2, turnSpeed:Math.PI*0.02 };

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let prevTime = performance.now();
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let vertex = new THREE.Vector3();
let color = new THREE.Color();
let clock = new THREE.Clock();

init();
animate();
function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.y = 10;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    controls = new THREE.PointerLockControls( camera, document.body );

    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {

        controls.lock();

    }, false );

    controls.addEventListener( 'lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

    } );

    controls.addEventListener( 'unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

    } );

    scene.add( controls.getObject() );

    const onKeyDown = function ( event ) {

        switch ( event.keyCode ) {

            case 38: // up
                moveForward = true;
                break;

            case 37: // left
                moveLeft = true;
                break;

            case 40: // down
                moveBackward = true;
                break;

            case 39: // right
                moveRight = true;
                break;

            case 32: // space
                if ( canJump === true ) velocity.y += 350;
                canJump = false;
                break;

        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.keyCode ) {

            case 38: // up
                moveForward = false;
                break;

            case 37: // left
                moveLeft = false;
                break;

            case 40: // down
                moveBackward = false;
                break;

            case 39: // right
                moveRight = false;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

// floor

    let floorGeometry = new THREE.PlaneBufferGeometry( 1000, 1000, 100, 100 );
    floorGeometry.rotateX( - Math.PI / 2 ); // flip to see top side of floor
    
    const floorMaterial = new THREE.MeshPhongMaterial({
        color: 0xF3FFE2,
        specular: 0xff0000,
        shininess: 40,
        map: new THREE.TextureLoader().load('adrien-olichon-R2OM3BvN-Uo-unsplash.jpg'), // load jpg as floor texture
        normalMap: new THREE.TextureLoader().load('adrien-olichon-R2OM3BvN-Uo-unsplash.jpg') // load jpg as floor texture

    });

    const floor = new THREE.Mesh( floorGeometry, floorMaterial ); // attach material to floor geometry
    scene.add( floor ); // add floor geometry to scene


// objects

    const boxGeometry = new THREE.BoxBufferGeometry( 20, 20, 20 ).toNonIndexed();

    position = boxGeometry.attributes.position;
    const colorsBox = [];

    for ( let i = 0, l = position.count; i < l; i ++ ) {

        color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        colorsBox.push( color.r, color.g, color.b );

    }

    boxGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsBox, 3 ) );

    for ( let i = 0; i < 500; i ++ ) {

        // const boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: true } );
        // boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
        const boxMaterial = new THREE.MeshStandardMaterial({
            color: 0xF3FFE2,
            roughness: 0.8,
            metalness: 0.9
            // map: new THREE.TextureLoader().load('adrien-olichon-R2OM3BvN-Uo-unsplash.jpg') // load jpg as floor texture
        });

        const box = new THREE.Mesh( boxGeometry, boxMaterial );
        box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
        box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
        box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

        scene.add( box );
        objects.push( box );

    }

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    const time = performance.now();

    if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects( objects );

        const onObject = intersections.length > 0;

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );
            canJump = true;

        }

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        controls.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( controls.getObject().position.y < 10 ) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

    }

    prevTime = time;

    renderer.render( scene, camera );

}

// function init(){
//     //Scene
//     scene = new THREE.Scene();
//     scene.background = new THREE.Color( 0xffffff );
//     scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
    
//     //Camera
// 	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
// 	camera.position.set(0, player.height, -5); //Set camera to player's height
// 	camera.lookAt(new THREE.Vector3(0,player.height,0));
    
//     //Geometry
// 	mesh = new THREE.Mesh(
// 		new THREE.BoxGeometry(1,1,1), //Add form to mesh
// 		new THREE.MeshPhongMaterial({color:0xff4444}) //Add color to form
// 	);
//     mesh.position.y += 1; // Move the mesh up 1 meter
//     mesh.receiveShadow = true; //Shadows can cast on geometry
//     mesh.castShadow = true; //Geometry casts shadow
// 	scene.add(mesh); //Add mesh/geometry to scene
    
//     //Floor
// 	geometry = new THREE.PlaneGeometry( 700, 600, 22, 12 );
//     for (let i = 0; i < geometry.vertices.length; i++) {
//         geometry.vertices[i].z = (Math.sin(i * i * i)+1/2) * 3;
//     }
//     geometry.verticesNeedUpdate = true;
//     geometry.normalsNeedUpdate = true;
//     geometry.computeFaceNormals(); 

//     material = new THREE.MeshPhongMaterial({ 
//         color: 0xFFFFFF, 
//         shininess: 60,
//         bumpScale: 0.045,
//         emissive: 0xEBF7FD,
//         emissiveIntensity: 0.03,
//     }); 

//     plane = new THREE.Mesh( geometry, material );
//     plane.rotation.x = Math.PI / -2;
//     plane.receiveShadow = true;
//     plane.position.y = -5;

//     scene.add(plane);

//     //Lights
//     hemisphereLight = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
//     scene.add(hemisphereLight);
//     light = new THREE.PointLight(0xffffff, 0.8, 10);
//     light.position.set(-3,6,-3);
//     light.castShadow = true;
//     light.shadow.camera.near = 0.1;
//     light.shadow.camera.far = 25;
//     scene.add(light);

//     //Pointer lock controls
//     // controls = new PointerLockControls( camera, document.body );

//     //Render scene to dom
// 	renderer = new THREE.WebGLRenderer();
//     renderer.setSize(1280, 720);
    
//     //Shadow
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.BasicShadowMap;

// 	document.body.appendChild(renderer.domElement);
// }
// function setupControls() {
//     raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    
//     let onKeyDown = function ( event ) {
      
//      switch ( event.keyCode ) {
//                 case 27:
//                   moveForward = false;
//                   moveBackward = false;
//                   moveLeft = false;
//                   moveRight = false;
//                   break
//                 case 38: // up
//                 case 87: // w
//                   moveForward = true;
//                   break;
//                 case 37: // left
//                 case 65: // a
//                   moveLeft = true; break;
//                 case 40: // down
//                 case 83: // s
//                   moveBackward = true;
//                   break;
//                 case 39: // right
//                 case 68: // d
//                   moveRight = true;
//                   break;
//                 case 32: // space
//                   if ( canJump === true ) velocity.y += 350;
//                   canJump = false;
//                   break;
//               }
//     };
//     let onKeyUp = function ( event ) {
//       switch( event.keyCode ) {
//         case 38: // up
//         case 87: // w
//           moveForward = false;
//           break;
//         case 37: // left
//         case 65: // a
//           moveLeft = false;
//           break;
//         case 40: // down
//         case 83: // s
//           moveBackward = false;
//           break;
//         case 39: // right
//         case 68: // d
//           moveRight = false;
//           break;
//       }
//     };
  
//     document.addEventListener( 'keydown', onKeyDown, false );
//     document.addEventListener( 'keyup', onKeyUp, false );
    
//     controls = new THREE.PointerLockControls( camera );
    
//     let blocker = document.getElementById( 'blocker' );
//     let instructions = document.getElementById( 'instructions' );
//     let hint = document.getElementById( 'hint' );
  
//     instructions.addEventListener( 'click', function () { controls.lock(); }, false );
  
//     controls.addEventListener( 'lock', function () {
//       instructions.style.display = 'none';
//       blocker.style.display = 'none';
//       hint.style.display = 'block';
//     } );
  
//     controls.addEventListener( 'unlock', function () {
//       blocker.style.display = 'block';
//       instructions.style.display = '';
//       hint.style.display = 'none';
//     } );
   
//     scene.add( controls.getObject() );
   
//   }
// // function animate(){
// // 	requestAnimationFrame(animate);
	
// // 	// Keyboard movement inputs
// // 	if(keyboard[38]){ // Up arrow Key
// // 		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
// // 		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
// // 	}
// // 	if(keyboard[40]){ // Down arrow key
// // 		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
// // 		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
// // 	}
// // 	if(keyboard[37]){ // Left arrow key
// // 		// Redirect motion by 90 degrees
// // 		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
// // 		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
// // 	}
// // 	if(keyboard[39]){ // Right arrow key
// // 		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
// // 		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
// //     }

	
// // 	renderer.render(scene, camera);
// // }
// // function handleWindowResize() {
// //     window.addEventListener( 'resize', onWindowResize, false );
// //     function onWindowResize() {
  
// //       camera.aspect = window.innerWidth / window.innerHeight;
// //       camera.updateProjectionMatrix();
// //       renderer.setSize( window.innerWidth, window.innerHeight );
  
// //     }
// // }
// // //Keyboard movement event listeners
// // function keyDown(event){
// // 	keyboard[event.keyCode] = true;
// // }

// // function keyUp(event){
// // 	keyboard[event.keyCode] = false;
// // }

// // window.addEventListener('keydown', keyDown);
// // window.addEventListener('keyup', keyUp);

// // window.onload = init;

// // animate();
// function animate() {
//     requestAnimationFrame( animate );
   
//     if (controls.isLocked === true ) {
//       raycaster.ray.origin.copy( controls.getObject().position );
//         raycaster.ray.origin.y -= 10;
      
//         var intersections = raycaster.intersectObjects( objects );
//       var onObject = intersections.length > 0;
//       var time = performance.now();
//       var delta = ( time - prevTime ) / 1000;
//       velocity.x -= velocity.x * 10.0 * delta;
//       velocity.z -= velocity.z * 10.0 * delta;
//       velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
//       direction.z = Number( moveForward ) - Number( moveBackward );
//       direction.x = Number( moveRight ) - Number( moveLeft );
//       direction.normalize(); // this ensures consistent movements in all directions
  
//       if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
//       if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
  
//       if ( onObject === true ) {
//         velocity.y = Math.max( 0, velocity.y );
//         canJump = true;
//       }
  
//       controls.moveRight( - velocity.x * delta );
//       controls.moveForward( - velocity.z * delta );
//       controls.getObject().position.y += ( velocity.y * delta ); // new behavior
  
//       if ( controls.getObject().position.y < 10 ) {
//         velocity.y = 0;
//         controls.getObject().position.y = 10;
//         canJump = true;
//       }
  
//       prevTime = time;
  
//         stats.end();
//     } else {
//       // Prevent Player from continuing if esc and forward at the same time
//       velocity.x = 0;
//       velocity.z = 0;
//       controls.moveRight(0);
//       controls.moveForward( 0 );
//       moveForward = false;
//       moveBackward = false;
//       moveLeft = false;
//       moveRight = false;
//     }
//     render();
//   }
//   function render() {
//     renderer.render( scene, camera );
//   }
//   const init = () => {
//     setupControls();
//   }
// //   window.onload = init;
  
  
  