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

function Character(name, selectImage, standingImg, attackImg, arenaBack, attackWaitInc, hitPts, attackPts, cam, cap, dodgeProb) {
    this.name = name;                       //  How their name appears in css
    this.selectImage = selectImage;         //  Path to selection screen image
    this.standingImage = standingImg;       //  Path to standing Image  
    this.attackingImage = attackImg;        //  Path to attacking image
    this.attackWaitInc = attackWaitInc;     //  Increment to 100 to be prepared to attack
    this.arenaBackground = arenaBack;        //  Which background to use for the arena
    this.isAttacking = false;         //  Flag for whether we're attacking or not.
    this.hitPoints = hitPts;                //  How many hitpoints the character has
    this.attackPoints = attackPts;          //  How many attack points can the player deliver
    this.counterAttackMulti = cam;          //  Counter-attack multiplier
    this.counterAttackProbability = cap;    //  What are the odds the player will counter attack?   (Out of 100)
    this.dodgeProbability = dodgeProb;      //  What are the odds the player will dodge? (out of 100)
    this.imageElement = "";            //  The element we'll be drawing to
}
// Basic qualities each character will posess.
// We will override these in each of the character classes

// name, selectImage, standingImg, attackImg, arenaBack, attackWaitInc,  hitPts, attackPts, cam, cap, dodgeProb
var mario = new Character("mario", "./assets/images/mario/Mario-Select.gif", "./assets/images/mario/Mario-Standing.gif", "./assets/images/mario/Mario-Attacking.png",
                            "./assets/images/mario/mario-background.jpg", 15, 150, 35, 1.5, 15, 15);
var mudKip = new Character("mudkip", "./assets/images/mudkip/MudKip-Select.gif","./assets/images/mudkip/MudKip-Standing.gif","./assets/images/mudkip/MudKip-Standing.gif",
                            "./assets/images/mudkip/mudkip-background.png",5, 65, 20, 3, 45, 50);
var megaMan = new Character("megaman", "./assets/images/megaman/MegaMan-Select.gif", "./assets/images/megaman/MegaMan-Standing.gif", "./assets/images/megaman/MegaMan-Attacking.gif",
                            "./assets/images/megaman/megaman-background.png", 20, 200, 45, 1.25, 3, 5);
var contra = new Character("contra", "./assets/images/contra/Contra-Select.gif", "./assets/images/contra/Contra-Standing.gif", "./assets/images/contra/Contra-Select.gif",
                            "./assets/images/contra/contra-background.png", 20, 125, 30, 1.5, 25, 25);
var link = new Character("link", "./assets/images/link/Link-Select.gif","./assets/images/link/Link-Standing.gif", "./assets/images/link/Link-Attacking.gif", 
                            "./assets/images/link/link-background.png", 25, 75, 60, 1.5, 25, 25);

// All the game files stored in array so we can load them before the game starts.
var gameFiles = [   
    mario.selectImage, mario.standingImage, mario.arenaBackground, mario.attackingImage, 
    mudKip.selectImage, mudKip.standingImage, mudKip.arenaBackground,
    megaMan.selectImage,megaMan.standingImage, megaMan.arenaBackground, megaMan.attackingImage,
    link.selectImage, link.standingImage, link.arenaBackground, link.attackingImage,
    contra.selectImage, contra.standingImage, contra.arenaBackground, contra.attackingImage
];
// Loads all the game files using a recursive function
// https://forum.jquery.com/topic/wait-until-all-images-are-loaded
var filesLoaded = 0;
var progress = 0;
function loadGameFiles(callback) {
    var length = gameFiles.length;  
    var inc = 100 / gameFiles.length;
    var workFile = gameFiles[filesLoaded];
    console.log(workFile);
    // if we're working with an image
    if(workFile.indexOf('gif') > 0 ||
        workFile.indexOf('jpg') > 0 || 
        workFile.indexOf('png') > 0) {
        //  We're loading an image
        $("<img />").attr("src", workFile).on('load', function() {
            filesLoaded++;
            progress += inc;
            $(".load-progress").css("width", progress + "%");
            if(filesLoaded == gameFiles.length) {
                callback();
            } else {
                loadGameFiles(callback);
            }
        });
    }
}

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
    charSwap.imageElement.attr("src", src);
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
        enemy.timer += enemy.attackWaitInc;
        enemy.timer = (enemy.timer > 100) ? 100 : enemy.timer;
    }
    // Player is exactly the same
    if(player.timer >= 100) {
        playerCanGo = true;
    }
    if(!playerCanGo) {
        player.timer += player.attackWaitInc;
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
    $("#instructions-link").animate({"opacity": 0}, 200, function() {
        $(this).css("display", "none");
    });
    startPlayerTimer();
    startEnemyTimer();
    fightStarted = true;
    interval = setInterval(advanceTimers, 250);
}

