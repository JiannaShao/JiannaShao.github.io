const tank = document.getElementById("tank");
const fishLayer = document.getElementById("fish-layer");
const foodLayer = document.getElementById("food-layer");
const bubbleLayer = document.getElementById("bubble-layer");
const message = document.getElementById("message");
const foodCount = document.getElementById("food-count");


/* =========================
   SETTINGS
========================= */

let food = 0;
let lastTime = 0;
let bubbleTimer = 0;

const minimumBubbleTime = 350;
const maximumBubbleTime = 1400;

let nextBubbleTime = randomNumber(
    minimumBubbleTime,
    maximumBubbleTime
);


/* =========================
   FISH
========================= */

/*
    All fish drawings face LEFT.

    direction:
        1  = swimming RIGHT
       -1  = swimming LEFT

    The speeds below are the previous
    speeds divided by 8.
*/

const fishData = [

    {
        name: "Bass",
        image: "Fih/Bass.png",
        size: 220,
        baseSpeed: 0.025 / 8,
        speed: 0.025 / 8,
        targetSpeed: 0.025 / 8,
        direction: 1
    },

    {
        name: "Bluegill",
        image: "Fih/Bluegill.png",
        baseSpeed: 0.045 / 8,
        size: 80,
        speed: 0.045 / 8,
        targetSpeed: 0.045 / 8,
        direction: -1
    },

    {
        name: "Burbot",
        image: "Fih/Burbot.png",
        baseSpeed: 0.030 / 8,
        size: 180,
        speed: 0.030 / 8,
        targetSpeed: 0.030 / 8,
        direction: 1
    },

    {
        name: "Carp",
        image: "Fih/Carp.png",
        baseSpeed: 0.050 / 8,
        size: 120,
        speed: 0.050 / 8,
        targetSpeed: 0.050 / 8,
        direction: -1
    },

    {
        name: "Catfish",
        image: "Fih/Catfish.png",
        baseSpeed: 0.040 / 8,
        size: 100,
        speed: 0.040 / 8,
        targetSpeed: 0.040 / 8,
        direction: 1
    },

    {
        name: "Crappie",
        image: "Fih/Crappie.png",
        baseSpeed: 0.028 / 8,
        size: 90,
        speed: 0.028 / 8,
        targetSpeed: 0.028 / 8,
        direction: -1
    },

    {
        name: "Freshwater Drum",
        image: "Fih/Freshwater Drum.png",
        baseSpeed: 0.038 / 8,
        size: 100,
        speed: 0.038 / 8,
        targetSpeed: 0.038 / 8,
        direction: 1
    },

    {
        name: "Golden Dorado",
        image: "Fih/GoldenDorado.png",
        baseSpeed: 0.055 / 8,
        size: 220,
        speed: 0.055 / 8,
        targetSpeed: 0.055 / 8,
        direction: -1
    },

    {
        name: "Minnow",
        image: "Fih/Minnow.png",
        baseSpeed: 0.032 / 8,
        size: 50,
        speed: 0.032 / 8,
        targetSpeed: 0.032 / 8,
        direction: 1
    },

    {
        name: "Perch",
        image: "Fih/Perch.png",
        baseSpeed: 0.048 / 8,
        size: 100,
        speed: 0.048 / 8,
        targetSpeed: 0.048 / 8,
        direction: -1
    },

    {
        name: "Pike",
        image: "Fih/Pike.png",
        baseSpeed: 0.042 / 8,
        size: 160,
        speed: 0.042 / 8,
        targetSpeed: 0.042 / 8,
        direction: 1
    },

    {
        name: "Pumpkinseed",
        image: "Fih/Pumpkinseed.png",
        baseSpeed: 0.033 / 8,
        size: 80,
        speed: 0.033 / 8,
        targetSpeed: 0.033 / 8,
        direction: -1
    },

    {
        name: "Round Goby",
        image: "Fih/Round Goby.png",
        baseSpeed: 0.047 / 8,
        size: 90,
        speed: 0.047 / 8,
        targetSpeed: 0.047 / 8,
        direction: 1
    },

    {
        name: "Salmon",
        image: "Fih/Salmon.png",
        baseSpeed: 0.036 / 8,
        size: 200,
        speed: 0.036 / 8,
        targetSpeed: 0.036 / 8,
        direction: -1
    },

    {
        name: "Sucker",
        image: "Fih/Sucker.png",
        baseSpeed: 0.043 / 8,
        size: 100,
        speed: 0.043 / 8,
        targetSpeed: 0.043 / 8,
        direction: 1
    }

];


/* =========================
   RANDOM STARTING POSITIONS
========================= */

/*
    Every fish starts somewhere different.

    X = left/right
    Y = up/down
*/

