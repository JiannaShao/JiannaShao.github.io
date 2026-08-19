import * as THREE from "three";

// =====================================================
// BASIC SETUP
// =====================================================

const gallery = document.getElementById("gallery");

const scene = new THREE.Scene();

scene.background =
    new THREE.Color("#f3f1e8");


const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth /
        window.innerHeight,
        0.1,
        100
    );


camera.position.set(
    0,
    1.7,
    8
);


// =====================================================
// RENDERER
// =====================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


// Correct color handling
renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.15;


renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


gallery.appendChild(
    renderer.domElement
);


// =====================================================
// LIGHTING
// =====================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.5
    );

scene.add(
    ambientLight
);


const mainLight =
    new THREE.DirectionalLight(
        0xffffff,
        1.5
    );


mainLight.position.set(
    0,
    8,
    0
);

mainLight.castShadow = true;

scene.add(
    mainLight
);


// =====================================================
// MATERIALS
// =====================================================

const wallMaterial =
    new THREE.MeshStandardMaterial({
        color: "#f3f1e8",
        roughness: 0.9
    });


const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: "#182b3d",
        roughness: 0.85
    });


const ceilingMaterial =
    new THREE.MeshStandardMaterial({
        color: "#111f2d",
        roughness: 1
    });


const frameMaterial =
    new THREE.MeshStandardMaterial({
        color: "#111111",
        roughness: 0.6
    });


// =====================================================
// GALLERY DIMENSIONS
// =====================================================

const ROOM_WIDTH = 14;
const ROOM_LENGTH = 12;

const WALL_HEIGHT = 7;

const CAMERA_HEIGHT = 1.7;


// =====================================================
// COLLISION OBJECTS
// =====================================================

const collidableObjects = [];


// =====================================================
// FLOOR
// =====================================================

const floor =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            ROOM_WIDTH,
            0.2,
            ROOM_LENGTH * 3
        ),
        floorMaterial
    );


floor.position.set(
    0,
    -0.1,
    -8
);


floor.receiveShadow = true;

scene.add(
    floor
);


// =====================================================
// CEILING
// =====================================================

const ceiling =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            ROOM_WIDTH,
            0.2,
            ROOM_LENGTH * 3
        ),
        ceilingMaterial
    );


ceiling.position.set(
    0,
    WALL_HEIGHT,
    -8
);


scene.add(
    ceiling
);


// =====================================================
// WALL CREATION
// =====================================================

function createWall(
    width,
    depth,
    x,
    z
) {

    const wall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                WALL_HEIGHT,
                depth
            ),
            wallMaterial
        );


    wall.position.set(
        x,
        WALL_HEIGHT / 2,
        z
    );


    wall.receiveShadow = true;

    scene.add(
        wall
    );


    collidableObjects.push({
        type: "wall",
        object: wall
    });


    return wall;

}


// =====================================================
// OUTER WALLS
// =====================================================

// LEFT

createWall(
    0.3,
    ROOM_LENGTH * 3,
    -ROOM_WIDTH / 2,
    -8
);


// RIGHT

createWall(
    0.3,
    ROOM_LENGTH * 3,
    ROOM_WIDTH / 2,
    -8
);


// FRONT

createWall(
    ROOM_WIDTH,
    0.3,
    0,
    10
);


// BACK

createWall(
    ROOM_WIDTH,
    0.3,
    0,
    -26
);


// =====================================================
// ROOM DIVIDERS
// =====================================================

// DIVIDER AT Z = -2

createWall(
    ROOM_WIDTH / 2 - 2,
    0.3,
    -4.5,
    -2
);

createWall(
    ROOM_WIDTH / 2 - 2,
    0.3,
    4.5,
    -2
);


// =====================================================
// DIVIDER AT Z = -14
// GAP IN CENTER = DOORWAY
// =====================================================

createWall(
    ROOM_WIDTH / 2 - 2,
    0.3,
    -4.5,
    -14
);

createWall(
    ROOM_WIDTH / 2 - 2,
    0.3,
    4.5,
    -14
);


// =====================================================
// ARTWORK DATA
// =====================================================

