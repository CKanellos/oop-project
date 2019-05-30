//Create the Item, Potion, Bomb and Key class

/*
Item class definition. Item is an Entity
- constructor
  - parameters: value (number), rarity (number), type (string)
  - Creates an item with the correct image (depends on type).
  - Sets the name based on the rarity (with ITEM_RARITIES) and the type.
- name (string)
- value (number)
- rarity (number)
- sound (Audio object - type is used for the sound file path)
Example use: not used by itself. 
*/
class Item extends Entity {
    constructor(value, rarity, type) {
        super('imgs/items/' + type + '.png');
        this.name = ITEM_RARITIES[rarity] + ' ' + type;
        this.value = value;
        this.rarity = rarity;
        this.type = type;
        this.sound = new Audio('sounds/' + type + '.wav');
    }
}

/*
Potion class definition. Potion is an Item
- constructor
  - parameters: rarity (number)
  - Creates a potion with type 'potion' and a value based on rarity: (rarity + 1) * 10
- potency (number): (rarity + 1) * 10
- use (function)
 - parameters: target (Creature)
 - Restores hp of target by potency value. HP of target can't go past its max HP.
 - Plays the item sound
Example use:
new Potion(0) // potion rarity 0
*/
class Potion extends Item {
    constructor(rarity) {
        let value = (rarity + 1) * 10;
        super(value, rarity, 'potion');
        this.potency = (rarity + 1) * 10;
    } 
    use(target) {
        target.hp += this.potency;
        if (target.hp > target.getMaxHp()) {
            target.hp = target.getMaxHp();
        }
        this.sound.currentTime = 0;
        this.sound.play();
    }
}

/*
Bomb class definition. Bomb is an Item
- constructor
  - parameters: rarity (number)
  - Creates a bomb with type 'bomb' and a value based on rarity: (rarity + 1) * 20
- damage (number): (rarity + 1) * 30
- use (function)
 - parameters: target (Creature)
 - Damages hp of target by damage value. HP of target can't be lower than 0.
 - Plays the item sound
Example use:
new Bomb(0) // bomb rarity 0
*/
class Bomb extends Item {
    constructor(rarity) {
        let value = (rarity + 1) * 20;
        super(value, rarity, 'bomb');
        this.damage = (rarity + 1) * 30;
    }
    use(target) {
        target.hp -= this.damage;
        if (target.hp < 0) {
            target.hp = 0;
        }
        this.sound.currentTime = 0;
        this.sound.play();
    }
}

/*
Key class definition. Key is an Item
- constructor
  - parameters: none
  - Creates a key with value 100, rarity 3 and type 'key'
- use (function)
 - parameters: target (Dungeon)
 - opens the dungeon and plays the item sound if the dungeon does not have the princess
Example use:
new Key(0) // bomb rarity 0
*/
class Key extends Item {
    constructor() {
        super(100, 3, 'key');
    }
    use(target) {
        target.open();
        if (!target.hasPrincess) {
            this.sound.currentTime = 0;
            this.sound.play(); 
        }
    }
}
