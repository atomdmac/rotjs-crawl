var Main = (function (window) {
    
    var self = this;
    
    // Public Methods for Game.
    /**
     * Redraw all map tiles.
     */
    self.drawMap = function () {
        var color, tile;
        for(var t in this.map) {
            tile = self.map[t];
            
            // Draw explored tiles with appropriate color.
            if (tile.explored) {
                switch(tile.type) {
                    // Floor/Passable
                    case 0:
                        color = "#E3D5D5";
                        break;
                    // Wall/Impassable
                    case 1:
                        color = "#572C1C"
                        break;
                    default:
                        color = "#000";
                }
                
                self.display.draw(tile.x, tile.y, "", "", color);
            }
            
            // Unexplored tiles are always black;
            else {
                self.display.draw(tile.x, tile.y, "", "black", "black");
            }
        }
    };
    
    /*
     * Determine whether light can pass through a given tile.
     */
    var lightCanPass = function (x, y) {
        var key = x+","+y;
        if (self.map[key]) { return (self.map[key].type == 0); }
        return false;
    };
    lightCanPass = lightCanPass.bind(this);
    
    /**
     * Update the player's field of view.
     */
    self.updateFOV = function () {
        self.fov.compute(self.player.x, self.player.y, 10, function(x, y, r, visibility) {
            var tile = self.map[x+","+y];
            
            // Don't highlight walls or
            if (!tile) return;
            
            tile.explored = true;
            
            /*var ch = (r ? "" : "@");
            var color = (self.map[x+","+y].type ? "#aa0": "#660");
            self.display.draw(x, y, ch, "#fff", color);*/
            if(!r) self.display.draw(x, y, "@", "#fff", "black");
        });
    };
    
    // Update the game state.
    self.act = function () {
        self.drawMap();
        self.updateFOV();
    };
    
    // Seed Random Number Generator.
    // ROT.RNG.setSeed(1234);
    
    // Instantiate main game components.
    self.display   = new ROT.Display({fontSize:16});
    self.scheduler = new ROT.Scheduler.Simple();
    self.engine    = new ROT.Engine(self.scheduler);
    // self.digger    = new ROT.Map.Rogue(ROT.DEFAULT_WIDTH, ROT.DEFAULT_HEIGHT);
    self.digger    = new ROT.Map.Digger();
    self.map       = {};
    self.freeTiles = [];
    
    // Create a random dungeon.
    self.digger.create(function (x, y, tile) {
        // display.DEBUG(x, y, tile);
        if(tile === 0) self.freeTiles.push({x:x, y:y});
        self.map[x + "," + y] = {
            type: tile,
            x   :x,
            y   :y,
            explored: false,
            occupants: []
        };
    });
    
    // Mechanism for determining the player's current field of view.
    self.fov       = new ROT.FOV.PreciseShadowcasting(lightCanPass);
    
    // Draw doors.
    var drawDoor = function(x, y) {
        display.draw(x, y, "", "", "red");
    }
    /*
    var rooms = digger.getRooms();
    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        room.getDoors(drawDoor);
    }
    */
    
    // Create Player character.
    var index   = Math.floor(ROT.RNG.getUniform() * self.freeTiles.length);
    var playPos = self.freeTiles.splice(index, 1)[0];
    
    self.player = new Player({
        "map"    : self.map,
        "display": self.display,
        "engine" : self.engine,
        "x"      : playPos.x,
        "y"      : playPos.y
    });
    self.player.draw();
    
    // Add characters to scheduler.
    self.scheduler.add(self.player, true);
    self.scheduler.add(self, true);
    
    // Add the display to the DOM.
    document.body.appendChild(self.display.getContainer());
    
    self.engine.start();
    self.act();
});

var Player = (function (options) {
    
    var self = this;
    
    self.map     = options.map;
    self.display = options.display;
    self.engine  = options.engine;
    self.x       = options.x || 0;
    self.y       = options.y || 0;
    
    self.act = function () {
        self.engine.lock();
        window.addEventListener("keydown", self.handleEvent);
    }
    
    self.draw = function () {
        self.display.draw(self.x, self.y, "@", "white", "black");
    }
    
    self.handleEvent = function (e) {
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
        var newX = self.x + diff[0];
        var newY = self.y + diff[1];
     
        var newKey = newX + "," + newY;
        if (self.map[newKey].type !== 0) { return; } /* cannot move in self direction */
        
        // Clean up the space where I just was.
        self.display.draw(self.x, self.y, " ");
        
        // Draw my new position.
        self.x = newX;
        self.y = newY;
        self.draw();
        
        // My turn is over.
        window.removeEventListener("keydown", self);
        self.engine.unlock();
    }
    
    self.handleEvent = self.handleEvent.bind(self);
});

Function.prototype.bind = function(scope) {
  var _function = this;
  
  return function() {
    return _function.apply(scope, arguments);
  }
}