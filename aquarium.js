const tank =
    document.getElementById("tank");

const fishLayer =
    document.getElementById("fish-layer");

const foodLayer =
    document.getElementById("food-layer");

const bubbleLayer =
    document.getElementById("bubble-layer");

const message =
    document.getElementById("message");

const foodCount =
    document.getElementById("food-count");



/* =========================
   SETTINGS
========================= */

let food = 0;

let lastTime = 0;

let bubbleTimer = 0;


/*
    How frequently bubbles can appear.

    This is intentionally somewhat random
    so the bubbles don't look synchronized.
*/

const minimumBubbleTime = 350;

const maximumBubbleTime = 1400;

let nextBubbleTime =
    randomNumber(
        minimumBubbleTime,
        maximumBubbleTime
    );



/* =========================
   FISH
========================= */

/*
    There are exactly 15 fish.

    All fish drawings face LEFT.

    Therefore:

    direction = 1
        Fish faces RIGHT

    direction = -1
        Fish faces LEFT


    The original speeds have been divided
    by 8 to make the swimming slower.
*/


const fishData = [

    {
        name: "Bass",
        image: "Fih/Bass.png",
        baseSpeed: 0.025 / 8,
        speed: 0.025 / 8,
        targetSpeed: 0.025 / 8,
        direction: 1
    },


    {
        name: "Bluegill",
        image: "Fih/Bluegill.png",
        baseSpeed: 0.045 / 8,
        speed: 0.045 / 8,
        targetSpeed: 0.045 / 8,
        direction: -1
    },


    {
        name: "Burbot",
        image: "Fih/Burbot.png",
        baseSpeed: 0.030 / 8,
        speed: 0.030 / 8,
        targetSpeed: 0.030 / 8,
        direction: 1
    },


    {
        name: "Carp",
        image: "Fih/Carp.png",
        baseSpeed: 0.050 / 8,
        speed: 0.050 / 8,
        targetSpeed: 0.050 / 8,
        direction: -1
    },


    {
        name: "Catfish",
        image: "Fih/Catfish.png",
        baseSpeed: 0.040 / 8,
        speed: 0.040 / 8,
        targetSpeed: 0.040 / 8,
        direction: 1
    },


    {
        name: "Crappie",
        image: "Fih/Crappie.png",
        baseSpeed: 0.028 / 8,
        speed: 0.028 / 8,
        targetSpeed: 0.028 / 8,
        direction: -1
    },


    {
        name: "Freshwater Drum",
        image: "Fih/Freshwater Drum.png",
        baseSpeed: 0.038 / 8,
        speed: 0.038 / 8,
        targetSpeed: 0.038 / 8,
        direction: 1
    },


    {
        name: "Golden Dorado",
        image: "Fih/GoldenDorado.png",
        baseSpeed: 0.055 / 8,
        speed: 0.055 / 8,
        targetSpeed: 0.055 / 8,
        direction: -1
    },


    {
        name: "Minnow",
        image: "Fih/Minnow.png",
        baseSpeed: 0.032 / 8,
        speed: 0.032 / 8,
        targetSpeed: 0.032 / 8,
        direction: 1
    },


    {
        name: "Perch",
        image: "Fih/Perch.png",
        baseSpeed: 0.048 / 8,
        speed: 0.048 / 8,
        targetSpeed: 0.048 / 8,
        direction: -1
    },


    {
        name: "Pike",
        image: "Fih/Pike.png",
        baseSpeed: 0.042 / 8,
        speed: 0.042 / 8,
        targetSpeed: 0.042 / 8,
        direction: 1
    },


    {
        name: "Pumpkinseed",
        image: "Fih/Pumpkinseed.png",
        baseSpeed: 0.033 / 8,
        speed: 0.033 / 8,
        targetSpeed: 0.033 / 8,
        direction: -1
    },


    {
        name: "Round Goby",
        image: "Fih/Round Goby.png",
        baseSpeed: 0.047 / 8,
        speed: 0.047 / 8,
        targetSpeed: 0.047 / 8,
        direction: 1
    },


    {
        name: "Salmon",
        image: "Fih/Salmon.png",
        baseSpeed: 0.036 / 8,
        speed: 0.036 / 8,
        targetSpeed: 0.036 / 8,
        direction: -1
    },


    {
        name: "Sucker",
        image: "Fih/Sucker.png",
        baseSpeed: 0.043 / 8,
        speed: 0.043 / 8,
        targetSpeed: 0.043 / 8,
        direction: 1
    }

];



/* =========================
   RANDOM STARTING POSITIONS
========================= */

/*
    Give every fish a random starting
    position inside the aquarium.

    X = left/right

    Y = up/down
*/

fishData.forEach(
    function(fish) {

        fish.x =
            randomNumber(
                5,
                88
            );


        fish.y =
            randomNumber(
                10,
                80
            );


        /*
            Vertical movement.

            This determines whether the fish
            is currently moving upward or
            downward.

            The amount is intentionally small
            compared with horizontal movement.
        */

        fish.verticalDirection =
            randomNumber(
                -1,
                1
            );


        /*
            How strongly this fish is
            currently moving vertically.
        */

        fish.verticalSpeed =
            randomNumber(
                0.15,
                0.45
            );


        /*
            Each fish periodically changes
            its vertical direction.
        */

        fish.verticalChangeTimer =
            randomNumber(
                1500,
                4000
            );

    }
);



