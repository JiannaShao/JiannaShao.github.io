/* =====================================================
   AQUARIUM
===================================================== */

const tank =
    document.getElementById("tank");

const fishLayer =
    document.getElementById("fish-layer");

const foodLayer =
    document.getElementById("food-layer");

const bubbleLayer =
    document.getElementById("bubble-layer");

const waterOverlay =
    document.getElementById("water-overlay");

const feedButton =
    document.getElementById("feed-button");

const resetButton =
    document.getElementById("reset-button");


/* =====================================================
   SETTINGS
===================================================== */

let lastTime = 0;

let bubbleTimer = 0;

const minimumBubbleTime = 200;

const maximumBubbleTime = 800;

let nextBubbleTime =
    randomNumber(
        minimumBubbleTime,
        maximumBubbleTime
    );


/* =====================================================
   RANDOM NUMBER
===================================================== */

function randomNumber(
    min,
    max
) {

    return Math.random() *
        (max - min) +
        min;

}


/* =====================================================
   FISH
===================================================== */

const fishData = [

    {
        name: "Bass",
        image: "Fih/Bass.png",
        size: 380,
        baseSpeed: 0.025 / 8,
        speed: 0.025 / 8,
        targetSpeed: 0.025 / 8,
        direction: 1
    },

    {
        name: "Bluegill",
        image: "Fih/Bluegill.png",
        size: 140,
        baseSpeed: 0.045 / 8,
        speed: 0.045 / 8,
        targetSpeed: 0.045 / 8,
        direction: -1
    },

    {
        name: "Burbot",
        image: "Fih/Burbot.png",
        size: 340,
        baseSpeed: 0.030 / 8,
        speed: 0.030 / 8,
        targetSpeed: 0.030 / 8,
        direction: 1
    },

    {
        name: "Carp",
        image: "Fih/Carp.png",
        size: 220,
        baseSpeed: 0.050 / 8,
        speed: 0.050 / 8,
        targetSpeed: 0.050 / 8,
        direction: -1
    },

    {
        name: "Catfish",
        image: "Fih/Catfish.png",
        size: 200,
        baseSpeed: 0.040 / 8,
        speed: 0.040 / 8,
        targetSpeed: 0.040 / 8,
        direction: 1
    },

    {
        name: "Crappie",
        image: "Fih/Crappie.png",
        size: 190,
        baseSpeed: 0.028 / 8,
        speed: 0.028 / 8,
        targetSpeed: 0.028 / 8,
        direction: -1
    },

    {
        name: "Freshwater Drum",
        image: "Fih/Freshwater Drum.png",
        size: 240,
        baseSpeed: 0.038 / 8,
        speed: 0.038 / 8,
        targetSpeed: 0.038 / 8,
        direction: 1
    },

    {
        name: "Minnow",
        image: "Fih/Minnow.png",
        size: 120,
        baseSpeed: 0.032 / 8,
        speed: 0.032 / 8,
        targetSpeed: 0.032 / 8,
        direction: 1
    },

    {
        name: "Perch",
        image: "Fih/Perch.png",
        size: 220,
        baseSpeed: 0.048 / 8,
        speed: 0.048 / 8,
        targetSpeed: 0.048 / 8,
        direction: -1
    },

    {
        name: "Pike",
        image: "Fih/Pike.png",
        size: 280,
        baseSpeed: 0.042 / 8,
        speed: 0.042 / 8,
        targetSpeed: 0.042 / 8,
        direction: 1
    },

    {
        name: "Pumpkinseed",
        image: "Fih/Pumpkinseed.png",
        size: 150,
        baseSpeed: 0.033 / 8,
        speed: 0.033 / 8,
        targetSpeed: 0.033 / 8,
        direction: -1
    },

    {
        name: "Round Goby",
        image: "Fih/Round Goby.png",
        size: 200,
        baseSpeed: 0.047 / 8,
        speed: 0.047 / 8,
        targetSpeed: 0.047 / 8,
        direction: 1
    },

    {
        name: "Salmon",
        image: "Fih/Salmon.png",
        size: 360,
        baseSpeed: 0.036 / 8,
        speed: 0.036 / 8,
        targetSpeed: 0.036 / 8,
        direction: -1
    },

    {
        name: "Sucker",
        image: "Fih/Sucker.png",
        size: 240,
        baseSpeed: 0.043 / 8,
        speed: 0.043 / 8,
        targetSpeed: 0.043 / 8,
        direction: 1
    }

];


