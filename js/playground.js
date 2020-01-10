/*
    MIT License

    Copyright (c) 2019 FastSpring

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.


    Sessions playground - by Javier Trujillo
 */


window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    const spinner = document.getElementById('spinner');
    const popupFormCustomerInfo = document.getElementById('popupFormCustomerInfo');
    const popupFormPricing = document.getElementById('popupFormPricing');
    const popupFormSecurePayload = document.getElementById('popupFormSecurePayload');
    const updateCustomerInfo = document.getElementById('updateCustomerInfo');
    const popupFormStorefront = document.getElementById('popupFormStorefront');
    const updatePrice = document.getElementById('updatePrice');
    const addSecurePayload = document.getElementById('addSecurePayload');
    const storefronts = document.getElementById('storefronts');

    /* When page loads make sure we create the Options available for the current storefront */
    if (localStorage.getItem('storefrontToUse')) {
        $('#storefrontId').val(localStorage.getItem('storefrontToUse'));
    }
    if (localStorage.getItem('accessKeyToUse')) {
        $('#accessKey').val(localStorage.getItem('accessKeyToUse'));
    }

    function addStorefront(storefront) {
        let storename = storefront;
        // Prettify storefront names for user
        if (storefront === 'fastspringexamples.test.onfastspring.com/popup-fastspringexamples') {
            storename = 'Example popup storefront';
        } else if (storefront === 'fastspringexamples.test.onfastspring.com') {
            storename = 'Example web storefront';
        }
        const option = $(`
            <div class="form-check">
               <input class="form-check-input" type="radio" name="radio-storefront" value="${storefront}">
               <label class="form-check-label" for="exampleRadios1">
                   ${storename}
               </label>
           </div>
        `);
        $('#storefronts').append(option);
    }

    config.storefronts.forEach(function(storefront) {
        addStorefront(storefront);
    });

    var currentStorefront = localStorage.getItem('storefrontToUse');
    if (currentStorefront && (config.storefronts.indexOf(currentStorefront) == -1)) {
        addStorefront(currentStorefront);
    }

    for (var i = 0; i < storefronts.elements.length; i++) {
        const val = storefronts.elements[i].value
        if (storefronts.elements[i].value === storefrontToUse) {
            storefronts.elements[i].checked = true;
        }
    }

    // Reload page with new storefront
    storefronts.addEventListener('change', function (event) {
        window.localStorage.setItem('storefrontToUse', event.target.value);
        window.location.reload();
    }, false);

    /*
     * Custom payload for customer information
     */
    document.getElementById('AddCustomerInfoBtn').onclick = function () {
        $('#updateCustomerInfo').modal('hide');
        const method = $('#customerTabs a[data-toggle="tab"].active')[0].id;
        const payload = {
            email: popupFormCustomerInfo.email.value,
            firstName: popupFormCustomerInfo.fname.value,
            lastName: popupFormCustomerInfo.lname.value
        };
        if (method === 'secure') {
            fastspring.builder.secure({ contact: payload });
        } else {
            fastspring.builder.recognize(payload);
        }
    };
    document.getElementById('customerInfo').onclick = function () { 
        onCustomerInfoChange();
    };
    $('#customerTabs a[data-toggle="tab"]').on('shown.bs.tab', function () {
        onCustomerInfoChange();
    });

    /*
     * Custom payload for pricing
     */
    document.getElementById('UpdatePricingBtn').onclick = function () {
        $('#updatePricing').modal('hide');
        applyCustomPrice(popupFormPricing.product.value, popupFormPricing.customPrice.value);
    };
    document.getElementById('customPricing').onclick = function () {
        let product;
        // Create options in product selector
        document.popupFormPricing.product.options.length = 0;
        var k = 0;
        const { data } = FSGlobal;
        for (var i = 0; i < data.groups.length; i++) {
            for (var j = 0; j < data.groups[i].items.length; j++) {
                document.popupFormPricing.product.options[k] = new Option(data.groups[i].items[j].display, data.groups[i].items[j].path, false, false);
                // Set product variable to first option 
                if (k === 0) {
                    product = data.groups[i].items[j].path;
                }
                k++;
            }
        }

        // Fill in original body of custom price
        updatePriceSnippet(product, 1);
    };

    /*
     * Custom payload for secure call
     */
    document.getElementById('AddSecurePayloadBtn').onclick = function () {
        $('#addSecurePayload').modal('hide');
        try {
            fastspring.builder.secure(JSON.parse(popupFormSecure.securePayload.value));
        } catch (e) {
            alert('Check that JSON payload is valid');
        }
    };

    // Fill secure payload example snippet with an example call with one of the
    // products of the selected storefronts
    document.getElementById('securePayloadExample').onclick = function () {
        const { data } = FSGlobal;
        const productPath = data.groups[0].items[0].path;
        updateSecurePayloadSnippet(productPath);
    };
});

