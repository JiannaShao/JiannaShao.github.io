import * as THREE from "three";

import {
    CSS3DRenderer,
    CSS3DObject
} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/renderers/CSS3DRenderer.js";


// =====================================================
// BASIC SETUP
// =====================================================

const gallery =
    document.getElementById("gallery");

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color("#f3f1e8");


const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );

camera.position.set(
    0,
    2,
    8
);


// =====================================================
// WEBGL RENDERER
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

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

gallery.appendChild(
    renderer.domElement
);


// =====================================================
// CSS3D RENDERER
// =====================================================
//
// Used for the interactive aquarium and books.
//
// This allows normal HTML elements to exist inside
// the 3D gallery and move with the camera.
// =====================================================

const cssRenderer =
    new CSS3DRenderer();

cssRenderer.setSize(
    window.innerWidth,
    window.innerHeight
);

cssRenderer.domElement.style.position =
    "fixed";

cssRenderer.domElement.style.top =
    "0";

cssRenderer.domElement.style.left =
    "0";

cssRenderer.domElement.style.pointerEvents =
    "none";

cssRenderer.domElement.style.zIndex =
    "2";

document.body.appendChild(
    cssRenderer.domElement
);


// =====================================================
// GENERAL LIGHTING
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
        1.4
    );

mainLight.position.set(
    0,
    8,
    2
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
        roughness: 0.9,
        side: THREE.DoubleSide
    });


const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: "#f3f1e8",
        roughness: 0.9
    });


const ceilingMaterial =
    new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.9
    });


const frameMaterial =
    new THREE.MeshStandardMaterial({
        color: "#111111",
        roughness: 0.55
    });


// =====================================================
// GALLERY DIMENSIONS
// =====================================================

const ROOM_WIDTH = 14;

const ROOM_LENGTH = 12;

const WALL_HEIGHT = 7;

const CAMERA_HEIGHT = 2;


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

createWall(
    0.3,
    ROOM_LENGTH * 3,
    -ROOM_WIDTH / 2,
    -8
);

createWall(
    0.3,
    ROOM_LENGTH * 3,
    ROOM_WIDTH / 2,
    -8
);

createWall(
    ROOM_WIDTH,
    0.3,
    0,
    10
);

createWall(
    ROOM_WIDTH,
    0.3,
    0,
    -26
);


