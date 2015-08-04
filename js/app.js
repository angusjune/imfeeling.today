var body        = $('body');
var $mainColor  = $('.main-color');
var debug       = $('#debug');
var $colorsList = $('.colors__list');
var $colorsEmpty = $('.colors__empty');
var $dropper    = $('.dropper');
var $question   = $('.question');
var $questionColor = $('.question__color');
var $btnAddColor   = $('.button-add-color');
var $btnShowList   = $('.button-show-list');
var $icon = $('link[rel=icon], link[rel=apple-touch-icon]');

var saturation  = '60%';
var blockSize   = 150;
var faviconSize = 260;

var mainColorH;
var mainColorW;

var colorArray = [];
var date;
var color = 'hsl(360,' + saturation + ',0%)';


window.onresize = getParameter;

//body.bind('touchmove', function(e) { e.preventDefault(); });


function logStorageColors() {
    return JSON.parse(localStorage.getItem('colors'));
}

function clearStorageColors() {
    colorArray = [];
    localStorage.removeItem('colors');
    $colorsList.empty();
    checkColorsListEmpty();
}

function debugSetColor(c, dateOfMonth) {
    var d = dateOfMonth;
    if (dateOfMonth < 10) {
        d = '0' + d;
    }
    d = '201508' + d;
    var da = new Date();
    da.setFullYear(2015);
    da.setMonth(7);
    da.setDate(dateOfMonth);
    var ts = da.getTime();

    addColor(c, d, ts);
}

function debugAddColors() {
    var colors = chroma.brewer.OrRd;
    var startDate = 9;
    colors.forEach(function(el) {
        var h = Math.round(chroma(el).hsl()[0]);
        var s = Math.round(chroma(el).hsl()[1] * 100);
        var l = Math.round(chroma(el).hsl()[2] * 100);
        var hsl = 'hsl(' + h + ',' + s + '%,' + l + '%)';

        debugSetColor(hsl, startDate++);
        listColors();
        checkColorsListEmpty();
    });
}

function getParameter() {
    mainColorH = $mainColor.height();
    mainColorW = $mainColor.width();
}

function getDate() {
    var d = new Date(Date.now());
    var month = d.getMonth() < 9 ? '' + 0 + (d.getMonth() + 1) : d.getMonth() + 1;
    var day   = d.getDate() < 10 ? '' + 0 + d.getDate() : d.getDate();

    date = '' + d.getFullYear() + month + day;
}

function getColorArray() {
    if (localStorage.getItem('colors')) {
        colorArray = JSON.parse(localStorage.getItem('colors'));
    }
}

function addColor(color, dateString, timestamp) {
    var isExists = false;
    var colorObj = {'date': dateString, 'timestamp': timestamp};

    if (colorArray.length !== 0) {
        colorArray.forEach(function(el, i) {

            // If a color has already been assigned to the specific date
            if (el.date == dateString) {
                isExists = true;

                el.color = color; // Replace the color with the current one
                el.timestamp = timestamp;

                var dom = $colorsList.find('.colors__block')[colorArray.length - i - 1];

                // Change the color of the block
                dom.style.backgroundColor = color;
                checkContrast(color, $(dom));
                $(dom).data('hex', chroma(color).hex());
            }
        });
    }

    // If no color is assigned today
    if (!isExists) {
        colorObj.color = color;
        colorArray.push(colorObj); // Add today's color
        $colorsList.width($colorsList.width() + blockSize);
        prependNewColor();
    }

    setFavicon(color);
    localStorage.setItem('colors', JSON.stringify(colorArray));
}