const artworks = [

    // =================================================
    // ROOM 1
    // =================================================

    {
        title: "Artwork One",
        year: "2025",
        medium: "Painting",
        description:
            "Description of your first artwork.",
        image:
            "ArtFiles/img1.jpg",

        position:
            [-3.8, 3.1, 9.80],

        rotation:
            [0, Math.PI, 0]
    },


    {
        title: "Artwork Two",
        year: "2025",
        medium: "Painting",
        description:
            "Description of your second artwork.",
        image:
            "ArtFiles/img2.jpg",

        position:
            [0, 3.1, 9.80],

        rotation:
            [0, Math.PI, 0]
    },


    {
        title: "Artwork Three",
        year: "2024",
        medium: "Digital",
        description:
            "Description of your third artwork.",
        image:
            "ArtFiles/img3.jpg",

        position:
            [3.8, 3.1, 9.80],

        rotation:
            [0, Math.PI, 0]
    },


    {
        title: "Artwork Four",
        year: "2024",
        medium: "Painting",
        description:
            "Description of your fourth artwork.",
        image:
            "ArtFiles/img5.JPG",

        position:
            [-6.82, 3.1, 4],

        rotation:
            [0, Math.PI / 2, 0]
    },


    {
        title: "Artwork Five",
        year: "2023",
        medium: "Mixed Media",
        description:
            "Description of your fifth artwork.",
        image:
            "ArtFiles/img7.JPG",

        position:
            [6.82, 3.1, 4],

        rotation:
            [0, -Math.PI / 2, 0]
    },


    // =================================================
    // ROOM 2
    // =================================================

    {
        title: "Artwork Six",
        year: "2024",
        medium: "Painting",
        description:
            "Description of your sixth artwork.",
        image:
            "ArtFiles/img4.JPG",

        position:
            [-3.8, 3.1, -13.6],

        rotation:
            [0, 0, 0]
    },


    {
        title: "Artwork Seven",
        year: "2024",
        medium: "Painting",
        description:
            "Description of your seventh artwork.",
        image:
            "ArtFiles/img9.JPG",

        position:
            [-6.84, 3.1, -9],

        rotation:
            [0, Math.PI / 2, 0]
    },


    {
        title: "Artwork Eight",
        year: "2023",
        medium: "Digital",
        description:
            "Description of your eighth artwork.",
        image:
            "ArtFiles/img10.JPG",

        position:
            [3.8, 3.1, -13.6],

        rotation:
            [0, 0, 0]
    },


    {
        title: "Artwork Nine",
        year: "2023",
        medium: "Painting",
        description:
            "Description of your ninth artwork.",
        image:
            "ArtFiles/img11.JPG",

        position:
            [-6.82, 3.1, -4.5],

        rotation:
            [0, Math.PI / 2, 0]
    },


    {
        title: "Artwork Ten",
        year: "2022",
        medium: "Drawing",
        description:
            "Description of your tenth artwork.",
        image:
            "ArtFiles/img12.JPG",

        position:
            [6.82, 3.1, -11],

        rotation:
            [0, -Math.PI / 2, 0]
    },


    // =================================================
    // ROOM 3
    // =================================================

    {
        title: "Artwork Eleven",
        year: "2023",
        medium: "Painting",
        description:
            "Description of your eleventh artwork.",
        image:
            "ArtFiles/img14.jpg",

        position:
            [-3.8, 3.1, -25.6],

        rotation:
            [0, 0, 0]
    },


    {
        title: "Artwork Twelve",
        year: "2022",
        medium: "Digital",
        description:
            "Description of your twelfth artwork.",
        image:
            "ArtFiles/img13.jpg",

        position:
            [3.8, 3.1, -25.6],

        rotation:
            [0, 0, 0]
    },


    {
        title: "Artwork Thirteen",
        year: "2022",
        medium: "Painting",
        description:
            "Description of your thirteenth artwork.",
        image:
            "ArtFiles/img6.JPG",

        position:
            [-6.82, 3.1, -23],

        rotation:
            [0, Math.PI / 2, 0]
    },


    {
        title: "Artwork Fourteen",
        year: "2021",
        medium: "Drawing",
        description:
            "Description of your fourteenth artwork.",
        image:
            "ArtFiles/img8.JPG",

        position:
            [6.82, 3.1, -18],

        rotation:
            [0, -Math.PI / 2, 0]
    }

];


// =====================================================
// ARTWORK VARIABLES
// =====================================================

const clickableArt = [];

const textureLoader =
    new THREE.TextureLoader();


