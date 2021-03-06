//Create the Creature and Monster class

/*
The Creature class is an Entity. It has the following properties (not including inherited properties):
- constructor
  - parameters: name (string), img (string), level (number), items (Item[]), gold (number)
- name (string)
- img (string - path to image)
- level (number)
- items (array of Item objects)
- gold (number)
- hp (number): level * 100
- strength (number): level * 10
- attackSpeed (number): 3000 / level
- getMaxHp (function)
  - parameters: none
  - returns max hp (level * 100)
- hit (function)
  - parameters: val (number)
  - decreases hp by val. Hp cannot go under 0
- attack (function)
  - parameters: entity (Creature)
  - hits the entity with strength value
  - sets an attack timeout that expires after attackSpeed. While the timeout is active, this method 
    immediately returns false, else returns true.
Example use: not used by itself. 
*/
class Creature extends Entity {
    constructor(name, img, level, items, gold) {
        super(img);
        this.name = name;
        this.img = img;
        this.level = level;
        this.items = items;
        this.gold = gold;
        this.hp = level * 100; 
        this.strength = level * 10;
        this.attackSpeed = 3000 / level;
    }    
    getMaxHp() {
        return this.level * 100;
    }
    hit(val) {         
        this.hp -= val;
        if (this.hp < 0) {
            this.hp = 0;
        }  
    }
    attack(entity) {
        if (typeof this.attackTimeoutId !== 'undefined') {
            return false;
        }
        entity.hit(this.strength);
        this.attackTimeoutId = setTimeout(() => {
            delete this.attackTimeoutId;
        }, this.attackSpeed);
        return true;
    }
}

/*
The Monster class is a Creature. It has the following properties (not including inherited properties):
- constructor
  - parameters: name (string), level (number), items (Item[]), gold (number)
- name (string): name must be valid (from MONSTER_NAMES)
- level (number)
- items (array of Item objects)
- gold (number)
- attack (function)
  - parameters: entity (Creature)
  - calls the attack method from Creature (use super) and plays the 'mattack' sound if the attack was 
    successful
Example use:
new Monster('Anti Fairy', 1, [], 0); // Creates a Monster named Anti Fairy, level 1, no items and 0 gold. 
Only the name is required.
*/
class Monster extends Creature {
    constructor(name, level = 1, items = [], gold = 0) {
        let img = 'imgs/monsters/' + name.replace(/ /g, '') + '.gif';
        super(name, img, level, items, gold);
    }
    attack(entity) {
        if (super.attack(entity)) {
            playSound('mattack');
        }
    }
}