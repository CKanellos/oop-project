// selectors
const boardElement = document.getElementById('board');
const actioncam = document.getElementById('action-cam');

// sounds
const sounds = {
  bg: new Audio('sounds/bg.mp3'),
  loot: new Audio('sounds/loot.mp3'),
  trade: new Audio('sounds/trade.wav'),
  pattack: new Audio('sounds/pattack.wav'),
  mattack: new Audio('sounds/mattack.wav'),
  gold: new Audio('sounds/gold.wav'),
  levelup: new Audio('sounds/levelup.wav'),
  death: new Audio('sounds/death.wav'),
  battle: new Audio('sounds/battle.mp3'),
  win: new Audio('sounds/win.mp3'),
};

// game state. Is used in the keyboard event listener to prevent user action if game is over
let GAME_STATE = 'PLAY';

// init board
// Create a board with 20 rows and 25 columns (can play around to test different sizes) and render it
let board = new Board(20, 25);
board.render(boardElement);

// init player
// create player at the center of the board with 2 items and render it
let center = new Position(Math.floor(board.rows.length / 2), Math.floor(board.rows[0].length / 2));
let player = new Player('Link', center, board, 1, [new Potion(0), new Bomb(0)], 0); 
player.render(boardElement);

// Keep this, used to display the information on the box on the right of the board
updateActionCam(); 

// board entities

// monsters

// Create all the monsters entities and set them on the board at a random position
// Give each monster a random name, random level (1-3), a potion (random rarity 0-3), random gold (0-50)
// Give one monster the key
for (let i = 0; i < MAX_MONSTERS; i++) {
  let name = MONSTER_NAMES[getRandom(0, MONSTER_NAMES.length - 1)];
  let level = getRandom(1, 3);
  let items = (i === 0) ? [new Potion(getRandom(0, 3)), new Key()] : [new Potion(getRandom(0, 3))];
  let gold = getRandom(0, 50);
  let monster = new Monster(name, level, items, gold);
  board.setEntity(monster, getRandomPosition(board));
}

// items
// Add code to create a potion and a bomb entity and set them at a random board position
board.setEntity(new Potion(getRandom(0, 3)), getRandomPosition(board));
board.setEntity(new Bomb(getRandom(0, 3)), getRandomPosition(board));

// gold
// Add code to create a gold entity and place it at a random position on the board
board.setEntity(new Gold(getRandom(10, 100)), getRandomPosition(board));

// dungeons
// Add code for an opened dungeon and a closed dungeon you can loot (random position)
// Add code for a dungeon that is closed and has the princess (random position)
board.setEntity(new Dungeon(true, false, 50, [new Bomb(getRandom(0, 3))]), getRandomPosition(board));
board.setEntity(new Dungeon(false, false, 50, [new Potion(getRandom(0, 3))]), getRandomPosition(board));
board.setEntity(new Dungeon(false, true, 0, []), getRandomPosition(board));

// tradesman
// Add code for a tradesman with a potion of each rarity (0 to 3), bomb of each rarity and a key at a 
// random position
let tradesmanItems = [
  new Potion(0), new Potion(1), new Potion(2), new Potion(3),
  new Bomb(0), new Bomb(1), new Bomb(2), new Bomb(3),
  new Key()
];
board.setEntity(new Tradesman(tradesmanItems), getRandomPosition(board));

// event handlers

let monsterAttack;
// UPDATE this event listener to move the player
// Add code to check if the entity at the new player position (after move) is a monster.
// If so, call the encounterMonster function
document.addEventListener('keydown', (ev) => {
  if (!ev.key.includes('Arrow') || GAME_STATE === 'GAME_OVER') return;
  if (sounds.bg.paused) playMusic('bg');
  clearInterval(monsterAttack); // stop monster attack when player moves
  if (event.key === "ArrowUp") {
    player.move('U');
  }
  if (event.key === "ArrowRight") {
    player.move('R');
  }
  if (event.key === "ArrowDown") {
    player.move('D');
  }
  if (event.key === "ArrowLeft") {
    player.move('L');
  }
  let entity = board.getEntity(player.position);
  if (entity instanceof Monster) {
    encounterMonster(entity);
  }
  updateActionCam();
});