// =====================================================
// CREATE ARTWORK
// =====================================================

function createArtwork(art) {

    textureLoader.load(

        art.image,

        function (loadedTexture) {

            // -----------------------------------------
            // CORRECT IMAGE COLOR
            // -----------------------------------------

            loadedTexture.colorSpace =
                THREE.SRGBColorSpace;


            loadedTexture.anisotropy =
                renderer.capabilities
                    .getMaxAnisotropy();


            // -----------------------------------------
            // IMAGE DIMENSIONS
            // -----------------------------------------

            const image =
                loadedTexture.image;


            const imageWidth =
                image.naturalWidth ||
                image.width;


            const imageHeight =
                image.naturalHeight ||
                image.height;


            const aspectRatio =
                imageWidth /
                imageHeight;


            // -----------------------------------------
            // MAXIMUM ARTWORK SIZE
            // -----------------------------------------

            const maxWidth = 3.8;
            const maxHeight = 3.2;


            let artworkWidth;
            let artworkHeight;


            if (
                aspectRatio >= 1
            ) {

                artworkWidth =
                    Math.min(
                        maxWidth,
                        maxHeight *
                        aspectRatio
                    );


                artworkHeight =
                    artworkWidth /
                    aspectRatio;

            } else {

                artworkHeight =
                    Math.min(
                        maxHeight,
                        maxWidth /
                        aspectRatio
                    );


                artworkWidth =
                    artworkHeight *
                    aspectRatio;

            }


            // -----------------------------------------
            // ARTWORK MATERIAL
            // -----------------------------------------
            //
            // The slight emissive component makes the
            // artwork itself brighter and more colorful
            // without saturating the whole gallery.
            // -----------------------------------------

            const material =
                new THREE.MeshStandardMaterial({

                    map:
                        loadedTexture,

                    color:
                        0xffffff,

                    roughness:
                        0.75,

                    metalness:
                        0,

                    emissive:
                        0xffffff,

                    emissiveMap:
                        loadedTexture,

                    emissiveIntensity:
                        0.18
                });


            // -----------------------------------------
            // FRAME
            // -----------------------------------------

            const frame =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        artworkWidth + 0.22,
                        artworkHeight + 0.22,
                        0.12
                    ),

                    frameMaterial

                );


            // -----------------------------------------
            // ARTWORK
            // -----------------------------------------

            const artwork =
                new THREE.Mesh(

                    new THREE.PlaneGeometry(
                        artworkWidth,
                        artworkHeight
                    ),

                    material

                );


            // -----------------------------------------
            // FRONT / BACK WALL
            // -----------------------------------------

            if (
                Math.abs(
                    Math.sin(
                        art.rotation[1]
                    )
                ) < 0.5
            ) {

                // Facing +Z
                if (
                    art.rotation[1] === 0
                ) {

                    frame.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2] - 0.07
                    );


                    artwork.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2] - 0.14
                    );

                }

                // Facing -Z
                else {

                    frame.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2] + 0.07
                    );


                    artwork.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2] + 0.14
                    );

                }

            }


            // -----------------------------------------
            // SIDE WALL
            // -----------------------------------------

            else {

                // LEFT WALL
                if (
                    art.rotation[1] > 0
                ) {

                    frame.position.set(
                        art.position[0] + 0.07,
                        art.position[1],
                        art.position[2]
                    );


                    artwork.position.set(
                        art.position[0] + 0.14,
                        art.position[1],
                        art.position[2]
                    );

                }

                // RIGHT WALL
                else {

                    frame.position.set(
                        art.position[0] - 0.07,
                        art.position[1],
                        art.position[2]
                    );


                    artwork.position.set(
                        art.position[0] - 0.14,
                        art.position[1],
                        art.position[2]
                    );

                }

            }


            // -----------------------------------------
            // ROTATION
            // -----------------------------------------

            frame.rotation.set(
                art.rotation[0],
                art.rotation[1],
                art.rotation[2]
            );


            artwork.rotation.set(
                art.rotation[0],
                art.rotation[1],
                art.rotation[2]
            );


            // -----------------------------------------
            // SHADOWS
            // -----------------------------------------

            frame.castShadow = true;
            frame.receiveShadow = true;


            artwork.castShadow = true;


            // -----------------------------------------
            // ADD TO SCENE
            // -----------------------------------------

            scene.add(
                frame
            );

            scene.add(
                artwork
            );


            // -----------------------------------------
            // CLICK DATA
            // -----------------------------------------

            artwork.userData =
                art;


            clickableArt.push(
                artwork
            );

        },

        undefined,

        function (error) {

            console.error(
                "FAILED TO LOAD ARTWORK:",
                art.image,
                error
            );

        }

    );

}


