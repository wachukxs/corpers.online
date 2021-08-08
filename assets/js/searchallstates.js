// http://www.runningcoder.org/jquerytypeahead/demo/ User v1

// use grouping from http://www.runningcoder.org/jquerytypeahead/demo/ Advanced demo Beer v1
$.typeahead({
    input: '.s',
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
    group: {
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
    template: "{{address}} <br> <small class='text-muted text-uppercase'>{{type}}, &#8358;{{price}} {{rentrange}} by {{statecode}}</small>" +
                "<br> <small class='text-muted text-uppercase'>{{group}}</small>",
                template: "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                "<br> <small class='text-muted text-uppercase'>{{group}}</small>",
    correlativeTemplate: true,
    //////////////////////////////////////////////////////////////
    // correlativeTemplate: true,
    group: { // use group to maybe group by LGAs and anything relevant
        template: "{{group}} STATE"
    },
    // template: "{{address}} {{ppa_address}} <br> <small class='text-muted text-uppercase'>{{group}}</small>",
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
                // console.log('t', item)
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // what you can search and it autocompletes // 'group' options works but isn't ideal yet because we can't implement // display cannot be a function
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                console.log('=href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }

            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.ABIA'
            }
        },
        ADAMAWA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.ADAMAWA'
            }
        },
        "AKWA IBOM": {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data."AKWA IBOM"'
            }
        },
        ANAMBRA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.ANAMBRA'
            }
        },
        BAUCHI: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.BAUCHI'
            }
        },
        BAYELSA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.BAYELSA'
            }
        },
        BENUE: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.BENUE'
            }
        },
        BORNO: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.BORNO'
            }
        },
        "CROSS RIVER": {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data."CROSS RIVER"'
            }
        },
        DELTA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.DELTA'
            }
        },
        EBONYI: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.EBONYI'
            }
        },
        EDO: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.EDO'
            }
        },
        EKITI: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.EKITI'
            }
        },
        ENUGU: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.ENUGU'
            }
        },
        "FCT - ABUJA": {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data."FCT - ABUJA"'
            }
        },
        IMO: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.IMO'
            }
        },
        JIGAWA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.JIGAWA'
            }
        },
        KADUNA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.KADUNA'
            }
        },
        KANO: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.KANO'
            }
        },
        KASTINA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.KASTINA'
            }
        },
        KEBBI: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.KEBBI'
            }
        },
        KOGI: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.KOGI'
            }
        },
        KWARA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.KWARA'
            }
        },
        LAGOS: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.LAGOS'
            }
        },
        NASSARAWA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.NASSARAWA'
            }
        },
        NIGER: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.NIGER'
            }
        },
        OGUN: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.OGUN'
            }
        },
        ONDO: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.ONDO'
            }
        },
        OSUN: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.OSUN'
            }
        },
        OYO: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.OYO'
            }
        },
        PLATEAU: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.PLATEAU'
            }
        },
        RIVERS: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.RIVERS'
            }
        },
        SOKOTO: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.SOKOTO'
            }
        },
        TARABA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.TARABA'
            }
        },
        YOBE: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'], // seems 'group' options isn't working
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
            },
            ajax: {
                url: "/posts",

                data: { // set url query parameter if we want to do backend/query search [must be thesame across all groups]
                    q: '{{query}}',
                    u: 'test'
                },

                path: 'data.YOBE'
            }
        },
        ZAMFARA: {
            template: function (query, item) {
                if (item.rentrange) {
                    let d = moment(item.post_time).fromNow();
                    return "{{address}} <br> <small class='text-muted text-uppercase'>{{type}} at &#8358;{{price}} {{rentrange}} by {{statecode}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>accommodations</small>";
                } else if (item.name_of_ppa) {
                    return "{{name_of_ppa}} ({{type_of_ppa}})<br> <small class='text-muted text-uppercase'>{{ppa_address}}</small>" +
                        "<br> <small class='text-muted'>ppa</small>";
                } else if (item.itemname) {
                    let d = moment(item.post_time).fromNow();
                    return "{{itemname}} selling at &#8358;{{price}}<br> <small class='text-muted text-uppercase'>{{location}}  &#183; " + d + "</small>" +
                        "<br> <small class='text-muted'>sale</small>";
                };
            },
            display: ['address', 'type', "name_of_ppa", "ppa_address", "type_of_ppa", 'price', 'itemname', 'location'],
            // Be careful as item properties might contain Url-unsafe characters
            href: function (item) {
                // console.log('href', item);
                if (item.name_of_ppa) { // if it's a ppa
                    return "/search?state=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address +
                        "&top=" + item.type_of_ppa;
                } else if (item.rentrange) { // if it's an accommodation
                    return "/search?state=" + item.group + "&pt=" + item.post_time +  "&sc=" +
                        item.statecode + "&rr=" + item.rentrange + "&p=" + item.price + "&t=" + item.type; // sn sc it
                } else if (item.itemname) { // if it's an item for sale
                    return "/search?sc=" + item.statecode + "&pt=" + item.post_time;
                }
                    
            },
            ajax: {
                url: "/posts",
                data: { // set url query parameter if we want to do backend/query search
                    q: '{{query}}',
                    u: 'test'
                },
                path: 'data.ZAMFARA'
            }
        },
    },
    // please put elipses in very long texts, group or add posts type (eg. accommodation, on sale, ppa, etc.)
    callback: {
        onInit: function (node) {
            // console.log('Typeahead Initiated on ', node);

        },
        // the first set of results that comes
        onReceiveRequest: function (node, searchtext) {
            console.log('gonna search ', node, searchtext);
            // save seacrhtext in db for corper's preference and other good functionalities
            // if they searched for an accommodation, alert them when one is avalible.
            // even give the option of them putting on alert when a particulart item or property is up for sale or rent respectively
        },
        // Whenever the result changes, this callback will be triggered.
        onResult: function (node, query, result, resultCount, resultCountPerGroup) { // When the result container is displayed
            console.log('search result', node, query, result, resultCount, resultCountPerGroup); // results is an array of objects of the search results
            // let's see what the user is seeing
            
            if (resultCount == 0){
                // let's see the search text, emit it
                if(query.length > 2){
                    let qq = query;
                    let ql = query.length;
                }
            }

        },
        // The ul.typeahead__list has max-height: 300px; and is scrollable, onNavigateAfter is set to scroll the result container if arrow UP or DOWN are pressed to the .active item.
        onNavigateAfter: function (node, lis, a, item, query, event) {
            if (~[38, 40].indexOf(event.keyCode)) {
                let resultList = node.closest("form")
                    .find("ul.typeahead__list"),
                    activeLi = lis.filter("li.active"),
                    offsetTop = activeLi[0] && activeLi[0].offsetTop - (resultList.height() / 2) || 0;

                resultList.scrollTop(offsetTop);
            }

        },
        onMouseEnter: function (node, a, item, event) {
            console.log('enter key on search');
            /* if (item.group === "country") {
                $(a).append('<span class="flag-chart flag-' + item.display.replace(' ', '-').toLowerCase() + '"></span>')
            } */

        },
        onHideLayout: function (node, query) { // IFFFFFFFFFF they asked for something and we didn't have it, we'll save it and ask other corpers about it. so if it's a ppa that was searched for and we didn't have anything about it we'd ask a corper that serves there to put it on the map!!! same with accommodations and everyother thing possible... we should be able to suggest to them similar things when ever we can't find a goods they want to buy
            console.log('closed the search layout', node, query)
            if(query.length > 0){ // means they clicked to another page
                console.log('sth', query)
            }
        },
        // Triggers when the Typeahead results layout is displayed.
        onShowLayout: function (node, query) { // they asked for something and we had it
            console.log('showed the search layout', node, query)
            
        },
        // Triggers every time a new search is executed in Typeahead.
        onSearch: function (node, query) { // they asked for something and we had it
            console.log('on the search', node, query)
            
        }
    },
    debug: true
});
