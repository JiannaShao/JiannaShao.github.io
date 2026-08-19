import * as THREE from "three";


// =====================================================
// BASIC SETUP
// =====================================================

const gallery = document.getElementById("gallery");

const scene = new THREE.Scene();

scene.background = new THREE.Color("#f3f1e8");


const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);


// Starting position
camera.position.set(0, 1.7, 10);


// =====================================================
// RENDERER
// =====================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

gallery.appendChild(renderer.domElement);


// =====================================================
// LIGHTING
// =====================================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambientLight);


const mainLight = new THREE.DirectionalLight(
    0xffffff,
    2.5
);

mainLight.position.set(
    0,
    10,
    0
);

mainLight.castShadow = true;

scene.add(mainLight);


// =====================================================
// MATERIALS
// =====================================================

const wallMaterial =
    new THREE.MeshStandardMaterial({
        color: "#f3f1e8"
    });

const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: "#d5d0c4"
    });

const ceilingMaterial =
    new THREE.MeshStandardMaterial({
        color: "#ebe8df"
    });

const frameMaterial =
    new THREE.MeshStandardMaterial({
        color: "#111111"
    });


// =====================================================
// GALLERY DIMENSIONS
// =====================================================

// Three rooms arranged along the Z axis.
//
// Room 1: z = 10 → -2
// Room 2: z = -2 → -14
// Room 3: z = -14 → -26

const ROOM_WIDTH = 14;
const ROOM_LENGTH = 12;

const WALL_HEIGHT = 7;

const FLOOR_Y = 0;

const CAMERA_HEIGHT = 1.7;


// =====================================================
// FLOOR
// =====================================================