/*  setCustomStorefront
 *  Double check that the storefront added has a correct regex.
 *  Update localstorage and reload page so that the new storefront takes over.
 */
function setCustomStorefront() {
    if (popupFormStorefront.checkValidity()) {
        const storeFrontToUse = popupFormStorefront.storefrontId.value;
        const regex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(\/[a-z0-9-]*)?$/;
        if (!regex.test(storeFrontToUse)) {
            $('#error-storefrontId').removeClass('hidden');
            return false;
        }
        $('#updateStorefront').modal('hide');
        window.localStorage.setItem('storefrontToUse', storeFrontToUse.replace(/^https?:\/\//, ''));
        window.localStorage.setItem('accessKeyToUse', popupFormStorefront.accessKey.value);
        window.location.reload();
        return false;
    }
};



/*  checkoutDecision
 *  Determines wether we proceed directly to checkout or show interstitial page
 */
function checkoutDecision() {
    foundSelectables = false;
    const { data } = FSGlobal;
    data.groups.forEach(function(group) {
        if (group.selectableAdditions && group.driverType == 'product') {
            foundSelectables = true;
        }
        group.items.forEach(function(item) {
            if (item.selectableReplacements) {
                foundSelectables = true;
            }
        });
    });
    if (!foundSelectables) {
        fastspring.builder.checkout();
    } else {
        showInterstitial();
    }
}

/**************** SNIPPETS *******************/

function updateCustomerInfoSnippet(firstName, lastName, email, method) {
    let snippet = {
        firstName,
        lastName,
        email
    };
    if (method === 'secure') {
        snippet = { recipient: snippet };
    }
    $('#customerSnippet').html(`
const payload = ${JSON.stringify(snippet, undefined, 3)};
fastspring.builder.${method}(payload);`);
}


function updatePriceSnippet(product, price) {
    const snippet = {
        items: [{
            product,
            quantity: 1,
            pricing: {
                price: {
                    'USD': price
                }
            }
        }]
    };
    $('#priceSnippet').html(`
const payload = ${JSON.stringify(snippet, undefined, 3)};
fastspring.builder.secure(payload);`);
}

function updateSecurePayloadSnippet(product) {
    const snippet = {
        contact: {
            email: 'john.doe@email.com',
            firstName: 'John',
            lastName: 'Doe'
        },
        items: [{
            product,
            quantity: 4,
            pricing: {
                price: {
                    USD: 50
                }
            }
        }],
        country: 'de'

    };
    popupFormSecure.securePayload.value = JSON.stringify(snippet, undefined, 3);
}


function onPriceChange() {
    updatePriceSnippet(popupFormPricing.product.value, popupFormPricing.customPrice.value);
}

function onCustomerInfoChange() {
    const method = $('#customerTabs a[data-toggle="tab"].active')[0].id;
    updateCustomerInfoSnippet(popupFormCustomerInfo.fname.value, popupFormCustomerInfo.lname.value, popupFormCustomerInfo.email.value, method);
}

/*
 * When an upsell is bought the driver item that it replaces gets deteled from the session.
 * This function avoids blank pages in the "one product" section of the app when an item it's replaced by its upsell.
 * It will add the upsell to the session and redirect the user back to the main page.
 */
function addUpsell(el) {
    fastspring.builder.add(el.getAttribute('data-fsc-item-path-value'));
    window.location.hash = '';
}

/* We need to manually call the update function of SBL to update the price of ALL the instances
 * in the page of this product. If we were to make use of HTML tags to do that it would update the first instance SBL would find in the page.
 * If you were in the product page it wouldn't update correctly.
 * *
 */
function updatePriceSelector(el) {
    fastspring.builder.update(el.attributes['data-fsc-item-path'].value, el.value);
}

/*
 * Finds the hash (#product) location and shows the main screen or the specific product.
 * If no product found, it goes to main screen.
 */
function hashlocation() {
    if (window.location.hash.length < 2) {
        $("#one-product").fadeOut();
        $("#interstitial").fadeOut();
        $("#all-products").fadeIn();
    } else {
        const product = window.location.hash.substr(1);
        if (productExists(product)) {
            const filter = { path: product };
            fastspring.builder.Recompile('one-product', filter);
            $("#all-products").fadeOut();
            $("#intrestitial").fadeOut();
            $("#one-product").fadeIn();
        } else {
            $("#one-product").fadeOut();
            $("#interstitial").fadeOut();
            $("#all-products").fadeIn();
        }
    }
    return true;
}

window.onhashchange = hashlocation;

function applyCustomPrice(product, price) {
    const payload = {
        items: [{
            product: product,
            quantity: 1,
            pricing: {
                price: {
                    USD: price
                }
            }
        }]
    };
    fastspring.builder.secure(payload);
}

/* Checkout function
 * When click we call the checkout method of SBL. We need to make sure that the
 * view is update correctly for a nice user experience.
 * Depending on the type of storefront selected, it will show the popup or redirect to a
 * webstorefront with a session created.
 */ 
function checkout() {
    $("#shopping-cart").show();
    $("#interstitial").fadeOut();
    $("#one-product").fadeOut();
    $("#all-products").fadeIn();
    // Call the checkout function from the API directly
    fastspring.builder.Checkout();
}

/* Add event listener to apply coupons to the checkout
*/
window.applyPromoCode = function() {
    var code = document.getElementById('couponField').value;
    fastspring.builder.Promo(code);
};


/* Utility functions
 */

/* Set the width of the side navigation to 250px */
function openNav() {
  document.getElementById("sidenav").style.width = "250px";
}
/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("sidenav").style.width = "0";
}


var foundSelectables = false;
function productExists(product) {
    //check if the product is in the json payload.
    var exists = false;
    const { data } = FSGlobal;
    for (var i=0; i<data.groups.length; i++) {
        for (var j=0; j<data.groups[i].items.length; j++) {
            if (data.groups[i].items[j].path == product) { exists = true; break; }
        }
    }
    return exists;
}

/* Interstitial functions.
 * Some products contain product offers (up-sell and cross-sells).
 * Before the checkout is performed we will show an interstitial page with such
 * products so that the buyer can have the chance to add them to the cart and complete the purchase.
 */
function showInterstitial() {
    $("#all-products").fadeOut();
    $("#one-product").fadeOut();
    $("#shopping-cart").hide();
    $("#interstitial").fadeIn();
}

function hideInterstitial() {
    $("#interstitial").fadeOut();
    $("#shopping-cart").show();
    $("#all-products").fadeIn();
}

/*
 * JQuery miscellaneous functions
 */

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
    'use strict';
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
            form.addEventListener('submit', function(event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();

// Make tooltips work
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

/* Prevent default submit on forms when pressing Enter key */
$('form input').keydown(function(event){
    if(event.keyCode == 13) {
        event.preventDefault();
        return false;
    }
});
