module.exports = function(dom, options){
    var suggestion_template = dom.querySelector(".pac-item");
    var results_holder = dom.querySelector(".pac-results");


    dom.show = function(){
        dom.style.display = "block";
    }
    dom.hide = function(){
        dom.style.display = "none";
    }
    dom.show_if_possible = function(current_place_id){
        if(results_holder.children.length == 0) return; // dont show if nothing to show
        if(results_holder.children.length == 1 && results_holder.children[0].value.place_id == current_place_id) return; // do not show if the only option is already written
        dom.show();
    }
    dom.update = function(suggestions){
        results_holder.innerHTML = ""; // clear the old display
        suggestions.forEach((suggestion)=>{
            try{
                var suggestion = create_suggestion_element(suggestion, suggestion_template);
                suggestion.onclick = function(){
                    if(typeof dom.on_selection == "function") dom.on_selection(suggestion.value.description, suggestion.value.place_id);
                }
            } catch (err){
                console.error(err);
            }
            results_holder.appendChild(suggestion);
        })
    }

    dom.append_below = function(input_element){
        dom.style.marginTop = input_element.offsetHeight;
        input_element.parentNode.appendChild(dom) // insert as sibling

        // TODO - add keybinds which listen for ENTER and DOWN/UP arrow keys
    }

    return dom;
}

var create_suggestion_element = function(suggestion, template){
    var element = template.cloneNode(true);
    var text = suggestion.description;
    var styled_text = style_based_on_matches(text, suggestion.matched_substrings)
    element.querySelector(".pac-text").innerHTML = styled_text;
    element.setAttribute('place_id', suggestion.place_id);
    element.value = {description : suggestion.description, place_id : suggestion.place_id};
    return element;
}

var style_based_on_matches = function(text, matched_substrings){
    /*
        we must style the string according to query matches.
    */
    // 0. get the match indicies; format offset, length into index start and stop of match
    var match_indicies = [];
    matched_substrings.forEach((match)=>{ match_indicies.push([match.offset, match.offset+match.length]); })

    // 1. split the string into segments before and after each query slice; mark each slice as a match or not a match
    var last_end_index = 0;
    var slices = [];
    var match_bools = [];
    match_indicies.forEach((match)=>{
        // get before slice
        var before_slice = text.slice(last_end_index, match[0]); // get all characters up to the match since the last character considered
        slices.push(before_slice); // record this slice
        match_bools.push(false); // record that slice was not a match

        // get query slice
        var query_slice = text.slice(match[0], match[1]); // get all characters in the match;
        slices.push(query_slice); // record this slice
        match_bools.push(true); // record that slice WAS a match

        // update ending index
        last_end_index = match[1]; // update last end index
    })
    // get final slice
    var final_slice = text.slice(last_end_index, text.length) // ensure that we go all the way to end of string, even after all matches
    slices.push(final_slice); // record slice
    match_bools.push(false); // record taht it was not a match

    // 2. wrap each matched slice in  <span class="pac-matched"></span> if relevant
    var wrapped_slices = [];
    var is_slice_numeric_bool = []; // keep track of whether each slice is numeric; used later
    slices.forEach((slice, index)=>{
        is_slice_numeric_bool.push(isNaN(parseInt(slice)));
        if(match_bools[index] === true) slice = '<span class="pac-matched">' + slice + '</span>'; // if slice was a match, wrap it
        wrapped_slices.push(slice);
    })

    // 3. for each wrapped slice, if is a match, get up to the next "," (if text) and " " (if number) and add it to the match slice from the other slice
    var full_slices = [];
    for(var i = 0; i<wrapped_slices.length; i++){
        var this_slice = wrapped_slices[i];
        var this_match = match_bools[i];
        var this_slice_is_numeric = is_slice_numeric_bool[i] ;
        if(this_match !== true){ // if this slice is not a match
            full_slices.push(this_slice); // just add the slice
            continue; // and do nothing more
        }

        // if it is a matched slice, look into the next slice to see which part of it is related to this part (e.g., "N", "orth College Ave, Indianapolis" -> "orth College Ave" is relevant)
        var search_delimeter = (this_slice_is_numeric)? " ": ","; // if numeric, delimit by " ", else by ","
        var next_slice = wrapped_slices[i+1]; // grab the next slice
        var slice_parts = next_slice.split(search_delimeter); // split by search delimeter
        var relevant_part = slice_parts[0]; // the first is relevant; add the delimeter to relevant part
        var not_relevant_part = slice_parts.slice(1).join(search_delimeter); // all other than the first

        // append the relevant part to this slice; append it to slice list
        this_slice = this_slice + relevant_part;
        full_slices.push(this_slice);

        // append the not relevant part to the slice list; increment index to show that we considered the next part already
        i++; // icnrement index to show that we already considered the next part
        full_slices.push(not_relevant_part);
    }

    // 4. wrap each full slice in <span class="pac-item-query"></span> if relevant
    var final_slices = [];
    full_slices.forEach((slice, index)=>{
        if(match_bools[index] === true) slice = '<span class="pac-item-query">' + slice + '</span>'; // if slice was a match, wrap it
        final_slices.push(slice);
    })

    // combine all slices and return the styled text
    return final_slices.join("");
}
