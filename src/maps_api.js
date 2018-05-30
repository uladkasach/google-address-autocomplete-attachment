var load_resources = require("js-resource-loader");
var Api = function(api_key){
    /*
        initialize all api objects
    */
    if(typeof api_key == "object"){
        var frame_src = api_key["src"];
        var api_key = api_key["key"];
    }
    this.promise_initialized = this.promise_to_initialize(api_key, frame_src);
}
Api.prototype = {
    promise_to_initialize : async function(api_key, frame_src){
        var google = await load_resources('https://maps.googleapis.com/maps/api/js?key='+api_key+'&libraries=places', "google", frame_src);
        this.services = {
            autocomplete : new google.maps.places.AutocompleteService(),
            places : new google.maps.places.PlacesService(document.createElement('div')),
            geocoder : new google.maps.Geocoder(),
        }
    },
    /*
        google api wrappers
    */
    promise_autocomplete_suggestions : async function(search_string){
        await this.promise_initialized; // ensure that services are defined.
        if(search_string == "") return [];
        var promise_predictions = new Promise((resolve, reject)=>{
            this.services.autocomplete.getPlacePredictions({input:search_string, types:["address"]}, function(list, status){
                if(list==null) resolve([]);
                resolve(list);
            });
        })
        return promise_predictions;
    },
}
module.exports = Api;