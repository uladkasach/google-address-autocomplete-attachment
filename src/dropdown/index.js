var view_loader = require('clientside-view-loader');
module.exports = async function(build_options){
    return view_loader.load(env.script_location.origin + env.script_location.pathdir).build(build_options);
}