// helper functions

// UPDATE the function to return a random position on the board that is not occupied by an entity 
// (Grass is fine) or the player's initial position (center)
// The parameter is a Board object
function getRandomPosition(board) {
  let position;
  do {
    position = new Position(getRandom(0, board.rows.length - 1), getRandom(0, board.rows[0].length - 1));
  }
  while (!(board.getEntity(position) instanceof Grass) || (center.row === position.row && center.column === position.column));
  return position;
}

// UPDATE the function passed to setInterval to attack the player and trigger player death if hp is <= 0 
// The parameter is a Monster object
// Replace the interval time of 1000 by the monster attack speed
// Replace the hp printed to be the player's hp
function encounterMonster(monster) {
  playMusic('battle');
  monsterAttack = setInterval(() => {
    monster.attack(player);
    if (player.hp <= 0) {
      playerDeath();
    }
    document.getElementById('Player-hp').textContent = `HP: ${player.hp}`;
  }, monster.attackSpeed);
}

// Use when the player is dead, no need to change anything
function playerDeath() {
  clearInterval(monsterAttack);
  boardElement.innerHTML = '<h1>GAME OVER</h1>';
  document.getElementById('player-cam').src = 'imgs/player/dead.png';
  document.getElementById('action-menu').style.display = 'none';
  GAME_STATE = 'GAME_OVER';
  playMusic('death');
}

// UPDATE this function to getExp from monster, loot the monster, and clear the entity (monster) 
// at the player position
function defeatMonster(monster) {
  clearInterval(monsterAttack);
  player.getExp(monster);
  player.loot(monster);
  clearEntity(player.position);
  playMusic('bg');
}

// UPDATE this function to set the board entity at position to a grass entity
function clearEntity(position) {
  board.setEntity(new Grass(), position);
}

// DOM manipulation functions

// This function updates the 'action cam' - the box showing the enemy and player info as well as the actions
// It is called after an event happened (e.g. used item) to update the information shown in the action box
// UPDATE the entity variable to be the entity at the player position
function updateActionCam() {
  const entity = board.getEntity(player.position); 
  actioncam.innerHTML = '';
  actioncam.appendChild(createActionView(entity));
  actioncam.appendChild(createActionView(player));
  actioncam.appendChild(createActionMenu(entity));
}

// UPDATE this function based on the comments
// Replace the if condition calling createCreatureView to only execute if the entity is a creature
// Replace the if condition creating the h4 value element to only execute if the entity has a value
// Replace the ternary condition setting the img.id to be 'player-cam' if the entity is a Player, 
// 'entity-cam' otherwise
// Replace the ternary condition setting the img.src to be 'imgs/player/attack.png' if the entity 
// is a Player, else use the entity's image src
function createActionView(entity) {
  const actionView = document.createElement('div');
  actionView.className = 'action-view';
  const infoWrapper = document.createElement('div');

  const name = document.createElement('h3');
  // Add code here to set the name text to be the entity name or use the constructor name as fallback
  name.innerText = typeof entity.name !== 'undefined' ? entity.name : entity.constructor.name;
  infoWrapper.appendChild(name);

  if (entity instanceof Creature) createCreatureView(infoWrapper, entity);

  if (typeof entity.value !== 'undefined') {
    const value = document.createElement('h4');
    // Add code here to set the value text to the entity's value e.g. "Value: 20"
    value.innerText = 'Value: ' + entity.value;
    infoWrapper.appendChild(value);
  }

  // Add the entity image
  const img = document.createElement('img');
  img.id = entity instanceof Player ? 'player-cam' : 'entity-cam';
  img.src = entity instanceof Player ? 'imgs/player/attack.png' : entity.element.src;
  actionView.appendChild(infoWrapper);
  actionView.appendChild(img);

  return actionView;
}

