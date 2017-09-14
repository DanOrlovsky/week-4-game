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
var attackStartSound = "./assets/sounds/attack-start.wav";
var winSound = "./assets/sounds/playerWins.wav";
var loseSound = "./assets/sounds/playerLose.wav";


// Game images unrelated to specific players
var unknownChar = "./assets/images/unknown.gif"
var charExplode = "./assets/images/char-explode.gif";

var quickDodgeAllowed = false;  //  Allows player to dodge for a short time while the enemy is attacking.
var quickDodgeExecuted = false; //  Flags if the player executed a quick dodge
var fightStarted = false;       //  Flags if the fight has started
var playerCanGo = false;        //  Flags whether the player can attack
var enemyCanGo = false;         //  Flags whether the enemy can attack
var gameOver = false;
var defeatedEnemyList = [];     //  List of defeated enemies
var player;                     //  Object to hold the player character
var enemy;                      //  Object to hold the enemy character
var interval;                   //  Object to hold the interval timer - use this to clear it. 


// Basic qualities each character will posess.
// We will override these in each of the character classes
var characterQualities = {
    name: "",               //  How their name appears in css
    selectImage: "",        //  Path to selection screen image
    standingImage: "",      //  Path to standing Image  
    attackingImage: "",     //  Path to attacking image
    attackWaitInc: 0,       //  Increment to 100 to be prepared to attack
    arenaBackground: "",    //  Which background to use for the arena
    isAttacking: false,     //  Flag for whether we're attacking or not.
    hitPoints: 0,           //  How many hitpoints the character has
    magicPoints: 0,         //  How many magicpoints the character has DEPRECATED
    magicPower: 0,          //  How much power each magic attack has   DEPRECATED
    magicLoss: 0,           //  How much magic is lost with each magic attack DEPRECATED
    attackPoints: 0,        //  How many attack points can the player deliver
    counterAttackMulti: 0,  //  Counter-attack multiplier
    counterAttackProbability: 0,    //  What are the odds the player will counter attack?   (Out of 100)
    dodgeProbability: 0,            //  What are the odds the player will dodge? (out of 100)
    imageElement: "",               //  The element we'll be drawing to

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
        arenaBackground: "./assets/images/mudkip/mudkip-background.png",
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
        attackingImage: "./assets/images/megaman/MegaMan-Attacking.gif",
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
        attackingImage: "./assets/images/contra/Contra-Select.gif",
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
        arenaBackground: "./assets/images/link/link-background.png",
        attackingImage: "./assets/images/link/Link-Attacking.gif",
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


// **** UTILITY FUNCTIONS *****
// Returns a random number
function getRandom(outOf) {
    return Math.floor(Math.random() * outOf);
}

function findCenter(offset) {
    return $(window).width() / 2 - offset;
}

/*  
 *  This function will play audio by creating a new element, and then removes the element after the sound has finished.
 *  This makes layering of sounds possible.
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

// ***  END UTILITY *********

/*
 * advanceTimers() is responsible for the wait-time before a character can attack.
 * This will be referred to as the attack timer.
 */
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
    // Player is exactly the same
    if(player.timer >= 100) {
        playerCanGo = true;
    }
    if(!playerCanGo) {
        player.timer += player.character.attackWaitInc;
        player.timer = (player.timer > 100) ? 100 : player.timer;
        
    }
    // update status bars.
    $("#player-attack-progress").css("width", player.timer + "%");
    $("#enemy-attack-progress").css("width", enemy.timer + "%");
}



/*
 *  Timer initialization is kept separate so we can reset either players separately after an attack.
 *  Initializes the players attack timer
 */
function startPlayerTimer() {
    playerCanGo = false;
    player.timer = 0;
    $("#player-attack-progress").css("width", 0);
}

/* 
 *  Initializes the enemies attack timer.  
 */
function startEnemyTimer() {
    enemyCanGo = false;
    enemy.timer = 0;
    $("#enemy-attack-progress").css("width", 0);
}

/*
 * Resets the entire game 
 */
function startGameTimers() {
    
    startPlayerTimer();
    startEnemyTimer();
    fightStarted = true;
    interval = setInterval(advanceTimers, 250);
}

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
    //  If we're selecting an enemy, we haven't won the game.
    gameOver = false;   
    // assign the enemy
    enemy = enemyChar;
    // If the enemy is mudKip - cut their dodge probability in half
    if(enemy.character.name === "mudkip") {
        enemy.character.dodgeProbability /= 2;
    }
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
    // Show the Questionmark box as a placeholder
    $("#enemy-image").attr("src", unknownChar);
    // Make sure the hero selection screen his hidden
    $("#hero-screen-wrapper").css({
        "opacity": 0,
        "display": "none"
    });
    // Make sure the wrapper for the enemySelectionScreen is visible
    $("#enemy-screen-wrapper").css({
        "opacity": 1,
        "display": "block"
    });
    // Removes the player's character
    $("#enemy-" + player.character.name + "-select").css("display", "none");

    // Removes characters that are in our enemy defeated list
    defeatedEnemyList.forEach(function (currentValue) {
        $("#enemy-" + currentValue + "-select").css("display", "none");
    });
}

