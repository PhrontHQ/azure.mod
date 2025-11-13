const HttpService = require("mod/data/service/http-service").HttpService,
    Montage = require('mod/core/core').Montage,
    //SyntaxInOrderIterator = (require)("mod/core/frb/syntax-iterator").SyntaxInOrderIterator,
    DataOperation = require("mod/data/service/data-operation").DataOperation,
    secretObjectDescriptor = require("mod/data/model/app/secret.mjson").montageObject;

/**
* 
* Doc to look at to implement handling refresh tokens:
*  https://developer.whoop.com/docs/tutorials/refresh-token-javascript/
*
* @class
* @extends HttpService
*/
exports.GraphDataService = class GraphDataService extends HttpService {/** @lends GraphDataService */


    /***************************************************************************
     * Initializing
     */

    constructor() {
        super();

        return this;
    }

    static {

        Montage.defineProperties(this.prototype, {
            apiVersion: {
                value: "1.0.0" //TO be fixed
            }
        });
    }

    handleReadOperation(readOperation) {

        return super.handleReadOperation(readOperation);
            
    }

}