const floor = new THREE.Mesh(
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

scene.add(floor);


// =====================================================
// CEILING
// =====================================================

const ceiling = new THREE.Mesh(
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

scene.add(ceiling);


// =====================================================
// WALL CREATION
// =====================================================

function createWall(
    width,
    depth,
    x,
    y,
    z
) {

    const wall = new THREE.Mesh(
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

    scene.add(wall);

    return wall;
}


// =====================================================
// OUTER WALLS
// =====================================================

// Left wall
createWall(
    0.3,
    ROOM_LENGTH * 3,
    -ROOM_WIDTH / 2,
    0,
    -8
);


// Right wall
createWall(
    0.3,
    ROOM_LENGTH * 3,
    ROOM_WIDTH / 2,
    0,
    -8
);


// Back wall
createWall(
    ROOM_WIDTH,
    0.3,
    0,
    0,
    -26
);


// Front wall
createWall(
    ROOM_WIDTH,
    0.3,
    0,
    0,
    10
);


// =====================================================
// ROOM DIVIDERS
// =====================================================
//
// Each divider has an opening in the middle.
// This creates three distinct rooms while allowing
// the visitor to walk between them.
//


// Divider at z = -2

createWall(
    ROOM_WIDTH / 2 - 2,
    0.3,
    -ROOM_WIDTH / 4 - 1,
    0,
    -2
);

createWall(
    ROOM_WIDTH / 2 - 2,
    0.3,
    ROOM_WIDTH / 4 + 1,
    0,
    -2
);


// Divider at z = -14

createWall(
    ROOM_WIDTH / 2 - 2,
    0.3,
    -ROOM_WIDTH / 4 - 1,
    0,
    -14
);

createWall(
    ROOM_WIDTH / 2 - 2,
    0.3,
    ROOM_WIDTH / 4 + 1,
    0,
    -14
);


// =====================================================
// ARTWORK
// =====================================================

const artworks = [

    // ================================
    // ROOM 1 — 5 PIECES
    // ================================

    {
        title: "Artwork One",
        year: "2025",
        medium: "Painting",
        description: "Description of your first artwork.",
        image: "Art/artwork1.jpg",

        position: [-3.8, 3.1, 9.8],
        rotation: [0, Math.PI, 0],

        size: [3.2, 2.4]
    },

    {
        title: "Artwork Two",
        year: "2025",
        medium: "Painting",
        description: "Description of your second artwork.",
        image: "Art/artwork2.jpg",

        position: [0, 3.1, 9.8],
        rotation: [0, Math.PI, 0],

        size: [3.2, 2.4]
    },

    {
        title: "Artwork Three",
        year: "2024",
        medium: "Digital",
        description: "Description of your third artwork.",
        image: "Art/artwork3.jpg",

        position: [3.8, 3.1, 9.8],
        rotation: [0, Math.PI, 0],

        size: [3.2, 2.4]
    },

    // Vertical
    {
        title: "Artwork Four",
        year: "2024",
        medium: "Painting",
        description: "Description of your fourth artwork.",
        image: "Art/artwork4.jpg",

        position: [-6.8, 3.1, 4],
        rotation: [0, Math.PI / 2, 0],

        size: [2, 3.2]
    },

    // Vertical
    {
        title: "Artwork Five",
        year: "2023",
        medium: "Mixed Media",
        description: "Description of your fifth artwork.",
        image: "Art/artwork5.jpg",

        position: [6.8, 3.1, 4],
        rotation: [0, -Math.PI / 2, 0],

        size: [2, 3.2]
    },


    // ================================
    // ROOM 2 — 5 PIECES
    // ================================

    {
        title: "Artwork Six",
        year: "2024",
        medium: "Painting",
        description: "Description of your sixth artwork.",
        image: "Art/artwork6.jpg",

        position: [-3.8, 3.1, -8],
        rotation: [0, 0, 0],

        size: [3.2, 2.4]
    },

    {
        title: "Artwork Seven",
        year: "2024",
        medium: "Painting",
        description: "Description of your seventh artwork.",
        image: "Art/artwork7.jpg",

        position: [0, 3.1, -8],
        rotation: [0, 0, 0],

        size: [3.2, 2.4]
    },

    {
        title: "Artwork Eight",
        year: "2023",
        medium: "Digital",
        description: "Description of your eighth artwork.",
        image: "Art/artwork8.jpg",

        position: [3.8, 3.1, -8],
        rotation: [0, 0, 0],

        size: [3.2, 2.4]
    },

    // Vertical
    {
        title: "Artwork Nine",
        year: "2023",
        medium: "Painting",
        description: "Description of your ninth artwork.",
        image: "Art/artwork9.jpg",

        position: [-6.8, 3.1, -4.5],
        rotation: [0, Math.PI / 2, 0],

        size: [2, 3.2]
    },

    // Vertical
    {
        title: "Artwork Ten",
        year: "2022",
        medium: "Drawing",
        description: "Description of your tenth artwork.",
        image: "Art/artwork10.jpg",

        position: [6.8, 3.1, -11],
        rotation: [0, -Math.PI / 2, 0],

        size: [2, 3.2]
    },


    // ================================
    // ROOM 3 — 4 PIECES
    // ================================

    {
        title: "Artwork Eleven",
        year: "2023",
        medium: "Painting",
        description: "Description of your eleventh artwork.",
        image: "Art/artwork11.jpg",

        position: [-3.8, 3.1, -20],
        rotation: [0, 0, 0],

        size: [3.2, 2.4]
    },

    {
        title: "Artwork Twelve",
        year: "2022",
        medium: "Digital",
        description: "Description of your twelfth artwork.",
        image: "Art/artwork12.jpg",

        position: [3.8, 3.1, -20],
        rotation: [0, 0, 0],

        size: [3.2, 2.4]
    },

    // Vertical
    {
        title: "Artwork Thirteen",
        year: "2022",
        medium: "Painting",
        description: "Description of your thirteenth artwork.",
        image: "Art/artwork13.jpg",

        position: [-6.8, 3.1, -23],
        rotation: [0, Math.PI / 2, 0],

        size: [2, 3.2]
    },

    // Vertical
    {
        title: "Artwork Fourteen",
        year: "2021",
        medium: "Drawing",
        description: "Description of your fourteenth artwork.",
        image: "Art/artwork14.jpg",

        position: [6.8, 3.1, -18],
        rotation: [0, -Math.PI / 2, 0],

        size: [2, 3.2]
    }

];


const clickableArt = [];

const textureLoader =
    new THREE.TextureLoader();


// =====================================================
// CREATE ARTWORK
// =====================================================

function createArtwork(art) {

    const texture =
        textureLoader.load(art.image);

    const material =
        new THREE.MeshStandardMaterial({
            map: texture
        });


    // Frame

    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                art.size[0] + 0.18,
                art.size[1] + 0.18,
                0.12
            ),
            frameMaterial
        );

    frame.position.set(
        art.position[0],
        art.position[1],
        art.position[2]
    );

    frame.rotation.set(
        art.rotation[0],
        art.rotation[1],
        art.rotation[2]
    );

    scene.add(frame);


    // Artwork

    const artwork =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                art.size[0],
                art.size[1]
            ),
            material
        );

    artwork.position.set(
        art.position[0],
        art.position[1],
        art.position[2]
    );

    artwork.rotation.set(
        art.rotation[0],
        art.rotation[1],
        art.rotation[2]
    );

    artwork.userData = art;

    scene.add(artwork);

    clickableArt.push(artwork);

}


artworks.forEach(
    createArtwork
);


// =====================================================
// POTTED PLANTS
// =====================================================

function createPlant(x, z) {

    // Pot

    const potMaterial =
        new THREE.MeshStandardMaterial({
            color: "#a89b82"
        });

    const pot =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.45,
                0.55,
                0.8,
                16
            ),
            potMaterial
        );

    pot.position.set(
        x,
        0.4,
        z
    );

    scene.add(pot);


    // Leaves

    const leafMaterial =
        new THREE.MeshStandardMaterial({
            color: "#526f61"
        });


    for (let i = 0; i < 7; i++) {

        const leaf =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.45,
                    8,
                    8
                ),
                leafMaterial
            );

        const angle =
            (i / 7) * Math.PI * 2;

        leaf.scale.set(
            0.6,
            1.3,
            0.4
        );

        leaf.position.set(
            x + Math.cos(angle) * 0.35,
            1.2 + (i % 2) * 0.3,
            z + Math.sin(angle) * 0.35
        );

        scene.add(leaf);

    }

}