// This updates the display of player and enemy stats. 
function updateStats() {
    $("#player-stats").html("<h1>PLAYER</h1><h1 style=\"margin-top: 10px\">HP: " + player.character.hitPoints + "</h1>");
    $("#enemy-stats").html("<h1>Enemy</h1><h1 style=\"margin-top: 10px\">HP: " + enemy.character.hitPoints + "</h1>");
}

//
function displayText(person, characterText) {
    
    var textElement = $("<span style='color: red; font-size: 28px; font-weight: 700'>").text(characterText)
        .css( { position: "absolute", left: findCenter(),
        top: parseInt(person.character.imageElement.css("top").replace("px", "")) - 270,
        position: "relative"
     });
     $("#battle-screen").append(textElement);
     // Animates the text and removes the element from the DOM when finished.
     textElement.animate({ opacity: 0, top: "-200px"}, 2000, function() {
         $(this).remove();
     })
}

function gameConsoleLog(msg){ 
    $("#game-console").prepend(msg + "<br />");
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
function dodgeAttack(personDodging) { 
    playSound(dodgeSound);    
    personDodging.character.imageElement.animate({ top: "50px"}, 100, function(event) {
        personDodging.character.imageElement.animate({top: "150px"}, 100);
    });
    
}

/*
 * Animation that runs when a character is hit. 
 * charHit is the character who was hit.  leftOrRight will toggle whether we are animating the 'left'
 * or 'right' css property.
 */
function characterHitAnimation(charHit, leftOrRight) {
    switch(leftOrRight) {
        case 'left':
            charHit.character.imageElement.animate({ left: "-200px"}, 100, function(event) {
                charHit.character.imageElement.animate({ left: "-140px"}, 100, function(event) {
                    charHit.character.imageElement.animate({ left: "-180px"});
                });
            });
            break;
        case 'right':
            charHit.character.imageElement.animate({ right: "-200px"}, 100, function(event) {
                charHit.character.imageElement.animate({ right: "-140px"}, 100, function(event) {
                    charHit.character.imageElement.animate({ right: "-180px"});
                });
            });
            break;
        default:
            break;
    }
}

/*
 * runs the player losing screen
 */
function togglePlayerLose() {
    // Grab a reference to our game screen
    var gameScreen = $("#game-screen");
    // Clear out the game screen
    gameScreen.empty();
    // Create a new element with the player's image.
    var playerImage = $("<img>").attr("src", player.character.selectImage).css({display: "block", "margin-left": 0 });
    //  Add the element to the game screen
    gameScreen.append(playerImage);
    //  Runs our utility method
    var center = findCenter(playerImage.width() / 2);
    
    playSound(loseSound);
    // Animates the player to the center.  When that animation is done, we change the image to the exploding gif and play
    // the exploding sound.
    playerImage.animate({ "margin-left": center }, 2000, function() {
        playSound(explodeSound);
        playerImage.attr("src", charExplode).css({ "margin-left" : center + 75}).animate({opacity: 0}, 1000);
        gameScreen.append($("<h1>YOU LOSE!!!</h1>").animate({color: "red" }, 1000, function() {
            gameOver = true;
            gameScreen.append($("<h1>Press ENTER to try again!</h1>"));
        }))
    })
}
function togglePlayerWin() {
    var gameScreen = $("#game-screen");
    
    gameScreen.empty();
    playSound(winSound);
    //  Create the element to display the character
    var playerImage = $("<img>").attr("src", player.character.selectImage).css({ display: "block", margin: "0 auto"});
    //  Calculate where we're going to animate the player to the right.
    //  Attach the character to our game screen
    gameScreen.append(playerImage);
    
    var farRight = $(window).width() - playerImage.width(); //parseInt(playerImage.css("width").replace("px", ""));
    var center = findCenter(playerImage.width() / 2);
    
    // Animate player to the far left
    playerImage.animate({ "margin-left": "0"}, 1000, function() {
        // Animate player to the far right
        playerImage.animate({ "margin-left": farRight }, 1000, function() {
            // Return player to the center
            playerImage.animate({ "margin-left": center }, 1000, function() {
                // Display win message
                gameScreen.append($("<h1>You Win!!</h1>").animate({ "color": "red" }, 1000, function() {
                    gameOver = true;
                    // Give player option to play again.
                    gameScreen.append("<h1>Press ENTER to start a new game!</h1>")        
                }));
            });
        });
    });    
};

/* 
 * Kills off the character by fading out their opacity.
 */
function killCharacter(deadChar) {
    swapImage(deadChar, charExplode);
    playSound(explodeSound);
    clearInterval(interval);
    deadChar.character.imageElement.animate({ opacity: 0}, 1000, function() {
        if(enemy.character.hitPoints <= 0) {
            defeatedEnemyList.push(deadChar.character.name);
            // COMMENTED OUT UPPING THE PLAYERS HEALTH AFTER VICTORY NOW THAT DODGING CAN BE OVERRIDDEN
            //var rewardHP = defeatedEnemyList.length * getRandom(100);
            //player.character.hitPoints += rewardHP;
            //gameConsoleLog("Player was awarded an additional " + rewardHP + "hps!!");
            if(defeatedEnemyList.length >= 4) {
                // we win!
                togglePlayerWin();
            } else {
                toggleBattleScreen("none");
                displayEnemySelectScreen();
            }
        }
        else  {
            // We lost
            togglePlayerLose();
        }
    });
}

// Pass isCounter to prevent a never-ending counterAttack loop.  This prevents countering a counter
function enemyAttackPlayer(isCounter = false) {
    // Assumes dodge and counterAttack are false    
    var dodge = false;
    var counterAttack = false;
    var playerLost = false;
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
           playSound(attackStartSound);
           
            // Load enemy's attackingImage
            swapImage(enemy, enemy.character.attackingImage);   
            // Flag the enemy is attacking
            enemy.character.isAttacking = true;
            // Run css animations
            // The callback will check for a dodge and animate the enemy back into position
            enemy.character.imageElement.animate({ right: "240px" }, 300, function() {
                quickDodgeAllowed = true;
                
                enemy.character.imageElement.animate({ right: "250px" }, 150, function() {
                    quickDodgeAllowed = false;
                    // If the player didn't dodge...
                    if(!dodge && !quickDodgeExecuted) {
                        displayText(player, "-" + attackPower);
                        gameConsoleLog(enemy.character.name + " hit " + player.character.name + " for " + attackPower + "hps!");
                        playSound(smackSound);
                        characterHitAnimation(player, "left");
                        player.character.hitPoints -= attackPower;
                    // If the player DID dodge
                    } else {
                        if(quickDodgeExecuted){
                            quickDodgeExecuted = false;
                        }

                        gameConsoleLog(player.character.name + " dodged " + enemy.character.name + "'s attack!");
                        dodgeAttack(player);
                    }
                    // Update the display
                    updateStats();
                    if(player.character.hitPoints <= 0) {
                        gameConsoleLog(player.character.name + " has fallen!");
                        killCharacter(player);
                        playerLost = true;
                    }
                    // Animate
                    enemy.character.imageElement.animate({
                        right: "-180px"
                    }, 300, function () {
                        swapImage(enemy, enemy.character.standingImage);
                        enemy.character.isAttacking = false;
                        if(counterAttack === true && !playerLost)  {
                            gameConsoleLog(player.character.name + " has counter-attacked!");
                            playerAttackEnemy(true);
                        } 
                        if(!isCounter) {
                            startEnemyTimer();
                        }
                    });
                });
            });
            return true;            
        }
    }
}

