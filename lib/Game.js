// if player turn - prompt user to attack or use potion,
// if using potion, display potion objects to user & apply selected potion to effect player 
// if attacking, subtract health from the enemy based on attack value 

// if enemy turn - subtract health from the player based on attack value 

const inquirer = require('inquirer');
const Enemy = require('./Enemy');
const Player = require('./Player');

function Game() {
    this.roundNumber = 0;
    this.isPlayerTurn = false; 
    this.enemies = [];
    this.currentEnemy; 
    this.player; 
};

Game.prototype.initializeGame = function() {
    this.enemies.push(new Enemy('goblin', 'sword'));
    this.enemies.push(new Enemy('orc', 'baseball bat'));
    this.enemies.push(new Enemy('skeleton', "axe"));

    // which enemy the player is fighting when game starts 
    this.currentEnemy = this.enemies[0];

inquirer
    // prompt object
    .prompt({
        type: 'text',
        name: 'name',
        message: 'What is your name?'
    })

    // destructure name from the prompt object / inquirer callback 
    .then(({ name }) => {
        this.player = new Player(name);

        // call new battle
        this.startNewBattle();
    });

};


// establish who will take their turn first based on their agility values 
Game.prototype.startNewBattle = function() {
    if (this.player.agility > this.currentEnemy.agility) {
        this.isPlayerTurn = true;
    } else {
        this.isPlayerTurn = false; 
    }

    // display Player stats 
    console.log('Your stats are as follows:');
    console.table(this.player.getStats()); 

    // display Enemy stats 
    console.log(this.currentEnemy.getDescription()); 

    // each turn of the round
    this.battle(); 
};

// battle 
Game.prototype.battle = function() {
    if (this.isPlayerTurn) {
        // player prompts will go here
        inquirer
            .prompt({
                type: 'list',
                message: 'What would you like to do?',
                name: 'action',
                choices: ['Attack', 'Use potion']
            })
            .then(({ action }) => {
                if (action === 'Use potion') {
                    // if user does not have any potions
                    if (!this.player.getInventory()) {
                        console.log("You don't have any potions!");
                        return this.checkEndOfBattle();
                    }
                    // potion prompt 
                    inquirer
                        .prompt ({
                            type: 'list',
                            message: 'Which potion would you like to use?',
                            name: 'action',
                            // taking usePotion() requires the index of the object in the array > return as string 
                            choices: this.player.getInventory().map((item, index) => `${index + 1}: ${item.name}`)
                        })
                        then(({ action }) => {
                            const potionDetails = action.split(': ');

                            this.player.usePotion(potionDetails[0] - 1);
                            console.log(`You used a ${potionDetails[1]} potion.`);
                            return this.checkEndOfBattle();
                        });
                } else {
                    const damage = this.player.getAttackValue();
                    this.currentEnemy.reducedHealth(damage);

                    console.log(`You attacked the ${this.currentEnemy.name}`);
                    console.log(this.currentEnemy.getHealth());
                    return this.checkEndOfBattle();
                }
            });
    } else {
        const damage = this.currentEnemy.getAttackValue();
        this.player.reducedHealth(damage);

        console.log(`You were attached by the ${this.currentEnemy.name}`);
        console.log(this.player.getHealth()); 
        return this.checkEndOfBattle();
    };
};

// win/lose conditions
Game.prototype.checkEndOfBattle = function() {
    // both players are alive and run battle again 
    if (this.player.isAlive() && this.currentEnemy.isAlive()) {
        this.isPlayerTurn = !this.isPlayerTurn; 
        this.battle();
    // if enemy is not alive 
    } else if (this.player.isAlive() && !this.currentEnemy.isAlive()) {
        console.log(`You've defeated the ${this.currentEnemy.name}`);

        // if player wins they are awarded a potion 
        this.player.addPotion(this.currentEnemy.potion);
        console.log(`${this.player.name} found a ${this.currentEnemy.potion.name} potion`);

        this.roundNumber++;

        if (this.roundNumber < this.enemies.length) {
            this.currentEnemy = this.enemies[this.roundNumber];
            this.startNewBattle();
        } else {
            console.log('You win!'); 
        } 
        
    } else {
        console.log("You've been defeated!"); 
    }
}; 



module.exports = Game; 