// =====================================================
// IMPORTANT:
// ACTUALLY CREATE ALL ARTWORK
// =====================================================

artworks.forEach(
    createArtwork
);


// =====================================================
// PLANTS
// =====================================================

function createPlant(x, z) {

    const potMaterial =
        new THREE.MeshStandardMaterial({
            color: "#a89d89",
            roughness: 0.9
        });


    const pot =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.48,
                0.62,
                0.85,
                20
            ),
            potMaterial
        );


    pot.position.set(
        x,
        0.425,
        z
    );


    pot.castShadow = true;
    pot.receiveShadow = true;


    scene.add(
        pot
    );


    // SOIL

    const soilMaterial =
        new THREE.MeshStandardMaterial({
            color: "#40372d"
        });


    const soil =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.40,
                0.40,
                0.06,
                20
            ),
            soilMaterial
        );


    soil.position.set(
        x,
        0.86,
        z
    );


    scene.add(
        soil
    );


    // STEMS

    const stemMaterial =
        new THREE.MeshStandardMaterial({
            color: "#496653"
        });


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const angle =
            (i / 8) *
            Math.PI *
            2;


        const stem =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.025,
                    0.035,
                    1.8,
                    8
                ),
                stemMaterial
            );


        stem.position.set(

            x +
            Math.cos(angle) *
            0.12,

            1.65,

            z +
            Math.sin(angle) *
            0.12
        );


        stem.rotation.z =
            Math.cos(angle) *
            0.25;


        stem.rotation.x =
            Math.sin(angle) *
            0.25;


        scene.add(
            stem
        );

    }


    // LEAVES

    const leafMaterial =
        new THREE.MeshStandardMaterial({
            color: "#557561",
            roughness: 0.8
        });


    for (
        let i = 0;
        i < 14;
        i++
    ) {

        const angle =
            (i / 14) *
            Math.PI *
            2;


        const height =
            1.3 +
            (i % 5) *
            0.3;


        const leaf =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.38,
                    10,
                    6
                ),
                leafMaterial
            );


        leaf.scale.set(
            0.23,
            0.75,
            0.12
        );


        leaf.position.set(

            x +
            Math.cos(angle) *
            (
                0.15 +
                (i % 3) *
                0.04
            ),

            height,

            z +
            Math.sin(angle) *
            (
                0.15 +
                (i % 3) *
                0.04
            )

        );


        leaf.rotation.y =
            angle;


        leaf.rotation.z =
            -0.35 +
            (i % 2) *
            0.2;


        leaf.castShadow = true;


        scene.add(
            leaf
        );

    }


    // COLLISION

    const collision =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.85,
                0.85,
                2.5,
                16
            ),
            new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0
            })
        );


    collision.position.set(
        x,
        1.25,
        z
    );


    scene.add(
        collision
    );


    collidableObjects.push({
        type: "plant",
        object: collision
    });

}


// =====================================================
// PLANTS
// =====================================================

createPlant(
    -5.7,
    7.4
);

createPlant(
    5.7,
    -0.5
);

createPlant(
    -5.7,
    -16
);

createPlant(
    5.7,
    -24
);


// =====================================================
// GALLERY LIGHTS
// =====================================================

function createGalleryLight(
    x,
    y,
    z,
    rotationY = 0
) {

    // -----------------------------------------
    // FIXTURE
    // -----------------------------------------

    const fixtureMaterial =
        new THREE.MeshStandardMaterial({
            color: "#222222",
            roughness: 0.7
        });


    const fixture =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.55,
                0.08,
                0.14
            ),
            fixtureMaterial
        );


    fixture.position.set(
        x,
        y,
        z
    );


    fixture.rotation.y =
        rotationY;


    scene.add(
        fixture
    );


    // -----------------------------------------
    // LIGHT
    // -----------------------------------------

    const light =
        new THREE.SpotLight(
            0xfff4dc,
            7,
            9,
            Math.PI / 4,
            0.65,
            1
        );


    light.position.set(
        x,
        y - 0.05,
        z
    );


    // -----------------------------------------
    // TARGET
    // -----------------------------------------

    const target =
        new THREE.Object3D();


    target.position.set(
        x,
        2.7,
        z
    );


    scene.add(
        target
    );


    light.target =
        target;


    light.castShadow = true;


    light.shadow.mapSize.width =
        1024;

    light.shadow.mapSize.height =
        1024;


    scene.add(
        light
    );

}


