// TODO: join states_short_paths_batch_uc and states_short_paths_batch_lc to be like states_short_paths_batch_regex_stringed

/**DEPRECIATED an array of paths for NG states short codes with batch extention uppercase */
exports.states_short_paths_batch_uc = ['/AB/:year([0-9]{2})', '/AD/:year([0-9]{2})', '/AK/:year([0-9]{2})', '/AN/:year([0-9]{2})', '/BA/:year([0-9]{2})', '/BY/:year([0-9]{2})', '/BN/:year([0-9]{2})', '/BO/:year([0-9]{2})', '/CR/:year([0-9]{2})', '/DT/:year([0-9]{2})', '/EB/:year([0-9]{2})', '/ED/:year([0-9]{2})', '/EK/:year([0-9]{2})', '/EN/:year([0-9]{2})', '/FC/:year([0-9]{2})', '/GM/:year([0-9]{2})', '/IM/:year([0-9]{2})', '/JG/:year([0-9]{2})', '/KD/:year([0-9]{2})', '/KN/:year([0-9]{2})', '/KT/:year([0-9]{2})', '/KB/:year([0-9]{2})', '/KG/:year([0-9]{2})', '/KW/:year([0-9]{2})', '/LA/:year([0-9]{2})', '/NS/:year([0-9]{2})', '/NG/:year([0-9]{2})', '/OG/:year([0-9]{2})', '/OD/:year([0-9]{2})', '/OS/:year([0-9]{2})', '/OY/:year([0-9]{2})', '/PL/:year([0-9]{2})', '/RV/:year([0-9]{2})', '/SO/:year([0-9]{2})', '/TR/:year([0-9]{2})', '/YB/:year([0-9]{2})', '/ZM/:year([0-9]{2})'];

/**DEPRECIATED an array of paths for NG states short codes with batch extention lowercase */
exports.states_short_paths_batch_lc = ['/ab/:year([0-9]{2})' , '/ad/:year([0-9]{2})', '/ak/:year([0-9]{2})', '/an/:year([0-9]{2})', '/ba/:year([0-9]{2})', '/by/:year([0-9]{2})', '/bn/:year([0-9]{2})', '/bo/:year([0-9]{2})', '/cr/:year([0-9]{2})', '/dt/:year([0-9]{2})', '/eb/:year([0-9]{2})', '/ed/:year([0-9]{2})', '/ek/:year([0-9]{2})', '/en/:year([0-9]{2})', '/fc/:year([0-9]{2})', '/gm/:year([0-9]{2})', '/im/:year([0-9]{2})', '/jg/:year([0-9]{2})', '/kd/:year([0-9]{2})', '/kn/:year([0-9]{2})', '/kt/:year([0-9]{2})', '/kb/:year([0-9]{2})', '/kg/:year([0-9]{2})', '/kw/:year([0-9]{2})', '/la/:year([0-9]{2})', '/ns/:year([0-9]{2})', '/ng/:year([0-9]{2})', '/og/:year([0-9]{2})', '/od/:year([0-9]{2})', '/os/:year([0-9]{2})', '/oy/:year([0-9]{2})', '/pl/:year([0-9]{2})', '/rv/:year([0-9]{2})', '/so/:year([0-9]{2})', '/tr/:year([0-9]{2})', '/yb/:year([0-9]{2})', '/zm/:year([0-9]{2})'];

exports.states_short_paths_batch = '/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:year([0-9]{2})'

let years = parseInt(new Date(Date.now()).getFullYear().toFixed().slice(2, 4));
let yearrange = '(' + (years - 1).toString() + '|' + years.toString() + ')';
/**regex in string of paths for NG states short codes with batch */
exports.states_short_paths_batch_regex_stringed = '/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:year_batch((' + yearrange /*(18|19)*/ + '([abcACB])))'

/**an array of paths for NG states short codes UPPERCASE */
exports.states_short_paths_uc = ['/AB', '/AD', '/AK', '/AN', '/BA', '/BY', '/BN', '/BO', '/CR', '/DT', '/EB', '/ED', '/EK', '/EN', '/FC', '/GM', '/IM', '/JG', '/KD', '/KN', '/KT', '/KB', '/KG', '/KW', '/LA', '/NS', '/NG', '/OG', '/OD', '/OS', '/OY', '/PL', '/RV', '/SO', '/TR', '/YB', '/ZM'];
/**an array of paths for NG states short codes LOWERCASE */
exports.states_short_paths_lc = ['/ab', '/ad', '/ak', '/an', '/ba', '/by', '/bn', '/bo', '/cr', '/dt', '/eb', '/ed', '/ek', '/en', '/fc', '/gm', '/im', '/jg', '/kd', '/kn', '/kt', '/kb', '/kg', '/kw', '/la', '/ns', '/ng', '/og', '/og', '/os', '/oy', '/pl', '/rv', '/so', '/tr', '/yb', '/zm'];

exports.states_short_paths = '/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))'

/**an array of the NYSC abbrevation standard of all the states in nigeria */
exports.states_short = ['AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BN', 'BO', 'CR', 'DT', 'EB', 'ED', 'EK', 'EN', 'FC', 'GM', 'IM', 'JG', 'KD', 'KN', 'KT', 'KB', 'KG', 'KW', 'LA', 'NS', 'NG', 'OG', 'OD', 'OS', 'OY', 'PL', 'RV', 'SO', 'TR', 'YB', 'ZM'];

// ABUJA => FCT - ABUJA
/**an array of all the states in nigeria */
exports.states_long = ['ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'ABUJA', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA', 'KANO', 'KASTINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASSARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'];
