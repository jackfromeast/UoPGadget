function(obj) {
    obj || (obj = {});
    var __t, __p = '', __e = _.escape;
    with (obj) {
        __p += '<div class="log text-muted pt-3">\n                    <h3 data-type="header">Puzzle Categories</h3>\n                </div>\n                <div class="selector">\n                    <select class="form-control" name="category[]" multiple="multiple">\n                        <option value="web" ' +
        __e( category.indexOf('web') >= 0 ? 'selected' : '' ) +
        ' >Web</option>\n                        <option value="pwn" ' +
        __e( category.indexOf('pwn') >= 0 ? 'selected' : '' ) +
        ' >PWN</option>\n                        <option value="crypto" ' +
        __e( category.indexOf('crypto') >= 0 ? 'selected' : '' ) +
        ' >Crypto</option>\n                        <option value="reverse" ' +
        __e( category.indexOf('reverse') >= 0 ? 'selected' : '' ) +
        ' >Reverse</option>\n                        <option value="misc" ' +
        __e( category.indexOf('misc') >= 0 ? 'selected' : '' ) +
        ' >Misc</option>\n                    </select>\n                </div>\n';
    }
    return __p
}