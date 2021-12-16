// render game board
function renderBoard(){
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    $("#board").html("")
    for (var row=0;row<size;row++){
        $("#board").append("<tr>")
            for (var col=0;col<size;col++){
                var char = characters.charAt(parseInt(Math.random()* characters.length))
                $("#board").append("<td class='letter' id=cell" +(row*size+col) +" data-row="+ row +" data-col=" +col +">" +char +"</td>")
            }
    }
    $(".letter").css("font-size",400/size+"px")
}


// computer search words in corpus
function searchWord(){
    direction = [[1,1],[1,0],[0,1],[1,-1]]
    var words_str = []
    if (level=="beginer"){
        words_str = easy_words
    }
    else if(level=="normal"){
        words_str = easy_words+medium_words
    }
    else{
        words_str = easy_words+medium_words+hard_words
    }
    var words = words_str.split("\n")
    for (var row=0;row<size;row++){
        for (var col=0;col<size;col++){
            str = ""
            dr = row
            dc = col
            for (var i=0; i<4; i++){
                while (dr>=0 && dr<size && dc>=0 && dc<size && words_str.indexOf(str)!=-1){
                    str += $("#cell"+(dr*size+dc)).html().toLowerCase()
                    if ((words.includes(str) || words.includes(str.split("").reverse().join(""))) && str.length>1){
                        answer.push(row+"-"+col+"-"+dr+"-"+dc)
                    }
                    dr += direction[i][0]
                    dc += direction[i][1]
                }
            }
        }
    }
} 


// user play game, using two clicks to indicate a word
function userPlay(){
    $(".letter").on("mouseenter",function(){  // mouse hover visual effect
        $(this).toggleClass("shadow")
    })
    $(".letter").on("mouseleave",function(){
        $(this).toggleClass("shadow")
    })

    $(".letter").on("click",function(){
        if (first_click==""){  // chose the start position
            first_click = $(this)
            diff = $(this).data("col")-$(this).data("row")
            sum = $(this).data("row")+$(this).data("col")
            first_r = $(this).data("row")
            first_c = $(this).data("col")
            for (var row=0;row<size;row++){  // highlight letters in same row, col, diag for chosen
                id = row*size+$(this).data("col")
                $("#cell"+id).addClass("highlight")
                if (sum-row>=0 && sum-row<size){
                    neg_diag_id = row*size+(sum-row)
                    $("#cell"+neg_diag_id).addClass("highlight")
                }
                if (row+diff>=0 && row+diff<size){
                    pos_diag_id = row*size+(row+diff)
                    $("#cell"+pos_diag_id).addClass("highlight")
                }
            }
            for (var col=0;col<size;col++){
                id = $(this).data("row")*size+col
                $("#cell"+id).addClass("highlight")
            }
            $(this).removeClass("highlight")
        }

        else{  // chose the ending position
            second_r = $(this).data("row")
            second_c = $(this).data("col")
            var temp = deserialize_word(first_r,first_c,second_r,second_c)
            var str =temp [0]
            var letters = temp[1]
            if ((all_words.includes(str.toLowerCase()) || all_words.includes(str.split("").reverse().join("").toLowerCase()))  // whether a legal word: 
            && !found.includes(first_r+"-"+first_c+"-"+second_r+"-"+second_c) && !found.includes(second_r+"-"+second_c+"-"+first_r+"-"+first_c)){  // legal if dictionary contains the word in either direction, and has not been chosen before
                
                addLog("You found Word: " + (all_words.includes(str.toLowerCase()) ? str.toLowerCase() : str.split("").reverse().join("").toLowerCase()))
                addScore(str.length,"player")
                found.push(first_r+"-"+first_c+"-"+second_r+"-"+second_c)
                letters.forEach(id => {
                    $("#cell"+id).addClass("grey")
                })
                idx = answer.indexOf(first_r+"-"+first_c+"-"+second_r+"-"+second_c)
                if (idx>-1){
                    answer.splice(idx, 1);
                }
                idx = answer.indexOf(second_r+"-"+second_c+"-"+first_r+"-"+first_c)
                if (idx>-1){
                    answer.splice(idx, 1);
                }
                setTimeout(() => { computerPlay() }, 2000);  // delay computer play to simulate it thinking
                
            }
            first_click = ""
            $(".letter").removeClass("highlight shadow")
        }
    })
}


