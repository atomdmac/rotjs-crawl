var Main = (function (window) {
    // LOL TODO
    
    // ROT.RNG.setSeed(1234);
    var map = new ROT.Map.Digger();
    var display = new ROT.Display({fontSize:32});
    // map.create(display.DEBUG);
    map.create(function (x, y, tile) {
        if (tile != 1) {
            console.log(x, ", ", y);
        }
        display.DEBUG(x, y, tile);
    });
    document.body.appendChild(display.getContainer());
    
    var drawDoor = function(x, y) {
        display.draw(x, y, "", "", "red");
    }
    
    var rooms = map.getRooms();
    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        room.getDoors(drawDoor);
    }

});

var Player = (function (map, display) {
    
});