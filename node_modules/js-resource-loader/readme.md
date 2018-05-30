# js-resource-loader

This is a module that enables a convenient way to load external js resources dynamically and with scope. Instead of importing the contents of a script into the global scope, it loads the contents into an iframe and then extracts the contents a user specifically requests.

*Note: this module was built to be loaded on the clientside with [`clientside-require`](https://github.com/uladkasach/clientside-require);*

`npm install js-resource-loader --save`

### Example

Loading the google maps api without polluting your global scope:
```js
(async function(){
    var load_resources = await load('js_resource_loader'); // the `load()` function is provided by `clientside-require`
    var google = await load_resources('https://maps.googleapis.com/maps/api/js?key=AIzaSyC_ymlgPnlMmPFzUFhJrRa0vivYGVGCSEE&libraries=places', "google");
})()
```
or equivalently

```js
var promise_google = load('js_resource_loader')
    .then(load_resources=>{
        return load_resources('https://maps.googleapis.com/maps/api/js?key=AIzaSyC_ymlgPnlMmPFzUFhJrRa0vivYGVGCSEE&libraries=places', "google")
    })
```

# Usage
```js
load_resources(path, extraction_list, frame_src)
```

### Path
Path is the url you would use in your browser to reach the resource manually. I.e., if you're not sure you have the right path, plug it into your url bar.

### Extraction List
Extraction list is an array of key_strings which should be extracted from the environment the script is loaded into.

Note: if you only have one key you would like extracted, you can just pass the key string instead of an array.

### Frame Src (optional)
If frame src is defined, then the iframe is loaded with the SRC as the contents. This may be useful when you need to load a script from a particular domain. (e.g., google looks for specific domains in which it authorizes the usage of certain api keys)
