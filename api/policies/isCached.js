/*jslint node: true*/
/*global Caching*/
'use strict';

module.exports = function(req, res, next) {
    Caching.read(req.url).then(
        function(reply) {
            reply = JSON.parse(reply);

            sails.log.info('Reply from cache: ', JSON.stringify(reply));

            if (!req.isSocket && req.get('if-none-match') && reply.etag && req.get('if-none-match') === reply.etag) {
                return res.send(304);
            };

            return res.send(reply.data);
        },
         /** If the requested URL is not cached, then forward to the controller. */
        function(err) {

            switch (err) {
                case 500 :
                    Logger.error('Cache Error.');
                    break;

                case 404 :
                    sails.log.info('Cache not found.');
                    break;

                case 200 :
                    sails.log.info('Not caching.');
                    break;
            };

            return next();
    });
};
