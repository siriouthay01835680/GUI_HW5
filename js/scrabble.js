// Aria Siriouthay
// HW5
// aria_siriouthay@student.uml.edu
// help sites: jquery docs, stackoverflow, ect.

//global variables to be updated throughout game play
var totalScore = 0; //var to hold total score
var totalTiles = 0; //var to hold tiles left
var hand = 7; //var to hold how many tiles are needed to be dealt
var pos = []; //array to store the board positions that are in use

$(document).ready(function(){
    updateTable(); //update table to reflect # of tiles

    var wordMap = new Map(); //map where key = the board div id, and value = the tile letter
    var alphaArr = initArr(); //array to hold all currently available (unused) tiles


    $("#submit").prop("disabled", true); //disable submit button before actual game play
    $("#score").text("Score: " + totalScore); //display current score
    getTiles(alphaArr); //display tiles with available tiles

    //beginning of methods for droppables
    $(".droppable").droppable({
        tolerance: "pointer", //will allow droppable to be detected when mouse touches area
        classes: {
            "ui-droppable-hover": "drop" //styling to add green border on hover
          },
        drop: function(e, ui){
            //when the tile is dropped, set the image to the tile's image by reading its id
            if(ui.draggable.attr("id").charAt(0) == "_"){
                $(this).css('background-image', "url(graphics_data/Scrabble_Tiles/Scrabble_Tile_Blank.jpg)");
            }
            else{
                $(this).css('background-image', "url(graphics_data/Scrabble_Tiles/Scrabble_Tile_" + ui.draggable.attr("id").charAt(0) +  ".jpg)");
            }
            $(this).data("info", ui.draggable.attr("id")); //set the data-info attribute to the id of the tile to store what tile is being held in the droppable
            ui.draggable.remove(); //remove the draggable tile after its dropped as it is no longer needed
            $("#" + this.id).droppable("disable"); //disable the current droppable position now that is is taken
            
            //get the last char of the div id as it correlated to its position (1-7) and save to array
            //this will be used to keep track of all positions & if they're available or not
            let index = this.id.charAt(6);
            index = parseInt(index);
            pos.push(index);
            pos.sort();

            //enable all free positions & skip any in use
            for(var i = 1; i <= 7; i++){
                if(pos.includes(i)){ 
                    continue;
                }
                $("#target" + i).droppable("enable");
            }
            //disabling any positions that are not directly next to the current tiles to avoid gaps.
            //first & last pos. are used because for example for word: "AN" it can be "CAN" or "ANT" 
            //only outer pos. are available at this time, this approach also works for one letter as
            //first and last are the same.
            var first = pos[0];
            var last = pos[pos.length-1];
            for(var i = first-2; i > 0; i--){
                $("#target" + i).droppable("disable");
            }
            for(var i = last+2; i <= 7; i++){
                $("#target" + i).droppable("disable");
            }
            //save the current word on the board to the map and check to see if the word is a valid length
            wordMap.set(this.id, ui.draggable.attr("id").charAt(0));
            checkWord(wordMap);
        }
    });//end of methods for droppables
    
    //beginning methods for clicks on board to remove tiles
    $("#scrabbleBoard").on("click", function(e){
        var id = $(e.target).data("info"); // get the data-info attr. of the clicked div
        if (id != ""){ //only if the div is actually holding a tile is this code executed
            
            //delete the div id from the map and update validation method
            wordMap.delete(e.target.id);
            checkWord(wordMap);
            
            //bring the tile back to the rack by using the data-info attr. to set the image
            if(id.charAt(0) == "_"){
                var data = "<li><div id ='" + id +"' class='draggable ui-widget-content'><img src='graphics_data/Scrabble_Tiles/Scrabble_Tile_Blank.jpg'" + "></div></li>";
            }
            else{
                var data = "<li><div id ='" + id +"' class='draggable ui-widget-content'><img src='graphics_data/Scrabble_Tiles/Scrabble_Tile_" + id.charAt(0) + ".jpg'" + "></div></li>";
            }

            //append the image to the tile rack and reinitialize its draggable abilities
            $("#tiles ul").append(data);
            $(".draggable").draggable({
                snap: ".ui-widget-header",
                revert: "invalid"
            });

            //set the board image back to its original by using its corresponding id digit
            //and enable the position and empty its data-info attr.
            $(e.target).css('background-image', "url(graphics_data/board_img" + e.target.id.charAt(6) +  ".png)");
            $(e.target).droppable("enable");
            $(e.target).data("info", "");

            //remove the current pos. from the array of used pos.
            var index = pos.indexOf(parseInt(e.target.id.charAt(6)));
            if(index > -1){
                pos.splice(index, 1);
            }
            //disabling any positions that are not directly next to the current tiles to avoid gaps.
            //first & last pos. are used because for example for word: "AN" it can be "CAN" or "ANT" 
            //only outer pos. are available at this time, this approach also works for one letter as
            //first and last are the same.
            pos.sort();
            for(var i = 1; i <= 7; i++){
                if(pos.includes(i)){ //enable all free positions & skip any in use
                    continue;
                }
                $("#target" + i).droppable("enable");
            }
            var first = pos[0];
            var last = pos[pos.length-1];
            for(var i = first-2; i > 0; i--){
                $("#target" + i).droppable("disable");
            }
            for(var i = last+2; i <= 7; i++){
                $("#target" + i).droppable("disable");
            }
        }  
    }); // end of methods for clicks on board to remove tiles
    
    // beginning of methods for submit button clicks
    $("#submit").click(function(){
        //when clicked, all spots on the board will become enabled,
        //score will be calculated and new tiles will be dealt to
        //make 7
        for(var i = 0; i < 7; i++){
            $("#target" + i).droppable("enable");
        }
        score(wordMap, totalScore);
        var alphaArr = initArr();
        getTiles(alphaArr);
    }); // end of methods for submit button clicks

    // beginning of methods for restart button clicks
    $("#restart").click(function(){
        //enable all positions and call restart method to clear gameplay
        for(var i = 0; i < 7; i++){
            $("#target" + i).droppable("enable");
        }
        restart(wordMap);
    }); // end of methods for restart button clicks
    
    // beginning of methods for new tiles button clicks
    $("#new").click(function(){
        // clear the board, remove all tiles, update array containing all available tiles and update hand accordingly
        clearBoard();
        $(".draggable").remove();
        var alphaArr = initArr();
        if(totalTiles >= 7){
            hand = 7;
        }
        else{
            hand = alphaArr.length;
        }
        getTiles(alphaArr);
    }); // end of methods for new tiles button clicks
});

