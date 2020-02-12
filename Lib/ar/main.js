function initAR() {
    // document.getElementById('renderCanvas').className = 'main';
    debugger
    var canvasElement = document.createElement('canvas');
    canvasElement.id = 'boxCanvas';
    canvasElement.className = "boxCanvas";
    canvasElement.style.transform = "scale(1,1)";
    canvasElement.width = document.getElementById('renderCanvas').offsetWidth;
    canvasElement.height = parseFloat(canvasElement.width) * 0.75;
    document.getElementById('renderCanvas').appendChild(canvasElement);
    canvasElement.style.display = 'none';
    // canvasElement.style.width = '100%';
    // canvasElement.style.height = (0.75 * canvasElement.offsetWidth).toString() + 'px';
    // canvasElement.width = canvasElement.style.width;
    // canvasElement.height = canvasElement.style.height;

    window.ARThreeOnLoad = function() {
        ARController.getUserMediaThreeScene({
            maxARVideoSize: 320,
            cameraParam: '/resources/camera_para/camera_para-iPhone 5 rear 640x480 1.0m.dat',
            onSuccess: function(arScene, arController, arCamera) {

                document.body.className = arController.orientation;

                var renderer = new THREE.WebGLRenderer({
                    // antialias: true
                    // preserveDrawingBuffer: true,
                    antialias: true,
                    // alpha: true
                });
                renderer.gammaOutput = true;
                renderer.gammaFactor = 2.2;
                renderer.setClearColor(0x00ffff, 1);

                var scene = new THREE.Scene();

                var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.z = 25;
                camera.position.y = 15;

                var light = new THREE.DirectionalLight("#c1582d", 1);
                var ambient = new THREE.AmbientLight("#85b2cd");
                light.position.set(0, -70, 100).normalize();
                scene.add(light);
                scene.add(ambient);
                renderer.domElement.className = 'renderCanvas';
                renderer.domElement.id = 'renderCanvasContext';
                // renderer.domElement.style.width = '100%';
                document.getElementById('renderCanvas').appendChild(renderer.domElement);
                // canvasElement.width = renderer.domElement.width;
                // canvasElement.height = renderer.domElement.height;
                // canvasElement.style.top = renderer.domElement.height / 2 - canvasElement.height / 2;

                if (arController.orientation === 'portrait') {
                    var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
                    var h = window.innerWidth;
                    renderer.setSize(w, h);
                    // renderer.domElement.style.paddingBottom = (w - h) + 'px';
                    var canvas = document.getElementById("boxCanvas");
                    var ctx = canvas.getContext("2d");
                    ctx.lineWidth = 50;
                    ctx.strokeStyle = 'white';
                    var boxWidth = canvas.width;
                    var boxHeight = canvas.height;
                    ctx.strokeRect(canvas.width / 2 - boxWidth / 2, canvas.height / 2 - boxHeight / 2, boxWidth, boxHeight);

                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.scale(-1, 1);
                    ctx.rotate(Math.PI / 2);
                    ctx.font = boxHeight / 10 + 'px' + " Comic Sans MS";
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";
                    ctx.fillText("Scan marker here", 0, 0);
                    document.getElementById('renderCanvasContext').style.height = document.getElementById('renderCanvas').offsetWidth + 'px';
                    document.getElementById('renderCanvasContext').style.width = parseFloat(document.getElementById('renderCanvas').offsetWidth) / 0.75 + 'px';
                    document.getElementById('renderCanvas').style.marginBottom = '15%';
                    document.getElementById('renderCanvas').style.marginLeft = '-15%';
                    document.getElementById('renderCanvasContext').style.marginTop = '15%';
                } else {
                    if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
                        // renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);

                        var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
                        var h = window.innerWidth;
                        renderer.setSize(w, h);

                        var canvas = document.getElementById("boxCanvas");
                        var ctx = canvas.getContext("2d");
                        ctx.lineWidth = 50;
                        ctx.strokeStyle = 'white';
                        var boxWidth = canvas.width;
                        var boxHeight = canvas.height;
                        ctx.strokeRect(canvas.width / 2 - boxWidth / 2, canvas.height / 2 - boxHeight / 2, boxWidth, boxHeight);

                        ctx.translate(canvas.width / 2, canvas.height / 2);
                        ctx.scale(-1, 1);
                        // ctx.rotate(Math.PI / 2);
                        ctx.font = boxHeight / 10 + 'px' + " Comic Sans MS";
                        ctx.fillStyle = "white";
                        ctx.textAlign = "center";
                        ctx.fillText("Scan marker here", 0, 0);
                    } else {
                        renderer.setSize(arController.videoWidth, arController.videoHeight);
                        document.body.className += ' desktop';
                        var canvas = document.getElementById("boxCanvas");
                        // var canvas = canvasElement; //TODO HERE
                        var ctx = canvas.getContext("2d");

                        ctx.lineWidth = 50;
                        ctx.strokeStyle = 'white';
                        var boxWidth = canvas.width;
                        var boxHeight = canvas.height;
                        ctx.strokeRect(canvas.width / 2 - boxWidth / 2, canvas.height / 2 - boxHeight / 2, boxWidth, boxHeight);
                        // ctx.strokeRect(0, 0, 100, 100);
                        // ctx.stroke();


                        ctx.translate(canvas.width / 2, canvas.height / 2);
                        // ctx.scale(-1, 1);
                        // ctx


                        ctx.font = boxWidth / 10 + 'px' + " Comic Sans MS";
                        ctx.fillStyle = "white";
                        ctx.textAlign = "center";
                        ctx.fillText("Scan marker here", 0, 0);
                    }
                    document.getElementById('renderCanvasContext').style.width = '100%';
                    document.getElementById('renderCanvasContext').style.height = (0.75 * document.getElementById('renderCanvasContext').offsetWidth) + 'px';
                }

                var rotationV = 0;
                var rotationTarget = 0;
                var mixers = [];
                var clock = new THREE.Clock();
                var objectRoot;
                var preMousePos;
                var isRotate = false;
                var finger_dist;

                function getMousePos(canvasDom, mouseEvent) {
                    var rect = canvasDom.getBoundingClientRect();
                    return {
                        x: mouseEvent.clientX - rect.left,
                        y: mouseEvent.clientY - rect.top
                    };
                }

                function getTouchPos(canvasDom, touchEvent) {
                    var rect = canvasDom.getBoundingClientRect();
                    return {
                        x: touchEvent.touches[0].clientX - rect.left,
                        y: touchEvent.touches[0].clientY - rect.top
                    };
                }

                function get_distance(e) {
                    var diffX = e.touches[0].clientX - e.touches[1].clientX;
                    var diffY = e.touches[0].clientY - e.touches[1].clientY;
                    return Math.sqrt(diffX * diffX + diffY * diffY);
                }

                //////////// Mouse Event /////////////
                renderer.domElement.addEventListener('mousedown', function(ev) {
                    if (arScene.isInteract()) {
                        preMousePos = getMousePos(renderer.domElement, ev);
                        isRotate = true
                    }
                }, false);
                renderer.domElement.addEventListener('mousemove', function(ev) {
                    if (arScene.isInteract()) {
                        if (isRotate) {
                            var newMousePos = getMousePos(renderer.domElement, ev);
                            if (preMousePos.x && preMousePos.y) {
                                var deltaX = newMousePos.x - preMousePos.x;
                                var deltaY = newMousePos.y - preMousePos.y;
                                objectRoot.rotation.y += deltaX / 100;
                                objectRoot.rotation.x += deltaY / 100;
                            }

                            preMousePos = newMousePos;
                        }
                    }
                }, false);
                renderer.domElement.addEventListener('mouseup', function(ev) {
                    if (arScene.isInteract()) {
                        isRotate = false;
                    }
                }, false);

                renderer.domElement.addEventListener('wheel', function(ev) {
                    if (arScene.isInteract()) {
                        if (ev.deltaY < 0)
                            var scale = objectRoot.scale.x + 0.05;
                        else
                            var scale = objectRoot.scale.x - 0.05;
                        objectRoot.scale.x = scale;
                        objectRoot.scale.y = scale;
                        objectRoot.scale.z = scale;
                    }
                }, false);
                ///////////////////////////

                /////////// Touch Event //////////////
                renderer.domElement.addEventListener('touchstart', function(ev) {
                    if (arScene.isInteract()) {
                        if (ev.touches.length > 1) {
                            finger_dist = get_distance(ev);
                        } else {
                            preMousePos = getTouchPos(renderer.domElement, ev);
                            isRotate = true
                        }
                    }
                }, false);
                renderer.domElement.addEventListener('touchmove', function(ev) {
                    if (arScene.isInteract()) {
                        ev.preventDefault();
                        if (ev.touches.length > 1) {
                            var new_finger_dist = get_distance(ev);
                            var scale = objectRoot.scale.x + (new_finger_dist - finger_dist) / 1000;
                            objectRoot.scale.x = scale;
                            objectRoot.scale.y = scale;
                            objectRoot.scale.z = scale;
                            finger_dist = new_finger_dist;
                        } else {
                            if (isRotate) {
                                var newMousePos = getTouchPos(renderer.domElement, ev);
                                if (preMousePos.x && preMousePos.y) {
                                    var deltaX = newMousePos.x - preMousePos.x;
                                    var deltaY = newMousePos.y - preMousePos.y;
                                    objectRoot.rotation.y += deltaX / 100;
                                    objectRoot.rotation.x += deltaY / 100;
                                }

                                preMousePos = newMousePos;
                            }
                        }
                    }
                }, false);
                renderer.domElement.addEventListener('touchend', function(ev) {
                    if (arScene.isInteract()) {
                        isRotate = false;
                    }
                }, false);
                ////////////////////////////////

                // var sphere = new THREE.Mesh(
                //     new THREE.SphereGeometry(0.5, 8, 8),
                //     new THREE.MeshNormalMaterial()
                // );

                var ambient = new THREE.AmbientLight(0x222222);
                arScene.scene.add(ambient);

                var directionalLight = new THREE.DirectionalLight(0xdddddd, 4);
                directionalLight.position.set(0, 0, 1).normalize();
                arScene.scene.add(directionalLight);

                // var light = new THREE.DirectionalLight("#c1582d", 1);
                // var ambient = new THREE.AmbientLight("#85b2cd");
                // light.position.set(0, -70, 100).normalize();
                // arScene.scene.add(light);
                // arScene.scene.add(ambient);

                // sphere.material.flatShading;
                // sphere.position.z = 0;
                // sphere.position.x = 0;
                // sphere.position.y = 0;
                // sphere.scale.set(20, 20, 20);

                arController.loadNFTMarker('/resources/dataNFT/Kyanon', function(markerId) {
                    var markerWidth = 10;
                    var markerRoot = arController.createThreeNFTMarker(markerId);
                    arScene.scene.add(markerRoot);
                    root = markerRoot;
                    // markerRoot.add(sphere);
                    var loader = new THREE.GLTFLoader();
                    // loader.load('/resources/models/scene.gltf', function(gltf) {
                    loader.load('/resources/models/fairy-archer/scene.gltf', function(gltf) {
                        // loader.load('https://raw.githubusercontent.com/huynhthanhnhan/MyImage/master/Model/popipo_miku_remix/scene.gltf', function(gltf) {
                        // loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/ladybug.gltf', function(gltf) {
                        // gltf.scene.scale.set(0.01, 0.01, 0.01);
                        // console.log(gltf.scene)
                        // arScene.scene.add(gltf.scene);
                        // scene.add(gltf.scene);
                        setTimeout(function() {
                            gltf.scene.rotation.x = 0.5 * Math.PI;
                            var object = gltf.scene;
                            object.position.z = -0;
                            object.position.x = 25;
                            object.position.y = 50;
                            var box = new THREE.Box3().setFromObject(object);
                            var scale = 20 / box.getSize().x;
                            object.scale.set(scale, scale, scale);
                            // object.scale.set(0.5, 0.5, 0.5);
                            // gltf.mixer = new THREE.AnimationMixer(gltf.scene);
                            // gltf.mixer.clipAction(gltf.animations[0]).play();
                            var animation = gltf.animations[0];
                            if (animation) {
                                var mixer = new THREE.AnimationMixer(object);
                                mixers.push(mixer);
                                var action = mixer.clipAction(animation);
                                action.play();
                            }

                            markerRoot.matrixAutoUpdate = false;

                            markerRoot.add(object);

                            objectRoot = object;

                        }, 0)
                        window['arScene'] = arScene;

                        // document.getElementById('loading').style.display = "none";
                    }, function(xhr) {

                        console.log((xhr.loaded / (xhr.total + xhr.loaded) * 100 * 2) + '% loaded');

                    }, function(error) {
                        console.error(error);
                    });
                });

                window['add'] = function add() {
                    root.add(objectRoot);
                }
                window['remove'] = function remove() {
                    if (root) {
                        if (root.children[0]) {
                            root.remove(root.children[0]);
                        }

                    }
                }
                window['replace'] = function replace(url) {
                        if (root) {
                            if (root.children[0]) {
                                root.remove(root.children[0]);
                                mixers = [];
                            }

                        }
                        var loader = new THREE.GLTFLoader();
                        loader.load(url, function(gltf) {
                            setTimeout(function() {
                                gltf.scene.rotation.x = 0.5 * Math.PI;
                                var object = gltf.scene;
                                object.position.z = -0;
                                object.position.x = 25;
                                object.position.y = 50;
                                var box = new THREE.Box3().setFromObject(object);
                                var scale = 50 / box.getSize().x;
                                object.scale.set(scale, scale, scale);

                                var animation = gltf.animations[0];
                                if (animation) {
                                    var mixer = new THREE.AnimationMixer(object);
                                    mixers.push(mixer);
                                    var action = mixer.clipAction(animation);
                                    action.play();
                                }

                                root.add(object);

                                objectRoot = object;

                            }, 0)

                        }, function(xhr) {

                            console.log((xhr.loaded / (xhr.total + xhr.loaded) * 100 * 2) + '% loaded');

                        }, function(error) {
                            console.error(error);
                        });
                    }
                    // document.getElementById('archer').addEventListener('click', replace)

                var tick = function() {
                    requestAnimationFrame(tick);
                    arScene.renderOn(renderer);
                    arScene.process();
                    if (mixers.length > 0) {
                        for (var i = 0; i < mixers.length; i++) {
                            mixers[i].update(clock.getDelta());
                        }
                    }

                };

                tick();

            }
        });

        delete window.ARThreeOnLoad;

    };

    if (window.ARController && ARController.getUserMediaThreeScene) {
        ARThreeOnLoad();
    }
}
initAR()