// UPDATE this function based on the comments
function createCreatureView(root, creature) {
  const level = document.createElement('h4');
  // Add code here to set the level text to the creature's level e.g. "Level 1"
  level.innerText = 'Level ' + creature.level;
  const hp = document.createElement('h4');
  hp.id = creature.constructor.name + '-hp';
  // Add code here to set the hp text to the creature's hp e.g. "HP: 100"
  hp.innerText = 'HP: ' + creature.hp;
  const gold = document.createElement('h4');
  // Add code here to set the gold text to the creature's gold e.g. "Gold: 10"
  gold.innerText = 'Gold: ' + creature.gold;
  root.appendChild(hp);
  root.appendChild(level);
  root.appendChild(gold);
}

// UPDATE this function to create the appropriate menu based on the entity type. Use the createMenu 
// functions (e.g. createPickupMenu)
function createActionMenu(entity) {
  const actionMenu = document.createElement('div');
  actionMenu.id = 'action-menu';
  if (entity instanceof Item || entity instanceof Gold) {
    createPickupMenu(actionMenu, entity);
  }
  else if (entity instanceof Monster) {
    createMonsterMenu(actionMenu, entity);
  }
  else if (entity instanceof Tradesman) {
    createTradeMenu(actionMenu, entity);
  }
  else if (entity instanceof Dungeon) {
    createDungeonMenu(actionMenu, entity);
  }
  return actionMenu;
}

// UPDATE the pickupBtn event listener function to pickup the entity
// Add a call to clearEntity in the listener function to set a Grass entity at the player position
function createPickupMenu(root, entity) {
  const actions = document.createElement('div');
  actions.textContent = 'Actions';
  const pickupBtn = document.createElement('button');
  pickupBtn.textContent = 'Pickup';
  pickupBtn.addEventListener('click', () => {
    player.pickup(entity);
    clearEntity(player.position);
    updateActionCam();
  });
  actions.appendChild(pickupBtn);
  root.appendChild(actions);
}

// UPDATE this function to add a call to createItemActions(root, monster) if the player has items
// Update the attackBtn event listener to attack the monster
// Update the if condition to execute only if the monster hp is 0 or lower. When true, call defeatMonster.
// Replace the timeout value (1000) passed to disable the attackBtn to be the player's attack speed
function createMonsterMenu(root, monster) {
  const actions = document.createElement('div');
  actions.textContent = 'Actions';
  let attackBtn = document.createElement('button');
  attackBtn.textContent = 'Attack';
  // Add code here to reset the player attack timeout to allow the player to attack a monster as soon 
  // as one is encountered
  if (typeof player.attackTimeoutId !== 'undefined') {
    clearTimeout(player.attackTimeoutId);
    delete player.attackTimeoutId;
  }
  attackBtn.addEventListener('click', () => {
    player.attack(monster);
    if (monster.hp <= 0) {
      defeatMonster(monster);
      updateActionCam();
    } else {
      attackBtn.disabled = true;
      setTimeout(() => (attackBtn.disabled = false), player.attackSpeed);
      // Replace the hp printed to be the monster's hp
      document.getElementById('Monster-hp').textContent = `HP: ${monster.hp}`;
    }
  });
  actions.appendChild(attackBtn);
  root.appendChild(actions);
  if (player.items.length > 0) {
    createItemActions(root, monster);
  }
}

// UPDATE
// update the forEach call to be on the player's items instead of an empty array
// update the function passed to forEach to return immediately if the item is a Key 
// (the key is not a valid item in a battle)
// update the itemBtn event listener to call useItem on the player for potions, useItem on the monster for Bombs.
// Add a call to defeatMonster if its hp is 0 or lower
function createItemActions(root, monster) {
  const items = document.createElement('div');
  items.textContent = 'Items';
  player.items.forEach((item) => {
    if (item instanceof Key) {
      return;
    }
    const itemBtn = document.createElement('button');
    // Add code here to set the itemBtn text to the item name
    itemBtn.innerText = item.name;
    itemBtn.addEventListener('click', () => {
      if (item instanceof Potion){
        player.useItem(item, player);
      }
      else {
        player.useItem(item, monster);
      }
      if (monster.hp <= 0) {
        defeatMonster(monster);
      }
      updateActionCam();
    });
    items.appendChild(itemBtn);
  });
  root.appendChild(items);
}