/* =========================
   CREATE FISH
========================= */

function createFish(data) {

    const fish =
        document.createElement("div");

    fish.className = "fish";


    /*
        Each fish gets its own image.
    */

    fish.innerHTML = `
        <img
            src="${data.image}"
            alt="${data.name}"
            draggable="false"
        >
    `;


    fish.style.left =
        data.x + "%";


    fish.style.top =
        data.y + "%";


    /*
        Your drawings face LEFT.

        scaleX(-1) flips them to face RIGHT.

        Therefore:

        direction = 1
            scaleX(-1)

        direction = -1
            scaleX(1)
    */

    fish.style.transform =
        `scaleX(${-data.direction})`;


    /*
        Each fish gets its own random
        timing for changing speed.
    */

    data.speedChangeTimer =
        randomNumber(
            1500,
            4500
        );


    /*
        Each fish gets its own random
        timing for occasional bursts.
    */

    data.burstTimer =
        randomNumber(
            5000,
            12000
        );


    data.burstMultiplier = 1;


    /*
        Clicking a fish makes it
        change direction and temporarily
        swim faster.
    */

    fish.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            data.direction *= -1;


            data.speed =
                data.speed * 1.5;


            message.textContent =
                `${data.name} noticed you!`;


            fish.style.filter =
                "brightness(1.2)";


            setTimeout(
                function() {

                    data.speed /= 1.5;

                    fish.style.filter = "";

                },
                800
            );

        }
    );


    data.element = fish;


    fishLayer.appendChild(fish);

}



/* Create all 15 fish */

fishData.forEach(
    function(fish) {

        createFish(fish);

    }
);



/* =========================
   CHANGING FISH SPEED
========================= */