function initArr(){
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_';
    var alphaArr = [];
    var numTiles = [];
    // https://stackoverflow.com/questions/70019852/how-to-pick-an-element-from-an-array-with-a-probability-distribution
    // creating array to hold probablities for each letter distribution
    for(var i = 0; i < alphabet.length; i++){
        numTiles.push(ScrabbleTiles[alphabet.charAt(i)]["number-remaining"]);
    }
    // making array filled with letters according to its distribution
    for(var i = 0; i < alphabet.length; i++){
        alphaArr = alphaArr.concat(new Array(numTiles[i]).fill(alphabet.charAt(i)));
    }
    return alphaArr;
}

function getTiles(alphaArr){
    //initalizing draggable abilities
    $(".draggable").draggable({
        snap: ".ui-widget-header",
        revert: "invalid"
    });
    // choose random tiles from array to complete 7-tile hand
    var countArr = []; //array to count how many times a tile appears so unique id can be given to each
    for(var i = 0; i < hand; i++){
        var alphaChar = alphaArr[Math.floor(Math.random() * (alphaArr.length-1))]; //choose a random letter from the available tile array
        countArr.push(alphaChar); //store the letter

        //only decrement number remaining if greater than 0
        if(ScrabbleTiles[alphaChar]["number-remaining"] > 0){
            ScrabbleTiles[alphaChar]["number-remaining"] -= 1; 
        }

        //update table & alphaArr to reflect any changes
        updateTable();
        alphaArr = initArr();
        totalTiles = alphaArr.length;
        
        //disable new tiles button if no more tiles
        if(totalTiles == 0){
            $("#new").prop("disabled", true);
        }

        //update tiles left
        $("#tilesLeft").text("Tiles left: " + totalTiles);
        
        //use the # of occurences to name the id
        let count = getOccurrence(countArr, alphaChar);
        if(alphaChar == '_'){
            var data = "<li><div id= '_" + count + "' class='draggable ui-widget-content'><img src='graphics_data/Scrabble_Tiles/Scrabble_Tile_Blank.jpg'" + "></div></li>";
        }
        else{
            var data = "<li><div id ='" + alphaChar + count +"' class='draggable ui-widget-content'><img src='graphics_data/Scrabble_Tiles/Scrabble_Tile_" + alphaChar + ".jpg'" + "></div></li>";
        }
        //add img to tile rack and reinitialize the draggable abilities
        $("#tiles ul").append(data);
        $(".draggable").draggable({
            snap: ".ui-widget-header",
            revert: "invalid"
        });
    }
}