// UPDATE
// update the first forEach call to be on the tradesman's items instead of an empty array
// update the second forEach call to be on the player's items instead of an empty array
// Add code to the itemBtn event listener to buy the clicked item
// Add code to the itemBtn event listener to sell the clicked item
function createTradeMenu(root, tradesman) {
  const buyAction = document.createElement('div');
  buyAction.textContent = 'Buy';
  tradesman.items.forEach((item) => {
    const itemBtn = document.createElement('button');
    // Add code here to set the item text to the item's name and value e.g. "Common potion - 10G"
    itemBtn.innerText = item.name + ' - ' + item.value + 'G';
    // Add code here to set itemBtn to disabled if the player does not have enough gold for the item
    if (player.gold < item.value) {
      itemBtn.disabled = true;
    }
    itemBtn.addEventListener('click', () => {
      player.buy(item, tradesman);
      updateActionCam();
    });
    buyAction.appendChild(itemBtn);
  });
  const sellAction = document.createElement('div');
  sellAction.textContent = 'Sell';
  player.items.forEach((item) => {
    const itemBtn = document.createElement('button');
    // Add code here to set the item text to the item's name and value e.g. "Common potion - 10G"
    itemBtn.innerText = item.name + ' - ' + item.value + 'G';
    itemBtn.addEventListener('click', () => {
      player.sell(item, tradesman);
      updateActionCam();
    });
    sellAction.appendChild(itemBtn);
  });
  root.appendChild(buyAction);
  root.appendChild(sellAction);
}

// UPDATE the function based on the comments
// Update the condition to create the openBtn only if the dungeon is not open
// Update the if condition inside the else block to only win the game if the dungeon has the princess
// Update the openBtn event listener to use the key item on the dungeon
// Update the lootBtn event listener to loot the dungeon
function createDungeonMenu(root, dungeon) {
  const actions = document.createElement('div');
  actions.textContent = 'Actions';
  if (!dungeon.isOpen) {
    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open';
    // Add code to get the key from the player items
    let key = null;
    for (let i = 0; i < player.items.length; i++) {
      if (player.items[i] instanceof Key) {
        key = player.items[i];
        break;
      }
    }
    // If the player does not have a key, set the openBtn to disabled
    if (key === null) {
      openBtn.disabled = true;
    }
    openBtn.addEventListener('click', () => {
      player.useItem(key, dungeon);
      updateActionCam();
    });
    actions.appendChild(openBtn);
    root.appendChild(actions);
  } else {
    if (dungeon.hasPrincess) {
      boardElement.innerHTML =
        '<h1>You WIN!</h1><img src="imgs/dungeon/princess.png" width=500/>';
      actioncam.style.display = 'none';
      GAME_STATE = 'GAME_OVER';
      playMusic('win');
    } else {
      const lootBtn = document.createElement('button');
      lootBtn.textContent = 'Loot';
      // Add code here to check if the dungeon has gold or items, if not set the lootBtn to disabled
      if (dungeon.gold === 0 && dungeon.items.length === 0) {
        lootBtn.disabled = true;
      }
      lootBtn.addEventListener('click', () => {
        player.loot(dungeon);
        updateActionCam();
      });
      actions.appendChild(lootBtn);
      root.appendChild(actions);
    }
  }
}

// utility functions - no need to change them

// Plays a background music while ensuring no other music is playing at the same time
function playMusic(music) {
  sounds.bg.pause();
  sounds.battle.currentTime = 0;
  sounds.battle.pause();
  sounds[music].play();
}

// Play sound from the start
function playSound(sound) {
  sounds[sound].currentTime = 0;
  sounds[sound].play();
}

// Returns a random integer between min and max (max included)
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// removes an element from the array
function remove(arr, element) {
  arr.splice(arr.indexOf(element), 1);
}
