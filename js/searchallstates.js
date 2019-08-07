    // http://www.runningcoder.org/jquerytypeahead/demo/ User v1

    // use grouping from http://www.runningcoder.org/jquerytypeahead/demo/ Advanced demo Beer v1
    $.typeahead( {
        input: '#s',
        // order: "asc", // asc or desc // no need for this, we already arrange it from server
        minLength: 1, // Accepts 0 to search on focus, minimum character length to perform a search
        offset: false, // Set to true to match items starting from their first character
        cache: sessionStorage,
        hint: true,
        loadingAnimation: true,
        backdrop: {
            "background-color": "#fff"
        },
        ttl: 3600000, // Cache time to live in ms
        maxItem: 30, // highest number of results to show


        ///////////////////
        /* group: {
            key: 'price',
            template: function (item) {
                if (item.ppa_address) {
                    return `${item.state} [ppa]`
                } else {
                    return `${item.state} [accommodations]`
                }
            }
        },
        dropdownFilter: [{
            key: 'state',
            template: '{{state}}',
            all: 'All states'
        }],
        source: {
            teams: {
                url: '/posts'
            }
        },
        template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{group}}</small>",
                    template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{group}}</small>",
        correlativeTemplate: true, */
        //////////////////////////////////////////////////////////////
        // correlativeTemplate: true,
        group: { // use group to maybe group by LGAs and anything relevant
            template: "{{group}} STATE"
        },
        // template: "{{streetname}} {{ppa_address}} <br> <small class='text-muted text-uppercase'>{{group}}</small>",
        // href: "/search?title={{display}}",

        // Typeahead can also search deep inside an object, just separate the keys with "." like display: ['string', 'deeper.key.level']
        // display: ["streetname", "ppa_address"], // or be specific in the group objects
        emptyTemplate: 'No result for "{{query}}"', //  <a> Put a reminder for when it\'s avaliable or tell them to search for other similar things after giving them similar results </a> 
        dropdownFilter: "All states",
        compression: true,
        source: {
            // group cannot be 'data'
            ABIA: {
                template: function (query, item) {
                    if (item.streetname) {
                        console.log('t', item)
                        var d = moment(item.input_time).fromNow();
                        // var dd = distanceInWordsToNow(new Date(item.input_time), { addSuffix: true });
                        return "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}} (" + d + ")</small>" +
                        "<br> <small class='text-muted text-lowercase'>ACCOMMODATIONS</small>";
                    } else if (item.name_of_ppa) {
                        return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted text-lowercase'>PPA</small>";
                    };
                },
                display: [ 'streetname', 'type', "name_of_ppa", "ppa_address", 'price' ], // what you can search and it autocompletes // 'group' options works but isn't ideal yet because we can't implement // display cannot be a function
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    if (item.name_of_ppa) { // if it's a ppa
                        return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                    } else if (item.rentrange) { // if it's an accommodation
                        return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                    }
                    
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.ABIA'
                }
            },
            ADAMAWA: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.ADAMAWA'
                }
            },
            "AKWA IBOM": {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data."AKWA IBOM"'
                }
            },
            ANAMBRA: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.ANAMBRA'
                }
            },
            BAUCHI: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.BAUCHI'
                }
            },
            BAYELSA: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.BAYELSA'
                }
            },
            BENUE: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.BENUE'
                }
            },
            BORNO: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.BORNO'
                }
            },
            "CROSS RIVER": {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data."CROSS RIVER"'
                }
            },
            DELTA: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.DELTA'
                }
            },
            EBONYI: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.EBONYI'
                }
            },
            EDO: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.EDO'
                }
            },
            EKITI: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.EKITI'
                }
            },
            ENUGU: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.ENUGU'
                }
            },
            "FCT - ABUJA": {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data."FCT - ABUJA"'
                }
            },
            IMO: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.IMO'
                }
            },
            JIGAWA: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.JIGAWA'
                }
            },
            KADUNA: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.KADUNA'
                }
            },
            KANO: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.KANO'
                }
            },
            KASTINA: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.KASTINA'
                }
            },
            KEBBI: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.KEBBI'
                }
            },
            KOGI: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.KOGI'
                }
            },
            KWARA: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.KWARA'
                }
            },
            LAGOS: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.LAGOS'
                }
            },
            NASSARAWA: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.NASSARAWA'
                }
            },
            NIGER: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.NIGER'
                }
            },
            OGUN: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.OGUN'
                }
            },
            ONDO: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.ONDO'
                }
            },
            OSUN: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.OSUN'
                }
            },
            OYO: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.OYO'
                }
            },
            PLATEAU: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.PLATEAU'
                }
            },
            RIVERS: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.RIVERS'
                }
            },
            SOKOTO: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.SOKOTO'
                }
            },
            TARABA: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.TARABA'
                }
            },
            YOBE: {
                template: "{{streetname}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ 'streetname', 'type', 'group' ], // seems 'group' options isn't working
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('acc href', item);
                    return "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" +
                        item.statecode; // sn sc it
                },
                ajax: {
                    url: "/posts",

                    data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                        q: '{{query}}',
                        u: 'te'
                    },

                    path: 'data.YOBE'
                }
            },
            ZAMFARA: {
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                    "<br> <small class='text-muted text-uppercase'>{{type}}</small>",
                display: [ "name_of_ppa", "ppa_address" ],
                // Be careful as item properties might contain Url-unsafe characters
                href: function( item ) {
                    // console.log('ppa href', item);
                    return "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa; // nop type pa
                },
                ajax: {
                    url: "/posts",
                    data: { // set url query parameter if we want to do backend/query search
                        q: '{{query}}',
                        u: 'te'
                    },
                    path: 'data.ZAMFARA'
                }
            },
        },
        // please put elipses in very long texts, group or add posts type (eg. accommodation, on sale, ppa, etc.)
        callback: {
            onInit: function( node ) {
                console.log( 'Typeahead Initiated on ', node );
                
            },
            onReceiveRequest: function( node, searchtext ) {
                console.log( 'gonna search ', node, searchtext );
                // save seacrhtext in db for corper's preference and other good functionalities
                // if they searched for an accommodation, alert them when one is avalible.
                // even give the option of them putting on alert when a particulart item or property is up for sale or rent respectively
            },
            onResult: function( node, searchtext, results, l ) { // When the result container is displayed
                console.log( 'search result', node, searchtext, results, l );
                // let's see what the user is seeing
            },
            // The ul.typeahead__list has max-height: 300px; and is scrollable, onNavigateAfter is set to scroll the result container if arrow UP or DOWN are pressed to the .active item.
            onNavigateAfter: function( node, lis, a, item, query, event ) {
                if ( ~[ 38, 40 ].indexOf( event.keyCode ) ) {
                    var resultList = node.closest( "form" )
                        .find( "ul.typeahead__list" ),
                        activeLi = lis.filter( "li.active" ),
                        offsetTop = activeLi[ 0 ] && activeLi[ 0 ].offsetTop - ( resultList.height() / 2 ) || 0;

                    resultList.scrollTop( offsetTop );
                }

            },
            onMouseEnter: function( node, a, item, event ) {
                console.log( 'enter key on search' );
                /* if (item.group === "country") {
                    $(a).append('<span class="flag-chart flag-' + item.display.replace(' ', '-').toLowerCase() + '"></span>')
                } */

            }
        },
        debug: true
    } );
