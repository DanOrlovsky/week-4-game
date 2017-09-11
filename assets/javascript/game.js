/*
 * 8Bit BattleGrounds
 * Daniel Orlovsky
 * for UNCC Bootcamp Aug-2017
 * 
 * Welcome to a battle between some of the biggest 8Bit stars on the planet!  In a realm where there importance is no longer measured by
 * how many kids exhaust HOURS guiding these heroes to victory, they now define their self-worth by battling EACH OTHER!
 */


'use strict'

// GAME SOUNDS
var selectMoveSound = "./assets/sounds/menu-move.mp3";
var selectCharSound = "./assets/sounds/menu-select.mp3";
var smackSound = "./assets/sounds/slap.wav";
var dodgeSound = "./assets/sounds/dodge-sound.mp3";
var explodeSound = "./assets/sounds/explosion.mp3";

var unknownChar = "./assets/images/unknown.gif"
var charExplode = "./assets/images/char-explode.gif";

var playerSelected = false;
var enemySelected = false;
var defenderSelected = false;
var fightStarted = false;
var playerCanGo = false;
var enemyCanGo = false;
var enemyList = [];
var player;
var enemy;
var interval;  // ? w3schools ?
// Basic qualities each character will posess.
// We will override these in each of the character classes
var characterQualities = {
    name: "", //  How their name appears in css
    selectImage: "", //  Path to selection screen image
    standingImage: "", //  Path to standing Image
    attackingImage: "", //  Path to attacking image
    attackWaitInc: 0,   //  Increment to 100 to be prepared to attack
    arenaBackground: "", //  Which background to use for the arena
    isAttacking: false, //  Flag for whether we're attacking or not.
    hitPoints: 0, //  How many hitpoints the character has
    magicPoints: 0, //  How many magicpoints the character has
    magicPower: 0, //  How much power each magic attack has
    magicLoss: 0, //  How much magic is lost with each magic attack   
    attackPoints: 0, //  How many attack points can the player deliver
    counterAttackMulti: 0, //  Counter-attack multiplier
    counterAttackProbability: 0, //  What are the odds the player will counter attack?   (Out of 100)
    dodgeProbability: 0, //  What are the odds the player will dodge? (out of 100)
    imageElement: "", //  The element we'll be drawing to

};

// Mario
var mario = {
    character: characterQualities = {
        name: "mario",
        selectImage: "./assets/images/mario/Mario-Select.gif",
        standingImage: "./assets/images/mario/Mario-Standing.gif",
        arenaBackground: "./assets/images/mario/mario-background.jpg",
        attackingImage: "./assets/images/mario/Mario-Attacking.png",
        attackWaitInc: 15,
        hitPoints: 150,
        magicPoints: 20,
        magicPower: 25,
        magicLoss: 5,
        attackPoints: 35,
        counterAttackMulti: 1.5,
        counterAttackProbability: 15,
        dodgeProbability: 15,
    }
};


// Mudkip
var mudKip = {
    character: characterQualities = {
        name: "mudkip",
        selectImage: "./assets/images/mudkip/MudKip-Select.gif",
        standingImage: "./assets/images/mudkip/MudKip-Standing.gif",
        attackingImage: "./assets/images/mudkip/MudKip-Standing.gif",
        hitPoints: 65,
        attackWaitInc: 5,
        magicPoints: 100,
        magicPower: 50,
        magicLoss: 25,
        attackPoints: 20,
        counterAttackMulti: 3,
        counterAttackProbability: 45,
        dodgeProbability: 50,
    }
};


// Megaman
var megaMan = {
    character: characterQualities = {
        name: "megaman",
        selectImage: "./assets/images/megaman/MegaMan-Select.gif",
        standingImage: "./assets/images/megaman/MegaMan-Standing.gif",
        arenaBackground: "./assets/images/megaman/megaman-background.png",
        attackingImage: "./assets/images/megaman/MegaMan-Standing.gif",
        magicPoints: 0,
        attackWaitInc: 20,
        hitPoints: 200,
        attackPoints: 45,
        counterAttackMulti: 1.25,
        counterAttackProbability: 3,
        dodgeProbability: 5,
    }
};

// The guy from Contra
var contra = {
    character: characterQualities = {
        name: "contra",
        selectImage: "./assets/images/contra/Contra-Select.gif",
        standingImage: "./assets/images/contra/Contra-Standing.gif",
        arenaBackground: "./assets/images/contra/contra-background.png",
        attackingImage: "./assets/images/contra/Contra-Standing.gif",
        hitPoints: 125,
        attackWaitInc: 20,
        magicPoints: 0,
        attackPoints: 30,
        counterAttackMulti: 1.5,
        counterAttackProbability: 25,
        dodgeProbability: 25,
    }
};