// =====================================================
// ROOM DIVIDER AT Z = -2
// =====================================================

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
// ROOM DIVIDER AT Z = -14
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
    // ROOM 1 FRONT WALL
    // =================================================

    {
        title: "Dad's Tan Hua Flower",
        year: "2025",
        medium: "Acrylic painting on canvas",
        description:
            "My father is a proud plant dad. The Tan Hua flower, famously known as the Queen of the Night, is a cactus bloom that opens only for a single evening a year starting at sunset and wilting by sunrise. Having never before seen him so excited about a plant, I painted it for him to preserve that moment forever.",
        image: "ArtFiles/img1.jpg",

        position: [
            -2.1,
            3.1,
            9.84
        ],

        rotation: [
            0,
            Math.PI,
            0
        ]
    },


    // =================================================
    // ROOM 1 FRONT WALL
    // =================================================

    {
        title: "Quick Breakfast",
        year: "2024",
        medium: "Multi-media on paper",
        description:
            "As an individual has become increasingly more dependent on caffeine to make it through the day, I felt inspired to create a piece based on it. To me, this piece exemplifies what you're putting into your body every time you drink tea, coffee, or energy drinks, which ultimately can hurt you when overconsumed. When it came to the caffeine molecules at the front, I had to do some research to recall my chemistry understanding of the structure so that I could gather the materials necessary for the project.",
        image: "ArtFiles/img5.JPG",

        position: [
            2.1,
            3.1,
            9.84
        ],

        rotation: [
            0,
            Math.PI,
            0
        ]
    },


    // =================================================
    // ROOM 1 LEFT DIVIDER WALL
    // HEAVEN IS QUIET
    // =================================================

    {
        title: "Heaven is Quiet",
        year: "2026",
        medium: "Acrylic painting on canvas",
        description:
            "Sweet eternal silence.",
        image: "ArtFiles/img3.jpg",

        position: [
            -4.2,
            3.1,
            -1.84
        ],

        rotation: [
            0,
            0,
            0
        ]
    },


    // =================================================
    // ROOM 1 RIGHT DIVIDER WALL
    // LONE STAR
    // =================================================

    {
        title: "Lone Star",
        year: "2025",
        medium: "Acrylic painting on canvas",
        description:
            "I was lucky enough to visit the original statue this painting is depicting which is The Little Mermaid, located in Copenhagen, Denmark. Unfortunately, my brother managed to slip on a rock and fall into the ocean right next to the statue in front of all the tourists.",
        image: "ArtFiles/img2.jpg",

        position: [
            4.2,
            3.1,
            -1.84
        ],

        rotation: [
            0,
            0,
            0
        ]
    },


    // =================================================
    // ROOM 1 SIDE WALL
    // AQUARIUM OCCUPIES OPPOSITE SIDE
    // =================================================

    {
        title: "Still Life in Blue",
        year: "2024",
        medium: "Pastel and acrylic paint on paper",
        description:
            "I like the texture and colors I used here.",
        image: "ArtFiles/img7.JPG",

        position: [
            6.84,
            3.1,
            4
        ],

        rotation: [
            0,
            -Math.PI / 2,
            0
        ]
    },


    // =================================================
    // ROOM 2
    // =================================================

    {
        title: "The Mine in my Mind",
        year: "2024",
        medium: "Acrylic marker and paint on canvas",
        description:
            "I created this piece as an exploration of my mental health, as I was in a creative slump at the time.",
        image: "ArtFiles/img4.JPG",

        position: [
            -3.8,
            3.1,
            -13.84
        ],

        rotation: [
            0,
            0,
            0
        ]
    },


    {
        title: "Mitosis",
        year: "2024",
        medium: "Acrylic paint on canvas",
        description:
            "I created this piece to explore the textures and ideas of separating an individual from a part of themselves. In this case, it was the beauty standard that I had familiarized myself with online. Luscious, curly hair, a small nose, big lips and big eyes were all traits I found myself lacking and frustrated that I couldn't change. This piece demonstrates the acknowledgment that I don't have to fit into that beauty standard and separating myself from it, while still recognizing the grasp it has on me and my life.",
        image: "ArtFiles/img10.JPG",

        position: [
            -6.84,
            3.1,
            -9
        ],

        rotation: [
            0,
            Math.PI / 2,
            0
        ]
    },


    {
        title: "Palimpsest",
        year: "2024",
        medium: "Charcoal on paper",
        description:
            "A palimpsest is defined by the Oxford Language Library as 'a manuscript or piece of writing material on which the original writing has been effaced to make room for later writing but of which traces remain'. This piece to me is both literally and metaphorically a palimpsest since the paper used in its creation was originally blueprints for a house, before then becoming a protective layer for a table from paint and markers until it finally reached my easel. Although much of the color is covered in the more busy patches of the piece, there are still traces of its original writing in the corners and empty parts. Metaphorically, big industrial infrastructure and factories are the later writings that have been written over the effaced, original writing, the nature and land that had existed there before it.",
        image: "ArtFiles/img9.JPG",

        position: [
            3.8,
            3.1,
            -13.84
        ],

        rotation: [
            0,
            0,
            0
        ]
    },


    {
        title: "Salty Soup",
        year: "2026",
        medium: "Ink and paper on canvas",
        description:
            "A meal flavored by my own tears.",
        image: "ArtFiles/img12.JPG",

        position: [
            -6.84,
            3.1,
            -4.5
        ],

        rotation: [
            0,
            Math.PI / 2,
            0
        ]
    },


    {
        title: "The Disparity of Abandonment",
        year: "2024",
        medium: "Ink, alcohol marker and gel pen on paper",
        description:
            "I created this piece to explore the difference in mood created by different line weights, as well as to create an environment through art that conveyed abandonment. Although I initially had not planned on drawing a dog into the scene or the ray of light that it steps into, I like that it is not the first subject you notice with the building and the clutter of broken objects overwhelmingly standing out. But once you look closer, the lone dog seems like the main character of the entire piece; it is the only thing with a semblance of movement or being alive.",
        image: "ArtFiles/img11.JPG",

        position: [
            3.8,
            3.1,
            -8
        ],

        rotation: [
            0,
            -Math.PI / 2,
            0
        ]
    },


    // =================================================
    // ROOM 3 BACK WALL
    // =================================================

    {
        title: "Touch Grass",
        year: "2025",
        medium: "Acrylic painting on canvas",
        description:
            "Just a little reminder to go outside. I often passed this tree stump on my way to my high school tutoring job and I was almost fascinated by the life within and around it.",
        image: "ArtFiles/img14.jpg",

        position: [
            0,
            3.5,
            -25.84
        ],

        rotation: [
            0,
            0,
            0
        ],

        largeArtwork: true
    },


    // =================================================
    // ROOM 3 LEFT WALL
    // ROW ROW ROW YOUR BOAT
    // =================================================

    {
        title: "Row Row Row Your Boat",
        year: "2026",
        medium: "Acrylic paint on canvas",
        description:
            "At the time of painting this artwork I was 19 years old. 20 wasn't too far off; I was getting older than I thought. A distant dream was the ignorant joy of my youth or something like that.",
        image: "ArtFiles/img13.jpg",

        position: [
            6.84,
            3.1,
            -21
        ],

        rotation: [
            0,
            -Math.PI / 2,
            0
        ]
    },


    // =================================================
    // ROOM 3 LEFT WALL
    // LUNCH
    // =================================================

    {
        title: "Lunch",
        year: "2024",
        medium: "Multimedia",
        description:
            "Probably my favorite piece I've created so far. Pretty self-explanatory. The chicken nuggets are from Chick-Fil-A.",
        image: "ArtFiles/img8.JPG",

        position: [
            -4.2,
            3.1,
            -14.84
        ],

        rotation: [
            0,
            0,
            0
        ]
    },


    // =================================================
    // ROOM 3 LEFT WALL
    // EVEN FISH CAN DROWN
    // =================================================

    {
        title: "Even Fish can Drown",
        year: "2024",
        medium: "Ink, alcohol marker and gel pen on paper",
        description:
            "Even though fish are born in, raised in, and spend their whole life swimming and living in the water, they can 'drown' as well when not enough air gets through their gills. Although we're the creators, the consumers, and the discarders of trash, that does not mean it will not somehow bite us back. Ending up in landfills, the ocean, and in our air and food is effectively our form of 'drowning', as something we are so familiar with can be dangerous to us.",
        image: "ArtFiles/img6.JPG",

        position: [
            -6.84,
            3.5,
            -20
        ],

        rotation: [
            0,
            Math.PI / 2,
            0
        ],

        largeArtwork: true
    }

];