fishData.forEach(function(fish) {

    fish.x = randomNumber(5, 88);
    fish.y = randomNumber(10, 80);

    /*
        Each fish gets a random initial
        swimming angle.

        0 degrees   = right
        90 degrees  = down
        -90 degrees = up
        180 degrees = left
    */

    fish.angle = randomNumber(-45, 45);

    /*
        Some fish start swimming left.
    */

    if (Math.random() < 0.5) {
        fish.direction = -1;
        fish.angle += 180;
    }

    /*
        Controls how quickly the fish
        changes its swimming angle.
    */

    fish.angleChangeTimer = randomNumber(
        1500,
        4000
    );

});


/* =========================
   CREATE FISH
========================= */

function createFish(data) {

    const fish = document.createElement("div");

    fish.className = "fish";

    fish.innerHTML = `
       <img
           src="${data.image}"
           alt="${data.name}"
           draggable="false"
           style="width: ${data.size}px; height: auto;"
       >
   `;

    fish.style.left = data.x + "%";
    fish.style.top = data.y + "%";

    /*
        Your artwork faces LEFT.

        When the fish swims RIGHT,
        flip the image horizontally.

        When it swims LEFT,
        use the original image.
    */

    if (data.direction === 1) {
        fish.style.transform = "scaleX(-1)";
    } else {
        fish.style.transform = "scaleX(1)";
    }


    /*
        Random speed-change timing.
    */

    data.speedChangeTimer = randomNumber(
        1500,
        4500
    );


    /*
        Random burst timing.
    */

    data.burstTimer = randomNumber(
        6000,
        14000
    );

    data.burstMultiplier = 1;


    /*
        Clicking a fish makes it turn around
        and temporarily speed up.
    */

    fish.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            data.direction *= -1;

            data.angle += 180;

            data.speed *= 1.5;

            message.textContent =
                `${data.name} noticed you!`;

            fish.style.filter =
                "brightness(1.2)";


            setTimeout(function() {

                data.speed /= 1.5;

                fish.style.filter = "";

            }, 800);

        }
    );


    data.element = fish;

    fishLayer.appendChild(fish);
}


/*
    Create exactly 15 fish.
*/

fishData.forEach(function(fish) {
    createFish(fish);
});


/* =========================
   FISH BEHAVIOR
========================= */

function updateFishBehavior(
    fish,
    deltaTime
) {

    /*
        =========================
        CHANGE SPEED
        =========================
    */

    fish.speedChangeTimer -= deltaTime;

    if (fish.speedChangeTimer <= 0) {

        fish.targetSpeed =
            fish.baseSpeed *
            randomNumber(0.6, 1.3);

        fish.speedChangeTimer =
            randomNumber(2000, 5000);
    }


    /*
        Gradually approach the new speed.
    */

    const speedChangeRate = 0.00015;

    if (fish.speed < fish.targetSpeed) {

        fish.speed +=
            speedChangeRate * deltaTime;

    } else {

        fish.speed -=
            speedChangeRate * deltaTime;
    }


    /*
        =========================
        CHANGE SWIMMING ANGLE
        =========================
    */

    fish.angleChangeTimer -= deltaTime;

    if (fish.angleChangeTimer <= 0) {

        /*
            Change the angle by a random
            amount instead of suddenly
            choosing a completely new path.
        */

        fish.angle += randomNumber(
            -35,
            35
        );

        fish.angleChangeTimer =
            randomNumber(
                1500,
                4000
            );
    }


    /*
        =========================
        OCCASIONAL SPEED BURST
        =========================
    */

    fish.burstTimer -= deltaTime;

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


    if (fish.burstMultiplier > 1) {

        fish.burstDuration -= deltaTime;

        if (fish.burstDuration <= 0) {

            fish.burstMultiplier = 1;
        }
    }

}


/* =========================
   FISH MOVEMENT
========================= */

