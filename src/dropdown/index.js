var view_loader = require('clientside-view-loader');
module.exports = async function(build_options){
    return view_loader.load(window.script_location.origin + window.script_location.pathdir).build(build_options);
}
