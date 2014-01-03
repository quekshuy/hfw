/**
 *
 * HFW
 * - by syquek
 *
 */

/** key frame insertion. 
 *  Taken from http://stackoverflow.com/questions/10342494/set-webkit-keyframes-values-using-javascript-variable 
 *  with JSFiddle here:http://jsfiddle.net/russelluresti/RHhBz/2/ 
 */

// search the CSSOM for a specific -webkit-keyframe rule
function findKeyframesRule(rule)
    {
        // gather all stylesheets into an array
        var ss = document.styleSheets;
        
        // loop through the stylesheets
        for (var i = 0; i < ss.length; ++i) {
            
            // loop through all the rules
            for (var j = 0; ss[i].cssRules && j < ss[i].cssRules.length; ++j) {
                
                // find the -webkit-keyframe rule whose name matches our passed over parameter and return that rule
                if (ss[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE && ss[i].cssRules[j].name == rule)
                    return ss[i].cssRules[j];
            }
        }
        
        // rule not found
        return null;
    }

// remove old keyframes and add new ones
function handsChange(el, anim, fromDegree, toDegree)
{
    // find our -webkit-keyframe rule
    var keyframes = findKeyframesRule(anim);
    
    // remove the existing 0% and 100% rules
    keyframes.deleteRule("0%");
    keyframes.deleteRule("100%");
    
    //keyframes.deleteRule("from");
    //keyframes.deleteRule("to");
    
    // create new 0% and 100% rules with random numbers
    keyframes.insertRule("0% { -webkit-transform: rotate("+fromDegree+"deg); }");
    keyframes.insertRule("100% { -webkit-transform: rotate("+toDegree+"deg); }");
    //keyframes.insertRule("from { -webkit-transform: rotate("+fromDegree+"deg); }");
    //keyframes.insertRule("to { -webkit-transform: rotate("+toDegree+"deg); }");

    // assign the animation to our element (which will cause the animation to run)
    el.style.webkitAnimationName = anim;
}

/**
 * End keyframe insertion.
 */

// controls the date
var DateDisplay = function($dateContainer) { 
    this.$el = $dateContainer;
};

DateDisplay.prototype.setDate = function(date) { 

    this.currDate = date;
    var DAY_LIST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        MONTH_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var numDate = date.getDate();
    numDate = (numDate < 10) ? '0' + numDate : numDate;
    this.$el.find('span.date').html(numDate);
    this.$el.find('span.day').html(DAY_LIST[date.getDay()]);
    this.$el.find('span.month').html(MONTH_LIST[date.getMonth()]);
    this.$el.find('span.year').html(date.getFullYear());
};

// controls the clock
var Clock = function($clockElem, observer) { 
    this.$el = $clockElem;
    this.observer = observer;
};

Clock.prototype.hasDateChanged = function(secsElapsed) { 
    var newDate = new Date(this.lastDate.getTime() + secsElapsed*1000);
    return newDate.getDate() !== this.lastDate.getDate();
};

Clock.prototype.newDatetime = function(secsElapsed) { 
    var newDate = new Date(this.lastDate.getTime() + secsElapsed*1000);
    return newDate;
};

Clock.prototype.pause = function(date) { 
    var nd;
    if (typeof date === 'undefined') { 
        nd = this.newDatetime(this.seconds);
    } else { 
        nd = date;
    }
    clearInterval(this.lastIntId);
    this.setTime(nd, true);
};

Clock.prototype.unpause = function() { 
    // just so that we don't run through the same set of code
    // again for the same time, we need to modify lastDate to 
    // include one more second
    this.setTime(this.newDatetime(1), false);
};

Clock.prototype.startCountingSeconds = function() { 

    // reset the counting
    this.stopCountingSeconds();

    var cl = this;
    cl.seconds = 0;


    this.lastIntId = setInterval(function() { 
        cl.seconds++;
        var newDate = cl.newDatetime(cl.seconds);
        cl.observer.findData(newDate);
        if (newDate.getDate() !== cl.lastDate.getDate()) { 
            cl.observer.dateChanged(date, cl.seconds);
        }
    }, 1000);

    // placed after the interval so that if we find data
    // and pause, we get the right lastIntId to clear
    cl.observer.findData(this.lastDate);
};

Clock.prototype.stopCountingSeconds = function() { 
    clearInterval(this.lastIntId);
};

Clock.prototype.setTime = function(date, isPaused) { 
    
    // reset the second hand
    console.log('Clock.setTime');
    var el, clock = this; // = this.$el.find('.seconds').get(0);

    // set the minute
    // find the angle
    clock.$el.find('.minute').get(0).style.webkitAnimationName = 'none';
    var minutes = date.getMinutes();
    clearTimeout(this.minTimeout);
    this.minTimeout = setTimeout((function(date, isPaused) { 
        return function() {

            var el = clock.$el.find('.minute').get(0);
            var fromAngle = minutes / 60.0 * 360.0, 
                toAngle = (isPaused) ? fromAngle : fromAngle + 360 ;

            handsChange(
                el,
                'theminute',
                fromAngle,
                toAngle
                );
        };
    })(date, isPaused), 0);

    //// set the hour
    //// hour has some relation to minute, because of inter-hour 
    //// indication of minute

    clock.$el.find('.hour').get(0).style.webkitAnimationName = 'none';
    clearTimeout(this.hourTimeout);
    this.hourTimeout = setTimeout((function(date, isPaused) { 
        return function() { 
            var el = clock.$el.find('.hour').get(0);
            var hour = date.getHours(),
                interHourInterval = 360/12;
            fromAngle = hour / 12.0 * 360.0 + minutes / 60 * interHourInterval;
            toAngle = (isPaused) ? fromAngle : fromAngle + 360;
            handsChange(
                el,
                'thehour',
                fromAngle,
                toAngle
                );
        };
    })(date, isPaused), 0);
        
    clock.$el.find('.seconds').get(0).style.webkitAnimationName = 'none';
    clearTimeout(this.secTimeout);
    this.secTimeout = setTimeout((function(date, isPaused){ 
        return function() { 
            var el = clock.$el.find('.seconds').get(0);
            if (!isPaused) { 
                handsChange(
                        el,
                        'thesecond',
                        '0',
                        '360'
                        );
            } else { 
                // don't move the clock if it's paused
                var seconds = date.getSeconds(),
                    fromAngle = seconds / 60.0 * 360.0,
                    toAngle = fromAngle;
                handsChange(
                    el,
                    'thesecond',
                    fromAngle,
                    toAngle
                    );
            }
        };
    })(date, isPaused), 0);

    clock.lastDate = date;
    if (!isPaused) {
        // we have to watch out for isPause,
        // otherwise the pause will call setTime again
        // which will call findData again, which will be 
        // an unlimited loop
        clock.startCountingSeconds();
    } else { 
        // stop counting seconds
        clock.stopCountingSeconds();
    }

    console.log('Clock.setTime done');
};

//-------------------------------
// CONTROL
//-------------------------------

var Control = function(clock, dateDisplay, timeChooser, dateChooser, stateStorage) { 
    this.clock = clock;
    this.dateDisplay = dateDisplay;
    this.timeChooser = timeChooser;
    this.dateChooser = dateChooser;
    this.stateStorage = stateStorage;
};


Control.prototype.setDatetime = function(date) { 
    this.dateDisplay.setDate(date);
    this.clock.setTime(date, false);
};

Control.prototype.queryData = function() { 
    this.loading('show');
    return $.getJSON('/data/data.json');
};

Control.prototype.setData = function(data) { 
    this.data = data;
};

// should automatically disappear
Control.prototype.showNotFound = function()  {
    var nf = $('#not-found');
    nf.removeClass('animated fadeOut hide').addClass('animated fadeIn');
    // also hide found if it's out there
    this.hideFound();
    var c = this;
    setTimeout(function()  {
        c.hideNotFound();
    }, 5000);
};

Control.prototype.hideNotFound = function() { 
    var nf = $('#not-found');
    nf.removeClass('animated fadeIn').addClass('animated fadeOut');
    setTimeout(function() { 
        nf.addClass('hide');
    }, 100);
};

Control.prototype.continueButton = function(state) { 
    if (state === 'show') { 
        $('#time-continue').removeClass('hide').removeClass('animated');
    } else { 
        $('#time-continue').addClass('hide');
    }
};

Control.prototype.showFound = function(data, date)  {
    var found = $('#found');
    found.find('.content').html(data.content); 
    found.find('#ymy-prefix').html('');
    if (data.prefix) { 
        found.find('#ymy-prefix').html(data.prefix);
    } 
    this.hideNotFound();
    found.removeClass('hide').removeClass('animated fadeOut').addClass('animated fadeIn');
    // pause the clock
    this.clock.pause(date);
    // show option to continue
    this.continueButton('show');
};

Control.prototype.hideFound = function() { 
    $('#found').removeClass('animated fadeIn').addClass('animated fadeOut');
    setTimeout(function() {
        $('#found').addClass('hide');
    });
};

Control.prototype.findData = function(date) { 
    var key = this.key(date);
    if (this.data.hasOwnProperty(key)) { 
        this.showFound(this.data[key], date);
        // update the status bar
        this.stateStorage.writeData(key);
        this.stateStorage.update(this.data);
    } else {
        //only activate not found when the button is used
        //this.showNotFound();
    }
};

Control.prototype.loading = function(state) { 
    if (state === 'show') { 
        $('.load-status-indicator').removeClass('hide');
    } else { 
        $('.load-status-indicator').addClass('hide');
    }
};

Control.prototype.key = function(date) { 
    //var ds = '' + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + 'T',
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        mins = date.getMinutes(),
        secs = date.getSeconds();
    if (month < 10) { month = "0" + month; }
    if (day < 10) { day = "0" + day; }
    if (hour < 10) { hour = "0" + hour; }
    if (mins < 10) { mins = "0" + mins; }
    if (secs < 10) { secs = "0" + secs; }
    var ds = "" + year + '-' + month + '-' + day + 'T' + hour + ':' + mins + ':' + secs;
    return ds;
}

Control.prototype.pause = function(date)  {
    this.clock.pause(date);
};

Control.prototype.unpause = function() { 
    this.clock.unpause();
};

// pulls the datetime for the date and time pickers
// resets seconds to 0
Control.prototype.refreshDatetime = function()  {

    var ds = this.dateChooser.val(),
        dsComps = ds.split('-'),
        day = dsComps[0],
        month = dsComps[1],
        year = dsComps[2],
        ts = this.timeChooser.val(),
        tsComps = ts.split(':'),
        hour = tsComps[0],
        minute = tsComps[1],
        seconds = 0,
        date = new Date(year, month-1, day, hour, minute, seconds);

    // if nothing exists, just display the not-found
    if (this.data && !this.data.hasOwnProperty(this.key(date))) { 
        this.showNotFound();
    }

    this.setDatetime(date);
};

var StateStorage = function() { 
    this.key = 'CHET_XMAS_READ';
};

StateStorage.prototype.readData = function() { 
    return $.jStorage.get(this.key, []);
};

StateStorage.prototype.writeData = function(dataKey) { 
    var data = this.readData();
    // make sure that dataKey doesn't already exist in data
    var existing = data.filter(function(el, idx){
        return el === dataKey;
    });
    if (existing && existing.length === 0) { 
        data.push(dataKey);
        $.jStorage.set(this.key, data);
    }
};

StateStorage.prototype.update = function(allData) { 
    var data = this.readData();
    $('#num-read').html(data.length);
    var count = 0;
    for (var d in allData) { 
        if (allData.hasOwnProperty(d)) { 
            count++;
        }
    }
    $('#num-remaining').html(count - data.length);
};


function chooserButtonToggle(el, panel, control) { 
    el.on('click', function() {

        if (el.hasClass('active')) { 

            el.removeClass('active').removeClass('btn-info').addClass('btn-default');
            panel.removeClass('fadeInDown');
            panel.addClass('animated fadeOutUp');
            setTimeout(function() { 
                panel.addClass('hide');
            }, 500);
            el.html('\u5F00\u59CB');
            // sets the time and queries
            control.refreshDatetime();

        } else { 
            el.addClass('active').removeClass('btn-default').addClass('btn-info');
            el.html('\u626D\u8F6C\u65F6\u7A7A!');
            panel.removeClass('fadeOutUp');
            panel.removeClass('hide').addClass('animated fadeInDown');
            control.hideFound();
            control.continueButton('hide');
        }
    });

    $('#time-continue').on('click', function() { 
        control.hideFound();
        $(this).addClass('animated fadeOut').addClass('hide');
        control.unpause();
    });
};

(function($) { 

    $(document).ready(function() {

        var cl = new Clock($('.clock')),
            dd = new DateDisplay($('.date-container')),
            ss = new StateStorage(),
            control = new Control(
                cl, dd, 
                $('.bfh-timepicker input[type=text]'),
                $('.bfh-datepicker input[type=text]'),
                ss
                );

        cl.observer = control;
        window.ymyControl = control;

        // set the default datetime first
        chooserButtonToggle($('#chooser-init'), $('#chooser-row'), control);

        control.queryData()
            .then(function(data) { 
                control.setData(data);
                control.setDatetime(new Date());
                control.loading('hide');

                ss.update(data);

            });

    });

})(jQuery);
