var PublicGcal = require('../index.js')
  , API_key = require('./API_key.js');

// data in sample calendar
var repeatingEvents = [
  { name: 'Repeating event 1', count: 10 },
  { name: 'Repeating event 2', count: 5 }
];

describe('constructor PublicGcal', function () {

  var testFuncs = [
    function () {
      var gcal = new PublicGcal();
    },
    function () {
      var gcal = new PublicGcal({ API_key: 'foo' });
    }
  ];

  it('should throw error if options omitted', function () {
    testFuncs.forEach(function (func) {
      expect(func).toThrowError(/must be specified/i);
    });
  });

  describe('method getEvents', function () {

    var gcal
      , result;

    beforeEach(function (done) {
      gcal = new PublicGcal({API_key: API_key, calendarId: '199slga5i4eh632182h41sr98g@group.calendar.google.com'});
      if (!result) {
        gcal.getEvents(function (err, data) {
          if (err) {
            return done(err);
          }
          result = data;
          done();
        });
      }
      else {
        done();
      }
    });

    it('should return array of events', function () {
      expect(result instanceof Array).toBeTruthy();
    });

    it('should return error if Google returns error', function (done) {
      new PublicGcal({ API_key: 'foo', calendarId: 'bar' }).getEvents(function (error, result) {
        expect(error).toBeTruthy();
        expect(error.toString()).toMatch(/keyinvalid/i);
        done();
      });
    });

    describe('resulting array', function () {

      it('should be date-sorted (ascending)', function () {
        result.forEach(function (item, index) {
          if (index < result.length - 2) {
            var startDate = item.start.dateTime ? new Date(item.start.dateTime) : new Date(item.start.date)
              , startDateOfNextItem = result[index + 1].start.dateTime ?
                  new Date(result[index + 1].start.dateTime) : new Date(result[index + 1].start.date);
            expect(startDate.toISOString()).not.toBeGreaterThan(startDateOfNextItem.toISOString());
          }
        })
      });

      it('should have all the instances of repeating events in it', function () {
        repeatingEvents.forEach(function (eventSeries) {
          var count = 0;
          result.forEach(function (item) {
            if (item.summary === eventSeries.name) {
              count++;
            }
          });
          expect(count).toBe(eventSeries.count);
        });
      });

      describe('event item', function () {

        function testElements(key, valueType) {

          var errorMessage = '';

          result.forEach(function (item) {
            if (!(key in item)) {
              errorMessage = errorMessage || key + ' missing!';
            }
            if (valueType === 'number' || valueType === 'string' || valueType === 'object') {
              if (key in item && typeof item[key] !== valueType) {
                errorMessage = errorMessage || key + ' should be of type ' + valueType;
              }
            }
            else {
              if (key in item && !(item[key] instanceof valueType)) {
                errorMessage = errorMessage || key + ' should be instance of ' + valueType.toString();
              }
            }
          });

          return errorMessage;
        }

        it('should contain summary', function () {
          expect(testElements('summary', 'string')).toBeFalsy();
        });

        it('should contain description', function () {
          expect(testElements('description', 'string')).toBeFalsy();
        });

        it('should contain location', function () {
          expect(testElements('location', 'string')).toBeFalsy();
        });

        it('should contain start object', function () {
          expect(testElements('start', 'object')).toBeFalsy();
        });

        it('should contain end object', function () {
          expect(testElements('end', 'object')).toBeFalsy();
        });


      });

    });
  });

});