// =====================================================
// ARTWORK SYSTEM
// =====================================================

const clickableArt = [];

const textureLoader =
    new THREE.TextureLoader();


// =====================================================
// GALLERY LIGHT
// =====================================================

function createGalleryLightForArtwork(
    art,
    artworkWidth,
    artworkHeight
) {

    const rotationY =
        art.rotation[1];

    const lightHeight =
        art.position[1] +
        artworkHeight / 2 +
        0.5;


    const isFrontWall =
        Math.abs(
            rotationY - Math.PI
        ) < 0.1;


    const isBackWall =
        Math.abs(rotationY) < 0.1;


    const isLeftWall =
        rotationY > 0 &&
        !isFrontWall;


    const isRightWall =
        rotationY < 0 &&
        !isFrontWall;


    let lightX =
        art.position[0];

    let lightY =
        lightHeight;

    let lightZ =
        art.position[2];


    if (
        isFrontWall
    ) {

        lightZ =
            9.84;

    }

    else if (
        isBackWall
    ) {

        lightZ =
            -25.84;

    }

    else if (
        isLeftWall
    ) {

        lightX =
            -6.84;

    }

    else if (
        isRightWall
    ) {

        lightX =
            6.84;

    }


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
        lightX,
        lightY,
        lightZ
    );


    if (
        isLeftWall
    ) {

        fixture.rotation.y =
            Math.PI / 2;

    }

    else if (
        isRightWall
    ) {

        fixture.rotation.y =
            -Math.PI / 2;

    }


    scene.add(
        fixture
    );


    const light =
        new THREE.SpotLight(
            0xfff4dc,
            7,
            9,
            Math.PI / 5,
            0.5,
            1
        );


    light.position.set(
        lightX,
        lightY - 0.05,
        lightZ
    );


    light.target.position.set(
        art.position[0],
        art.position[1],
        art.position[2]
    );


    light.castShadow = true;

    light.shadow.mapSize.width =
        1024;

    light.shadow.mapSize.height =
        1024;


    scene.add(
        light
    );

    scene.add(
        light.target
    );

}