// =====================================================
// ROOM 1 LIGHTS
// =====================================================

// ABOVE ARTWORK 1

createGalleryLight(
    -3.8,
    5.3,
    9.55
);


// ABOVE ARTWORK 2

createGalleryLight(
    0,
    5.3,
    9.55
);


// ABOVE ARTWORK 3

createGalleryLight(
    3.8,
    5.3,
    9.55
);


// ABOVE ARTWORK 4

createGalleryLight(
    -6.65,
    5.3,
    4,
    Math.PI / 2
);


// ABOVE ARTWORK 5

createGalleryLight(
    6.65,
    5.3,
    4,
    -Math.PI / 2
);


// =====================================================
// ROOM 2 LIGHTS
// =====================================================

// ABOVE ARTWORK 6

createGalleryLight(
    -3.8,
    5.3,
    -13.55
);


// ABOVE ARTWORK 8

createGalleryLight(
    3.8,
    5.3,
    -13.55
);


// ABOVE ARTWORK 7

createGalleryLight(
    -6.65,
    5.3,
    -9,
    Math.PI / 2
);


// =====================================================
// THIS WAS MISSING
// LIGHT ABOVE ARTWORK 9
// =====================================================

createGalleryLight(
    -6.65,
    5.3,
    -4.5,
    Math.PI / 2
);


// ABOVE ARTWORK 10

createGalleryLight(
    6.65,
    5.3,
    -11,
    -Math.PI / 2
);


// =====================================================
// ROOM 3 LIGHTS
// =====================================================

// ABOVE ARTWORK 11

createGalleryLight(
    -3.8,
    5.3,
    -25.55
);


// ABOVE ARTWORK 12

createGalleryLight(
    3.8,
    5.3,
    -25.55
);


// ABOVE ARTWORK 13

createGalleryLight(
    -6.65,
    5.3,
    -23,
    Math.PI / 2
);


// ABOVE ARTWORK 14

createGalleryLight(
    6.65,
    5.3,
    -18,
    -Math.PI / 2
);


// =====================================================
// CAMERA
// =====================================================

let yaw = 0;
let pitch = 0;

let mouseDown = false;

let lastMouseX = 0;
let lastMouseY = 0;


const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};


// =====================================================
// KEYBOARD
// =====================================================

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();


        if (
            key in keys
        ) {

            keys[key] = true;

            event.preventDefault();

        }

    }
);


window.addEventListener(
    "keyup",
    (event) => {

        const key =
            event.key.toLowerCase();


        if (
            key in keys
        ) {

            keys[key] = false;

        }

    }
);


// =====================================================
// MOUSE
// =====================================================

renderer.domElement.addEventListener(
    "mousedown",
    (event) => {

        mouseDown = true;

        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;

    }
);


window.addEventListener(
    "mouseup",
    () => {

        mouseDown = false;

    }
);


window.addEventListener(
    "mousemove",
    (event) => {

        if (
            !mouseDown
        ) return;


        const movementX =
            event.clientX -
            lastMouseX;


        const movementY =
            event.clientY -
            lastMouseY;


        yaw -=
            movementX * 0.003;


        pitch -=
            movementY * 0.003;


        const maxPitch =
            Math.PI / 2.5;


        pitch =
            Math.max(
                -maxPitch,
                Math.min(
                    maxPitch,
                    pitch
                )
            );


        lastMouseX =
            event.clientX;


        lastMouseY =
            event.clientY;

    }
);


// =====================================================
// PLANT COLLISION
// =====================================================

function checkPlantCollision(
    position
) {

    const playerRadius =
        0.45;


    for (
        const entry
        of collidableObjects
    ) {

        if (
            entry.type !==
            "plant"
        ) continue;


        const object =
            entry.object;


        const dx =
            position.x -
            object.position.x;


        const dz =
            position.z -
            object.position.z;


        const distance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );


        const collisionRadius =
            0.85 +
            playerRadius;


        if (
            distance <
            collisionRadius
        ) {

            return true;

        }

    }


    return false;

}


