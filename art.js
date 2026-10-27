import * as THREE from "three";

import { GLTFLoader } from "./vendor/three/examples/jsm/loaders/GLTFLoader.js";

// Keep the site loading screen up until the gallery's models and artwork have loaded.
// Phones get a "best on a computer" notice instead, so they don't wait for the 3D.
if (window.siteLoader && !window.matchMedia("(max-width: 800px), (hover: none) and (pointer: coarse)").matches) {
    window.siteLoader.wait("gallery");
    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
        window.siteLoader.progress("gallery", total ? loaded / total : 0);
    };
    THREE.DefaultLoadingManager.onLoad = () => window.siteLoader.done("gallery");
    THREE.DefaultLoadingManager.onError = () => {};
}


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

renderer.domElement.style.position =
    "fixed";

renderer.domElement.style.top =
    "0";

renderer.domElement.style.left =
    "0";

renderer.domElement.style.zIndex =
    "1";

gallery.appendChild(
    renderer.domElement
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
        metalness: 0,
        transparent: false,
        opacity: 1,
        depthWrite: true,
        depthTest: true,
        side: THREE.FrontSide
    });


const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: "#f3f1e8",
        roughness: 0.9
    });


const ceilingMaterial =
    new THREE.MeshStandardMaterial({
        color: "#f3f1e8",
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

// solid walls the player can't walk through (outer walls + partitions)
const wallColliders = [];

/* =====================================================
   3D FURNITURE
===================================================== */

const furnitureLoader = new GLTFLoader();

const BAMBOO_PATH = "RoomFurniture/Bamboo.glb";
const COLUMN_PATH = "RoomFurniture/Column (1).glb";

// Desired heights in gallery units.
const BAMBOO_HEIGHT = 3.5;
const COLUMN_HEIGHT = WALL_HEIGHT; // Full room height = 7


/*
    Scale a GLB to a specific height, rotate it upright,
    and place its bottom directly on the floor.
*/
function prepareFurnitureModel(model, targetHeight) {

    // The models were exported Z-up, while Three.js uses Y-up.
    model.rotation.x = -Math.PI / 2;

    model.updateMatrixWorld(true);

    const initialBox =
        new THREE.Box3().setFromObject(model);

    const initialSize =
        new THREE.Vector3();

    initialBox.getSize(initialSize);

    if (initialSize.y > 0) {

        const scale =
            targetHeight / initialSize.y;

        model.scale.set(
            scale,
            scale,
            scale
        );
    }

    model.updateMatrixWorld(true);

    // Recalculate after scaling.
    const finalBox =
        new THREE.Box3().setFromObject(model);

    // Put the bottom directly on the floor.
    model.position.y -= finalBox.min.y;

    model.updateMatrixWorld(true);

    // Enable shadows.
    model.traverse((child) => {

        if (child.isMesh) {

            child.castShadow = true;
            child.receiveShadow = true;

        }

    });

    return model;
}


/*
    Add a furniture model and create an invisible
    collision box around it.
*/
function addFurnitureClone(
    sourceModel,
    position,
    targetHeight
) {

    const model =
        sourceModel.clone(true);

    prepareFurnitureModel(
        model,
        targetHeight
    );

    model.position.x = position[0];
    model.position.z = position[1];

    scene.add(model);


    // -------------------------------------------------
    // COLLISION BOX
    // -------------------------------------------------

    model.updateMatrixWorld(true);

    const box =
        new THREE.Box3().setFromObject(model);

    // Slightly enlarge the collision area so the
    // player cannot visually clip through the object.
    const collisionPadding = 0.25;

    box.min.x -= collisionPadding;
    box.max.x += collisionPadding;

    box.min.z -= collisionPadding;
    box.max.z += collisionPadding;

    furnitureColliders.push({
        box: box
    });


    return model;
}


/* =====================================================
   FURNITURE COLLISION
===================================================== */

const furnitureColliders = [];


/*
    Returns true if the camera/player would intersect
    a piece of furniture at the proposed position.
*/
function furnitureCollision(newPosition) {

    // Radius of the player/camera.
    const playerRadius = 0.35;

    for (const box of wallColliders) {

        if (
            newPosition.x + playerRadius > box.min.x &&
            newPosition.x - playerRadius < box.max.x &&
            newPosition.z + playerRadius > box.min.z &&
            newPosition.z - playerRadius < box.max.z
        ) {

            return true;

        }

    }

    for (const collider of furnitureColliders) {

        const box = collider.box;

        if (
            newPosition.x + playerRadius > box.min.x &&
            newPosition.x - playerRadius < box.max.x &&
            newPosition.z + playerRadius > box.min.z &&
            newPosition.z - playerRadius < box.max.z
        ) {

            return true;

        }

    }

    return false;
}


/* =====================================================
   BAMBOO PLANTS
===================================================== */

const bambooPositions = [

    // -----------------------------------------
    // ROOM 1
    // -----------------------------------------

    [4.8, 7.6],


    // -----------------------------------------
    // ROOM 2
    // -----------------------------------------

    [5.0, -3.2],


    // -----------------------------------------
    // ROOM 3
    // -----------------------------------------

    [-5.0, -23.0]

];


furnitureLoader.load(

    BAMBOO_PATH,

    (gltf) => {

        const bamboo =
            gltf.scene;

        bambooPositions.forEach(
            (position) => {

                addFurnitureClone(
                    bamboo,
                    position,
                    BAMBOO_HEIGHT
                );

            }
        );

    },

    undefined,

    (error) => {

        console.error(
            "Could not load Bamboo.glb:",
            error
        );

    }

);


/* =====================================================
   COLUMNS
===================================================== */

/*
    Exactly four columns per room.

    One column is placed at each actual corner
    of each room.

    There are NO columns beside the doorways.
*/

const columnPositions = [

    // =========================================
    // ROOM 1
    // =========================================

    [-6.35,  9.35],   // back-left
    [ 6.35,  9.35],   // back-right
    [-6.35, -1.35],   // front-left
    [ 6.35, -1.35],   // front-right


    // =========================================
    // ROOM 2
    // =========================================

    [-6.35, -2.65],   // back-left
    [ 6.35, -2.65],   // back-right
    [-6.35, -13.35],  // front-left
    [ 6.35, -13.35],  // front-right


    // =========================================
    // ROOM 3
    // =========================================

    [-6.35, -14.65],  // back-left
    [ 6.35, -14.65],  // back-right
    [-6.35, -25.35],  // front-left
    [ 6.35, -25.35]   // front-right

];


furnitureLoader.load(

    COLUMN_PATH,

    (gltf) => {

        const column =
            gltf.scene;

        columnPositions.forEach(
            (position) => {

                addFurnitureClone(
                    column,
                    position,
                    COLUMN_HEIGHT
                );

            }
        );

    },

    undefined,

    (error) => {

        console.error(
            "Could not load Column (1).glb:",
            error
        );

    }

);


furnitureLoader.load(
    COLUMN_PATH,

    (gltf) => {

        const column = gltf.scene;

        columnPositions.forEach((position) => {

            addFurnitureClone(
                column,
                position,
                COLUMN_HEIGHT
            );

        });

    },

    undefined,

    (error) => {

        console.error(
            "Could not load Column (1).glb:",
            error
        );

    }
);


/* =====================================================
   SCROLL BENCH (middle room)
   RoomFurniture/ScrollBench.glb is modelled as a flat slab;
   it is laid flat so its lower outer ledge is the seat, the
   taller scroll body behind it the back. It faces the
   paintings on the middle room's left wall.
   Walk up to it and look at the floating E, then press E to
   sit; E (or W A S D) to stand.
===================================================== */

const BENCH_PATH = "RoomFurniture/ScrollBench.glb";
const BENCH_CENTER = new THREE.Vector3(0.6, 0, -7.75);
const BENCH_LENGTH = 7.6;         // along the wall (uniform scale: the ledge lands at seat height)

const SEATED_EYE = 1.05;

const bench = {
    ready: false,
    seat: new THREE.Vector3(),     // where the seated eye sits
    prompt: null,
    seated: false,
    anim: null,                    // { from, to, yawFrom, yawTo, pitchFrom, t }
    standPos: new THREE.Vector3(),
    standYaw: 0
};

// floating "E" key cap
(function makeBenchPrompt() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = "rgba(0,0,0,.18)";
    g.beginPath(); g.roundRect(30, 38, 196, 196, 46); g.fill();
    g.fillStyle = "#fafafa";
    g.strokeStyle = "#14253d";
    g.lineWidth = 10;
    g.beginPath(); g.roundRect(28, 24, 196, 196, 46); g.fill(); g.stroke();
    g.fillStyle = "#14253d";
    g.font = "700 128px 'Work Sans', Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("E", 126, 126);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false }));
    sprite.scale.set(0.42, 0.42, 1);
    sprite.renderOrder = 10;
    sprite.visible = false;
    scene.add(sprite);
    bench.prompt = sprite;
})();

furnitureLoader.load(
    BENCH_PATH,
    (gltf) => {
        const model = gltf.scene;
        model.traverse((o) => {
            if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
        });

        // lay the slab flat (file Z becomes up), seat ledge toward -x
        const holder = new THREE.Group();
        model.rotation.x = -Math.PI / 2;
        holder.add(model);
        holder.rotation.y = Math.PI;
        holder.updateMatrixWorld(true);

        let box = new THREE.Box3().setFromObject(holder);
        const size = box.getSize(new THREE.Vector3());
        const k = BENCH_LENGTH / Math.max(size.x, size.z);
        holder.scale.setScalar(k);   // uniform: no stretching
        holder.updateMatrixWorld(true);

        box = new THREE.Box3().setFromObject(holder);
        const center = box.getCenter(new THREE.Vector3());
        holder.position.set(
            BENCH_CENTER.x - center.x,
            -box.min.y + 0.1,               // floor top is at y = 0.1
            BENCH_CENTER.z - center.z
        );
        holder.updateMatrixWorld(true);
        scene.add(holder);
        box = new THREE.Box3().setFromObject(holder);

        // seat: the lowest broad top surface on the -x side (the ledge)
        const v = new THREE.Vector3();
        const width = box.max.x - box.min.x;
        let sumX = 0, sumZ = 0, n = 0, ledgeTop = 0;
        const tops = [];
        holder.traverse((o) => {
            if (!o.isMesh) return;
            const p = o.geometry.attributes.position;
            for (let i = 0; i < p.count; i += 2) {
                v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
                if (v.x < box.min.x + width * 0.3) tops.push([v.x, v.y, v.z]);
            }
        });
        // the ledge top is the most common height near the outer edge
        const hist = {};
        tops.forEach((t) => { const h = Math.round(t[1] * 20) / 20; hist[h] = (hist[h] || 0) + 1; });
        ledgeTop = +Object.keys(hist).filter((h) => h > 0.25).sort((a, b) => hist[b] - hist[a])[0] || 0.5;
        tops.forEach((t) => { if (Math.abs(t[1] - ledgeTop) < 0.04) { sumX += t[0]; sumZ += t[2]; n++; } });
        bench.seat.set(n ? sumX / n : box.min.x + width * 0.15, ledgeTop + SEATED_EYE, n ? sumZ / n : BENCH_CENTER.z);
        bench.prompt.position.set(bench.seat.x - 0.15, ledgeTop + 1.35, bench.seat.z);

        // solid: the player walks around it, not through it
        const pad = 0.1;
        box.min.x -= pad; box.max.x += pad; box.min.z -= pad; box.max.z += pad;
        furnitureColliders.push({ object: holder, box });

        bench.ready = true;
    },
    undefined,
    (error) => console.error("Could not load ScrollBench.glb:", error)
);

const benchHint = document.getElementById("bench-hint");
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const _toPrompt = new THREE.Vector3();
const _look = new THREE.Vector3();

function benchPromptVisible() {
    if (!bench.ready || bench.seated || bench.anim) return false;
    const dx = camera.position.x - bench.seat.x, dz = camera.position.z - bench.seat.z;
    if (Math.hypot(dx, dz) > 3.4) return false;
    _toPrompt.copy(bench.prompt.position).sub(camera.position).normalize();
    camera.getWorldDirection(_look);
    return _look.dot(_toPrompt) > Math.cos(THREE.MathUtils.degToRad(28));
}

function startBenchAnim(toPos, toYaw, toPitch) {
    // turn the short way round
    let dy = toYaw - yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    bench.anim = {
        from: camera.position.clone(), to: toPos.clone(),
        yawFrom: yaw, yawTo: yaw + dy, pitchFrom: pitch, pitchTo: toPitch, t: 0
    };
}

function sitOnBench() {
    bench.standPos.copy(camera.position);
    bench.standYaw = yaw;
    bench.seated = true;
    Object.keys(keys).forEach((k) => { keys[k] = false; });
    startBenchAnim(bench.seat, Math.PI / 2, -0.04);   // face the left wall (-x)
    if (benchHint) benchHint.classList.add("is-on");
}

function standFromBench() {
    bench.seated = false;
    const back = bench.standPos.clone();
    back.y = CAMERA_HEIGHT;
    startBenchAnim(back, yaw, 0);
    if (benchHint) benchHint.classList.remove("is-on");
}

window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "e" || e.repeat) return;
    if (bench.anim) return;
    if (bench.seated) standFromBench();
    else if (benchPromptVisible()) sitOnBench();
});
window.addEventListener("keydown", (e) => {
    if (bench.seated && !bench.anim && ["w", "a", "s", "d"].includes(e.key.toLowerCase())) standFromBench();
});