function selectPlayer(playerChar) {
    player = playerChar;
    gameConsoleLog("Player Will be: " + player.name);
    player.imageElement = $("#hero-fighter");
    player.imageElement.attr("src", player.standingImage);
    $("#hero-image").attr("src", player.selectImage);
    displayEnemySelectScreen();
}

// Runs after an enemy is selected
function selectEnemy(enemyChar) {
    $("#instructions-link").animate({ "opacity": 1}, 200);
    //  If we're selecting an enemy, we haven't won the game.
    gameOver = false;   
    // assign the enemy
    enemy = enemyChar;
    // If the enemy is mudKip - cut their dodge probability in half
    if(enemy.name === "mudkip") {
        enemy.dodgeProbability /= 2;
    }
    gameConsoleLog("Enemy will be: " + enemy.name);

    // removes the enemy selection screen
    $("#enemy-screen-wrapper").css({
        "opacity": 0,
        "display": "none"
    });
    $("#enemy-image").attr("src", enemy.selectImage);
    // Grabs the playing image element
    enemy.imageElement = $("#enemy-fighter");
    // Sets the opacity to 1 (when he dies the opacity goes to zero, this will reset it)
    enemy.imageElement.css("opacity", 1); 
    swapImage(enemy, enemy.standingImage);
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
    $("#enemy-" + player.name + "-select").css("display", "none");

    // Removes characters that are in our enemy defeated list
    defeatedEnemyList.forEach(function (currentValue) {
        $("#enemy-" + currentValue + "-select").css("display", "none");
    });
}

// This updates the display of player and enemy stats. 
function updateStats() {
    $("#player-stats").html("<h1>PLAYER</h1><h1 style=\"margin-top: 10px\">HP: " + player.hitPoints + "</h1>");
    $("#enemy-stats").html("<h1>Enemy</h1><h1 style=\"margin-top: 10px\">HP: " + enemy.hitPoints + "</h1>");
}

//
function displayText(person, characterText) {
    
    var textElement = $("<span style='color: red; font-size: 28px; font-weight: 700'>").text(characterText)
        .css( { position: "absolute", left: findCenter(),
        top: parseInt(person.imageElement.css("top").replace("px", "")) - 270,
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
        "background-image": "url('" + enemy.arenaBackground + "')"
    });
    $("#fighting-options").css("display", displayToggle);
    $("#player-attack-bar").css("display", displayToggle);
    $("#enemy-attack-bar").css("display", displayToggle);
    player.imageElement.css("display", (displayToggle === "none") ? "none" : "inline-block");
    enemy.imageElement.css("display", (displayToggle === "none") ? "none" : "inline-block");
    updateStats();
}

/*
 * Runs the dodge animation
 * Since the X position doesn't matter, we can run the same animation for either player or enemy
 */