function updateFishBehavior(
    fish,
    deltaTime
) {

    /*
        Count down until the fish
        chooses a new speed.
    */

    fish.speedChangeTimer -=
        deltaTime;


    /*
        Choose a new target speed.

        The fish can slow down or
        speed up gradually.
    */

    if (
        fish.speedChangeTimer <= 0
    ) {

        const variation =
            randomNumber(
                0.60,
                1.30
            );


        fish.targetSpeed =
            fish.baseSpeed *
            variation;


        fish.speedChangeTimer =
            randomNumber(
                1800,
                5000
            );

    }


    /*
        Gradually move toward the
        target speed.
    */

    const accelerationRate =
        0.00015;


    if (
        fish.speed <
        fish.targetSpeed
    ) {

        fish.speed +=
            accelerationRate *
            deltaTime;

    }


    else if (
        fish.speed >
        fish.targetSpeed
    ) {

        fish.speed -=
            accelerationRate *
            deltaTime;

    }


    /*
        Prevent the speed from becoming
        negative due to tiny floating-point
        differences.
    */

    fish.speed =
        Math.max(
            fish.speed,
            0.0001
        );


    /*
        =========================
        VERTICAL DIRECTION
        =========================

        Fish periodically decide whether
        to swim upward or downward.
    */

    fish.verticalChangeTimer -=
        deltaTime;


    if (
        fish.verticalChangeTimer <= 0
    ) {

        fish.verticalDirection =
            randomNumber(
                -1,
                1
            );


        /*
            Normalize the direction so
            it is either upward or downward.
        */

        fish.verticalDirection =
            fish.verticalDirection >= 0
                ? 1
                : -1;


        fish.verticalSpeed =
            randomNumber(
                0.15,
                0.45
            );


        fish.verticalChangeTimer =
            randomNumber(
                1500,
                4500
            );

    }


    /*
        =========================
        SPEED BURSTS
        =========================
    */

    fish.burstTimer -=
        deltaTime;


    if (
        fish.burstTimer <= 0 &&
        fish.burstMultiplier === 1
    ) {

        fish.burstMultiplier =
            randomNumber(
                1.4,
                2.1
            );


        fish.burstDuration =
            randomNumber(
                700,
                1600
            );


        fish.burstTimer =
            randomNumber(
                6000,
                14000
            );

    }


    /*
        End the burst.
    */

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



/* =========================
   FISH MOVEMENT
========================= */

function updateFish(deltaTime) {

    fishData.forEach(
        function(fish) {

            if (!fish.element) {
                return;
            }


            updateFishBehavior(
                fish,
                deltaTime
            );


            /*
                Actual speed including
                occasional bursts.
            */

            const actualSpeed =
                fish.speed *
                fish.burstMultiplier;


            /*
                =========================
                HORIZONTAL MOVEMENT
                =========================
            */

            const horizontalMovement =
                actualSpeed *
                deltaTime;


            fish.x +=
                horizontalMovement *
                fish.direction;


            /*
                =========================
                VERTICAL MOVEMENT
                =========================

                Vertical movement is based
                on the same general speed,
                but reduced so the fish tend
                to travel diagonally rather
                than moving straight up/down.
            */

            const verticalMovement =
                actualSpeed *
                deltaTime *
                fish.verticalSpeed;


            fish.y +=
                verticalMovement *
                fish.verticalDirection;


            /*
                =========================
                LEFT EDGE
                =========================
            */

            if (fish.x <= 2) {

                fish.x = 2;

                fish.direction = 1;

            }


            /*
                =========================
                RIGHT EDGE
                =========================
            */

            if (fish.x >= 91) {

                fish.x = 91;

                fish.direction = -1;

            }


            /*
                =========================
                TOP EDGE
                =========================
            */

            if (fish.y <= 5) {

                fish.y = 5;

                fish.verticalDirection = 1;

            }


            /*
                =========================
                BOTTOM EDGE
                =========================
            */

            if (fish.y >= 82) {

                fish.y = 82;

                fish.verticalDirection = -1;

            }


            /*
                Update position.
            */

            fish.element.style.left =
                fish.x + "%";


            fish.element.style.top =
                fish.y + "%";


            /*
                Your original drawings face LEFT.

                Flip horizontally when the fish
                is swimming RIGHT.

                direction = 1  -> scaleX(-1)
                direction = -1 -> scaleX(1)
            */

            fish.element.style.transform =
                `scaleX(${-fish.direction})`;

        }
    );

}



/* =========================
   BUBBLES
========================= */

function createBubble(fish) {

    if (!fish.element) {
        return;
    }


    const bubble =
        document.createElement("div");

    bubble.className = "bubble";


    /*
        Find the fish's current position.
    */

    const fishX =
        fish.x;

    const fishY =
        fish.y;


    /*
        Add randomness so bubbles don't
        always come from exactly the same
        location.
    */

    const randomX =
        Math.random() * 5 - 2.5;

    const randomY =
        Math.random() * 5 - 2.5;


    bubble.style.left =
        `calc(${fishX}% + ${randomX}px)`;


    bubble.style.top =
        `calc(${fishY}% + ${randomY}px)`;


    /*
        Different bubble sizes.
    */

    const size =
        randomNumber(
            4,
            14
        );


    bubble.style.width =
        size + "px";


    bubble.style.height =
        size + "px";


    /*
        Different rising speeds.
    */

    const duration =
        randomNumber(
            3,
            6
        );


    bubble.style.setProperty(
        "--bubble-duration",
        duration + "s"
    );


    /*
        Random horizontal drift.
    */

    const drift =
        randomNumber(
            -35,
            35
        );


    bubble.style.setProperty(
        "--bubble-drift",
        drift + "px"
    );


    bubbleLayer.appendChild(
        bubble
    );


    /*
        Remove the bubble after
        its animation is complete.
    */

    setTimeout(
        function() {

            bubble.remove();

        },
        duration * 1000
    );

}



/* =========================
   RANDOM BUBBLE GENERATION
========================= */

function updateBubbles(deltaTime) {

    bubbleTimer +=
        deltaTime;


    if (
        bubbleTimer >=
        nextBubbleTime
    ) {

        bubbleTimer = 0;


        /*
            Choose a random fish.
        */

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


        /*
            Pick another random interval.
        */

        nextBubbleTime =
            randomNumber(
                minimumBubbleTime,
                maximumBubbleTime
            );

    }

}



/* =========================
   ANIMATION LOOP
========================= */

function animationLoop(
    timestamp
) {

    if (!lastTime) {

        lastTime =
            timestamp;

    }


    const deltaTime =
        timestamp -
        lastTime;


    lastTime =
        timestamp;


    updateFish(
        deltaTime
    );


    updateBubbles(
        deltaTime
    );


    requestAnimationFrame(
        animationLoop
    );

}


/*
    Start the aquarium.
*/

requestAnimationFrame(
    animationLoop
);



/* =========================
   FEEDING
========================= */

function feedFish() {

    /*
        Drop several pieces of food
        into the aquarium.
    */

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


    food += 10;


    foodCount.textContent =
        `Food: ${food}`;


    message.textContent =
        "Feeding time!";


    /*
        Make the fish temporarily
        move faster.

        They accelerate toward their
        new target speeds naturally.
    */

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



/* =========================
   CREATE FOOD
========================= */

function createFood() {

    const pellet =
        document.createElement("div");

    pellet.className =
        "food";


    pellet.style.left =
        randomNumber(
            5,
            95
        ) + "%";


    pellet.style.top =
        randomNumber(
            2,
            10
        ) + "%";


    foodLayer.appendChild(
        pellet
    );


    setTimeout(
        function() {

            pellet.remove();

        },
        3000
    );

}



/* =========================
   FEED BUTTON
========================= */

document
    .getElementById(
        "feed-button"
    )
    .addEventListener(
        "click",
        function() {

            feedFish();

        }
    );



/* =========================
   RESET
========================= */

document
    .getElementById(
        "reset-button"
    )
    .addEventListener(
        "click",
        function() {

            location.reload();

        }
    );



/* =========================
   RANDOM NUMBER HELPER
========================= */

function randomNumber(
    min,
    max
) {

    return (
        Math.random() *
        (max - min) +
        min
    );

}
