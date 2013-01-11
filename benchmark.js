require('colors');

var Bench = require('benchmark');
var Table = require('cli-table');

//  ---------------------------------------------------------------------------------------------------------------  //

function run(rows, columns) {
    var column_ids = Object.keys(columns);

    var colAligns = [ 'left' ];
    column_ids.forEach(function() {
        colAligns.push('right');
    });

    var table = new Table({
        head: [ "" ].concat(column_ids),
        colAligns: colAligns,
        chars: {
            'top': '-',
            'top-mid': '+',
            'top-left': '+',
            'top-right': '+',
            'bottom': '-',
            'bottom-mid': '+',
            'bottom-left': '+',
            'bottom-right': '+',
            'left': '|',
            'left-mid': '+',
            'mid': '-',
            'mid-mid': '+',
            'right': '|',
            'right-mid': '+'
        }
    });

    Bench.each(rows, function(row, test_id) {
        var suite = new Bench.Suite();

        Bench.each(row, function(test, column_id) {
            suite.add(column_id, function() {
                return columns[column_id](test);
            });
        });

        suite.on('complete', function() {
            var results = [];

            var fastest = this.filter('fastest')[0].hz;
            var slowest = this.filter('slowest')[0].hz;

            column_ids.forEach(function(column_id) {
                var result = suite.filter(function(result) {
                    return (result.name === column_id);
                })[0];

                var color;
                if (result) {
                    var hz = result.hz;

                    if (hz === fastest) {
                        color = 'green';
                    } else if (hz === slowest) {
                        color = 'red';
                    }

                    var s = Bench.formatNumber( hz.toFixed(hz < 100 ? 2 : 0) ).toString();
                    if (color) {
                        s = s[color];
                    }

                    results.push(s);
                } else {
                    results.push('');
                }
            });

            var o = {};
            o[test_id] = results;
            table.push(o);
        });

        suite.run();
    });

    console.log( table.toString() );
}

//  ---------------------------------------------------------------------------------------------------------------  //

module.exports = run;

//  ---------------------------------------------------------------------------------------------------------------  //