// =====================================================
// CREATE ARTWORK
// =====================================================

function createArtwork(
    art
) {

    textureLoader.load(

        art.image,

        (loadedTexture) => {

            loadedTexture.colorSpace =
                THREE.SRGBColorSpace;

            loadedTexture.anisotropy =
                renderer.capabilities
                    .getMaxAnisotropy();


            const image =
                loadedTexture.image;


            const imageWidth =
                image.naturalWidth ||
                image.width;


            const imageHeight =
                image.naturalHeight ||
                image.height;


            if (
                !imageWidth ||
                !imageHeight
            ) {

                console.error(
                    "Could not determine image dimensions:",
                    art.image
                );

                return;

            }


            const aspectRatio =
                imageWidth /
                imageHeight;


            let maxWidth = 4;

            let maxHeight = 4;


            if (
                art.largeArtwork
            ) {

                maxWidth = 10.8;

                maxHeight = 6.3;

            }


            let artworkWidth;

            let artworkHeight;


            if (
                aspectRatio >= 1
            ) {

                artworkWidth =
                    Math.min(
                        maxWidth,
                        maxHeight * aspectRatio
                    );

                artworkHeight =
                    artworkWidth /
                    aspectRatio;

            }

            else {

                artworkHeight =
                    Math.min(
                        maxHeight,
                        maxWidth / aspectRatio
                    );

                artworkWidth =
                    artworkHeight *
                    aspectRatio;

            }


            const material =
                new THREE.MeshStandardMaterial({

                    map: loadedTexture,

                    color:
                        new THREE.Color(
                            1.12,
                            1.12,
                            1.12
                        ),

                    roughness: 0.7,

                    metalness: 0,

                    side:
                        THREE.DoubleSide

                });


            const frame =
                new THREE.Mesh(

                    new THREE.BoxGeometry(

                        artworkWidth + 0.22,

                        artworkHeight + 0.22,

                        0.12

                    ),

                    frameMaterial

                );


            frame.castShadow = true;

            frame.receiveShadow = true;


            const artwork =
                new THREE.Mesh(

                    new THREE.PlaneGeometry(
                        artworkWidth,
                        artworkHeight
                    ),

                    material

                );


            const rotationY =
                art.rotation[1];


            if (
                Math.abs(
                    Math.sin(
                        rotationY
                    )
                ) < 0.5
            ) {

                if (
                    Math.abs(
                        rotationY -
                        Math.PI
                    ) < 0.1
                ) {

                    frame.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2]
                    );

                    artwork.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2] - 0.08
                    );

                }

                else {

                    frame.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2]
                    );

                    artwork.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2] + 0.08
                    );

                }

            }

            else {

                if (
                    rotationY > 0
                ) {

                    frame.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2]
                    );

                    artwork.position.set(
                        art.position[0] + 0.08,
                        art.position[1],
                        art.position[2]
                    );

                }

                else {

                    frame.position.set(
                        art.position[0],
                        art.position[1],
                        art.position[2]
                    );

                    artwork.position.set(
                        art.position[0] - 0.08,
                        art.position[1],
                        art.position[2]
                    );

                }

            }


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


            scene.add(
                frame
            );

            scene.add(
                artwork
            );


            artwork.userData =
                art;

            clickableArt.push(
                artwork
            );


            createGalleryLightForArtwork(
                art,
                artworkWidth,
                artworkHeight
            );

        },

        undefined,

        (error) => {

            console.error(
                "FAILED TO LOAD ARTWORK:",
                art.image,
                error
            );

        }

    );

}