// https://stackoverflow.com/questions/37365512/count-the-number-of-times-a-same-value-appears-in-a-javascript-array
// simple method to count occurences of element in arr
function getOccurrence(arr, value) {
    var count = 0;
    arr.forEach((v) => (v === value && count++));
    return count;
}

//function to calculate score
function score(wordMap){
    let doubleWord = 0;
    hand = wordMap.size; //hand is equal to the # of tiles needed to make rack complete
    clearBoard();

    // iterating through map to calculate score depending on value of tile and its position on board
    let score = 0;
    wordMap.forEach(function(value, key){
        if(key == "target2" || key == "target6"){ //id of 2 bonus squares
            doubleWord++;
        }
        score  += ScrabbleTiles[value].value;
    });

    //accounting for # of bonuses used
    for(var i = 0; i < doubleWord; i++){
        score *=2;
    }

    //updating total score, tiles left, clearing the map, and updating validation method to enable/disable submit btn.
    totalScore += score;
    $("#score").text("Score: " + totalScore);
    $("#tilesLeft").text("Tiles left: " + totalTiles);
    wordMap.clear();
    checkWord(wordMap);
}

//function to clear board
function clearBoard(){
    //set all board positions back to original image and empty data-info
    for(var i = 1; i <= 7; i++){
        $("#target" + i).css('background-image', "url(graphics_data/board_img" + i +  ".png)");
        $("#target" + i).droppable("enable");
        $("#target" + i).data("info", "");
    }
    pos = []; //empty used pos. arr
}

//function to restart game
function restart(wordMap){
    //remove all tiles, clear the board, map, and total score.
    $(".draggable").remove();
    clearBoard();
    wordMap.clear();
    checkWord(wordMap);
    totalScore = 0;
    $("#score").text("Score: " + totalScore);

    //setting number-remaining back to original values
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_';
    for(var i = 0; i < 27; i++){
        ScrabbleTiles[alphabet.charAt(i)]["number-remaining"] = ScrabbleTiles[alphabet.charAt(i)]["original-distribution"];
    }
    //update table & tile (alpha) arr to reflect changes
    updateTable();
    var alphaArr = initArr();
    hand = 7;
    getTiles(alphaArr);
    $("#tilesLeft").text("Tiles left: " + totalTiles);
    $("#new").prop("disabled", false); //enable new tiles button
    
}
//function to check length of word on board, disabled if under 2 letters
function checkWord(wordMap){
    if(wordMap.size >= 2){
        $("#submit").prop("disabled", false);
    }
    else{
        $("#submit").prop("disabled", true);
    }
}

//Jesse M. Heines, UMass Lowell Computer Science, heines@cs.uml.edu
function updateTable() {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_';
    var char;          // uppercase character indicated by the loop index
    var newTableRow;   // one row of the table
    var newTableCell;  // one cell in a table row
    var nTiles = 0;    // total # of tiles

    $("#tileTable").empty(); //remove any previous data for update

    // preparing row/cell for data
    newTableRow = $("<tr></tr>");
    newTableCell = $("<td></td>");

    //add the top header of table
    newTableRow.append("<th>Tile</th><th> Value </th><th> # Remaining</th>");
    $("#tileTable").append(newTableRow);

    newTableRow = $("<tr></tr>");
    newTableCell = $("<td></td>");

    //for the entire alphabet, update table cells according to the values held
    //in assoc. array in order of letter, value, # remaining
    for (var i = 0; i < alphabet.length; i++) {
        if(alphabet.charAt(i) == "_"){
            char = "Blank";
        }
        else{
            char = alphabet.charAt(i);
        }
        newTableCell.text(char);
        newTableRow.append(newTableCell);
        newTableCell = $("<td></td>");

        newTableCell.text(ScrabbleTiles[alphabet.charAt(i)].value);
        newTableRow.append(newTableCell);
        newTableCell = $("<td></td>");

        newTableCell.text(ScrabbleTiles[alphabet.charAt(i)]["number-remaining"]);
        newTableRow.append(newTableCell);
        nTiles += ScrabbleTiles[alphabet.charAt(i)]["number-remaining"]; //increase total # of tiles
        $("#tileTable").append(newTableRow);
        newTableRow = $("<tr></tr>");
        newTableCell = $("<td></td>");
    }
    newTableRow = $("<tr></tr>");
    newTableCell = $("<td></td>");

    //set total number of tiles at end of table
    newTableRow.append("<th>Total Tiles:</th>");
    $("#tileTable").append(newTableRow);
    newTableCell.text(nTiles);
    newTableRow.append(newTableCell);
    newTableCell = $("<td></td>");
    newTableRow.append(newTableCell);

    //append all changes to main table
    $("#tileTable").append(newTableRow);

}