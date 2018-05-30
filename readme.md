# google-address-autocomplete-attachment

Add the google address autocomplete dropdown to any text input, opensource. 

Effectively, this module re-implements the dropdown created by a google api in an open source fashion.  

# Usage

`npm install google-address-autocomplete-attachment`

```js
(async function(){
    var Autocomplete = await load("/_controller/google_maps/autocomplete/full_address.js"); // load is provided by clientside-require
    var autocomplete = new Autocomplete(document.querySelector('input'), api_key);
    console.log(autocomplete);
})()
```

*Note : this module is dependent on clientside require statements, and tested with the [`clientside-require`](https://github.com/uladkasach/clientside-require) module*


### Restricted Domains for API Key
Google offers the ability to restrict the domains on which the api key can work. To resolve this, we can load the google api script in a frame that is sourced from a page on your server.

This module uses the `js-resource-loader` module to load the google api in a private scope. The `js-resource-loader` loads the google api in an iframe. By defining that that iframe should open a page on your domain before loading the script, the domain of the iframe will be your domain. This will satisfy google.

To do so, replace `api_key` with an object:
```js
{
    key : api_key,
    src : "https://your_domain.com/blank/page.html",
}
```

Where `src` is the url of the page on your domain you wish to load the script into.

##### Full Example:
```js

(async function(){
    var Autocomplete = await load("/_controller/google_maps/autocomplete/full_address.js"); // load is provided by clientside-require
    var autocomplete = new Autocomplete(document.querySelector('input'), {
        key : api_key,
        src : "https://your_domain.com/blank/page.html",
    });
    console.log(autocomplete);
})()
```