artworks.forEach(
    (art) => {

        createArtwork(
            art
        );

    }
);


// =====================================================
// AQUARIUM
// =====================================================
//
// The aquarium remains the original HTML aquarium.
// CSS3DRenderer places it inside the 3D room.
//
// It occupies approximately 90% of the wall width.
// =====================================================

const aquariumWorld =
    document.getElementById(
        "aquarium-world"
    );


let aquariumObject = null;


function setupAquarium() {

    if (
        !aquariumWorld
    ) {

        console.warn(
            "Aquarium element not found."
        );

        return;

    }


    aquariumWorld.style.display =
        "block";

    aquariumWorld.style.position =
        "absolute";

    aquariumWorld.style.left =
        "0";

    aquariumWorld.style.top =
        "0";

    aquariumWorld.style.width =
        "1000px";

    aquariumWorld.style.transform =
        "none";

    aquariumWorld.style.pointerEvents =
        "none";


    aquariumObject =
        new CSS3DObject(
            aquariumWorld
        );


    // =================================================
    // POSITION
    // =================================================
    //
    // Aquarium is on the LEFT WALL of room 1.
    //
    // This wall is opposite the artwork on the right.
    // =================================================

    aquariumObject.position.set(
        -6.69,
        3.45,
        4
    );


    // =================================================
    // SCALE
    // =================================================
    //
    // 1000px × 0.0125 = 12.5 world units
    //
    // Room width = 14
    //
    // Therefore aquarium ≈ 89% of wall width.
    // =================================================

    aquariumObject.scale.set(
        0.0125,
        0.0125,
        0.0125
    );


    // =================================================
    // ROTATION
    // =================================================
    //
    // Face inward toward the room.
    // =================================================

    aquariumObject.rotation.y =
        Math.PI / 2;


    scene.add(
        aquariumObject
    );


    // Make the aquarium itself interactive.

    aquariumWorld.style.pointerEvents =
        "auto";

}


// Delay slightly so aquarium.js has already initialized
// the fish, bubbles, and other interactive elements.

setTimeout(
    setupAquarium,
    0
);


// =====================================================
// BOOK SYSTEM
// =====================================================

const bookWorld =
    document.getElementById(
        "book-world"
    );


const bookObjects =
    bookWorld
        ? bookWorld.querySelectorAll(
            ".book-object"
        )
        : [];


const bookDescriptions = {

    book1: {

        title:
            "The Strange Case of Dr Jekyll and Mr Hyde and Other Tales of Terror",

        year:
            "2026",

        medium:
            "Book",

        description:
            "One of Jianna's favorite reads of the year."

    },


    book2: {

        title:
            "Breakneck: China's Quest to Engineer the Future",

        year:
            "2026",

        medium:
            "Book",

        description:
            "A book that became especially interesting after spending three months in Shanghai in 2025 and continuing conversations about China at Wesleyan."

    },


    book3: {

        title:
            "The 5 Types of Wealth",

        year:
            "2026",

        medium:
            "Book",

        description:
            "A book given to Jianna by her mother after reading Atomic Habits and The 7 Habits of Highly Effective People."

    }

};


