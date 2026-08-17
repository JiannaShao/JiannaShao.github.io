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

let fishAreBig = false;

let fishAreOverfed = false;

/*
    =========================
    FOOD SETTINGS
    =========================
*/

const MAX_FOOD = 100;

const BIG_FISH_FOOD =
    70;

const minimumBubbleTime = 150;
const maximumBubbleTime = 450;

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
        size: 380,
        baseSpeed: 0.025 / 8,
        speed: 0.025 / 8,
        targetSpeed: 0.025 / 8,
        direction: 1
    },

    {
        name: "Bluegill",
        image: "Fih/Bluegill.png",
        baseSpeed: 0.045 / 8,
        size: 140,
        speed: 0.045 / 8,
        targetSpeed: 0.045 / 8,
        direction: -1
    },

    {
        name: "Burbot",
        image: "Fih/Burbot.png",
        baseSpeed: 0.030 / 8,
        size: 340,
        speed: 0.030 / 8,
        targetSpeed: 0.030 / 8,
        direction: 1
    },

    {
        name: "Carp",
        image: "Fih/Carp.png",
        baseSpeed: 0.050 / 8,
        size: 220,
        speed: 0.050 / 8,
        targetSpeed: 0.050 / 8,
        direction: -1
    },

    {
        name: "Catfish",
        image: "Fih/Catfish.png",
        baseSpeed: 0.040 / 8,
        size: 200,
        speed: 0.040 / 8,
        targetSpeed: 0.040 / 8,
        direction: 1
    },

    {
        name: "Crappie",
        image: "Fih/Crappie.png",
        baseSpeed: 0.028 / 8,
        size: 190,
        speed: 0.028 / 8,
        targetSpeed: 0.028 / 8,
        direction: -1
    },

    {
        name: "Freshwater Drum",
        image: "Fih/Freshwater Drum.png",
        baseSpeed: 0.038 / 8,
        size: 240,
        speed: 0.038 / 8,
        targetSpeed: 0.038 / 8,
        direction: 1
    },

    {
        name: "Minnow",
        image: "Fih/Minnow.png",
        baseSpeed: 0.032 / 8,
        size: 120,
        speed: 0.032 / 8,
        targetSpeed: 0.032 / 8,
        direction: 1
    },

    {
        name: "Perch",
        image: "Fih/Perch.png",
        baseSpeed: 0.048 / 8,
        size: 220,
        speed: 0.048 / 8,
        targetSpeed: 0.048 / 8,
        direction: -1
    },

    {
        name: "Pike",
        image: "Fih/Pike.png",
        baseSpeed: 0.042 / 8,
        size: 280,
        speed: 0.042 / 8,
        targetSpeed: 0.042 / 8,
        direction: 1
    },

    {
        name: "Pumpkinseed",
        image: "Fih/Pumpkinseed.png",
        baseSpeed: 0.033 / 8,
        size: 150,
        speed: 0.033 / 8,
        targetSpeed: 0.033 / 8,
        direction: -1
    },

    {
        name: "Round Goby",
        image: "Fih/Round Goby.png",
        baseSpeed: 0.047 / 8,
        size: 200,
        speed: 0.047 / 8,
        targetSpeed: 0.047 / 8,
        direction: 1
    },

    {
        name: "Salmon",
        image: "Fih/Salmon.png",
        baseSpeed: 0.036 / 8,
        size: 400,
        speed: 0.036 / 8,
        targetSpeed: 0.036 / 8,
        direction: -1
    },

    {
        name: "Sucker",
        image: "Fih/Sucker.png",
        baseSpeed: 0.043 / 8,
        size: 240,
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


            /*
                Don't interact with fish once
                they are completely overfed.
            */
            
            if (fishAreOverfed) {
                return;
            }
            
            
            data.direction *= -1;

            data.angle += 180;

            data.speed *= 1.5;

            message.textContent =
                `${data.name} noticed you!`;

            fish.style.filter =
                "brightness(1.3)";


            setTimeout(function() {

                data.speed /= 1.5;

                fish.style.filter = "";

            }, 200);

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
   FISH SIZE
========================= */

function updateFishSize(fish) {

    if (!fish.element) {
        return;
    }

    /*
        Fish are 1.2x larger when
        food is 70 or higher.
    */

    const scale =
        fishAreBig
            ? 1.2
            : 1;

    /*
        Your drawings all face LEFT.

        direction = -1
        → Fish is facing LEFT
        → No horizontal flip

        direction = 1
        → Fish is facing RIGHT
        → Flip horizontally
    */

    if (fish.direction === 1) {

        fish.element.style.transform =
            `scale(${scale}) scaleX(-1)`;

    } else {

        fish.element.style.transform =
            `scale(${scale})`;

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


        /*
            =========================
            OVERFED BEHAVIOR
            =========================

            At 100 food, the fish stop
            swimming and slowly fall
            toward the bottom.
        */

        if (fishAreOverfed) {

            /*
                Stop normal swimming.
            */

            fish.speed = 0;

            fish.targetSpeed = 0;

            fish.burstMultiplier = 1;


            /*
                Slowly fall toward the
                bottom of the aquarium.
            */

            const fallSpeed = 0.012;

            if (fish.y < 82) {

                fish.y +=
                    fallSpeed *
                    deltaTime;

                if (fish.y > 82) {

                    fish.y = 82;

                }

            }


            fish.element.style.left =
                fish.x + "%";

            fish.element.style.top =
                fish.y + "%";


            /*
                Keep the fish at its current
                size and orientation.
            */

            updateFishSize(fish);

            return;
        }


        /*
            =========================
            NORMAL SWIMMING
            =========================
        */

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
            Update size and orientation.
        */

        updateFishSize(fish);

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
        =========================
        FIND THE FISH'S MOUTH
        =========================

        Your drawings face LEFT.

        If the fish is swimming LEFT,
        the mouth is on the left side.

        If the fish is swimming RIGHT,
        the image is flipped, so the
        mouth is on the right side.
    */

    const fishRect =
        fish.element.getBoundingClientRect();

    const tankRect =
        tank.getBoundingClientRect();


    let mouthX;


    if (fish.direction === -1) {

        /*
            Fish facing LEFT.
            Mouth is near the left edge.
        */

        mouthX =
            fishRect.left +
            fishRect.width * 0.05;

    } else {

        /*
            Fish facing RIGHT.
            Image is flipped, so mouth
            is now near the right edge.
        */

        mouthX =
            fishRect.right -
            fishRect.width * 0.05;

    }


    /*
        Mouth is slightly above the
        vertical center of the fish.
    */

    const mouthY =
        fishRect.top +
        fishRect.height * 0.35;


    /*
        Convert the mouth's pixel position
        into a position relative to the tank.
    */

    const bubbleX =
        mouthX -
        tankRect.left;

    const bubbleY =
        mouthY -
        tankRect.top;


    bubble.style.left =
        bubbleX + "px";

    bubble.style.top =
        bubbleY + "px";


    /*
        Random bubble size.
    */

    const size =
        randomNumber(6, 40);

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
        randomNumber(-50, 50);

    bubble.style.setProperty(
        "--bubble-drift",
        drift + "px"
    );


    bubbleLayer.appendChild(bubble);


    /*
        Remove bubble after animation.
    */

    setTimeout(function() {

        bubble.remove();

    }, duration * 1000);

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

    let deltaTime =
        timestamp - lastTime;

    lastTime = timestamp;


    /*
        Prevent a huge movement spike when
        returning to the aquarium after
        switching tabs or windows.
    */

    deltaTime =
        Math.min(deltaTime, 50);


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
        Don't allow more food if the
        aquarium has already reached 100.
    */

    if (food >= MAX_FOOD) {

        food = MAX_FOOD;

        foodCount.textContent =
            food;

        message.textContent =
            "The fish are completely full!";

        return;
    }


    /*
        Add 10 food at a time.

        If there is less than 10 space
        remaining, only add enough to
        reach exactly 100.
    */

    const foodToAdd =
        Math.min(
            10,
            MAX_FOOD - food
        );


    /*
        Create the food pellets.
    */

    for (
        let i = 0;
        i < foodToAdd;
        i++
    ) {

        setTimeout(
            function() {

                createFood();

            },
            i * 100
        );

    }


    /*
        Increase the food counter.
    */

    food += foodToAdd;


    /*
        Update the displayed food amount.
    */

    foodCount.textContent =
        food;


    /*
        =========================
        70–99 FOOD
        =========================

        Fish become 1.2x larger,
        but continue swimming.
    */

    if (
        food >= BIG_FISH_FOOD &&
        food < MAX_FOOD
    ) {

        fishAreBig = true;


        /*
            Update every fish immediately
            so they become larger.
        */

        fishData.forEach(
            function(fish) {

                updateFishSize(fish);

            }
        );


        message.textContent =
            "The fish are getting full...";


        /*
            Give the fish a temporary
            burst of interest in the food.
        */

        fishData.forEach(
            function(fish) {

                fish.targetSpeed =
                    fish.baseSpeed *
                    randomNumber(1.4, 2.0);

            }
        );

    }


    /*
        =========================
        100 FOOD
        =========================

        Fish become overfed.

        They stop swimming and the
        updateFish() function will
        make them fall to the bottom.
    */

    if (food >= MAX_FOOD) {

        food = MAX_FOOD;

        fishAreBig = true;

        fishAreOverfed = true;


        /*
            Stop all normal fish movement.
        */

        fishData.forEach(
            function(fish) {

                fish.speed = 0;

                fish.targetSpeed = 0;

                fish.burstMultiplier = 1;


                /*
                    Make sure the 1.2x size
                    is applied immediately.
                */

                updateFishSize(fish);

            }
        );


        message.textContent =
            "The fish are completely full!";

    }

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

/* =========================
   BOOKS
========================= */

const bookDescriptions = {

    book1: {
        title: "The Strange Case of Dr Jekyll and Mr Hyde and Other Tales of Terror",

        text:
            "When I bought this book at Barnes & Nobles I was warned by a friend that this story, although a classic, had notoriously mediocre writing. After reading it in one sitting and reflecting on the story now I have to agree; a number of passages are overcomplicated and focus on mundane details. What did really resonate with me though was Dr. Jekyll’s final monologue at the end of the story told in the form of a letter to Mr. Utterson, where he reveals his alter-ego as Mr. Hyde (Spoiler alert!!) His description of the pursuit of the separation of the total good and evil in man and the allure of freedom to become a being faced with no consequences or any of the restrictions of a civilized member of society gave the story an entire new tone to me. For me, it shifted from a scary tale of a horrific villain and a poor victim doctor to the reflection of a multi-dimensional soul, a human who’s forced to grapple with their own flawed humanity as a consequence of their own actions. Dr. Jekyll’s self-awareness and eventual submission to fate seal my appreciation of this story, and I would give it a 8 out 10."
    },


    book2: {
        title: "Breakneck: China's Quest to Engineer the Future",

        text:
            "After living in Shanghai for 3 months in 2025, I found myself increasingly interested in China and everything socially, culturally and politically related to it. Luckily for me, there is no shortage of fellow students at Wesleyan that are also interested in this topic, and it’s become an important and interesting area of study for me. While there’s not a particular lot to reflect on (the book mostly compares the effectiveness of China’s government to effectively and quickly build infrastructure compared to the U.S. where policy holds back development), it did reinforce existing conversations I’d had about how there were benefits and losses to both sides. Where the perfect middle ground stands is debatable; but there is middle ground nevertheless."
    },


    book3: {
        title: "The 5 Types of Wealth",

        text:
            "This was a self-help book that my mother gave me to read (succeeding Atomic Habits and 7 Habits of Highly Effective People) that I found surprisingly helpful despite my otherwise aversion to the genre. The points are well organized and clear, the advice pretty standard but meaningful and I quite liked the background the author gave on his own life which made reading the book almost feel like a real coffee chat. One of the things that stuck out most to me was a page that had 4,160 dots representing how many weeks a person that would 80 years had in their life to live. I was able to locate what dot I was already at, and it put into perspective how fast life was moving. I then found the dots of my parents, and then my grandparents; the time I had with them was shockingly finite, which Bloom does emphasize when talking about his experience with his own parents. His other piece of advice I really liked that I am paraphrasing here is work hard first work smart later. In a age where the internet is filled with “get rich quick with AI tools” hacks for the burnt out young generation just looking for a way out of the rat race, it was a gentle reminder to me that at the end of the day you still have to face the problem head on."
    }

};



const bookCards =
    document.querySelectorAll(
        ".book-card"
    );


const bookDescription =
    document.getElementById(
        "book-description"
    );


const bookDescriptionTitle =
    document.getElementById(
        "book-description-title"
    );


const bookDescriptionText =
    document.getElementById(
        "book-description-text"
    );


let selectedBook = null;



bookCards.forEach(
    function(book) {

        book.addEventListener(
            "click",
            function() {

                const bookID =
                    book.dataset.book;


                /*
                    Clicking the same book
                    again closes the description.
                */

                if (
                    selectedBook === bookID
                ) {

                    bookDescription.classList.remove(
                        "visible"
                    );

                    selectedBook = null;

                    return;

                }


                const information =
                    bookDescriptions[
                        bookID
                    ];


                if (!information) {
                    return;
                }


                bookDescriptionTitle.textContent =
                    information.title;


                bookDescriptionText.textContent =
                    information.text;


                bookDescription.classList.add(
                    "visible"
                );


                selectedBook = bookID;


                /*
                    Smoothly move the
                    description into view.
                */

                setTimeout(
                    function() {

                        bookDescription.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest"
                        });

                    },
                    100
                );

            }
        );

    }
);