/* =====================================================
   INITIAL FISH POSITIONS
===================================================== */

fishData.forEach(
    function(fish) {

        fish.x =
            randomNumber(5, 88);

        fish.y =
            randomNumber(10, 80);

        fish.angle =
            randomNumber(-45, 45);

        if (
            Math.random() < 0.5
        ) {

            fish.direction = -1;

            fish.angle += 180;

        }

        fish.angleChangeTimer =
            randomNumber(
                1500,
                4000
            );

    }
);


/* =====================================================
   CREATE FISH
===================================================== */

function createFish(data) {

    const fish =
        document.createElement("div");

    fish.className =
        "fish";

    fish.innerHTML = `
        <img
            src="${data.image}"
            alt="${data.name}"
            draggable="false"
            style="
                width:${data.size}px;
                height:auto;
            "
        >
    `;

    fish.style.left =
        data.x + "%";

    fish.style.top =
        data.y + "%";


    data.speedChangeTimer =
        randomNumber(
            1500,
            4500
        );


    data.burstTimer =
        randomNumber(
            6000,
            14000
        );


    data.burstMultiplier = 1;


    fish.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            data.direction *= -1;

            data.angle += 180;

            data.speed *= 1.5;

            fish.style.filter =
                "brightness(1.3)";

            setTimeout(
                function() {

                    data.speed /= 1.5;

                    fish.style.filter = "";

                },
                200
            );

        }
    );


    data.element = fish;

    fishLayer.appendChild(
        fish
    );

}


fishData.forEach(
    createFish
);


/* =====================================================
   FISH BEHAVIOR
===================================================== */

function updateFishBehavior(
    fish,
    deltaTime
) {

    fish.speedChangeTimer -=
        deltaTime;


    if (
        fish.speedChangeTimer <= 0
    ) {

        fish.targetSpeed =
            fish.baseSpeed *
            randomNumber(
                0.6,
                1.3
            );

        fish.speedChangeTimer =
            randomNumber(
                2000,
                5000
            );

    }


    const speedChangeRate =
        0.00015;


    if (
        fish.speed <
        fish.targetSpeed
    ) {

        fish.speed +=
            speedChangeRate *
            deltaTime;

    }

    else {

        fish.speed -=
            speedChangeRate *
            deltaTime;

    }


    fish.angleChangeTimer -=
        deltaTime;


    if (
        fish.angleChangeTimer <= 0
    ) {

        fish.angle +=
            randomNumber(
                -35,
                35
            );

        fish.angleChangeTimer =
            randomNumber(
                1500,
                4000
            );

    }


    fish.burstTimer -=
        deltaTime;


    if (
        fish.burstTimer <= 0 &&
        fish.burstMultiplier === 1
    ) {

        fish.burstMultiplier =
            randomNumber(
                1.3,
                1.8
            );

        fish.burstDuration =
            randomNumber(
                600,
                1400
            );

        fish.burstTimer =
            randomNumber(
                6000,
                14000
            );

    }


    if (
        fish.burstMultiplier > 1
    ) {

        fish.burstDuration -=
            deltaTime;

        if (
            fish.burstDuration <= 0
        ) {

            fish.burstMultiplier = 1;

        }

    }

}


/* =====================================================
   FISH MOVEMENT
===================================================== */