// simulate a computer play, fecth a word it found
function computerPlay(){
    if (answer.length == 0){
        addLog("YOU WON!! you may continue on your own or start a new game")
        return
    }
    idx = parseInt(Math.random()* answer.length)
    serialize = answer[idx]
    found.push(serialize)
    answer.splice(idx, 1);
    serialize = serialize.split("-")
    var temp = deserialize_word(serialize[0],serialize[1],serialize[2],serialize[3])
    var str = temp [0]
    
    var letters = temp[1]
    letters.forEach(id => {
        $("#cell"+id).addClass("grey")
    });
    addLog("Computer found Word: " + (all_words.includes(str.toLowerCase()) ? str.toLowerCase() : str.split("").reverse().join("").toLowerCase()))
    addScore(str.length,"computer")
}


// behavior of the right pannel buttons
function panelSetting(){
    $("#level-btn").on("click",function(){  // change level 
        level = $("#level").val()
        renderBoard()
        addLog("Change computer level to "+level)
        searchWord()
        userPlay()
    })

    $("#boardsize-btn").on("click",function(){  // change game board size
        temp = $("#boardsize").val()
        if ( temp>30 || temp<10){
            addLog("please enter a board size between 10 and 30")
            return
        }
        size = temp
        renderBoard()
        addLog("Update board size to "+size)
        searchWord()
        userPlay()
    })

    $("#newgame-btn").on("click",function(){  // start new game
        $("#playerScore").html("")
        $("#opponentScore").html("")
        renderBoard()
        addLog("======= NEW GAME =======")
        searchWord()
        userPlay()
    })

    $("#allwords-btn").on("click",function(){  // output all words computer found
        res = ""
        answer.forEach(serialize => {
            serialize = serialize.split("-")
            var temp = deserialize_word(serialize[0],serialize[1],serialize[2],serialize[3])
            var str = temp [0]
            var letters = temp[1]
            letters.forEach(id => {
                $("#cell"+id).addClass("grey")
            });
            res += (all_words.includes(str.toLowerCase()) ? str.toLowerCase() : str.split("").reverse().join("").toLowerCase()) +", "
        });
        addLog(res.substring(0, res.length-2))
    })
}


// add log after action
function addLog(log){
    $("#log").append(log+"\n\n")
    $("#log").scrollTop($("#log")[0].scrollHeight);
}


// add score after found words
function addScore(len,turn){
    if (turn==="player"){
        temp = parseInt($("#playerScore").html()==="" ?0 : $("#playerScore").html())
        $("#playerScore").html(temp+len)
    }
    else{
        temp = parseInt($("#opponentScore").html()==="" ?0 : $("#opponentScore").html())
        $("#opponentScore").html(temp+len)
    }
}


// helper: deseralize words from begining and ending locations, return word and letter posutions
function deserialize_word(r1,c1,r2,c2){
    minr = Math.min(r1,r2)
    maxr = Math.max(r1,r2)
    minc = Math.min(c1,c2)
    maxc = Math.max(c1,c2)
    str = ""
    letters = []
    if (r2==r1){
        for (col=minc; col<=maxc; col++){
            str += $("#cell"+(r2*size+col)).html()
            letters.push(r2*size+col)
        }
    }

    else if(c2==c1) {
        for (row=minr; row<=maxr; row++){
            str += $("#cell"+(row*size+c2)).html()
            letters.push(row*size+c2)
        }
    }
    else if(c2+r2 == c1+r1) {
        sum = r1+c1
        for (row=minr; row<=maxr; row++){
            str += $("#cell"+(row*size+sum-row)).html()
            letters.push(row*size+sum-row)
        }
    }
    else if(r2-c2 == r1-c1){
        diff = r2-c2
        for (row=minr; row<=maxr; row++){
            str += $("#cell"+(row*size+row-diff)).html()
            letters.push(row*size+row-diff)
        }
    }
    return [str, letters]
}


// helper: read corpus texts
function readFile(file){
    var Reader = new XMLHttpRequest();
    Reader.open("GET", file, false);
    Reader.onreadystatechange = function (){
        words = Reader.responseText;
    }
    Reader.send(null);
    return words
}