function prependNewColor() {

    // Move other color blocks backward
    $colorsList.find('li').each(function(i) {
        $(this).snabbt({
            position: [blockSize, 0, 0],
            easing: 'spring',
            springConstant: 0.4,
            springDeceleration: 0.8,
            duration: 200
            ,delay: i * 50
        });
    });

    var placeholder = $('<li>').addClass('placeholder').append($('<div>').addClass('colors__block'));
    placeholder.prependTo($colorsList);

    placeholder.snabbt({
        fromScale: [0,0],
        scale: [1,1],
        easing: 'spring',
        springConstant: 0.3,
        springDeceleration: 0.8,
        duration: 200,
        delay: 50,
        complete: function(){
            // When the animation completed, remove the placeholder
            placeholder.remove();
            $colorsList.find('li').each(function() {
                $(this).snabbt({
                    position: [0, 0, 0],
                    duration: 200
                });
            });

            listColors();
        }
    });
}


function listColors() {
    if (colorArray.length !== 0) {
        $colorsList.empty();
        $colorsList.css('width', blockSize * colorArray.length + 'px');

        colorArray.forEach(function(el) {
            var timestamp = el.timestamp;
            var color = el.color;

            var d = new Date(timestamp);
            var displayDate = d.toLocaleDateString();

            var colorBlock = $('<div>').addClass('colors__block').css('background-color', color);
            var blockText  = $('<div>').addClass('colors__block__text').html(displayDate);
            var listItem   = $('<li>');

            colorBlock.data({
                'hex': chroma(color).hex(),
                'date': displayDate
            });

            // Show color hex on hover
            colorBlock.bind('mouseover touchstart', function(){
                $(this).find('.colors__block__text').html($(this).data('hex'));
            }).bind('mouseout touchend', function(){
                $(this).find('.colors__block__text').html($(this).data('date'));
            });

            checkContrast(color, colorBlock);

            // Add color blocks to the list
            blockText.appendTo(colorBlock);
            colorBlock.appendTo(listItem);
            listItem.prependTo($colorsList);
        });
    }
}

function checkContrast(color, object) {
    if (chroma(color).luminance() > 0.5) {
        object.addClass('light');
    } else {
        object.removeClass('light');
    }
}

function checkColorsListEmpty() {
    if (colorArray.length === 0) {
        $colorsEmpty.removeClass('hide');
    } else {
        $colorsEmpty.addClass('hide');
    }
}

function animateColorDrop() {

    $dropper.css({
        'background-color': color
    }).addClass('animating');

    $dropper.snabbt({
        fromOpacity: 1,
        fromWidth: mainColorW,
        fromHeight: mainColorH,
        fromPosition: [0, 0, 0],
        width: blockSize,
        height: blockSize,
        position: [(mainColorW - blockSize) / 2, (mainColorH) / 2, 0],
        easing: 'easeIn',
        duration: 500
    }).snabbt({
        fromRotation: [0,0,0],
        position: [0, mainColorH, 0],
        rotation: [0, 0, -2 * Math.PI],
        easing: 'spring',
        springConstant: 0.2,
        springDeceleration: 0.75,
        duration: 300
    }).snabbt({
        fromOpacity: 1,
        opacity: 0,
        duration: 300,
        complete: function(){$dropper.removeClass('animating')}
    });

    if (!body.hasClass('show-list')) {
        $btnShowList.addClass('up');

        $mainColor.snabbt({
            position: [0, -blockSize, 0],
            easing: 'spring',
            springDeceleration: 0.3,
            duration: 200
            //,delay: 150
        }).snabbt({
            fromPosition: [0, -blockSize, 0],
            position: [0, 0, 0],
            easing: 'spring',
            springDeceleration: 0.3,
            duration: 200,
            delay: 1300,
            complete: function(){$btnShowList.removeClass('up');}
        });
    }
}

function animateColorsBlock() {
    $('.colors__block').each(function(i, el) {
        var delay = i * 50;

        $(this).snabbt({
            fromScale: [0,0],
            scale: [1,1],
            easing: 'ease',
            duration: 300,
            delay: delay
        });
    });
}

function showColorsList() {
    if (body.hasClass('init')) {
        animateColorsBlock();
        body.removeClass('init');
    }

    $mainColor.snabbt({
        position: [0, -blockSize, 0],
        easing: 'easeOut',
        duration: 200
    });
    body.addClass('show-list');
    $btnShowList.addClass('up');
}

