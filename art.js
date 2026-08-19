import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


// =====================================================
// BASIC THREE.JS SETUP
// =====================================================

const gallery = document.getElementById("gallery");

const scene = new THREE.Scene();

scene.background = new THREE.Color("#f3f1e8");


const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 2, 8);


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
    3
);

mainLight.position.set(
    0,
    8,
    4
);

mainLight.castShadow = true;

scene.add(mainLight);


// =====================================================
// MATERIALS
// =====================================================

const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#f3f1e8"
});

const floorMaterial = new THREE.MeshStandardMaterial({
    color: "#d8d2c5"
});

const frameMaterial = new THREE.MeshStandardMaterial({
    color: "#111111"
});


// =====================================================
// FLOOR
// =====================================================

const floor = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.2, 20),
    floorMaterial
);

floor.position.y = -0.1;

floor.receiveShadow = true;

scene.add(floor);


// =====================================================
// GALLERY WALLS
// =====================================================

function createWall(
    width,
    height,
    depth,
    x,
    y,
    z
) {

    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            height,
            depth
        ),
        wallMaterial
    );

    wall.position.set(x, y, z);

    wall.receiveShadow = true;

    scene.add(wall);

    return wall;
}


// Back wall
createWall(
    20,
    6,
    0.2,
    0,
    3,
    -6
);


// Left wall
createWall(
    0.2,
    6,
    12,
    -10,
    3,
    0
);


// Right wall
createWall(
    0.2,
    6,
    12,
    10,
    3,
    0
);


// =====================================================
// ARTWORK
// =====================================================

const artworks = [

    {
        title: "Artwork One",
        year: "2025",
        medium: "Oil on canvas",
        description:
            "A study exploring form, color, and composition.",
        image:
            "Art/artwork1.jpg",
        position:
            [-5, 3, -5.85],
        rotation:
            [0, 0, 0],
        size:
            [3, 2.5]
    },

    {
        title: "Artwork Two",
        year: "2024",
        medium: "Acrylic on canvas",
        description:
            "An exploration of structure and visual rhythm.",
        image:
            "Art/artwork2.jpg",
        position:
            [0, 3, -5.85],
        rotation:
            [0, 0, 0],
        size:
            [3, 2.5]
    },

    {
        title: "Artwork Three",
        year: "2024",
        medium: "Digital illustration",
        description:
            "A digital work exploring shape, atmosphere, and narrative.",
        image:
            "Art/artwork3.jpg",
        position:
            [5, 3, -5.85],
        rotation:
            [0, 0, 0],
        size:
            [3, 2.5]
    }

];


const clickableArt = [];

const textureLoader = new THREE.TextureLoader();


function createArtwork(art) {

    const texture =
        textureLoader.load(art.image);

    const artworkMaterial =
        new THREE.MeshStandardMaterial({
            map: texture
        });

    const artwork = new THREE.Mesh(
        new THREE.PlaneGeometry(
            art.size[0],
            art.size[1]
        ),
        artworkMaterial
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


    // Frame

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(
            art.size[0] + 0.2,
            art.size[1] + 0.2,
            0.1
        ),
        frameMaterial
    );

    frame.position.set(
        art.position[0],
        art.position[1],
        art.position[2] + 0.03
    );

    frame.rotation.set(
        art.rotation[0],
        art.rotation[1],
        art.rotation[2]
    );

    scene.add(frame);

    // Move artwork slightly forward
    artwork.position.z -= 0.06;

}


artworks.forEach(createArtwork);


// =====================================================
// SIDE-WALL ARTWORK
// =====================================================

function createSideArtwork(
    image,
    position,
    rotation,
    size,
    data
) {

    const texture =
        textureLoader.load(image);

    const material =
        new THREE.MeshStandardMaterial({
            map: texture
        });

    const artwork =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                size[0],
                size[1]
            ),
            material
        );

    artwork.position.set(
        position[0],
        position[1],
        position[2]
    );

    artwork.rotation.set(
        rotation[0],
        rotation[1],
        rotation[2]
    );

    artwork.userData = data;

    scene.add(artwork);

    clickableArt.push(artwork);

}