// Link
var link = {
    character: characterQualities = {
        name: "link",
        selectImage: "./assets/images/link/Link-Select.gif",
        standingImage: "./assets/images/link/Link-Standing.gif",
        arenaBackground: "./assets/images/link/link-background.gif",
        hitPoints: 75,
        magicPoints: 100,
        attackWaitInc: 25,
        magicPower: 45,
        magicLoss: 20,
        attackPoints: 60,
        counterAttackMulti: 1.5,
        counterAttackProbility: 25,
        dodgeProbability: 25,
    }
};

function gameConsoleLog(msg){ 
    $("#game-console").prepend(msg + "<br />");
}
// Returns a random number
function getRandom(outOf) {
    return Math.floor(Math.random() * outOf);
}

function displayText(person, characterText) {
    var textElement =$("#battle-screen").append("<h1>" + characterText + "</h1>");
    textElement.css("left", person.character.imageElement.css("left"));
    textElement.css("top", person.character.imageElement.css("top") - "250px");
}
/*  This function will play audio by creating a new element, and then removes the element after the sound has finished.
    This makes layering of sounds possible.
*/
function playSound(soundPath) {
    // creates an audio element (need jquery)
    var audioElement = document.createElement("audio"); //$('<audio></audio>').src = audioFile;
    // connects the element to the source
    audioElement.src = soundPath;
    // creates an event listener that will remove the element when finished
    audioElement.addEventListener("ended", function () {
        $(audioElement).remove();
    }, false);
    // plays the audio
    audioElement.play();
}

// This makes it easier to swap out which image is displayed for a character
function swapImage(charSwap, src) {
    charSwap.character.imageElement.attr("src", src);
}


/* THESE ARE NOT WORKING */
function disableFightOptions() {
    $("#option-attack").addClass("disabled");
    $("#option-magic").addClass("disabled");
    $("#option-defend").addClass("disabled");
}

function enableFightOptions() {
    $("#option-attack").removeClass("disabled");
    $("#option-magic").removeClass("disabled");
    $("#option-defend").removeClass("disabled");
    
}


/* This function runs the timers depending on game statuses */
function advanceTimers() {
    // Checks if the enemy timer has reached its max
    if(enemy.timer >= 100) {
        // flag the enemy can go and run their attack
        enemyCanGo = true;
        enemyAttackPlayer();
    }
    // if not, advance the timer
    if(!enemyCanGo) {
        // this should be done in one line?  But we pin the width to 100 to prevent from status bar overflow (hidden-  duh)
        enemy.timer += enemy.character.attackWaitInc;
        enemy.timer = (enemy.timer > 100) ? 100 : enemy.timer;
    }
    if(player.timer >= 100) {
        enableFightOptions();
        playerCanGo = true;
    }
    if(!playerCanGo) {
        player.timer += player.character.attackWaitInc;
        player.timer = (player.timer > 100) ? 100 : player.timer;
        disableFightOptions();
    }
    // update status bars.
    $("#player-attack-progress").css("width", player.timer + "%");
    $("#enemy-attack-progress").css("width", enemy.timer + "%");
}

// resets the player's timer variables
function startPlayerTimer() {
    playerCanGo = false;
    player.timer = 0;
    $("#player-attack-progress").css("width", 0);
}

// resets the enemies timer variables
function startEnemyTimer() {
    enemyCanGo = false;
    enemy.timer = 0;
    $("#enemy-attack-progress").css("width", 0);
}

// starts all the game timers
function startGameTimers() {
    disableFightOptions();
    startPlayerTimer();
    startEnemyTimer();
    enemySelected = true;
    fightStarted = true;
    interval = setInterval(advanceTimers, 250);
}

// This function fires when the player is selected, moves on the enemySelectionScreen
function selectPlayer(playerChar) {
    player = playerChar;
    gameConsoleLog("Player Will be: " + player.character.name);
    player.character.imageElement = $("#hero-fighter");
    player.character.imageElement.attr("src", player.character.standingImage);
    $("#hero-image").attr("src", player.character.selectImage);
    displayEnemySelectScreen();
}

// Runs after an enemy is selected
function selectEnemy(enemyChar) {
    // assign the enemy
    enemy = enemyChar;

    gameConsoleLog("Enemy will be: " + enemy.character.name);

    // removes the enemy selection screen
    $("#enemy-screen-wrapper").css({
        "opacity": 0,
        "display": "none"
    });
    $("#enemy-image").attr("src", enemy.character.selectImage);
    // Grabs the playing image element
    enemy.character.imageElement = $("#enemy-fighter");
    // Sets the opacity to 1 (when he dies the opacity goes to zero, this will reset it)
    enemy.character.imageElement.css("opacity", 1); 
    swapImage(enemy, enemy.character.standingImage);
    // Show the battle screen
    toggleBattleScreen("block");
    // Starts the game timers!
    startGameTimers();
}