// =====================================================
// CREATE BOOK DISPLAY
// =====================================================

const cssBookObjects = [];


function setupBooks() {

    if (
        !bookWorld
    ) {

        return;

    }


    bookWorld.style.position =
        "absolute";

    bookWorld.style.left =
        "0";

    bookWorld.style.top =
        "0";

    bookWorld.style.width =
        "0";

    bookWorld.style.height =
        "0";

    bookWorld.style.pointerEvents =
        "none";


    bookObjects.forEach(
        (bookElement, index) => {

            bookElement.style.position =
                "absolute";

            bookElement.style.left =
                "0";

            bookElement.style.top =
                "0";

            bookElement.style.width =
                "180px";

            bookElement.style.pointerEvents =
                "auto";


            const object =
                new CSS3DObject(
                    bookElement
                );


            // =================================================
            // ROOM 3 RIGHT WALL
            // =================================================
            //
            // Three books are arranged vertically.
            // =================================================

            const x =
                6.69;


            const z =
                -18 +
                index * 2.8;


            const y =
                4.6 -
                index * 2.3;


            object.position.set(
                x,
                y,
                z
            );


            object.rotation.y =
                -Math.PI / 2;


            object.scale.set(
                0.009,
                0.009,
                0.009
            );


            object.userData.book =
                bookElement.dataset.book;


            scene.add(
                object
            );


            cssBookObjects.push(
                object
            );

        }
    );

}


setTimeout(
    setupBooks,
    0
);


// =====================================================
// BOOK CLICKING
// =====================================================

bookObjects.forEach(
    (bookElement) => {

        bookElement.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                const bookID =
                    bookElement.dataset.book;


                const data =
                    bookDescriptions[
                        bookID
                    ];


                if (
                    data
                ) {

                    showArtworkInfo(
                        data
                    );

                }

            }
        );

    }
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
            movementX *
            0.003;


        pitch -=
            movementY *
            0.003;


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
// CAMERA BOUNDS
// =====================================================

function keepCameraInside() {

    const margin = 1;


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


    camera.position.y =
        CAMERA_HEIGHT;

}


// =====================================================
// MOVEMENT
// =====================================================

