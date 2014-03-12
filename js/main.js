var Main = (function (window) {
    // LOL TODO
    // ROT.RNG.setSeed(1234);
    
    // Instantiate main game components.
    this.display   = new ROT.Display({fontSize:16});
    this.scheduler = new ROT.Scheduler.Simple();
    this.engine    = new ROT.Engine(this.scheduler);
    this.digger    = new ROT.Map.Digger();
    this.map       = {};
    this.freeTiles = [];
    
    // Create a random dungeon.
    digger.create(function (x, y, tile) {
        display.DEBUG(x, y, tile);
        if(tile === 0) freeTiles.push({x:x, y:y});
        map[x + "," + y] = {type: tile};
    });
    
    // Draw doors.
    var drawDoor = function(x, y) {
        display.draw(x, y, "", "", "red");
    }
    
    var rooms = digger.getRooms();
    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        room.getDoors(drawDoor);
    }
    
    // Scheduler

    
    // Create Player character.
    var index   = Math.floor(ROT.RNG.getUniform() * freeTiles.length);
    var playPos = freeTiles.splice(index, 1)[0];
    
    this.player = new Player({
        "map"    : map,
        "display": display,
        "engine" : this.engine,
        "x"      : playPos.x,
        "y"      : playPos.y
    });
    this.player.draw();
    
    // Add characters to scheduler.
    this.scheduler.add(this.player, true);
    
    // Add the display to the DOM.
    document.body.appendChild(display.getContainer());
    
    this.engine.start();
});

var Player = (function (options) {
    
    this.map     = options.map;
    this.display = options.display;
    this.engine  = options.engine;
    this.x       = options.x || 0;
    this.y       = options.y || 0;
    
    this.act = function () {
        this.engine.lock();
        window.addEventListener("keydown", this.handleEvent);
    }
    
    this.draw = function () {
        this.display.draw(this.x, this.y, "@", "white", "black");
    }
    
    this.handleEvent = function (e) {
        var keyMap = {};
            keyMap[38] = 0;
            keyMap[33] = 1;
            keyMap[39] = 2;
            keyMap[34] = 3;
            keyMap[40] = 4;
            keyMap[35] = 5;
            keyMap[37] = 6;
            keyMap[36] = 7;
     
        var code = e.keyCode;
     
        if (!(code in keyMap)) { return; }
        
        var diff = ROT.DIRS[8][keyMap[code]];
        var newX = this.x + diff[0];
        var newY = this.y + diff[1];
     
        var newKey = newX + "," + newY;
        if (this.map[newKey].type !== 0) { return; } /* cannot move in this direction */
        
        // Clean up the space where I just was.
        this.display.draw(this.x, this.y, " ");
        
        // Draw my new position.
        this.x = newX;
        this.y = newY;
        this.draw();
        
        // My turn is over.
        window.removeEventListener("keydown", this);
        this.engine.unlock();
    }
    
    this.handleEvent = this.handleEvent.bind(this);
});

Function.prototype.bind = function(scope) {
  var _function = this;
  
  return function() {
    return _function.apply(scope, arguments);
  }
}