// Displays the enemy selection screen
function displayEnemySelectScreen() {
    $("#enemy-image").attr("src", unknownChar);
    $("#hero-screen-wrapper").css({
        "opacity": 0,
        "display": "none"
    });
    $("#enemy-screen-wrapper").css({
        "opacity": 1,
        "display": "block"
    });
    $("#enemy-" + player.character.name + "-select").css("display", "none");
    enemyList.forEach(function (currentValue) {
        $("#enemy-" + currentValue + "-select").css("display", "none");
    });
}

function updateStats() {
    $("#player-stats").html("<h1>PLAYER</h1><h1 style=\"margin-top: 10px\">HP: " + player.character.hitPoints + "</h1>");
    if (player.character.magicPoints > 0) {
        $("#player-stats").append("<h1 style=\"margin-top: 10px\">MP: " + player.character.magicPoints + "</h1>");
    }
    $("#enemy-stats").html("<h1>Enemy</h1><h1 style=\"margin-top: 10px\">HP: " + enemy.character.hitPoints + "</h1>");
    if (enemy.character.magicPoints > 0) {
        $("#enemy-stats").append("<h1 style=\"margin-top: 10px\">MP: " + enemy.character.magicPoints + "</h1>");
    }
}
function toggleBattleScreen(displayToggle) {
    
    $("#battle-screen").css({
        "display": displayToggle,
        "height": "300px",
        "background-image": "url('" + enemy.character.arenaBackground + "')"
    });
    $("#fighting-options").css("display", displayToggle);
    $("#player-attack-bar").css("display", displayToggle);
    $("#enemy-attack-bar").css("display", displayToggle);
    player.character.imageElement.css("display", (displayToggle === "none") ? "none" : "inline-block");
    enemy.character.imageElement.css("display", (displayToggle === "none") ? "none" : "inline-block");
    updateStats();
}

/*
 * Runs the dodge animation
 * Since the X position doesn't matter, we can run the same animation for either player or enemy
 */
function runDodge(personDodging) { 
    playSound(dodgeSound);    
    personDodging.character.imageElement.animate({ top: "50px"}, 30, function(event) {
        personDodging.character.imageElement.animate({top: "150px"}, 30);
    });
    
}

/*
 * Animation that runs when the player is hit
 */
function playerHit() {
    player.character.imageElement.animate({ left: "-200px"}, 100, function(event) {
        player.character.imageElement.animate({left: "-140px"}, 100, function(event) {
            player.character.imageElement.animate({left: "-180px"});
        });
    });
}

/*
 * Animation that runs when the enemy is hit.
 */
function enemyHit() {
    enemy.character.imageElement.animate({ right: "-200px"}, 100, function(event) {
        enemy.character.imageElement.animate({right: "-140px"}, 100, function(event) {
            enemy.character.imageElement.animate({right: "-180px"});
        });
    });
}

/* 
 * Kills off the character by fading out their opacity.
 */
function killCharacter(deadChar) {
    swapImage(deadChar, charExplode);
    playSound(explodeSound);
    clearInterval(interval);
    deadChar.character.imageElement.animate({ opacity: 0}, 1000, function() {
        if(enemy.character.hitPoints <= 0) {
            enemyList.push(deadChar.character.name);
            if(enemyList.length >= 4) {
                // we win!
            } else {
                toggleBattleScreen("none");
                displayEnemySelectScreen();
            }
        }
    });
}

// Pass isCounter to prevent a never-ending counterAttack loop.  This prevents countering a counter
function enemyAttackPlayer(isCounter = false) {
    // Assumes dodge and counterAttack are false    
    var dodge = false;
    var counterAttack = false;
    // We either check if it's a genuine allowable attack, or if it's a counter
    if((!enemy.character.isAttacking && enemyCanGo && !player.character.isAttacking) || isCounter) {
        // Check odds of a dodge
        var playerDodge = getRandom(100);
        if(playerDodge <= player.character.dodgeProbability) {
            dodge = true;
        }
        // If it's not a counter ....
        if(!isCounter) {
            // Check the odds of a counter
            var counter = getRandom(100);
            if(counter <= player.character.counterAttackProbability) {
                counterAttack = true;
            }
        }

        // Check the attack power - TODO : ADD MINIMUM ATTACK DAMAGE TO PREVENT INCREDIBLY LOW ATTACK RATES
        var attackPower = getRandom(enemy.character.attackPoints);
        // If we have an attack
        if(attackPower > 0) {
            // We hit the enemy!
            // Load enemy's attackingImage
            swapImage(enemy, enemy.character.attackingImage);   
            // Flag the enemy is attacking
            enemy.character.isAttacking = true;
            // Run css animations
            // The callback will check for a dodge and animate the enemy back into position
            enemy.character.imageElement.animate({
                right: "250px"
            }, 300, function () {
                // If the player didn't dodge...
                if(!dodge) {
                    gameConsoleLog(enemy.character.name + " hit " + player.character.name + " for " + attackPower + "hps!");
                    playSound(smackSound);
                    playerHit();
                    player.character.hitPoints -= attackPower;
                // If the player DID dodge
                } else {
                    gameConsoleLog(player.character.name + " dodged " + enemy.character.name + "'s attack!");
                    runDodge(player);
                }
                // Update the display
                updateStats();
                // Animate
                enemy.character.imageElement.animate({
                    right: "-180px"
                }, 300, function () {
                    swapImage(enemy, enemy.character.standingImage);
                    enemy.character.isAttacking = false;
                    if(counterAttack === true)  {
                        gameConsoleLog(player.character.name + " has counter-attacked!");
                        playerAttackEnemy(true);
                    } 
                    if(!isCounter) {
                        startEnemyTimer();
                    }
                });
            });
            return true;            
        }
    }
}

