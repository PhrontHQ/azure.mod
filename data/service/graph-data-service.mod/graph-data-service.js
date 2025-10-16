const HttpService = require("../http-service").HttpService,
    Montage = require('../../../core/core').Montage,
    //SyntaxInOrderIterator = (require)("mod/core/frb/syntax-iterator").SyntaxInOrderIterator,
    DataOperation = require("../data-operation").DataOperation,
    secretObjectDescriptor = require("../../model/app/secret.mjson").montageObject;

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

           super.handleReadOperation(readOperation);
            
    }

}
