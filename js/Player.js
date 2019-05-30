//Create the Player class

/*
Player class definition. Player is a Creature
- constructor
  - parameters: name (string), position (Position), board (Board), level (number), items (Item[]), gold (number)
  - Sets the attackSpeed to 2000 / level
  - Sets the exp to 0
  - Sets the position and board
- attackSpeed (number)
- exp (number)
- position (Position)
- board (Board)
- render (function)
  - parameters: root (HTMLElement)
  - Appends the element to the root (the board HTML element)
  - Updates the player position
- update (function)
  - parameters: none
  - Updates the player's HTML element position based on its position property and ENTITY_SIZE
- moveToPosition (Position)
  - moves to position specified unless it is a Wall entity.
  - updates player (update method)
- move (function)
  - parameters: direction (string)
  - Sets the player image based on direction and moves to new position
- pickup (function)
  - parameters: entity (Item || Gold)
  - Adds item or gold and plays the corresponding sound ('loot' or 'gold' respectively)
- attack (function)
  - parameters: (entity)
  - calls the attack method from Creature (use super) and plays the 'pattack' sound if the attack was successful
- buy (function)
  - parameters: item (Item), tradesman (Tradesman)
  - updates gold and items for both player and tradesman.
  - Plays the trade sound
  - returns true if successful trade, false if gold is insufficient
- sell (function)
  - parameters: item (Item), tradesman (Tradesman)
  - updates gold and items for both player and tradesman.
  - Plays the trade sound
  - returns true if successful trade, false if gold is insufficient
- useItem (function)
  - parameters: item (Item), target (Creature)
  - uses the item on the target and removes it from the player
- loot (function)
  - parameters: entity (Monster || Dungeon)
  - Updates gold and items for both player and dungeon or monster.
  - plays the loot sound
- getExpToLevel (function)
  - parameters: none
  - returns exp needed to level: level * 10
- getExp (function)
  - parameters: entity (Monster)
  - adds exp based on entity level (level * 10)
  - level up if enough exp. It is possible to level up multiple times at once if enough exp is earned (e.g. beat enemy level 3)
- levelUp (function)
  - parameters: entity (Monster)
  - Increments level, sets hp to max hp
  - updates strength (level * 10) and attack speed (3000 / level)
  - plays levelup sound
Example use:
new Player('Van', new Position(5, 5), new Board(10, 10), 1, [new Potion(0)]);
*/
class Player extends Creature {
    constructor(name, position, board, level, items, gold) {
        let img = 'imgs/player/front.png';
        super(name, img, level, items, gold);
        this.position = position;
        this.board = board;
    }
    render(root) {
        this.element.style.position = 'absolute';
        this.update();
        root.appendChild(this.element);
    }
    update() {
        this.element.style.top = (this.position.row * ENTITY_SIZE) + 'px';
        this.element.style.left = (this.position.column * ENTITY_SIZE) + 'px';
    }
    moveToPosition(position) {
        if (!(this.board.getEntity(position) instanceof Wall)) {
            this.position = position;
            this.update();
        }
    }
    move(direction) {
        switch (direction) {
            case 'U': 
                this.setImg('imgs/player/back.png');
                this.moveToPosition(new Position(this.position.row - 1, this.position.column));
                break;
            case 'R': 
                this.setImg('imgs/player/right.png');
                this.moveToPosition(new Position(this.position.row, this.position.column + 1));
                break;   
            case 'D': 
                this.setImg('imgs/player/front.png');
                this.moveToPosition(new Position(this.position.row + 1, this.position.column));
                break; 
            case 'L': 
                this.setImg('imgs/player/left.png');
                this.moveToPosition(new Position(this.position.row, this.position.column - 1));
                break;
        }
    }
    pickup(entity) {
        if (entity instanceof Item) {
            this.items.push(entity);
            playSound('loot');
        }
        if (entity instanceof Gold) {
            this.gold += entity.value;
            playSound('gold');
        }
    }
    attack(entity) {
        if (super.attack(entity)) {
            playSound('pattack');
        }
    }
    buy(item, tradesman) {
        if (this.gold < item.value) {
            return false;
        }
        this.gold -= item.value;
        remove(tradesman.items, item);
        this.items.push(item);
        playSound('trade');
        return true; 
    }
    sell(item, tradesman) {
        this.gold += item.value;
        remove(this.items, item);
        tradesman.items.push(item);
        playSound('trade');
        return true;
    }
    useItem(item, target) {
        item.use(target);
        remove(this.items, item);
    }
    loot(entity) {
        this.gold += entity.gold;
        entity.gold = 0;
        for (let i = 0; i < entity.items.length; i++) {
            this.items.push(entity.items[i])
        }
        entity.items = [];
        playSound('loot');
    }
    getExpToLevel() {
        return this.level * 10;
    }
    getExp(entity) {
        this.exp += entity.level * 10;
        while (this.exp >= this.getExpToLevel()) {
            this.levelUp();
        }
    }
    levelUp() {
        this.level++;
        this.hp = this.getMaxHp();
        this.strength = this.level * 10;
        this.attackSpeed = 3000 / this.level;
        playSound('levelup');
    }
}