function playerAttackEnemy(isCounter = false) {
    var dodge = false;
    var counterAttack = false;
    var enemyLost = false;
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
            playSound(attackStartSound);
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
                    displayText(enemy, "-" + attackPower);
                    gameConsoleLog(player.character.name + " hit " + enemy.character.name + " for " + attackPower + "hps!");
                    playSound(smackSound);
                    characterHitAnimation(enemy, "right");
                    enemy.character.hitPoints -= attackPower;
                } else {
                    gameConsoleLog(enemy.character.name + " dodged " + player.character.name + "'s attack!");
                    dodgeAttack(enemy);
                }
                updateStats();
                if(enemy.character.hitPoints <= 0) {
                    gameConsoleLog(enemy.character.name + " has fallen!");
                    killCharacter(enemy);
                    enemyLost = true;
                }
                player.character.imageElement.animate({
                    left: "-180px"
                }, 300, function () {
                    swapImage(player, player.character.standingImage);
                    player.character.isAttacking = false;
                    if(counterAttack === true && !enemyLost) {
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
            } else if (event.key.toLowerCase() == 'd') {
                if(quickDodgeAllowed) {
                    quickDodgeExecuted = true;
                }
                //  M Pressed 
            } else if (event.key.toLowerCase() == 'm') {
            } 
            
        }
        if(event.key.toLowerCase() == 'enter') {
            if(gameOver) {
                window.location.reload(true);               
            }
        }
    });
    $("#instructions-link").on('click', function() {
        $("#instruction-window").css('z-index', '99999').animate({ opacity: 1 }, 1000);
        
    })
    $("#close-instructions").on('click', function() {
        $("#instruction-window").animate({ opacity: 0, "z-index": "-99999" });
    })
    $("#option-defend").on("click", function() {
        if(quickDodgeAllowed) {
            quickDodgeExecuted = true;
        }
    });
    $("#option-attack").on("click", function() {
        playerAttackEnemy();
        updateStats();
    });

    $("#play-game").on("click", function() {
        $("#welcome-screen").animate({ height: 0}, 300, function() {
            $("welcome-screen").css("display", "none");
        })
    });
});