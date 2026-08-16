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

    Each fish has:

    - Its own image
    - Its own base swimming speed
    - Its own starting direction

    The starting X and Y positions are
    generated randomly when the page loads.
*/


const fishData = [

    {
        name: "Bass",
        image: "Fih/Bass.png",
        baseSpeed: 0.025,
        speed: 0.025,
        targetSpeed: 0.025,
        direction: 1
    },


    {
        name: "Bluegill",
        image: "Fih/Bluegill.png",
        baseSpeed: 0.045,
        speed: 0.045,
        targetSpeed: 0.045,
        direction: -1
    },


    {
        name: "Burbot",
        image: "Fih/Burbot.png",
        baseSpeed: 0.030,
        speed: 0.030,
        targetSpeed: 0.030,
        direction: 1
    },


    {
        name: "Carp",
        image: "Fih/Carp.png",
        baseSpeed: 0.050,
        speed: 0.050,
        targetSpeed: 0.050,
        direction: -1
    },


    {
        name: "Catfish",
        image: "Fih/Catfish.png",
        baseSpeed: 0.040,
        speed: 0.040,
        targetSpeed: 0.040,
        direction: 1
    },


    {
        name: "Crappie",
        image: "Fih/Crappie.png",
        baseSpeed: 0.028,
        speed: 0.028,
        targetSpeed: 0.028,
        direction: -1
    },


    {
        name: "Freshwater Drum",
        image: "Fih/Freshwater Drum.png",
        baseSpeed: 0.038,
        speed: 0.038,
        targetSpeed: 0.038,
        direction: 1
    },


    {
        name: "Golden Dorado",
        image: "Fih/GoldenDorado.png",
        baseSpeed: 0.055,
        speed: 0.055,
        targetSpeed: 0.055,
        direction: -1
    },


    {
        name: "Minnow",
        image: "Fih/Minnow.png",
        baseSpeed: 0.032,
        speed: 0.032,
        targetSpeed: 0.032,
        direction: 1
    },


    {
        name: "Perch",
        image: "Fih/Perch.png",
        baseSpeed: 0.048,
        speed: 0.048,
        targetSpeed: 0.048,
        direction: -1
    },


    {
        name: "Pike",
        image: "Fih/Pike.png",
        baseSpeed: 0.042,
        speed: 0.042,
        targetSpeed: 0.042,
        direction: 1
    },


    {
        name: "Pumpkinseed",
        image: "Fih/Pumpkinseed.png",
        baseSpeed: 0.033,
        speed: 0.033,
        targetSpeed: 0.033,
        direction: -1
    },


    {
        name: "Round Goby",
        image: "Fih/Round Goby.png",
        baseSpeed: 0.047,
        speed: 0.047,
        targetSpeed: 0.047,
        direction: 1
    },


    {
        name: "Salmon",
        image: "Fih/Salmon.png",
        baseSpeed: 0.036,
        speed: 0.036,
        targetSpeed: 0.036,
        direction: -1
    },


    {
        name: "Sucker",
        image: "Fih/Sucker.png",
        baseSpeed: 0.043,
        speed: 0.043,
        targetSpeed: 0.043,
        direction: 1
    }

];



/* =========================
   RANDOM STARTING POSITIONS
========================= */

/*
    Give every fish a random starting
    position inside the aquarium.

    X controls left/right.
    Y controls up/down.

    These ranges keep the fish away
    from the extreme edges.
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


    fish.style.transform =
        `scaleX(${data.direction})`;


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
        temporarily swim faster and
        change direction.
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
        Every few seconds choose a new
        target speed.

        The fish can slow down to about
        60% of its normal speed or speed
        up to about 130%.
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

        This prevents sudden robotic
        changes in speed.
    */

    const accelerationRate =
        0.0012;


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
        Occasionally give the fish
        a short burst of speed.
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
        End the burst after its
        random duration.
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


            /*
                Update this fish's
                changing speed.
            */

            updateFishBehavior(
                fish,
                deltaTime
            );


            /*
                Apply the temporary
                burst multiplier.
            */

            const actualSpeed =
                fish.speed *
                fish.burstMultiplier;


            /*
                Convert the speed into
                movement.
            */

            let movement =
                actualSpeed *
                deltaTime;


            fish.x +=
                movement *
                fish.direction;


            /*
                LEFT EDGE
            */

            if (fish.x <= 2) {

                fish.x = 2;

                fish.direction = 1;

            }


            /*
                RIGHT EDGE
            */

            if (fish.x >= 91) {

                fish.x = 91;

                fish.direction = -1;

            }


            fish.element.style.left =
                fish.x + "%";


            /*
                Flip the artwork so the fish
                faces the direction it swims.
            */

            fish.element.style.transform =
                `scaleX(${fish.direction})`;

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
        Find the fish's position
        inside the aquarium.
    */

    const fishX = fish.x;

    const fishY = fish.y;


    /*
        Add a little randomness so
        bubbles don't always come from
        exactly the same location.
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
        Real bubbles have different sizes.
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
        Different bubbles rise at
        different speeds.
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
        Bubbles drift slightly from
        side to side while rising.
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


    /*
        Once enough time has passed,
        choose a random fish and create
        a bubble.
    */

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


        /*
            Choose a new random interval.
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

    /*
        Calculate time since the
        previous animation frame.
    */

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

        They accelerate naturally toward
        their new target speeds.
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
