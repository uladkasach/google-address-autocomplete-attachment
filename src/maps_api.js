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
        // TODO - enable , types:["address"]
        var promise_predictions = new Promise((resolve, reject)=>{
            this.services.autocomplete.getPlacePredictions({input:search_string}, (list, status)=>{
                if(list==null) resolve([]);
                resolve(list);
            });
        })
        return promise_predictions;
    },
    promise_place_from_place_id : async function(place_id){
        await this.promise_initialized; // ensure that services are defined
        if(typeof place_id !== "string") throw new Error("place id must be a string");
        var promise_place = new Promise((resolve, reject)=>{
            this.services.places.getDetails({placeId:place_id}, (place, status)=>{
                if(status !== "OK") throw new Error("place could not be found");
                resolve(place);
            })
        })
        return promise_place;
    }
}
module.exports = Api;
