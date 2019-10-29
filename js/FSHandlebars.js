

function markupHelpersCallback() {
    // registering helper to allow advanced if's in Handlebars templates and global variable scope access.
    // using a dedicated callback for this which is called when Handlebars is ready and we can register helpers
    Handlebars.registerHelper('iff', function(lvalue, operator, rvalue, options) {
        if (window.hasOwnProperty(rvalue)) rvalue = window[rvalue];

        var functions = {
            '==':       function(l,r) { return l == r; },
            '===':      function(l,r) { return l === r; },
            '!=':       function(l,r) { return l != r; },
            '<':        function(l,r) { return l < r; },
            '>':        function(l,r) { return l > r; },
            '<=':       function(l,r) { return l <= r; },
            '>=':       function(l,r) { return l >= r; },
            'typeof':   function(l,r) { return typeof l === r; }
        };

        if (!functions.hasOwnProperty(operator)){
            throw new Error(`Handlerbars Helper 'iff' doesn't know the operator ${operator}`);
        }

        var result = functions[operator](lvalue,rvalue);

        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });

    //allows for row stripes
    Handlebars.registerHelper('everyOther', function (index, amount, scope) {
        if ( ++index % amount)
            return scope.inverse(this);
        else
            return scope.fn(this);
    });

    Handlebars.registerPartial('pricing', document.getElementById('pricing-partial').innerHTML);
    Handlebars.registerPartial('quantity', document.getElementById('quantity-partial').innerHTML);
}


const FSGlobal = {};
function dataCallback(obtainedData) {
    // function which is called on each change of the order data
    FSGlobal.data = obtainedData;
    console.log('CALLBACK', obtainedData);
    if (!obtainedData.groups.length) {
        $(`<div class='well'>No homepage products found</div>`).appendTo('div.container');
    }
}

function errorCallback(code, string) {
    if (code === 0) {
        // Incorrect storefrontId set
        // Prompt user to input it again
        $('#error-placeholder').show();
    } else if (code === 400) {
        alert('Problem updating session. Check payload and/or access key.');
    }
    console.log('Error: ', code, string);
}

function beforeRequestsCallback() {
    // show/hide loading indicator based on before and after requests
    $('#overlay').fadeIn();
}

function afterRequestsCallback() {
    //hide the overlay after loading
    if ($('#overlay')) {
        $('#overlay').fadeOut();
    }

}

function afterMarkupCallback() {
    //load the debug bar and get to the right page
    if (typeof loaded === 'undefined') {
        loaded = true;
        hashlocation();
    }
}

function decorateURLFunction(url) {
    return url;
}