// Left wall

createSideArtwork(
    "Art/artwork4.jpg",
    [-9.85, 3, -2],
    [0, Math.PI / 2, 0],
    [3, 2.5],
    {
        title: "Artwork Four",
        year: "2023",
        medium: "Mixed media",
        description:
            "An exploration of material, texture, and form."
    }
);


// Right wall

createSideArtwork(
    "Art/artwork5.jpg",
    [9.85, 3, 2],
    [0, -Math.PI / 2, 0],
    [3, 2.5],
    {
        title: "Artwork Five",
        year: "2023",
        medium: "Digital art",
        description:
            "A study of atmosphere and visual storytelling."
    }
);


// =====================================================
// CAMERA CONTROLS
// =====================================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.enablePan = false;

controls.minDistance = 2;

controls.maxDistance = 10;

controls.maxPolarAngle =
    Math.PI / 2.05;

controls.target.set(
    0,
    2.5,
    -3
);


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


        if (intersections.length > 0) {

            const artwork =
                intersections[0].object;

            showArtworkInfo(
                artwork.userData
            );

        }

    }
);


// =====================================================
// ARTWORK INFORMATION PANEL
// =====================================================

const infoPanel =
    document.getElementById(
        "artwork-info"
    );

const closeInfo =
    document.getElementById(
        "close-info"
    );


function showArtworkInfo(data) {

    document.getElementById(
        "artwork-year"
    ).textContent = data.year;

    document.getElementById(
        "artwork-title"
    ).textContent = data.title;

    document.getElementById(
        "artwork-medium"
    ).textContent = data.medium;

    document.getElementById(
        "artwork-description"
    ).textContent = data.description;

    infoPanel.classList.remove(
        "hidden"
    );

}


closeInfo.addEventListener(
    "click",
    function() {

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

    ]

};


// =====================================================
// MUSIC PLAYER STATE
// =====================================================

let currentAlbum =
    Object.keys(albums)[0];

let currentSong = 0;

let audio =
    new Audio();

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


// =====================================================
// LOAD SONG
// =====================================================

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

    audio.load();

}


loadSong();


// =====================================================
// PLAY / PAUSE
// =====================================================

playButton.addEventListener(
    "click",
    function() {

        if (isPlaying) {

            audio.pause();

        } else {

            audio.play();

        }

    }
);


audio.addEventListener(
    "play",
    function() {

        isPlaying = true;

        playButton.textContent = "Ⅱ";

    }
);


audio.addEventListener(
    "pause",
    function() {

        isPlaying = false;

        playButton.textContent = "▶";

    }
);


// =====================================================
// NEXT SONG
// =====================================================

document.getElementById(
    "next"
).addEventListener(
    "click",
    function() {

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
// PREVIOUS SONG
// =====================================================

document.getElementById(
    "previous"
).addEventListener(
    "click",
    function() {

        currentSong--;

        if (currentSong < 0) {

            currentSong =
                albums[currentAlbum].length - 1;

        }

        loadSong();

        audio.play();

    }
);


// =====================================================
// AUTOMATICALLY NEXT SONG
// =====================================================

audio.addEventListener(
    "ended",
    function() {

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
    function() {

        albumMenu.classList.toggle(
            "hidden"
        );

    }
);


// Create album buttons

Object.keys(albums).forEach(
    function(album) {

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
            function() {

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
// WINDOW RESIZE
// =====================================================

window.addEventListener(
    "resize",
    function() {

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


// =====================================================
// ANIMATION LOOP
// =====================================================

function animate() {

    requestAnimationFrame(
        animate
    );

    controls.update();

    renderer.render(
        scene,
        camera
    );

}

animate();