// Plants in room corners

createPlant(
    -5.8,
    7.5
);

createPlant(
    5.8,
    -0.5
);

createPlant(
    -5.8,
    -16
);

createPlant(
    5.8,
    -24
);


// =====================================================
// CAMERA / MOVEMENT
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


// Keyboard

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();

        if (key in keys) {

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

        if (key in keys) {

            keys[key] = false;

        }

    }
);


// =====================================================
// MOUSE LOOK
// =====================================================

renderer.domElement.addEventListener(
    "mousedown",
    (event) => {

        mouseDown = true;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

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

        if (!mouseDown) return;

        const movementX =
            event.clientX - lastMouseX;

        const movementY =
            event.clientY - lastMouseY;


        yaw -= movementX * 0.003;

        pitch -= movementY * 0.003;


        const maxPitch =
            Math.PI / 2.5;

        pitch =
            Math.max(
                -maxPitch,
                Math.min(maxPitch, pitch)
            );


        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

    }
);


// =====================================================
// CAMERA BOUNDS
// =====================================================

function keepCameraInside() {

    const margin = 1.2;

    // Keep inside outer walls

    camera.position.x =
        Math.max(
            -ROOM_WIDTH / 2 + margin,
            Math.min(
                ROOM_WIDTH / 2 - margin,
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


    // Never let camera leave floor

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

        movement.add(
            forward
        );

    }

    if (keys.s) {

        movement.sub(
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


    if (movement.lengthSq() > 0) {

        movement.normalize();

        camera.position.addScaledVector(
            movement,
            speed * delta
        );

    }


    keepCameraInside();

}


// =====================================================
// CAMERA LOOK
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
    function(event) {

        mouse.x =
            (event.clientX /
                window.innerWidth) * 2 - 1;

        mouse.y =
            -(event.clientY /
                window.innerHeight) * 2 + 1;


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
// ARTWORK INFO
// =====================================================

const infoPanel =
    document.getElementById(
        "artwork-info"
    );


function showArtworkInfo(data) {

    document.getElementById(
        "artwork-year"
    ).textContent =
        data.year;

    document.getElementById(
        "artwork-title"
    ).textContent =
        data.title;

    document.getElementById(
        "artwork-medium"
    ).textContent =
        data.medium;

    document.getElementById(
        "artwork-description"
    ).textContent =
        data.description;

    infoPanel.classList.remove(
        "hidden"
    );

}


document.getElementById(
    "close-info"
).addEventListener(
    "click",
    () => {

        infoPanel.classList.add(
            "hidden"
        );

    }
);


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
    Object.keys(albums)[0];

let currentSong = 0;

const audio =
    new Audio();

let isPlaying = false;


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


function loadSong() {

    const song =
        albums[currentAlbum][currentSong];

    albumName.textContent =
        currentAlbum;

    songTitle.textContent =
        song.title;

    artistName.textContent =
        song.artist;

    audio.src =
        song.file;

}


loadSong();


// Play / pause

playButton.addEventListener(
    "click",
    () => {

        if (isPlaying) {

            audio.pause();

        } else {

            audio.play();

        }

    }
);


audio.addEventListener(
    "play",
    () => {

        isPlaying = true;

        playButton.textContent =
            "Ⅱ";

    }
);


audio.addEventListener(
    "pause",
    () => {

        isPlaying = false;

        playButton.textContent =
            "▶";

    }
);


// Next

document.getElementById(
    "next"
).addEventListener(
    "click",
    () => {

        currentSong++;

        if (
            currentSong >=
            albums[currentAlbum].length
        ) {

            currentSong = 0;

        }

        loadSong();

        audio.play();

    }
);


// Previous

document.getElementById(
    "previous"
).addEventListener(
    "click",
    () => {

        currentSong--;

        if (currentSong < 0) {

            currentSong =
                albums[currentAlbum].length - 1;

        }

        loadSong();

        audio.play();

    }
);


// Automatically play next

audio.addEventListener(
    "ended",
    () => {

        currentSong++;

        if (
            currentSong >=
            albums[currentAlbum].length
        ) {

            currentSong = 0;

        }

        loadSong();

        audio.play();

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


albumButton.addEventListener(
    "click",
    () => {

        albumMenu.classList.toggle(
            "hidden"
        );

    }
);


Object.keys(albums).forEach(
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
            () => {

                currentAlbum =
                    album;

                currentSong = 0;

                loadSong();

                albumMenu.classList.add(
                    "hidden"
                );

            }
        );


        albumList.appendChild(
            button
        );

    }
);


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


    moveCamera(delta);

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
