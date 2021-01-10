/**an array of paths for NG states short codes with batch extention uppercase */
exports.states_short_paths_batch_uc = ['/AB/:batch([0-9]{2})', '/AD/:batch([0-9]{2})', '/AK/:batch([0-9]{2})', '/AN/:batch([0-9]{2})', '/BA/:batch([0-9]{2})', '/BY/:batch([0-9]{2})', '/BN/:batch([0-9]{2})', '/BO/:batch([0-9]{2})', '/CR/:batch([0-9]{2})', '/DT/:batch([0-9]{2})', '/EB/:batch([0-9]{2})', '/ED/:batch([0-9]{2})', '/EK/:batch([0-9]{2})', '/EN/:batch([0-9]{2})', '/FC/:batch([0-9]{2})', '/GM/:batch([0-9]{2})', '/IM/:batch([0-9]{2})', '/JG/:batch([0-9]{2})', '/KD/:batch([0-9]{2})', '/KN/:batch([0-9]{2})', '/KT/:batch([0-9]{2})', '/KB/:batch([0-9]{2})', '/KG/:batch([0-9]{2})', '/KW/:batch([0-9]{2})', '/LA/:batch([0-9]{2})', '/NS/:batch([0-9]{2})', '/NG/:batch([0-9]{2})', '/OG/:batch([0-9]{2})', '/OD/:batch([0-9]{2})', '/OS/:batch([0-9]{2})', '/OY/:batch([0-9]{2})', '/PL/:batch([0-9]{2})', '/RV/:batch([0-9]{2})', '/SO/:batch([0-9]{2})', '/TR/:batch([0-9]{2})', '/YB/:batch([0-9]{2})', '/ZM/:batch([0-9]{2})'];

/**an array of paths for NG states short codes with batch extention lowercase */
exports.states_short_paths_batch_lc = ['/ab/:batch([0-9]{2})' , '/ad/:batch([0-9]{2})', '/ak/:batch([0-9]{2})', '/an/:batch([0-9]{2})', '/ba/:batch([0-9]{2})', '/by/:batch([0-9]{2})', '/bn/:batch([0-9]{2})', '/bo/:batch([0-9]{2})', '/cr/:batch([0-9]{2})', '/dt/:batch([0-9]{2})', '/eb/:batch([0-9]{2})', '/ed/:batch([0-9]{2})', '/ek/:batch([0-9]{2})', '/en/:batch([0-9]{2})', '/fc/:batch([0-9]{2})', '/gm/:batch([0-9]{2})', '/im/:batch([0-9]{2})', '/jg/:batch([0-9]{2})', '/kd/:batch([0-9]{2})', '/kn/:batch([0-9]{2})', '/kt/:batch([0-9]{2})', '/kb/:batch([0-9]{2})', '/kg/:batch([0-9]{2})', '/kw/:batch([0-9]{2})', '/la/:batch([0-9]{2})', '/ns/:batch([0-9]{2})', '/ng/:batch([0-9]{2})', '/og/:batch([0-9]{2})', '/od/:batch([0-9]{2})', '/os/:batch([0-9]{2})', '/oy/:batch([0-9]{2})', '/pl/:batch([0-9]{2})', '/rv/:batch([0-9]{2})', '/so/:batch([0-9]{2})', '/tr/:batch([0-9]{2})', '/yb/:batch([0-9]{2})', '/zm/:batch([0-9]{2})'];

let years = parseInt(new Date(Date.now()).getFullYear().toFixed().slice(2, 4));
let yearrange = '(' + (years - 1).toString() + '|' + years.toString() + ')';
/**regex in string of paths for NG states short codes with batch */
exports.states_short_paths_batch_regex_stringed = '/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:batch_stream((' + yearrange /*(18|19)*/ + '([abcACB])))'

/**an array of paths for NG states short codes UPPERCASE */
exports.states_short_paths_uc = ['/AB', '/AD', '/AK', '/AN', '/BA', '/BY', '/BN', '/BO', '/CR', '/DT', '/EB', '/ED', '/EK', '/EN', '/FC', '/GM', '/IM', '/JG', '/KD', '/KN', '/KT', '/KB', '/KG', '/KW', '/LA', '/NS', '/NG', '/OG', '/OD', '/OS', '/OY', '/PL', '/RV', '/SO', '/TR', '/YB', '/ZM'];
/**an array of paths for NG states short codes LOWERCASE */
exports.states_short_paths_lc = ['/ab', '/ad', '/ak', '/an', '/ba', '/by', '/bn', '/bo', '/cr', '/dt', '/eb', '/ed', '/ek', '/en', '/fc', '/gm', '/im', '/jg', '/kd', '/kn', '/kt', '/kb', '/kg', '/kw', '/la', '/ns', '/ng', '/og', '/og', '/os', '/oy', '/pl', '/rv', '/so', '/tr', '/yb', '/zm'];

/**an array of the NYSC abbrevation standard of all the states in nigeria */
exports.states_short = ['AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BN', 'BO', 'CR', 'DT', 'EB', 'ED', 'EK', 'EN', 'FC', 'GM', 'IM', 'JG', 'KD', 'KN', 'KT', 'KB', 'KG', 'KW', 'LA', 'NS', 'NG', 'OG', 'OD', 'OS', 'OY', 'PL', 'RV', 'SO', 'TR', 'YB', 'ZM'];

/**an array of all the states in nigeria */
exports.states_long = ['ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'FCT - ABUJA', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA', 'KANO', 'KASTINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASSARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'];