// =====================================================
// CAMERA BOUNDS
// =====================================================

function keepCameraInside() {

    const margin = 1;


    camera.position.x =
        Math.max(

            -ROOM_WIDTH / 2 +
            margin,

            Math.min(
                ROOM_WIDTH / 2 -
                margin,

                camera.position.x
            )

        );


    camera.position.z =
        Math.max(

            -26 + margin,

            Math.min(
                10 - margin,

                camera.position.z
            )

        );


    camera.position.y =
        CAMERA_HEIGHT;

}


// =====================================================
// MOVEMENT
// =====================================================

function moveCamera(delta) {

    const speed = 4;


    const forward =
        new THREE.Vector3(
            Math.sin(yaw),
            0,
            Math.cos(yaw)
        );


    const right =
        new THREE.Vector3(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        );


    const movement =
        new THREE.Vector3();


    if (keys.w) {

        movement.sub(
            forward
        );

    }


    if (keys.s) {

        movement.add(
            forward
        );

    }


    if (keys.d) {

        movement.add(
            right
        );

    }


    if (keys.a) {

        movement.sub(
            right
        );

    }


    if (
        movement.lengthSq() > 0
    ) {

        movement.normalize();


        const newPosition =
            camera.position.clone();


        newPosition.addScaledVector(
            movement,
            speed * delta
        );


        if (
            !checkPlantCollision(
                newPosition
            )
        ) {

            camera.position.copy(
                newPosition
            );

        }

    }


    keepCameraInside();

}


// =====================================================
// CAMERA ROTATION
// =====================================================

function updateCameraRotation() {

    camera.rotation.order =
        "YXZ";


    camera.rotation.y =
        yaw;


    camera.rotation.x =
        pitch;

}


// =====================================================
// ARTWORK CLICKING
// =====================================================

const raycaster =
    new THREE.Raycaster();


const mouse =
    new THREE.Vector2();