function playerAttackEnemy(isCounter = false) {
    var dodge = false;
    var counterAttack = false;
    if ((!player.character.isAttacking && playerCanGo && !enemy.character.isAttacking) || isCounter) {
        var enemyDodge = getRandom(100);
        if (enemyDodge <= enemy.character.dodgeProbability) {
            // the enemy dodged!
            dodge = true;
        };
        if(!isCounter) {
            var enemyCounter = getRandom(100);
            if(enemyCounter <= enemy.character.counterAttackProbability) {
                counterAttack = true;
            }
        }
        var attackPower = getRandom(player.character.attackPoints);
        if (attackPower > 0) {
            // We hit the enemy!
            // Load players attackingImage
            swapImage(player, player.character.attackingImage);   
            // Flag the player is attacking
            player.character.isAttacking = true;
            // Run css animations
            // Callback embeds another animation, runs the attack sound, and decrements the enemies health
            player.character.imageElement.animate({
                left: "250px"
            }, 300, function () {
                if(!dodge) {
                    gameConsoleLog(player.character.name + " hit " + enemy.character.name + " for " + attackPower + "hps!");
                    playSound(smackSound);
                    enemyHit();
                    enemy.character.hitPoints -= attackPower;
                } else {
                    gameConsoleLog(enemy.character.name + " dodged " + player.character.name + "'s attack!");
                    runDodge(enemy);
                }
                updateStats();
                if(enemy.character.hitPoints <= 0) {
                    gameConsoleLog(enemy.character.name + " has fallen!");
                    killCharacter(enemy);
                }
                player.character.imageElement.animate({
                    left: "-180px"
                }, 300, function () {
                    swapImage(player, player.character.standingImage);
                    player.character.isAttacking = false;
                    if(counterAttack === true) {
                        gameConsoleLog(enemy.character.name + " has counter-attacked!");
                        enemyAttackPlayer(true);
                    } 
                    if(!isCounter) {
                        startPlayerTimer();
                    }
                });
            });
            return true;
        }
    }
    // the enemy ended up dodging - 
    return false;
}

$(document).ready(function () {
    // Plays audio on mouse-over
    $(".character-select").mouseenter(function () {
        playSound(selectMoveSound);
    });



    /* EVENT HANDLERS */
    $('.hero-select').on("click", function () {
        playSound(selectCharSound);
        switch ($(this).data('name')) {
            case 'mario':
                selectPlayer(mario);
                break;
            case 'link':
                selectPlayer(link);
                break;
            case 'mudkip':
                selectPlayer(mudKip);
                break;
            case 'contra':
                selectPlayer(contra);
                break;
            case 'megaman':
                selectPlayer(megaMan);
                break;
            default:
                break;
        };
    });
    $('.enemy-select').on("click", function () {
        playSound(selectCharSound);
        switch ($(this).data('name')) {
            case 'mario':
                selectEnemy(mario);
                break;
            case 'link':
                selectEnemy(link);
                break;
            case 'mudkip':
                selectEnemy(mudKip);
                break;
            case 'contra':
                selectEnemy(contra);
                break;
            case 'megaman':
                selectEnemy(megaMan);
                break;
            default:
                break;
        }
    });
    $(document).keypress(function (event) {
        if (fightStarted) {
            //  A pressed
            if (event.key.toLowerCase() == 'a') {

                playerAttackEnemy();
                updateStats();
                //  D pressed
            } else if (event.which == 100) {

                //  M Pressed 
            } else if (event.which == 109) {

            }
        }
    });
    $("#option-attack").on("click", function() {
        playerAttackEnemy();
        updateStats();
    })

});