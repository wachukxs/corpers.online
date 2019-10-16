var years = parseInt(new Date(Date.now())
                      .getFullYear()
                      .toFixed()
                      .slice(2, 4));
                    var yearrange = '(' + (years - 1) + '|' + years + ')';
console.log(yearrange)