function updateFish(deltaTime) {

    fishData.forEach(function(fish) {

        if (!fish.element) {
            return;
        }


        updateFishBehavior(
            fish,
            deltaTime
        );


        /*
            Current speed.
        */

        const actualSpeed =
            fish.speed *
            fish.burstMultiplier;


        /*
            Convert the angle to radians.
        */

        const radians =
            fish.angle *
            Math.PI /
            180;


        /*
            Move horizontally AND vertically.

            cos = horizontal movement
            sin = vertical movement
        */

        const horizontalMovement =
            Math.cos(radians) *
            actualSpeed *
            deltaTime;


        const verticalMovement =
            Math.sin(radians) *
            actualSpeed *
            deltaTime;


        fish.x += horizontalMovement;

        fish.y += verticalMovement;


        /*
            =========================
            LEFT EDGE
            =========================
        */

        if (fish.x <= 2) {

            fish.x = 2;

            fish.direction = 1;

            /*
                Reflect the horizontal
                component of movement.
            */

            fish.angle =
                180 - fish.angle;
        }


        /*
            =========================
            RIGHT EDGE
            =========================
        */

        if (fish.x >= 91) {

            fish.x = 91;

            fish.direction = -1;

            fish.angle =
                180 - fish.angle;
        }


        /*
            =========================
            TOP EDGE
            =========================
        */

        if (fish.y <= 5) {

            fish.y = 5;

            /*
                Reverse vertical movement.
            */

            fish.angle =
                -fish.angle;
        }


        /*
            =========================
            BOTTOM EDGE
            =========================
        */

        if (fish.y >= 82) {

            fish.y = 82;

            fish.angle =
                -fish.angle;
        }


        /*
            Determine which direction
            the fish is actually moving.
        */

        const horizontalDirection =
            Math.cos(
                fish.angle *
                Math.PI /
                180
            );


        if (horizontalDirection > 0) {

            fish.direction = 1;

        } else {

            fish.direction = -1;
        }


        /*
            Update position.
        */

        fish.element.style.left =
            fish.x + "%";

        fish.element.style.top =
            fish.y + "%";


        /*
            Your drawings face LEFT.

            Swimming RIGHT:
                flip image

            Swimming LEFT:
                normal image
        */

        if (fish.direction === 1) {

            fish.element.style.transform =
                "scaleX(-1)";

        } else {

            fish.element.style.transform =
                "scaleX(1)";
        }

    });

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
        Start approximately where
        the fish currently is.
    */

    const randomX =
        randomNumber(-1.5, 1.5);

    const randomY =
        randomNumber(-1.5, 1.5);


    bubble.style.left =
        `calc(${fish.x}% + ${randomX}px)`;

    bubble.style.top =
        `calc(${fish.y}% + ${randomY}px)`;


    /*
        Random bubble size.
    */

    const size =
        randomNumber(4, 34);

    bubble.style.width =
        size + "px";

    bubble.style.height =
        size + "px";


    /*
        Random bubble rise speed.
    */

    const duration =
        randomNumber(4, 10);

    bubble.style.setProperty(
        "--bubble-duration",
        duration + "s"
    );


    /*
        Random horizontal drift.
    */

    const drift =
        randomNumber(-35, 35);

    bubble.style.setProperty(
        "--bubble-drift",
        drift + "px"
    );


    bubbleLayer.appendChild(bubble);


    setTimeout(function() {

        bubble.remove();

    }, duration * 500);

}


/* =========================
   RANDOM BUBBLES
========================= */

function updateBubbles(deltaTime) {

    bubbleTimer += deltaTime;

    if (bubbleTimer >= nextBubbleTime) {

        bubbleTimer = 0;


        /*
            Pick a random fish.
        */

        const randomFish =
            fishData[
                Math.floor(
                    Math.random() *
                    fishData.length
                )
            ];


        createBubble(randomFish);


        /*
            Pick another random time.
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

function animationLoop(timestamp) {

    if (!lastTime) {
        lastTime = timestamp;
    }


    const deltaTime =
        timestamp - lastTime;

    lastTime = timestamp;


    updateFish(deltaTime);

    updateBubbles(deltaTime);


    requestAnimationFrame(
        animationLoop
    );
}


requestAnimationFrame(
    animationLoop
);


/* =========================
   FEEDING
========================= */

function feedFish() {

    /*
        Drop 10 pieces of food.
    */

    for (
        let i = 0;
        i < 10;
        i++
    ) {

        setTimeout(function() {

            createFood();

        }, i * 100);
    }


    food += 10;

    foodCount.textContent =
        `Food: ${food}`;

    message.textContent =
        "Feeding time!";


    /*
        Fish temporarily become
        more active.
    */

    fishData.forEach(function(fish) {

        fish.targetSpeed =
            fish.baseSpeed *
            randomNumber(1.4, 2.0);

    });

}


/* =========================
   CREATE FOOD
========================= */

function createFood() {

    const pellet =
        document.createElement("div");

    pellet.className = "food";


    pellet.style.left =
        randomNumber(5, 95) + "%";

    pellet.style.top =
        randomNumber(2, 10) + "%";


    foodLayer.appendChild(pellet);


    setTimeout(function() {

        pellet.remove();

    }, 3000);

}


/* =========================
   FEED BUTTON
========================= */

document
    .getElementById("feed-button")
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
    .getElementById("reset-button")
    .addEventListener(
        "click",
        function() {

            location.reload();

        }
    );


/* =========================
   RANDOM NUMBER
========================= */

function randomNumber(min, max) {

    return (
        Math.random() *
        (max - min) +
        min
    );
}
