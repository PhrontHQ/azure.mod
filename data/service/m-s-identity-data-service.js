const IdentityService = require("mod/data/service/identity-service").IdentityService,
    DataOperation = require("mod/data/service/data-operation").DataOperation;
var RawServiceClient;

/**
*
* @class
* @extends RawDataService
*/
exports.MSIdentityDataService = class MSIdentityDataService extends IdentityService {/** @lends MSIdentityDataService */

/*
    https://github.com/Azure-Samples/ms-identity-javascript-nodejs-tutorial

        https://github.com/Azure-Samples/ms-identity-javascript-nodejs-tutorial/blob/main/1-Authentication/1-sign-in/README.md
        https://github.com/Azure-Samples/ms-identity-javascript-nodejs-tutorial/tree/main/Common/msal-node-wrapper

    https://stackoverflow.com/questions/72375489/how-to-verify-id-token-from-aad-and-then-call-user-info
    https://www.google.com/search?q=validates+the+ID+token+from+Microsoft+identity+JavaScript+node.js&client=safari&sca_esv=d43f5111e59e559f&rls=en&ei=H-sfZv-1OIO5kPIP0cmHuAE&ved=0ahUKEwi_wd_LyMmFAxWDHEQIHdHkARcQ4dUDCA8&uact=5&oq=validates+the+ID+token+from+Microsoft+identity+JavaScript+node.js&gs_lp=Egxnd3Mtd2l6LXNlcnAiQXZhbGlkYXRlcyB0aGUgSUQgdG9rZW4gZnJvbSBNaWNyb3NvZnQgaWRlbnRpdHkgSmF2YVNjcmlwdCBub2RlLmpzSMwaUIgIWI8ZcAF4AZABAJgBlwGgAaMGqgEDNC40uAEDyAEA-AEBmAIEoAK-AsICChAAGEcY1gQYsAPCAgUQIRigAZgDAIgGAZAGCJIHAzIuMqAH2xQ&sclient=gws-wiz-serp
    https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-v2-javascript-auth-code


    https://www.npmjs.com/package/@azure/msal-browser
    https://learn.microsoft.com/en-us/javascript/api/@azure/msal-browser/?view=msal-js-latest
    https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser
    
*/



    /***************************************************************************
     * Initializing
     */

    constructor() {
        super();

        return this;
    }

    static {

        Montage.defineProperties(this.prototype, {
            somePublicProp: {
                value: "A prop on the prototype"
            },
            _somePrivateProp: {
                value: "A private property on the prototype"
            }
        });
    }

    instantiateRawClientWithOptions(rawClientOptions) {
        //Create the custom raw client povided by @azure/msal-browser
        // return new SecretManagerServiceClient(rawClientOptions/*??*/);
    }

    rawClientPromises() {
        var promises = super();

        /*
            This lazy load allows to reduce cold-start time, but to kick-start load of code in the phase that's not billed, at least on AWS
        */

        promises.push(
            require.async("@azure/msal-browser").then(function(exports) {
                //Finish Me
                //RawServiceClient = exports.SOMETHING;
            })
        );

        return promises;
    }

    handleCreateTransactionOperation(createTransactionOperation) {
    }

    handleReadOperation(readOperation) {
    }

}