function updateFish(
    deltaTime
) {

    fishData.forEach(
        function(fish) {

            if (!fish.element) {
                return;
            }


            updateFishBehavior(
                fish,
                deltaTime
            );


            const actualSpeed =
                fish.speed *
                fish.burstMultiplier;


            const radians =
                fish.angle *
                Math.PI /
                180;


            fish.x +=
                Math.cos(radians) *
                actualSpeed *
                deltaTime;


            fish.y +=
                Math.sin(radians) *
                actualSpeed *
                deltaTime;


            if (fish.x <= 2) {

                fish.x = 2;

                fish.direction = 1;

                fish.angle =
                    180 -
                    fish.angle;

            }


            if (fish.x >= 91) {

                fish.x = 91;

                fish.direction = -1;

                fish.angle =
                    180 -
                    fish.angle;

            }


            if (fish.y <= 5) {

                fish.y = 5;

                fish.angle =
                    -fish.angle;

            }


            if (fish.y >= 82) {

                fish.y = 82;

                fish.angle =
                    -fish.angle;

            }


            const horizontalDirection =
                Math.cos(
                    fish.angle *
                    Math.PI /
                    180
                );


            fish.direction =
                horizontalDirection > 0
                    ? 1
                    : -1;


            fish.element.style.left =
                fish.x + "%";

            fish.element.style.top =
                fish.y + "%";


            fish.element.style.transform =
                fish.direction === 1
                    ? "scaleX(-1)"
                    : "scaleX(1)";

        }
    );

}


/* =====================================================
   BUBBLES
===================================================== */

function createBubble(
    fish
) {

    if (!fish.element) {
        return;
    }


    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble";


    bubble.style.left =
        `calc(
            ${fish.x}%
            + ${randomNumber(-1.5,1.5)}px
        )`;


    bubble.style.top =
        `calc(
            ${fish.y}%
            + ${randomNumber(-1.5,1.5)}px
        )`;


    const size =
        randomNumber(
            6,
            40
        );

    bubble.style.width =
        size + "px";

    bubble.style.height =
        size + "px";


    const duration =
        randomNumber(
            4,
            10
        );

    bubble.style.setProperty(
        "--bubble-duration",
        duration + "s"
    );


    bubble.style.setProperty(
        "--bubble-drift",
        randomNumber(
            -50,
            50
        ) + "px"
    );


    bubbleLayer.appendChild(
        bubble
    );


    setTimeout(
        function() {

            bubble.remove();

        },
        duration * 1000
    );

}


/* =====================================================
   RANDOM BUBBLES
===================================================== */

function updateBubbles(
    deltaTime
) {

    bubbleTimer +=
        deltaTime;


    if (
        bubbleTimer >=
        nextBubbleTime
    ) {

        bubbleTimer = 0;


        const randomFish =
            fishData[
                Math.floor(
                    Math.random() *
                    fishData.length
                )
            ];


        createBubble(
            randomFish
        );


        nextBubbleTime =
            randomNumber(
                minimumBubbleTime,
                maximumBubbleTime
            );

    }

}


/* =====================================================
   WATER RIPPLE
===================================================== */

let lastRippleTime = 0;

const RIPPLE_INTERVAL = 120;


tank.addEventListener(
    "mousemove",
    function(event) {

        const now =
            performance.now();


        if (
            now - lastRippleTime <
            RIPPLE_INTERVAL
        ) {

            return;

        }


        lastRippleTime = now;


        const rect =
            waterOverlay
                .getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        const ripple =
            document.createElement("div");

        ripple.className =
            "water-ripple";


        ripple.style.left =
            x + "px";

        ripple.style.top =
            y + "px";


        waterOverlay.appendChild(
            ripple
        );


        setTimeout(
            function() {

                ripple.remove();

            },
            1800
        );

    }
);


/* =====================================================
   FEEDING
===================================================== */

const activeFood = [];


