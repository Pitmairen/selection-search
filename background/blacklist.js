
var Blacklist = new function(){

    var _blacklistDefinition = [];
    var _blacklist = undefined;


    this.setDefinitions = function(definitions){
        _blacklistDefinition = definitions;
        _blacklist = _parseDefinitions(definitions);
    }

    this.getBlacklist = function(){
        return _blacklist;
    }

    function _parseDefinitions(definitions){

        if(definitions.length === 0){
            return undefined;
        }

        var hostnames = {};

        var addDef = function(definition, path){
            if(!(definition in hostnames)){
                hostnames[definition] = [];
            }
            if (path !== undefined){
                hostnames[definition].push(path);
            }
        }

        for(var i=0; i < definitions.length; i++){
            var definition = definitions[i];
            if(definition.startsWith('//')){ // Comment
                continue;
            }
            if(definition.indexOf('/') !== -1){
                var [host, ...path] = definition.split('/')
                addDef(host, '/' + path.join('/'));
            }else{
                addDef(definition, '/');
            }
        }

        return {hostnames: hostnames};
    }
}
