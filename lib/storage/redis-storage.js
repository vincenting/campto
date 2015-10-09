/**
 * Created by vt on 15/10/8.
 */

'use strict';

var StorageFactory = require('./factory');

module.exports = {
    initialize: function () {

    }
};

StorageFactory.register('redis', module.exports);
