/* THREE.js ARToolKit integration */

;
(function() {
    var integrate = function() {
        /**
        	Helper for setting up a Three.js AR scene using the device camera as input.
        	Pass in the maximum dimensions of the video you want to process and onSuccess and onError callbacks.

        	On a successful initialization, the onSuccess callback is called with an ThreeARScene object.
        	The ThreeARScene object contains two THREE.js scenes (one for the video image and other for the 3D scene)
        	and a couple of helper functions for doing video frame processing and AR rendering.

        	Here's the structure of the ThreeARScene object:
        	{
        		scene: THREE.Scene, // The 3D scene. Put your AR objects here.
        		camera: THREE.Camera, // The 3D scene camera.

        		arController: ARController,

        		video: HTMLVideoElement, // The userMedia video element.

        		videoScene: THREE.Scene, // The userMedia video image scene. Shows the video feed.
        		videoCamera: THREE.Camera, // Camera for the userMedia video scene.

        		process: function(), // Process the current video frame and update the markers in the scene.
        		renderOn: function( THREE.WebGLRenderer ) // Render the AR scene and video background on the given Three.js renderer.
        	}

        	You should use the arScene.video.videoWidth and arScene.video.videoHeight to set the width and height of your renderer.

        	In your frame loop, use arScene.process() and arScene.renderOn(renderer) to do frame processing and 3D rendering, respectively.

        	@param {number} width - The maximum width of the userMedia video to request.
        	@param {number} height - The maximum height of the userMedia video to request.
        	@param {function} onSuccess - Called on successful initialization with an ThreeARScene object.
        	@param {function} onError - Called if the initialization fails with the error encountered.
        */
        ARController.getUserMediaThreeScene = function(configuration) {
            var obj = {};
            for (var i in configuration) {
                obj[i] = configuration[i];
            }
            var onSuccess = configuration.onSuccess;

            obj.onSuccess = function(arController, arCameraParam) {
                var scenes = arController.createThreeScene();
                onSuccess(scenes, arController, arCameraParam);
            };

            var video = this.getUserMediaARController(obj);
            return video;
        };

        /**
        	Creates a Three.js scene for use with this ARController.

        	Returns a ThreeARScene object that contains two THREE.js scenes (one for the video image and other for the 3D scene)
        	and a couple of helper functions for doing video frame processing and AR rendering.

        	Here's the structure of the ThreeARScene object:
        	{
        		scene: THREE.Scene, // The 3D scene. Put your AR objects here.
        		camera: THREE.Camera, // The 3D scene camera.

        		arController: ARController,

        		video: HTMLVideoElement, // The userMedia video element.

        		videoScene: THREE.Scene, // The userMedia video image scene. Shows the video feed.
        		videoCamera: THREE.Camera, // Camera for the userMedia video scene.

        		process: function(), // Process the current video frame and update the markers in the scene.
        		renderOn: function( THREE.WebGLRenderer ) // Render the AR scene and video background on the given Three.js renderer.
        	}

        	You should use the arScene.video.videoWidth and arScene.video.videoHeight to set the width and height of your renderer.

        	In your frame loop, use arScene.process() and arScene.renderOn(renderer) to do frame processing and 3D rendering, respectively.

        	@param video Video image to use as scene background. Defaults to this.image
        */
        var isShow = false;
        var planeBox;
        ARController.prototype.createThreeScene = function(video) {
            video = video || this.image;

            this.setupThree();

            // To display the video, first create a texture from it.
            var videoTex = new THREE.Texture(video);

            videoTex.minFilter = THREE.LinearFilter;
            videoTex.flipY = false;

            // Then create a plane textured with the video.
            var plane = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(2, 2),
                new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.DoubleSide })
            );

            // The video plane shouldn't care about the z-buffer.
            plane.material.depthTest = false;
            plane.material.depthWrite = false;

            var texture = new THREE.CanvasTexture(document.getElementById('boxCanvas'));
            texture.needsUpdate = true;
            // texture.wrapS = THREE.RepeatWrapping;
            // // texture.repeat.x = -1;
            // // texture.rotation.x = Math.PI;
            // texture.repeat.z = -1;

            var planeB = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(-1, -1),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true })
            );
            planeBox = planeB;



            // Create a camera and a scene for the video plane and
            // add the camera and the video plane to the scene.
            var videoCamera = new THREE.OrthographicCamera(-1, 1, -1, 1, -1, 1);
            var videoScene = new THREE.Scene();
            videoScene.background = new THREE.Color(0x000000);

            videoScene.add(plane);
            videoScene.add(planeB);
            // videoScene.add(line);
            videoScene.add(videoCamera);
            // document.getElementById('myCanvas').style.display = 'none'

            if (this.orientation === 'portrait') {
                plane.rotation.z = Math.PI / 2;
            }

            var scene = new THREE.Scene();
            // var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            // camera.position.z = 25;
            // camera.position.y = 15;
            // setProjectionMatrix(camera.projectionMatrix, this.getCameraMatrix());
            // var camera = new THREE.Camera();
            // camera.matrixAutoUpdate = true;
            // setProjectionMatrix(camera.projectionMatrix, this.getCameraMatrix());

            var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
            camera.position.z = 0;
            camera.position.y = 0;
            camera.matrixAutoUpdate = false;
            var matrix = [1.9102363924347978, 0, 0, 0, 0, 2.5377457054523322, 0, 0, -0, -0.005830389685211879, -1.0000002000000199, -1, 0, 0, -20.0000002000000202, 0]
                // var matrix = new Float64Array();
                // matrix.set([1.9102363924347978, 0, 0, 0, 0, 2.5377457054523322, 0, 0, -0.013943280545895442, -0.005830389685211879, -1.0000002000000199, -1, 0, 0, -0.00020000002000000202, 0]);
                // console.log('camera ', this.getCameraMatrix())

            setProjectionMatrix(camera.projectionMatrix, matrix);

            // scene.add(camera);

            // var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000);
            // scene.add(camera);

            // scene.add(camera);


            var self = this;
            var count = 0;

            return {
                scene: scene,
                videoScene: videoScene,
                camera: camera,
                videoCamera: videoCamera,

                arController: this,

                video: video,
                isInteract: function() { return isShow; },

                process: function() {

                    // videoTex.needsUpdate = true;
                    var time = new Date().getSeconds();
                    // if (time % 2 == 0)
                    // {
                    if (isShow)
                        for (var i in self.threeNFTMarkers) {
                            self.threeNFTMarkers[i].visible = true;
                        }
                    else
                        for (var i in self.threeNFTMarkers) {
                            self.threeNFTMarkers[i].visible = false;
                        }
                        // document.getElementById('txt').textContent = video.paused;
                    if (video.paused)
                        video.paused = false;
                    self.process(video, time);

                    // }
                    // setTimeout(function() {

                    // }, 1000)
                },

                renderOn: function(renderer) {
                    // count++;
                    // document.getElementById('txt').textContent = count;
                    videoTex.needsUpdate = true;
                    var ac = renderer.autoClear;
                    renderer.autoClear = false;
                    renderer.clear();
                    renderer.render(this.videoScene, this.videoCamera);
                    renderer.render(this.scene, camera);
                    renderer.autoClear = ac;
                }

            };
        };


        /**
        	Creates a Three.js marker Object3D for the given NFT marker UID.
        	The marker Object3D tracks the NFT marker when it's detected in the video.

        	Use this after a successful artoolkit.loadNFTMarker call:

        	arController.loadNFTMarker('DataNFT/pinball', function(markerUID) {
        		var markerRoot = arController.createThreeNFTMarker(markerUID);
        		markerRoot.add(myFancyModel);
        		arScene.scene.add(markerRoot);
        	});

        	@param {number} markerUID The UID of the marker to track.
        	@param {number} markerWidth The width of the marker, defaults to 1.
        	@return {THREE.Object3D} Three.Object3D that tracks the given marker.
        */
        ARController.prototype.createThreeNFTMarker = function(markerUID, markerWidth) {
            this.setupThree();
            var obj = new THREE.Object3D();
            obj.markerTracker = this.trackNFTMarkerId(markerUID, markerWidth);
            obj.matrixAutoUpdate = false;
            this.threeNFTMarkers[markerUID] = obj;
            return obj;
        };

        ARController.prototype.setupThree = function() {
            if (this.THREE_JS_ENABLED) {
                return;
            }
            this.THREE_JS_ENABLED = true;

            /*
            	Listen to getNFTMarker events to keep track of Three.js markers.
            */
            var preMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.addEventListener('getNFTMarker', function(ev) {
                // document.getElementById('boxCanvas').style.display = 'none';
                isShow = true;
                planeBox.visible = false;
                var time = new Date().getMilliseconds();
                if (time % 1 == 0) {
                    var marker = ev.data.marker;
                    var obj;

                    obj = this.threeNFTMarkers[ev.data.marker.id];

                    if (obj) {
                        // if (checkDiff(preMatrix, ev.data.matrixGL_RH)) 
                        {
                            obj.matrix.fromArray(ev.data.matrixGL_RH);
                            obj.visible = true;
                            preMatrix = ev.data.matrixGL_RH;
                        }
                        // else {
                        //     obj.matrix.fromArray(preMatrix);
                        //     obj.visible = true;
                        //     // preMatrix = midMatrix(preMatrix, ev.data.matrixGL_RH);
                        // }
                    }
                }
                //  else {
                //     var marker = ev.data.marker;
                //     var obj;

                //     obj = this.threeNFTMarkers[ev.data.marker.id];

                //     if (obj) {
                //         obj.matrix.fromArray(midMatrix(preMatrix, ev.data.matrixGL_RH));
                //         obj.visible = true;
                //         preMatrix = midMatrix(preMatrix, ev.data.matrixGL_RH);
                //         console.log(preMatrix)
                //     }
                // }
            });
            var midMatrix = function(oldMatrix, newMatrix) {
                var midMatrix = [];
                for (var i = 0; i < oldMatrix.length; i++) {
                    midMatrix[i] = (oldMatrix[i] + newMatrix[i]) / 2;
                }
                return midMatrix;
            }
            var checkDiff = function(oldMatrix, newMatrix) {
                var count = 0;
                for (var i = 0; i < 11; i++) {
                    if (Math.abs(oldMatrix[i] - newMatrix[i]) < 0.01)
                        count++;
                }
                for (var i = 11; i < oldMatrix.length; i++) {
                    if (Math.abs(oldMatrix[i] - newMatrix[i]) < 5)
                        count++;
                }
                if (count == 16)
                    return false;
                else
                    return true;
            }



            this.addEventListener('lostNFTMarker', function(ev) {
                // console.log('lost');
                // document.getElementById('boxCanvas').style.display = 'block';

                isShow = false;
                planeBox.visible = true;
                var marker = ev.data.marker;
                var obj;

                obj = this.threeNFTMarkers[ev.data.marker.id];

                if (obj) {
                    // obj.matrix.fromArray(ev.data.matrixGL_RH);
                    obj.visible = false;
                }
            });

            /**
            	Index of Three.js NFT markers, maps markerID -> THREE.Object3D.
            */
            this.threeNFTMarkers = {};
            // setTimeout(function(){

            // }, 100)

        };

    };
    /**
     * Helper Method for Three.js compatibility
     */
    var setProjectionMatrix = function(projectionMatrix, value) {
        if (typeof projectionMatrix.elements.set === "function") {
            projectionMatrix.elements.set(value);
        } else {
            projectionMatrix.elements = [].slice.call(value);
        }
    };

    var tick = function() {
        if (window.ARController && window.THREE) {
            integrate();
            if (window.ARThreeOnLoad) {
                window.ARThreeOnLoad();
            }
        } else {
            setTimeout(tick, 50);
        }
    };

    tick();

})();