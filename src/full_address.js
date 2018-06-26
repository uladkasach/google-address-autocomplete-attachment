var Api = require("./maps_api.js"); // import the api
var build_dropdown = require("./dropdown/index.js");

var Full_Address_Autocomplete = function(input_element, api_key){
    // define the api
    this.api = new Api(api_key);

    // define input element
    this.input_element = input_element;

    // normalize request
    if(typeof options == "undefined") options = {dropdown : true, on_blur : true, on_enter : true};

    // fulfill request
    if(options.dropdown===true) this.promise_dropdown = this.append_dropdown(input_element);

    // append listeners
    input_element.addEventListener('focus', this.handle_focus.bind(this));
    input_element.addEventListener('input', this.handle_input.bind(this));
    input_element.addEventListener('blur', this.handle_blur.bind(this));

    // append selection tracker; do not let updates overwrite user selection
    this.selection_was_made = false;

    // define initial state for suggestiosn
    this.suggestions = [];

    // define whether input has changed since last focus, used to minimize requests "on focus";
    this.input_changed_since_focus = false;
}
Full_Address_Autocomplete.prototype = {
    /*
        data extraction methods
    */
    extract_address_data : async function(type_mappings){
        var place_id = this.input_element.getAttribute('place_id');
        var place = await this.api.promise_place_from_place_id(place_id);
        var address = this.map_address_object_by_keys(place.address_components, type_mappings); // map the ugly google address_components structure into {key:value,...} format
        return address;
    },
    map_address_object_by_keys : function(address_components, type_mappings){ // converts google's ugly address data structure to {key:value}
        if(typeof type_mappings != "object") type_mappings = {}; // set default as empty
        var mapped_address = {};
        address_components.forEach((component)=>{
            let type = component.types[0]; // default type is first type
            if(typeof type_mappings[type] == "string") type = type_mappings[type]; // e.g., enable mapping `administrative_area_level_1` to `state`
            mapped_address[type] = component.long_name;
        })
        return mapped_address;
    },

    /*
        action methods
    */
    handle_focus : async function(){
        if(this.input_changed_since_focus === true) await this.update_suggestions();
        this.input_changed_since_focus = false;
        if(typeof this.dropdown == "object") this.dropdown.show_if_possible(this.input_element.getAttribute("place_id")); // pass the input element value so that IF only suggestion is same as current value, dont show it
    },
    handle_input : async function(){
        this.selection_was_made = false; // user has inputted new content and any selection was undone
        await this.update_suggestions();
        this.dropdown.show_if_possible();
    },
    handle_blur : function(){
        if(typeof this.dropdown == "object") this.dropdown.hide(); // hide the dropdown
        if(this.selection_was_made == false) this.select_top_choice(); // if no selection was made, select the top choice
    },
    handle_selection : function(description, place_id){
        this.selection_was_made = true;
        this.dropdown.hide();
        this.update_selection(description, place_id);
    },


    /*
        utility:
    */
    update_selection : function(description, place_id){
        this.input_element.value = description;
        this.input_element.setAttribute("place_id", place_id)
        this.input_changed_since_focus = true;
    },
    select_top_choice : function(){
        if(this.suggestions.length == 0) return; // there is no top choice
        var top_choice = this.suggestions[0];
        this.update_selection(top_choice.description, top_choice.place_id);
    },

    /*
        data retreival
    */
    update_suggestions : async function(){
        // get value
        var raw_input = this.input_element.value;

        // request suggestions
        try{
            var suggestions = await this.api.promise_autocomplete_suggestions(raw_input);
        } catch (err){
            console.error(err);
            suggestions = [];
        }
        this.suggestions = suggestions;

        // display suggestions
        if(typeof this.dropdown == "object") this.dropdown.update(suggestions); // NOTE : update automcatically displays the dropdown if it was hidden and hides it if there is no input
    },

    /*
        dropdown handlers
    */
    append_dropdown : async function(input_element){
        var dom = await build_dropdown();
        dom.append_below(input_element);
        dom.on_selection = this.handle_selection.bind(this);
        dom.onmousedown = function(event){
            event.preventDefault(); // prevent the onblur event from firing
        }.bind(this)
        this.dropdown = dom;
    },
}

module.exports = Full_Address_Autocomplete;
