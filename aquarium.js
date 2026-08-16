const tank = document.getElementById("tank");

const fishLayer =
    document.getElementById("fish-layer");

const foodLayer =
    document.getElementById("food-layer");

const message =
    document.getElementById("message");

const fishCount =
    document.getElementById("fish-count");

const foodCount =
    document.getElementById("food-count");


let food = 0;

let nextId = 4;


/*
    Each fish has:

    name
    color
    position
    speed
    direction
*/

const fishData = [

    {
        name: "Nemo",
        color: "#ff7b54",
        x: 20,
        y: 28,
        speed: 0.55,
        direction: 1
    },

    {
        name: "Mochi",
        color: "#ffd166",
        x: 55,
        y: 48,
        speed: 0.35,
        direction: -1
    },

    {
        name: "Pixel",
        color: "#b88cff",
        x: 72,
        y: 24,
        speed: 0.70,
        direction: -1
    }

];



/* --------------------------------
   CREATE A FISH
-------------------------------- */

function createFish(data) {

    const fish =
        document.createElement("div");

    fish.className = "fish";

    fish.dataset.name = data.name;

    fish.style.setProperty(
        "--fish-color",
        data.color
    );

    fish.style.left =
        data.x + "%";

    fish.style.top =
        data.y + "%";


    fish.innerHTML = `

        <div class="tail"></div>

        <div class="fish-body"></div>

        <div class="fin"></div>

    `;


    /*
        Clicking a fish makes it
        change direction and speed up.
    */

    fish.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();


            data.direction *= -1;

            data.speed += 0.15;


            message.textContent =
                `${data.name} noticed you!`;


            fish.style.transform =
                `scaleX(${data.direction}) scale(1.18)`;


            setTimeout(
                function() {

                    fish.style.transform =
                        `scaleX(${data.direction})`;

                },
                250
            );

        }
    );


    data.element = fish;

    fishLayer.appendChild(fish);

}



/* Create our initial fish */

fishData.forEach(createFish);



/* --------------------------------
   FISH MOVEMENT
-------------------------------- */

function updateFish() {

    fishData.forEach(
        function(fish) {

            if (!fish.element) {
                return;
            }


            let x =
                parseFloat(
                    fish.element.style.left
                );


            /*
                Move the fish.

                direction = 1
                means right.

                direction = -1
                means left.
            */

            x +=
                fish.speed *
                fish.direction *
                0.018;


            /*
                Turn around when
                reaching the edges.
            */

            if (x > 91) {

                x = 91;

                fish.direction = -1;

            }


            if (x < 2) {

                x = 2;

                fish.direction = 1;

            }


            fish.x = x;


            fish.element.style.left =
                x + "%";


            fish.element.style.transform =
                `scaleX(${fish.direction})`;

        }
    );


    /*
        Keep the animation running.
    */

    requestAnimationFrame(updateFish);

}



/* Start fish movement */

updateFish();



/* --------------------------------
   FEEDING
-------------------------------- */

function feedFish(
    x = Math.random() * 85 + 5,
    y = 5
) {

    const pellet =
        document.createElement("div");

    pellet.className = "food";


    pellet.style.left =
        x + "%";

    pellet.style.top =
        y + "%";


    foodLayer.appendChild(pellet);


    food++;


    foodCount.textContent =
        `Food: ${food}`;


    /*
        Remove the food after
        it finishes falling.
    */

    setTimeout(
        function() {

            pellet.remove();

        },
        2600
    );

}



/* --------------------------------
   CLICK THE WATER
-------------------------------- */

tank.addEventListener(
    "click",
    function(event) {

        const rect =
            tank.getBoundingClientRect();


        const x =
            ((event.clientX - rect.left)
            / rect.width) * 100;


        const y =
            ((event.clientY - rect.top)
            / rect.height) * 100;


        feedFish(x, y);


        message.textContent =
            "You dropped some food!";

    }
);



/* --------------------------------
   FEED BUTTON
-------------------------------- */

document
    .getElementById("feed-button")
    .addEventListener(
        "click",
        function() {

            /*
                Drop several pieces
                of food.
            */

            for (
                let i = 0;
                i < 6;
                i++
            ) {

                setTimeout(
                    function() {

                        feedFish(
                            Math.random() * 90 + 3,
                            Math.random() * 8
                        );

                    },
                    i * 120
                );

            }


            message.textContent =
                "Feeding time!";

        }
    );



/* --------------------------------
   ADD A FISH
-------------------------------- */

document
    .getElementById("add-button")
    .addEventListener(
        "click",
        function() {

            const colors = [

                "#5de0e6",
                "#ff8fab",
                "#8ce99a",
                "#ffb86c",
                "#9d8cff"

            ];


            const data = {

                name:
                    `Fish ${nextId}`,

                color:
                    colors[
                        Math.floor(
                            Math.random()
                            * colors.length
                        )
                    ],

                x:
                    Math.random() * 75 + 5,

                y:
                    Math.random() * 55 + 12,

                speed:
                    Math.random() * 0.45 + 0.25,

                direction:
                    Math.random() > 0.5
                        ? 1
                        : -1

            };


            fishData.push(data);


            createFish(data);


            nextId++;


            fishCount.textContent =
                `${fishData.length} fish`;


            message.textContent =
                `${data.name} joined the aquarium!`;

        }
    );



/* --------------------------------
   RESET
-------------------------------- */

document
    .getElementById("reset-button")
    .addEventListener(
        "click",
        function() {

            location.reload();

        }
    );