function hideColorsList() {
    $mainColor.snabbt({
        position: [0, 0, 0],
        easing: 'easeOut',
        duration: 200
    });
    body.removeClass('show-list');
    $btnShowList.removeClass('up');
}

function setFavicon(color) {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // Create gradient base on the color
    var gradient = ctx.createLinearGradient(faviconSize / 2, 0, faviconSize / 2, faviconSize);
    gradient.addColorStop(0, chroma(color).hex());
    gradient.addColorStop(1, chroma(color).saturate(1).hex());
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, faviconSize, faviconSize);
    var uri = canvas.toDataURL();

    $('link[rel=icon]').attr('href', uri);

    // Set title as well
    $('title').text('feeling ' + chroma(color).hex() + ' today');
}

function setInitColor() {
    if (colorArray.length !== 0) {
        var latestColor = colorArray[colorArray.length - 1];
        if (latestColor.date == date) {
            color = latestColor.color;
            setFavicon(color);

            checkContrast(color, $mainColor);
            $mainColor.css('background-color', color);
            $questionColor.html(chroma(color).hex());


        }
    }
}

function clickMainColor() {
    addColor(color, date, Date.now());
    checkColorsListEmpty();
    animateColorDrop();
}

function init() {
    getParameter();
    getDate();
    getColorArray();
    checkColorsListEmpty();
    setInitColor();
    listColors();
}

init();

function setColor(offsetX, offsetY) {
    //debug.html('x: ' + offsetX + '; y:' + offsetY + '; color:' + color);

    var hue = Math.round((offsetX / mainColorW) * 260);
    var lightness = Math.round(100 - (offsetY / mainColorH) * 100);

    color = 'hsl(' + hue + ',' + saturation + ',' + lightness + '%)';
    $mainColor.css('background-color', color);
    checkContrast(color, $mainColor);

    $questionColor.html(chroma(color).hex());
}


$mainColor.bind('mousemove', function(e){
    var offsetX = e.pageX - this.offsetLeft;
    var offsetY = e.pageY - this.offsetTop;

    setColor(offsetX, offsetY);

}).bind('touchmove', function(e) {
    var offsetX = e.originalEvent.layerX;
    var offsetY = e.originalEvent.layerY;

    setColor(offsetX, offsetY);
});

$mainColor.click(function(e) {
    if (body.hasClass('show-list')) {
        hideColorsList();
    } else {
        addColor(color, date, Date.now());
        animateColorDrop();
    }
});

body.mouseout(function(){
    $btnShowList.addClass('hide');
}).mouseover(function(){
    $btnShowList.removeClass('hide');
});

var timeout;

$mainColor.bind('touchstart',function(e) {
    e.preventDefault();

    if (!body.hasClass('show-list')) {
        timeout = setTimeout(function(){
            $btnAddColor.addClass('hide');  // Wait before button disappear
        }, 1500);
    }

}).bind('touchend', function(){
    if (body.hasClass('show-list')) {
        hideColorsList();
    } else {
        clearTimeout(timeout);
        $btnAddColor.removeClass('hide');
    }
});


// Show colors list when mouse scrolls up
$mainColor.mousewheel(function(e) {
    if (e.deltaY < 0) {
        showColorsList();
    } else if (e.deltaY > 0 && body.hasClass('show-list')) {
        hideColorsList();
    }
});


$btnAddColor.bind('touchstart', function(e){
    e.preventDefault();

    if (!body.hasClass('show-list')) {
        $btnAddColor.snabbt({
            scale: [1.2,1.2],
            easing: 'spring'
        });
    }
}).bind('touchend', function(e){
    e.preventDefault();

    if (!body.hasClass('show-list')) {
        $btnAddColor.snabbt({
            scale: [1,1],
            easing: 'spring'
        });

        clickMainColor();
    }
});


$btnShowList.bind('click touchend', function(e) {
    e.preventDefault();
    if (!$(this).hasClass('up')) {
        showColorsList();
    }
});