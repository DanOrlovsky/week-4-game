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

var playerSelected = false;
var enemySelected = false;
var defenderSelected = false;
var fightStarted = false;

var enemyList = [];
var player;
var enemy;
// Basic qualities each character will posess.
// We will override these in each of the character classes
var characterQualities = {
    name: "",                       //  How their name appears in css
    selectImage: "",                //  Path to selection screen image
    standingImage: "",              //  Path to standing Image
    attackingImage: "",             //  Path to attacking image
    arenaBackground: "",            //  Which background to use for the arena
    isAttacking: false,             //  Flag for whether we're attacking or not.
    hitPoints: 0,                   //  How many hitpoints the character has
    magicPoints: 0,                 //  How many magicpoints the character has
    magicPower: 0,                  //  How much power each magic attack has
    magicLoss: 0,                   //  How much magic is lost with each magic attack   
    attackPoints: 0,                //  How many attack points can the player deliver
    counterAttackMulti: 0,          //  Counter-attack multiplier
    counterAttackProbability: 0,    //  What are the odds the player will counter attack?   (Out of 100)
    dodgeProbability: 0,            //  What are the odds the player will dodge? (out of 100)
    imageElement: "",               //  The element we'll be drawing to
    attackEnemy: function(enemy) {
        var enemyDodge = getRandom(100);
        if(enemyDodge <= enemy.dodgeProbability) {
            // the enemy dodged!
            return false;
        };

        var attackPower = getRandom(this.attackPoints);
        if(attackPower > 0) {
            // We hit the enemy!
            // Run attack animation
            enemy.hitPoints -= attackPower;
            
            return true;
        }

        // the enemy ended up dodging - 
        return false;
    }
};

var mario = {
    character: characterQualities = {
        name: "mario",
        selectImage: "./assets/images/mario/Mario-Select.gif",
        standingImage: "./assets/images/mario/Mario-Standing.gif",
        hitPoints: 150,
        magicPoints: 20,
        magicPower: 25,
        magicLoss: 5,
        attackPoints: 35,
        counterAttackMulti: 1.5,
        counterAttackProbability: 10,
        dodgeProbability: 5,
    }
};

var mudKip = {
    character: characterQualities = {
        name: "mudkip",
        selectImage: "./assets/images/mudkip/MudKip-Select.gif",
        standingImage: "./assets/images/mudkip/MudKip-Standing.gif",
        hitPoints: 65,
        magicPoints: 100,
        magicPower: 50,
        magicLoss: 25,
        attackPoints: 20,
        counterAttackMulti: 3,
        counterAttackProbability: 45,
        dodgeProbability: 50,
    }
};

var megaMan = {
    character: characterQualities = {
        name: "megaman",
        selectImage:     "./assets/images/megaman/MegaMan-Select.gif",
        standingImage:   "./assets/images/megaman/MegaMan-Standing.gif",
        arenaBackground: "./assets/images/megaman/megaman-background.png",
        hitPoints: 200,
        attackPoints: 45,
        counterAttackMulti: 1.25,
        counterAttackProbability: 3,
        dodgeProbability: 5,
    }
};

var contra = {
    character: characterQualities = {
        name: "contra",
        selectImage: "./assets/images/contra/Contra-Select.gif",
        standingImage: "./assets/images/contra/Contra-Standing.gif",
        arenaBackground: "./assets/images/contra/contra-background.jpg",
        hitPoints: 125,
        attackPoints: 30,
        counterAttackMulti: 1.5,
        counterAttackProbability: 25,
        dodgeProbability: 25,
    }
};

var link = {
    character: characterQualities = {
        name: "link",
        selectImage: "./assets/images/link/Link-Select.gif",
        standingImage: "./assets/images/link/Link-Standing.gif",
        hitPoints: 75,
        magicPoints: 100,
        magicPower: 45,
        magicLoss: 20,
        attackPoints: 30,
        counterAttackMulti: 1.5,
        counterAttackProbility: 25,
        dodgeProbability: 25,
    }
};
function playerAttack() {

}
// Returns a random number
function getRandom(outOf) {
    return Math.floor(Math.random() * outOf);
}

var charList = [
    mario, contra, link, mudKip, megaMan
];

/*  This function will play audio by creating a new element, and then removes the element after the sound has finished.
    This makes layering of sounds possible.
*/
function playSound(soundPath) {
    var audioElement = document.createElement("audio"); //$('<audio></audio>').src = audioFile;
    audioElement.src = soundPath;
    audioElement.addEventListener("ended", function() {
        $(audioElement).remove();
    }, false);
    audioElement.play();
}



function selectPlayer(playerChar) {
    player = playerChar;
    player.imageElement = $("#hero-fighter");
    player.imageElement.attr("src", player.character.standingImage);
    $("#hero-image").attr("src", player.character.selectImage);
    displayEnemySelectScreen();
}

// Runs after an enemy is selected
function selectEnemy(enemyChar) {
    enemy = enemyChar;
    $("#enemy-screen-wrapper").css({ "opacity": 0, "display": "none" });
    $("#enemy-image").attr("src", enemy.character.selectImage);
    enemy.imageElement = $("#enemy-fighter");
    enemy.imageElement.attr("src", enemy.character.standingImage);
    enemySelected = true;
    displayBattleScreen();
}

// Displays the enemy selection screen
function displayEnemySelectScreen(){
    $("#hero-screen-wrapper").css({"opacity": 0, "display": "none" } );
    $("#enemy-screen-wrapper").css({ "opacity": 1, "display": "block" } );
    $("#enemy-" + player.character.name + "-select").css("display", "none");
}


function displayBattleScreen() {
    $("#battle-screen").css({"height": "500px", "background-image": "url('" + enemy.character.arenaBackground + "')" });
    player.imageElement.css("display", "inline-block");
    enemy.imageElement.css("display", "inline-block");
}

$(document).ready(function() {
    // Plays audio on mouse-over
    $(".character-select").mouseenter(function() {
        playSound(selectMoveSound);
    }); 



    /* EVENT HANDLERS */
    $('.hero-select').on("click", function() {
        playSound(selectCharSound);
        switch($(this).data('name')) {
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
    $('.enemy-select').on("click", function() { 
        playSound(selectCharSound);
        switch($(this).data('name')) {
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
    })

});