function updateBench(delta, now) {
    if (!bench.prompt) return;
    const show = benchPromptVisible();
    const m = bench.prompt.material;
    m.opacity += ((show ? 1 : 0) - m.opacity) * Math.min(1, delta * 10);
    bench.prompt.visible = m.opacity > 0.02;
    if (bench.ready) bench.prompt.position.y = bench.seat.y - SEATED_EYE + 1.35 + Math.sin(now * 2.4) * 0.05;

    if (bench.anim) {
        const a = bench.anim;
        a.t = Math.min(1, a.t + delta / 0.8);
        const k = ease(a.t);
        camera.position.lerpVectors(a.from, a.to, k);
        yaw = a.yawFrom + (a.yawTo - a.yawFrom) * k;
        pitch = a.pitchFrom + (a.pitchTo - a.pitchFrom) * k;
        if (a.t >= 1) bench.anim = null;
    }
}

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

    wall.castShadow = false;

    scene.add(
        wall
    );

    collidableObjects.push({
        type: "wall",
        object: wall
    });

    wall.updateMatrixWorld(true);
    wallColliders.push(new THREE.Box3().setFromObject(wall));

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
//
// Two solid wall sections with a central doorway.
//
// LEFT SECTION:
// x = -4.5
//
// RIGHT SECTION:
// x = +4.5
//
// The center gap remains open.
//
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
//
// Same doorway arrangement.
//
// LEFT PARTITION:
// x = -4.5
//
// RIGHT PARTITION:
// x = +4.5
//
// These are solid, opaque gallery walls.
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
    // ROOM 1 LEFT WALL
    // =================================================
    // OPPOSITE STILL LIFE IN BLUE
    //
    // Three pieces are distributed horizontally along
    // the left wall.
    // =================================================

    {
        title: "Dad's Tan Hua Flower",
        year: "2025",
        medium: "Acrylic painting on canvas",
        description:
            "My father is a proud plant dad. The Tan Hua flower, famously known as the Queen of the Night, is a cactus bloom that opens only for a single evening a year starting at sunset and wilting by sunrise. Having never before seen him so excited about a plant, I painted it for him to preserve that moment forever.",
        image: "web/ArtFiles/img1.jpg",

        position: [
            -6.84,
            3.1,
            5.8
        ],

        rotation: [
            0,
            Math.PI / 2,
            0
        ]
    },


    // =================================================
    // ROOM 1 LEFT DIVIDER WALL
    // =================================================

    {
        title: "Heaven is Quiet",
        year: "2026",
        medium: "Acrylic painting on canvas",
        description:
            "Sweet eternal silence.",
        image: "web/ArtFiles/img3.jpg",

        position: [
            -3.9,
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
    // =================================================

    {
        title: "Lone Star",
        year: "2025",
        medium: "Acrylic painting on canvas",
        description:
            "I was lucky enough to visit the original statue this painting is depicting which is The Little Mermaid, located in Copenhagen, Denmark. Unfortunately, my brother managed to slip on a rock and fall into the ocean right next to the statue in front of all the tourists.",
        image: "web/ArtFiles/img2.jpg",

        position: [
            3.9,
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
    // ROOM 1 RIGHT WALL
    // =================================================
    // CENTERED ON THE WALL
    // =================================================

    {
        title: "Still Life in Blue",
        year: "2024",
        medium: "Pastel and acrylic paint on paper",
        description:
            "I like the texture and colors I used here.",
        image: "web/ArtFiles/img7.jpg",

        position: [
            -6.84,
            3.1,
            1.5
        ],

        rotation: [
            0,
            Math.PI / 2,
            0
        ]
    },


    // =================================================
    // ROOM 2 / ROOM 3 PARTITION
    // LEFT SIDE
    // =================================================
    // THE MINE IN MY MIND
    //
    // Placed slightly into Room 2's side of the
    // partition and slightly forward from the wall
    // to prevent z-fighting.
    // =================================================

    {
        title: "The Mine in my Mind",
        year: "2024",
        medium: "Acrylic marker and paint on canvas",
        description:
            "I created this piece as an exploration of my mental health, as I was in a creative slump at the time.",
        image: "web/ArtFiles/img4.jpg",

        position: [
            -3.9,
            3.1,
            -13.80
        ],

        rotation: [
            0,
            0,
            0
        ]
    },


    // =================================================
    // ROOM 2 LEFT WALL
    // =================================================

    {
        title: "Mitosis",
        year: "2024",
        medium: "Acrylic paint on canvas",
        description:
            "I created this piece to explore the textures and ideas of separating an individual from a part of themselves. In this case, it was the beauty standard that I had familiarized myself with online. Luscious, curly hair, a small nose, big lips and big eyes were all traits I found myself lacking and frustrated that I couldn't change. This piece demonstrates the acknowledgment that I don't have to fit into that beauty standard and separating myself from it, while still recognizing the grasp it has on me and my life.",
        image: "web/ArtFiles/img10.jpg",

        position: [
            -6.84,
            3.1,
            -10.0
        ],

        rotation: [
            0,
            Math.PI / 2,
            0
        ]
    },


    // =================================================
    // ROOM 2 / ROOM 3 PARTITION
    // RIGHT SIDE
    // =================================================
    // PALIMPSEST
    //
    // This is the RIGHT partition section.
    // =================================================

    {
        title: "Palimpsest",
        year: "2024",
        medium: "Charcoal on paper",
        description:
            "A palimpsest is defined by the Oxford Language Library as 'a manuscript or piece of writing material on which the original writing has been effaced to make room for later writing but of which traces remain'. This piece to me is both literally and metaphorically a palimpsest since the paper used in its creation was originally blueprints for a house, before then becoming a protective layer for a table from paint and markers until it finally reached my easel. Although much of the color is covered in the more busy patches of the piece, there are still traces of its original writing in the corners and empty parts. Metaphorically, big industrial infrastructure and factories are the later writings that have been written over the effaced, original writing, the nature and land that had existed there before it.",
        image: "web/ArtFiles/img9.jpg",

        position: [
            3.9,
            3.1,
            -13.80
        ],

        rotation: [
            0,
            0,
            0
        ]
    },


    // =================================================
    // ROOM 2 LEFT WALL
    // =================================================

    {
        title: "Salty Soup",
        year: "2026",
        medium: "Ink and paper on canvas",
        description:
            "A meal flavored by my own tears.",
        image: "web/ArtFiles/img12.jpg",

        position: [
            -6.84,
            3.1,
            -5.5
        ],

        rotation: [
            0,
            Math.PI / 2,
            0
        ]
    },


    // =================================================
    // ROOM 2 RIGHT WALL
    // =================================================

    {
        title: "The Disparity of Abandonment",
        year: "2024",
        medium: "Ink, alcohol marker and gel pen on paper",
        description:
            "I created this piece to explore the difference in mood created by different line weights, as well as to create an environment through art that conveyed abandonment. Although I initially had not planned on drawing a dog into the scene or the ray of light that it steps into, I like that it is not the first subject you notice with the building and the clutter of broken objects overwhelmingly standing out. But once you look closer, the lone dog seems like the main character of the entire piece; it is the only thing with a semblance of movement or being alive.",
        image: "web/ArtFiles/img11.jpg",

        position: [
            6.84,
            3.1,
            -9.5
        ],

        rotation: [
            0,
            -Math.PI / 2,
            0
        ]
    },


    // =================================================
    // ROOM 3 RIGHT WALL
    // Quick Breakfast and Lunch are centered together
    // on the former book-display wall.
    // =================================================

    {
        title: "Quick Breakfast",
        year: "2024",
        medium: "Multi-media on paper",
        description:
            "As an individual has become increasingly more dependent on caffeine to make it through the day, I felt inspired to create a piece based on it. To me, this piece exemplifies what you're putting into your body every time you drink tea, coffee, or energy drinks, which ultimately can hurt you when overconsumed. When it came to the caffeine molecules at the front, I had to do some research to recall my chemistry understanding of the structure so that I could gather the materials necessary for the project.",
        image: "web/ArtFiles/img5.jpg",

        position: [
            6.84,
            3.1,
            -21.85
        ],

        rotation: [
            0,
            -Math.PI / 2,
            0
        ],

        maxWidth: 5.22,
        maxHeight: 5.58
    },

    {
        title: "Lunch",
        year: "2024",
        medium: "Multimedia",
        description:
            "Probably my favorite piece I've created so far. Pretty self-explanatory. The chicken nuggets are from Chick-Fil-A.",
        image: "web/ArtFiles/img8.jpg",

        position: [
            6.84,
            3.1,
            -16.7
        ],

        rotation: [
            0,
            -Math.PI / 2,
            0
        ],

        maxWidth: 2.61,
        maxHeight: 3.78
    },


    {
        title: "Untitled",
        year: "",
        medium: "",
        description: "",
        image: "web/ArtFiles/img15.jpg",

        position: [
            0,
            3.5,
            9.84
        ],

        rotation: [
            0,
            Math.PI,
            0
        ],

        maxWidth: 10.8,
        maxHeight: 5.58
    },


    // =================================================
    // ROOM 3 RIGHT WALL
    // =================================================
    // NEXT TO DISPARITY OF ABANDONMENT
    // =================================================

    {
        title: "Row Row Row Your Boat",
        year: "2026",
        medium: "Acrylic paint on canvas",
        description:
            "At the time of painting this artwork I was 19 years old. 20 wasn't too far off; I was getting older than I thought. A distant dream was the ignorant joy of my youth or something like that.",
        image: "web/ArtFiles/img13.jpg",

        position: [
            6.84,
            3.1,
            4.0
        ],

        rotation: [
            0,
            -Math.PI / 2,
            0
        ],

        maxWidth: 7.2,
        maxHeight: 5.67
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
        image: "web/ArtFiles/img14.jpg",

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
    // =================================================

    {
        title: "Even Fish can Drown",
        year: "2024",
        medium: "Ink, alcohol marker and gel pen on paper",
        description:
            "Even though fish are born in, raised in, and spend their whole life swimming and living in the water, they can 'drown' as well when not enough air gets through their gills. Although we're the creators, the consumers, and the discarders of trash, that does not mean it will not somehow bite us back. Ending up in landfills, the ocean, and in our air and food is effectively our form of 'drowning', as something we are so familiar with can be dangerous to us.",
        image: "web/ArtFiles/img6.jpg",

        position: [
            -6.84,
            3.1,
            -20
        ],

        rotation: [
            0,
            Math.PI / 2,
            0
        ],

        largeArtwork: true,
        sizeScale: 0.8
    }

];


// =====================================================
// ARTWORK SYSTEM
// =====================================================

const clickableArt = [];

const textureLoader =
    new THREE.TextureLoader();


// =====================================================
// DETERMINE ARTWORK WALL
// =====================================================

function getArtworkWall(art) {

    const rotationY =
        art.rotation[1];


    if (
        Math.abs(rotationY - Math.PI) < 0.1 ||
        Math.abs(rotationY + Math.PI) < 0.1
    ) {

        return "front";
    }


    if (
        Math.abs(rotationY) < 0.1
    ) {

        return "back";
    }


    if (
        rotationY > 0
    ) {

        return "left";
    }


    return "right";
}


// =====================================================
// GALLERY LIGHT
// =====================================================

function createGalleryLightForArtwork(
    art,
    artworkWidth,
    artworkHeight
) {

    const wall =
        getArtworkWall(art);

    const lightHeight =
        art.position[1] +
        artworkHeight / 2 +
        0.5;

    let lightX =
        art.position[0];

    let lightY =
        lightHeight;

    let lightZ =
        art.position[2];


    // Move the light off the wall, into the room (same as left/right below)
    if (
        wall === "front"
    ) {

        lightZ =
            art.position[2] -
            0.25;

    }

    else if (
        wall === "back"
    ) {

        lightZ =
            art.position[2] +
            0.25;

    }

    else if (
        wall === "left"
    ) {

        lightX =
            art.position[0] +
            0.25;

    }

    else if (
        wall === "right"
    ) {

        lightX =
            art.position[0] -
            0.25;

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
        wall === "left"
    ) {

        fixture.rotation.y =
            Math.PI / 2;

    }

    else if (
        wall === "right"
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

function createArtwork(art) {

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


            let maxWidth =
                art.maxWidth || 4;

            let maxHeight =
                art.maxHeight || 4;


            if (
                art.largeArtwork
            ) {

                maxWidth = 10.8;

                maxHeight = 6.3;

            }


            if (art.maxWidth) {

                maxWidth = art.maxWidth;

            }


            if (art.maxHeight) {

                maxHeight = art.maxHeight;

            }


            const sizeScale =
                art.sizeScale || 1;

            maxWidth *= sizeScale;

            maxHeight *= sizeScale;


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


            // =========================================
            // ARTWORK MATERIAL
            // =========================================

            const material =
                new THREE.MeshBasicMaterial({
            
                    map: loadedTexture,
            
                    side:
                        THREE.DoubleSide
                });

            // =========================================
            // FRAME
            // =========================================

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


            // =========================================
            // IMAGE
            // =========================================

            const artwork =
                new THREE.Mesh(

                    new THREE.PlaneGeometry(
                        artworkWidth,
                        artworkHeight
                    ),

                    material
                );


            // =========================================
            // POSITION
            // =========================================

            frame.position.set(
                art.position[0],
                art.position[1],
                art.position[2]
            );

            artwork.position.copy(
                frame.position
            );


            // =========================================
            // MOVE IMAGE SLIGHTLY IN FRONT OF FRAME
            // =========================================
            
            const imageOffset = 0.08;
            
            const rotationY =
                art.rotation[1];
            
            
            // Front-facing wall
            if (
                Math.abs(rotationY - Math.PI) < 0.1
            ) {
            
                artwork.position.z -= imageOffset;
            
            }
            
            
            // Back-facing wall
            else if (
                Math.abs(rotationY) < 0.1
            ) {
            
                artwork.position.z += imageOffset;
            
            }
            
            
            // Left wall
            else if (
                rotationY > 0 &&
                Math.abs(rotationY - Math.PI) > 0.1
            ) {
            
                artwork.position.x += imageOffset;
            
            }
            
            
            // Right wall
            else {
            
                artwork.position.x -= imageOffset;
            
            }


            // =========================================
            // ROTATION
            // =========================================

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
        ) {

            return;

        }


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

function moveCamera(delta) {

    if (bench.seated || bench.anim) return;

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


        // Only move if the new position is not inside a wall,
        // plant or column. If the full step is blocked, try each
        // axis on its own so the player slides along the wall.
        if (!furnitureCollision(newPosition)) {

            camera.position.copy(newPosition);

        } else {

            const slideX = camera.position.clone();
            slideX.x = newPosition.x;

            const slideZ = camera.position.clone();
            slideZ.z = newPosition.z;

            if (!furnitureCollision(slideX)) camera.position.copy(slideX);
            else if (!furnitureCollision(slideZ)) camera.position.copy(slideZ);

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


    if (year) {

        year.textContent =
            data.year || "";

    }


    if (title) {

        title.textContent =
            data.title || "";

    }


    if (medium) {

        medium.textContent =
            data.medium || "";

    }


    if (description) {

        description.textContent =
            data.description || "";

    }


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
        () => {

            if (infoPanel) {

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


    if (!song) {

        return;

    }


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


    audio.pause();

    audio.currentTime = 0;

    audio.src =
        song.file;

    audio.load();

    isPlaying = false;

    updatePlayButton();


    if (shouldPlay) {

        playAudio();

    }

}


// =====================================================
// UPDATE PLAY BUTTON
// =====================================================

function updatePlayButton() {

    if (!playButton) {

        return;

    }


    playButton.classList.toggle("is-playing", isPlaying);
    playButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");

}


// =====================================================
// PLAY AUDIO
// =====================================================

function playAudio() {

    const promise =
        audio.play();


    if (promise !== undefined) {

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


loadSong(false);


// =====================================================
// PLAY / PAUSE
// =====================================================

if (playButton) {

    playButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            if (audio.paused) {

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


        loadSong(true);

    }
);


// =====================================================
// NEXT SONG
// =====================================================

if (nextButton) {

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


            loadSong(true);

        }
    );

}


// =====================================================
// PREVIOUS SONG
// =====================================================

if (previousButton) {

    previousButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            currentSong--;


            if (currentSong < 0) {

                currentSong =
                    albums[
                        currentAlbum
                    ].length - 1;

            }


            loadSong(true);

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


            const open = albumMenu.classList.toggle("hidden") === false;
            albumButton.setAttribute("aria-expanded", String(open));

        }
    );

}


// =====================================================
// CREATE ALBUM BUTTONS
// =====================================================

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

                    currentSong = 0;


                    loadSong(false);


                    if (albumMenu) {

                        albumMenu.classList.add(
                            "hidden"
                        );

                        if (albumButton) albumButton.setAttribute("aria-expanded", "false");

                    }

                    markCurrentAlbum();

                }
            );


            albumList.appendChild(
                button
            );

        }
    );

}


// =====================================================
// PROGRESS + VOLUME SLIDERS
// =====================================================

const progressInput = document.getElementById("mp-progress");
const volumeInput = document.getElementById("mp-volume");
const timeNow = document.getElementById("mp-current");
const timeTotal = document.getElementById("mp-duration");
let seeking = false;

const fmtTime = (t) => {
    if (!isFinite(t) || t < 0) t = 0;
    const m = Math.floor(t / 60), sec = Math.floor(t % 60);
    return m + ":" + String(sec).padStart(2, "0");
};
const setFill = (input) => {
    if (!input) return;
    const pct = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.setProperty("--fill", pct + "%");
};
const syncProgress = () => {
    if (!progressInput || seeking) return;
    const d = audio.duration;
    progressInput.value = isFinite(d) && d > 0 ? Math.round(audio.currentTime / d * 1000) : 0;
    setFill(progressInput);
    if (timeNow) timeNow.textContent = fmtTime(audio.currentTime);
    if (timeTotal) timeTotal.textContent = fmtTime(d);
};
["timeupdate", "loadedmetadata", "durationchange", "emptied"].forEach((ev) => audio.addEventListener(ev, syncProgress));

if (progressInput) {
    progressInput.addEventListener("input", () => {
        seeking = true;
        setFill(progressInput);
        if (isFinite(audio.duration) && timeNow) timeNow.textContent = fmtTime(progressInput.value / 1000 * audio.duration);
    });
    progressInput.addEventListener("change", () => {
        if (isFinite(audio.duration)) audio.currentTime = progressInput.value / 1000 * audio.duration;
        seeking = false;
        syncProgress();
    });
    setFill(progressInput);
}
if (volumeInput) {
    const applyVolume = () => { audio.volume = volumeInput.value / 100; setFill(volumeInput); };
    volumeInput.addEventListener("input", applyVolume);
    applyVolume();
}
// keep keyboard focus on the sliders from also walking around the room
[progressInput, volumeInput].forEach((el) => el && el.addEventListener("keydown", (e) => e.stopPropagation()));

function markCurrentAlbum() {
    if (!albumList) return;
    albumList.querySelectorAll(".album-option").forEach((b) => b.classList.toggle("is-current", b.textContent === currentAlbum));
}
markCurrentAlbum();

// close the album menu when clicking anywhere else
document.addEventListener("click", (e) => {
    if (!albumMenu || albumMenu.classList.contains("hidden")) return;
    if (albumMenu.contains(e.target) || (albumButton && albumButton.contains(e.target))) return;
    albumMenu.classList.add("hidden");
    if (albumButton) albumButton.setAttribute("aria-expanded", "false");
});


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


    updateBench(delta, clock.elapsedTime);

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