renderer.domElement.addEventListener(
    "click",
    (event) => {

        mouse.x =
            (
                event.clientX /
                window.innerWidth
            ) * 2 - 1;


        mouse.y =
            -(
                event.clientY /
                window.innerHeight
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const intersections =
            raycaster.intersectObjects(
                clickableArt
            );


        if (
            intersections.length > 0
        ) {

            showArtworkInfo(
                intersections[0]
                    .object
                    .userData
            );

        }

    }
);


// =====================================================
// ARTWORK INFORMATION
// =====================================================

const infoPanel =
    document.getElementById(
        "artwork-info"
    );


function showArtworkInfo(data) {

    const year =
        document.getElementById(
            "artwork-year"
        );


    const title =
        document.getElementById(
            "artwork-title"
        );


    const medium =
        document.getElementById(
            "artwork-medium"
        );


    const description =
        document.getElementById(
            "artwork-description"
        );


    if (year)
        year.textContent =
            data.year;


    if (title)
        title.textContent =
            data.title;


    if (medium)
        medium.textContent =
            data.medium;


    if (description)
        description.textContent =
            data.description;


    if (infoPanel) {

        infoPanel.classList.remove(
            "hidden"
        );

    }

}


// =====================================================
// CLOSE ARTWORK INFO
// =====================================================

const closeInfo =
    document.getElementById(
        "close-info"
    );


if (closeInfo) {

    closeInfo.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            if (infoPanel) {

                infoPanel.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// =====================================================
// MUSIC
// =====================================================

const albums = {

    "Album One": [

        {
            title: "Song One",
            artist: "Your Name",
            file: "Music/song1.mp3"
        },

        {
            title: "Song Two",
            artist: "Your Name",
            file: "Music/song2.mp3"
        },

        {
            title: "Song Three",
            artist: "Your Name",
            file: "Music/song3.mp3"
        }

    ],


    "Album Two": [

        {
            title: "Song Four",
            artist: "Your Name",
            file: "Music/song4.mp3"
        },

        {
            title: "Song Five",
            artist: "Your Name",
            file: "Music/song5.mp3"
        }

    ],


    "Album Three": [

        {
            title: "Song Six",
            artist: "Your Name",
            file: "Music/song6.mp3"
        }

    ]

};


let currentAlbum =
    Object.keys(
        albums
    )[0];


let currentSong = 0;


const audio =
    new Audio();


audio.preload =
    "auto";


let isPlaying = false;


// =====================================================
// MUSIC ELEMENTS
// =====================================================

const albumName =
    document.getElementById(
        "album-name"
    );


const songTitle =
    document.getElementById(
        "song-title"
    );


const artistName =
    document.getElementById(
        "artist-name"
    );


const playButton =
    document.getElementById(
        "play"
    );


const nextButton =
    document.getElementById(
        "next"
    );


const previousButton =
    document.getElementById(
        "previous"
    );


// =====================================================
// LOAD SONG
// =====================================================

function loadSong() {

    const song =
        albums[
            currentAlbum
        ][
            currentSong
        ];


    if (!song)
        return;


    if (albumName) {

        albumName.textContent =
            currentAlbum;

    }


    if (songTitle) {

        songTitle.textContent =
            song.title;

    }


    if (artistName) {

        artistName.textContent =
            song.artist;

    }


    audio.src =
        song.file;


    audio.load();


    isPlaying = false;


    updatePlayButton();

}


// =====================================================
// PLAY BUTTON DISPLAY
// =====================================================

function updatePlayButton() {

    if (!playButton)
        return;


    if (isPlaying) {

        playButton.textContent =
            "Ⅱ";

    } else {

        playButton.textContent =
            "▶";

    }

}


// =====================================================
// PLAY / PAUSE
// =====================================================

async function togglePlay() {

    if (
        !audio.src
    ) {

        loadSong();

    }


    if (
        audio.paused
    ) {

        try {

            await audio.play();

        }

        catch (error) {

            console.error(
                "Could not play audio:",
                error
            );

        }

    } else {

        audio.pause();

    }

}


if (playButton) {

    playButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            togglePlay();

        }
    );

}


// =====================================================
// AUDIO EVENTS
// =====================================================

audio.addEventListener(
    "play",
    () => {

        isPlaying = true;

        updatePlayButton();

    }
);


audio.addEventListener(
    "pause",
    () => {

        isPlaying = false;

        updatePlayButton();

    }
);


audio.addEventListener(
    "error",
    () => {

        console.error(
            "Audio failed to load:",
            audio.src
        );

    }
);


// =====================================================
// NEXT SONG
// =====================================================

function nextSong() {

    currentSong++;


    if (
        currentSong >=
        albums[
            currentAlbum
        ].length
    ) {

        currentSong = 0;

    }


    loadSong();


    audio.play()
        .catch(
            error => {

                console.error(
                    "Could not play next song:",
                    error
                );

            }
        );

}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            nextSong();

        }
    );

}


// =====================================================
// PREVIOUS SONG
// =====================================================

function previousSong() {

    currentSong--;


    if (
        currentSong < 0
    ) {

        currentSong =
            albums[
                currentAlbum
            ].length - 1;

    }


    loadSong();


    audio.play()
        .catch(
            error => {

                console.error(
                    "Could not play previous song:",
                    error
                );

            }
        );

}


if (previousButton) {

    previousButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            previousSong();

        }
    );

}


// =====================================================
// AUTOMATIC NEXT SONG
// =====================================================

audio.addEventListener(
    "ended",
    () => {

        nextSong();

    }
);


// =====================================================
// ALBUM MENU
// =====================================================

const albumButton =
    document.getElementById(
        "album-button"
    );


const albumMenu =
    document.getElementById(
        "album-menu"
    );


const albumList =
    document.getElementById(
        "album-list"
    );


if (
    albumButton &&
    albumMenu
) {

    albumButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            albumMenu.classList.toggle(
                "hidden"
            );

        }
    );

}


if (albumList) {

    Object.keys(
        albums
    ).forEach(
        (album) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "album-option";


            button.textContent =
                album;


            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    currentAlbum =
                        album;


                    currentSong =
                        0;


                    loadSong();


                    if (albumMenu) {

                        albumMenu.classList.add(
                            "hidden"
                        );

                    }

                }
            );


            albumList.appendChild(
                button
            );

        }
    );

}


// =====================================================
// ANIMATION
// =====================================================

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    moveCamera(
        delta
    );


    updateCameraRotation();


    renderer.render(
        scene,
        camera
    );

}


animate();


// =====================================================
// RESIZE
// =====================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);