function moveCamera(
    delta
) {

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


    if (
        keys.w
    ) {

        movement.sub(
            forward
        );

    }


    if (
        keys.s
    ) {

        movement.add(
            forward
        );

    }


    if (
        keys.d
    ) {

        movement.add(
            right
        );

    }


    if (
        keys.a
    ) {

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


        camera.position.copy(
            newPosition
        );

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
            ) *
            2 -
            1;


        mouse.y =
            -(
                event.clientY /
                window.innerHeight
            ) *
            2 +
            1;


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


function showArtworkInfo(
    data
) {

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


    if (
        year
    ) {

        year.textContent =
            data.year || "";

    }


    if (
        title
    ) {

        title.textContent =
            data.title || "";

    }


    if (
        medium
    ) {

        medium.textContent =
            data.medium || "";

    }


    if (
        description
    ) {

        description.textContent =
            data.description || "";

    }


    if (
        infoPanel
    ) {

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


if (
    closeInfo
) {

    closeInfo.addEventListener(
        "click",
        () => {

            if (
                infoPanel
            ) {

                infoPanel.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// =====================================================
// MUSIC / IPOD
// =====================================================

const albums = {

    "Game Music": [

        {
            title: "BG Music (SS)",
            artist: "Jianna Shao",
            file: "ArtFiles/SSBGMusic.m4a"
        },

        {
            title: "Ella's Room (SS)",
            artist: "Jianna Shao",
            file: "ArtFiles/EllasRoomSS.m4a"
        },

        {
            title: "Ella's Castle (SS)",
            artist: "Jianna Shao",
            file: "ArtFiles/EllasCastleSS.m4a"
        },

        {
            title: "Insult Battle (SS)",
            artist: "Jianna Shao",
            file: "ArtFiles/InsultBattleSS.wav"
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


let currentAlbum =
    Object.keys(
        albums
    )[0];


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


const nextButton =
    document.getElementById(
        "next"
    );


const previousButton =
    document.getElementById(
        "previous"
    );


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


// =====================================================
// LOAD SONG
// =====================================================

function loadSong(
    shouldPlay = false
) {

    const song =
        albums[
            currentAlbum
        ][
            currentSong
        ];


    if (
        !song
    ) return;


    if (
        albumName
    ) {

        albumName.textContent =
            currentAlbum;

    }


    if (
        songTitle
    ) {

        songTitle.textContent =
            song.title;

    }


    if (
        artistName
    ) {

        artistName.textContent =
            song.artist;

    }


    audio.pause();

    audio.currentTime = 0;

    audio.src =
        song.file;

    audio.load();

    isPlaying = false;

    updatePlayButton();


    if (
        shouldPlay
    ) {

        playAudio();

    }

}


// =====================================================
// UPDATE PLAY BUTTON
// =====================================================

function updatePlayButton() {

    if (
        !playButton
    ) return;


    if (
        isPlaying
    ) {

        playButton.textContent =
            "Ⅱ";

        playButton.setAttribute(
            "aria-label",
            "Pause"
        );

    }

    else {

        playButton.textContent =
            "▶";

        playButton.setAttribute(
            "aria-label",
            "Play"
        );

    }

}


// =====================================================
// PLAY AUDIO
// =====================================================

function playAudio() {

    const promise =
        audio.play();


    if (
        promise !== undefined
    ) {

        promise
            .then(
                () => {

                    isPlaying = true;

                    updatePlayButton();

                }
            )
            .catch(
                (error) => {

                    console.error(
                        "Audio could not play:",
                        error
                    );

                    isPlaying = false;

                    updatePlayButton();

                }
            );

    }

}


// =====================================================
// PAUSE AUDIO
// =====================================================

function pauseAudio() {

    audio.pause();

    isPlaying = false;

    updatePlayButton();

}


loadSong(
    false
);


// =====================================================
// PLAY / PAUSE
// =====================================================

if (
    playButton
) {

    playButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            if (
                audio.paused
            ) {

                playAudio();

            }

            else {

                pauseAudio();

            }

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
    "ended",
    () => {

        currentSong++;


        if (
            currentSong >=
            albums[
                currentAlbum
            ].length
        ) {

            currentSong = 0;

        }


        loadSong(
            true
        );

    }
);


// =====================================================
// NEXT SONG
// =====================================================

if (
    nextButton
) {

    nextButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            currentSong++;


            if (
                currentSong >=
                albums[
                    currentAlbum
                ].length
            ) {

                currentSong = 0;

            }


            loadSong(
                true
            );

        }
    );

}


// =====================================================
// PREVIOUS SONG
// =====================================================

if (
    previousButton
) {

    previousButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            currentSong--;


            if (
                currentSong < 0
            ) {

                currentSong =
                    albums[
                        currentAlbum
                    ].length - 1;

            }


            loadSong(
                true
            );

        }
    );

}


// =====================================================
// ALBUM MENU
// =====================================================

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


// =====================================================
// CREATE ALBUM BUTTONS
// =====================================================

if (
    albumList
) {

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

                    currentSong = 0;


                    loadSong(
                        false
                    );


                    if (
                        albumMenu
                    ) {

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


    cssRenderer.render(
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


        cssRenderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);