function dodgeAttack(personDodging) { 
    playSound(dodgeSound);    
    personDodging.imageElement.animate({ top: "50px"}, 100, function(event) {
        personDodging.imageElement.animate({top: "150px"}, 100);
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
            charHit.imageElement.animate({ left: "-200px"}, 100, function(event) {
                charHit.imageElement.animate({ left: "-140px"}, 100, function(event) {
                    charHit.imageElement.animate({ left: "-180px"});
                });
            });
            break;
        case 'right':
            charHit.imageElement.animate({ right: "-200px"}, 100, function(event) {
                charHit.imageElement.animate({ right: "-140px"}, 100, function(event) {
                    charHit.imageElement.animate({ right: "-180px"});
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
    var playerImage = $("<img>").attr("src", player.selectImage).css({display: "block", "margin-left": 0 });
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

/*
 *  Runs the animations when the player wins the game.
 */ 
function togglePlayerWin() {
    var gameScreen = $("#game-screen");
    
    gameScreen.empty();
    playSound(winSound);
    //  Create the element to display the character
    var playerImage = $("<img>").attr("src", player.selectImage).css({ display: "block", margin: "0 auto"});
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
    deadChar.imageElement.animate({ opacity: 0}, 1000, function() {
        if(enemy.hitPoints <= 0) {
            defeatedEnemyList.push(deadChar.name);
            // COMMENTED OUT UPPING THE PLAYERS HEALTH AFTER VICTORY NOW THAT DODGING CAN BE OVERRIDDEN
            //var rewardHP = defeatedEnemyList.length * getRandom(100);
            //player.hitPoints += rewardHP;
            //gameConsoleLog("Player was awarded an additional " + rewardHP + "hps!!");
            if(defeatedEnemyList.length >= 4) {
                // we win!
                togglePlayerWin();
            } else {
                // There's still enemies left to fight
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

/*
 * enemyAttackPlayer(isCounter = false) 
 * This function has several things going on.  We grab two random numbers out of 100 and check them against the player's
 * dodgeProbability and counterProbability.  If either of these are <= the random number, we flag those to be true.  If not,
 * we get a random number between 1 - attackPower.
 */ 
function enemyAttackPlayer(isCounter = false) {
    // Assumes dodge and counterAttack are false    
    var dodge = false;
    var counterAttack = false;
    var playerLost = false;
    // We either check if it's a genuine allowable attack, or if it's a counter
    if((!enemy.isAttacking && enemyCanGo && !player.isAttacking) || isCounter) {
        // Check odds of a dodge
        var playerDodge = getRandom(100);
        if(playerDodge <= player.dodgeProbability) {
            dodge = true;
        }
        // If it's not a counter ....
        if(!isCounter) {
            // Check the odds of a counter
            var counter = getRandom(100);
            if(counter <= player.counterAttackProbability) {
                counterAttack = true;
            }
        }
        
        // Prevent 0 attack power.
        var attackPower = getRandom(enemy.attackPoints) + 1; 
            
        // If the last attack was more than the amount of hitpoints the player has left, pin it to the amount of hitpoints.
        // This will prevent negative hitpoints from occuring.
        attackPower = (attackPower > player.hitPoints) ? player.hitPoints : attackPower;
        
        // We hit the enemy!
        playSound(attackStartSound);
        
        // Load enemy's attackingImage
        swapImage(enemy, enemy.attackingImage);   
        // Flag the enemy is attacking
        enemy.isAttacking = true;
        
        // Run css animations
        // The callback will check for a dodge and animate the enemy back into position
        enemy.imageElement.animate({ right: "240px" }, 300, function() {
            // Right before the enemy hits, we allow a dodge
            quickDodgeAllowed = true;
            
            enemy.imageElement.animate({ right: "250px" }, 150, function() {
                quickDodgeAllowed = false;
                // If the player didn't dodge...
                if(!dodge && !quickDodgeExecuted) {
                    // Display to the battle screen
                    displayText(player, "-" + attackPower);
                    // Add the event to the console log
                    gameConsoleLog(enemy.name + " hit " + player.name + " for " + attackPower + "hps!");
                    // Play the hit sound
                    playSound(smackSound);
                    // Animate the player being hit
                    characterHitAnimation(player, "left");
                    // Take away the player's health
                    player.hitPoints -= attackPower;
                // If the player DID dodge
                } else {
                    if(quickDodgeExecuted){
                        // if it was a quick dodge rather than a random dodge, flag it to false now since we are running the dodge
                        quickDodgeExecuted = false;
                    }
                    // Log the dodge
                    gameConsoleLog(player.name + " dodged " + enemy.name + "'s attack!");
                    dodgeAttack(player);
                }
                // Update the display
                updateStats();
                // Check if the player is out of hitPoints
                if(player.hitPoints <= 0) {
                    gameConsoleLog(player.name + " has fallen!");
                    killCharacter(player);
                    playerLost = true;
                }
                // Now that the actual hit is done, animate player back to their original position.
                enemy.imageElement.animate({
                    right: "-180px"
                }, 300, function () {
                    // Go back to the standing image
                    swapImage(enemy, enemy.standingImage);
                    // Flag the attack is over
                    enemy.isAttacking = false;
                    
                    // Do we get a counter attack?
                    // We also check to see if the player is still alive to prevent a "ghost" counter-attack from happening.
                    if(counterAttack === true && !playerLost)  {
                        gameConsoleLog(player.name + " has counter-attacked!");
                        playerAttackEnemy(true);
                    } 
                    // If this wasn't an enemy counter-attack, we have to restart the enemy's attack timer.
                    if(!isCounter) {
                        startEnemyTimer();
                    }
                });
            });
        });
        return true;            
    }
}

/*
 * playerAttackPlayer(isCounter = false) 
 * ALMOST IDENTICAL TO THE enemyAttackPlayer function --
 * This function has several things going on.  We grab two random numbers out of 100 and check them against the enemy's
 * dodgeProbability and counterProbability.  If either of these are <= the random number, we flag those to be true.  If not,
 * we get a random number between 1 - attackPower.
 */ 
function playerAttackEnemy(isCounter = false) {
    var dodge = false;
    var counterAttack = false;
    var enemyLost = false;
    if ((!player.isAttacking && playerCanGo && !enemy.isAttacking) || isCounter) {
        var enemyDodge = getRandom(100);
        if (enemyDodge <= enemy.dodgeProbability) {
            // the enemy dodged!
            dodge = true;
        };
        if(!isCounter) {
            var enemyCounter = getRandom(100);
            if(enemyCounter <= enemy.counterAttackProbability) {
                counterAttack = true;
            }
        }
        var attackPower = getRandom(player.attackPoints) + 1;
        // We hit the enemy!
        // If the last attack was more than the amount of hitpoints the player has left, pin it to the amount of hitpoints.
        // This will prevent negative hitpoints from occuring.
        attackPower = (attackPower > enemy.hitPoints) ? enemy.hitPoints : attackPower;
        
        playSound(attackStartSound);
        // Load players attackingImage
        swapImage(player, player.attackingImage);   
        // Flag the player is attacking
        player.isAttacking = true;
        // Run css animations
        // Callback embeds another animation, runs the attack sound, and decrements the enemies health
        player.imageElement.animate({
            left: "250px"
        }, 300, function () {
            if(!dodge) {
                // Displays the attack power
                displayText(enemy, "-" + attackPower);
                // Log in the console
                gameConsoleLog(player.name + " hit " + enemy.name + " for " + attackPower + "hps!");
                // Plays the smack sound
                playSound(smackSound);
                // Runs the enemy hit
                characterHitAnimation(enemy, "right");
                // Removes the hitpoints
                enemy.hitPoints -= attackPower;
            } else {
                //  Enemy dodged
                gameConsoleLog(enemy.name + " dodged " + player.name + "'s attack!");
                //  Run the dodge animation
                dodgeAttack(enemy);
            }
            //  Update stats on the screen
            updateStats();
            //  Check if the enemy died
            if(enemy.hitPoints <= 0) {
                //  Log the enemy has died
                gameConsoleLog(enemy.name + " has fallen!");
                //  Run the death animation
                killCharacter(enemy);
                enemyLost = true;
            }
            player.imageElement.animate({
                left: "-180px"
            }, 300, function () {
                swapImage(player, player.standingImage);
                player.isAttacking = false;
                if(counterAttack === true && !enemyLost) {
                    gameConsoleLog(enemy.name + " has counter-attacked!");
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

$(document).ready(function () {
    $("#game-console").css("display", "none");
    
    //  Loads the game images
    loadGameFiles(function() {
        $("#loading-screen").animate({"height": 0}, 1000, function() {
            $(this).css("display", "none");
            $("#game-console").css("display", "block");
        })
    })
    // Plays audio on mouse-over
    $("character-select").mouseenter(function () {
        playSound(selectMoveSound);
    });



    /* EVENT HANDLERS */
    $('.hero-select').on("click", function () {
        playSound(selectCharSound);
        selectPlayer(eval($(this).data('name')));
    });
    $('.enemy-select').on("click", function () {
        playSound(selectCharSound);
        selectEnemy(eval($(this).data('name')));
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
        // Displays the instructions
        $("#instruction-window").css('z-index', '99999').animate({ opacity: 1 }, 1000);
        
    })
    $("#close-instructions").on('click', function() {
        // Closes the instructions
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