function updateFood(
    deltaTime
) {

    for (
        let i = activeFood.length - 1;
        i >= 0;
        i--
    ) {

        const food =
            activeFood[i];


        food.age +=
            deltaTime;


        // Fall downward

        food.y +=
            food.speed *
            deltaTime;


        // Slight horizontal drift

        food.x +=
            food.drift *
            deltaTime;


        // Keep pellets inside tank

        if (food.x < 3) {

            food.x = 3;

            food.drift *= -1;

        }


        if (food.x > 97) {

            food.x = 97;

            food.drift *= -1;

        }


        // Update position

        food.element.style.left =
            food.x + "%";

        food.element.style.top =
            food.y + "%";


        // Remove when they reach the bottom
        // or have existed long enough

        if (
            food.y >= 85 ||
            food.age >= food.lifetime
        ) {

            food.element.remove();

            activeFood.splice(
                i,
                1
            );

        }

    }

}


function feedFish() {

    for (
        let i = 0;
        i < 10;
        i++
    ) {

        setTimeout(
            function() {

                createFood();

            },
            i * 100
        );

    }


    fishData.forEach(
        function(fish) {

            fish.targetSpeed =
                fish.baseSpeed *
                randomNumber(
                    1.4,
                    2.0
                );

        }
    );

}


function createFood() {

    const pellet =
        document.createElement("div");

    pellet.className =
        "food";


    const food = {

        element: pellet,

        x: randomNumber(5, 95),

        y: randomNumber(2, 8),

        speed: randomNumber(0.015, 0.03),

        drift: randomNumber(-0.003, 0.003),

        age: 0,

        lifetime: randomNumber(2500, 4000)

    };


    pellet.style.left =
        food.x + "%";

    pellet.style.top =
        food.y + "%";


    foodLayer.appendChild(
        pellet
    );


    activeFood.push(
        food
    );

}


function createFood() {

    const pellet =
        document.createElement("div");

    pellet.className =
        "food";


    const food = {

        element: pellet,

        x: randomNumber(5, 95),

        y: randomNumber(2, 8),

        speed: randomNumber(0.015, 0.03),

        drift: randomNumber(-0.003, 0.003),

        age: 0,

        lifetime: randomNumber(2500, 4000)

    };


    pellet.style.left =
        food.x + "%";

    pellet.style.top =
        food.y + "%";


    foodLayer.appendChild(
        pellet
    );


    activeFood.push(
        food
    );

}

feedButton.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        feedFish();

    }
);


/* =====================================================
   RESET
===================================================== */

function resetAquarium() {

    fishLayer.innerHTML = "";

    foodLayer.innerHTML = "";

    activeFood.length = 0;

    bubbleLayer.innerHTML = "";


    fishData.forEach(
        function(fish) {

            fish.x =
                randomNumber(5, 88);

            fish.y =
                randomNumber(10, 80);

            fish.angle =
                randomNumber(
                    -45,
                    45
                );

            fish.speed =
                fish.baseSpeed;

            fish.targetSpeed =
                fish.baseSpeed;

            fish.burstMultiplier = 1;

            fish.speedChangeTimer =
                randomNumber(
                    1500,
                    4500
                );

            fish.burstTimer =
                randomNumber(
                    6000,
                    14000
                );

            fish.angleChangeTimer =
                randomNumber(
                    1500,
                    4000
                );

            if (
                Math.random() < 0.5
            ) {

                fish.direction = -1;

                fish.angle += 180;

            }

            else {

                fish.direction = 1;

            }

            createFish(fish);

        }
    );

}


resetButton.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        resetAquarium();

    }
);


/* =====================================================
   ANIMATION
===================================================== */

function animationLoop(
    timestamp
) {

    if (!lastTime) {

        lastTime =
            timestamp;

    }


    let deltaTime =
        timestamp -
        lastTime;


    lastTime =
        timestamp;


    deltaTime =
        Math.min(
            deltaTime,
            50
        );


   updateFish(
       deltaTime
   );
   
   
   updateFood(
       deltaTime
   );
   
   
   updateBubbles(
       deltaTime
   );


    requestAnimationFrame(
        animationLoop
    );

}


requestAnimationFrame(
    animationLoop
);
