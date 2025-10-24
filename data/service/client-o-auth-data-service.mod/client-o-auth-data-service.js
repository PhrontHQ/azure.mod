const ModClientOAuthDataService = require("mod/data/service/client-o-auth-data-service.mod/client-o-auth-data-service").ClientOAuthDataService,
    Montage = require('mod/core/core').Montage;
const { PublicClientApplication } = require("@azure/msal-browser");

/**
* 
* Doc to look at to implement handling refresh tokens:
*  https://developer.whoop.com/docs/tutorials/refresh-token-javascript/
* 
* https://learn.microsoft.com/en-us/entra/msal/javascript/browser/initialization
*
* @class
* @extends Mod's ClientOAuthDataService
*/
exports.ClientOAuthDataService = class ClientOAuthDataService extends ModClientOAuthDataService {/** @lends ClientOAuthDataService */


    /***************************************************************************
     * Initializing
     */

    constructor() {
        super();
        this.accountId = "";
        this.responseAccount = null;
        return this;
    }

    static {

        Montage.defineProperties(this.prototype, {
            apiVersion: {
                value: "FROM AWS, NECESSARY FOR GCP?"
            }
        });
    }

    async handleReadOperation(readOperation) {
        this.msalInstance = new PublicClientApplication(this.connectionDescriptor);

        let userAccount, readOperationError;
        try {
            await this.msalInstance.initialize();
            await this.msalInstance.handleRedirectPromise().then(this._handleAuthResponse);

            userAccount = this.msalInstance.getAllAccounts()[0];

            if (!userAccount) {
                readOperationError =  new Error("No user account found");
            }

            
        } catch (error) {
            console.error("Sign in failed:", error.message || error);
            readOperationError = error;
        }

        //super.handleReadOperation(readOperation);

        let responseOperation = this.responseOperationForReadOperation(readOperation.referrer ? readOperation.referrer : readOperation, readOperationError ? readOperationError : null, readOperationError ? null : userAccount);
        responseOperation.target.dispatchEvent(responseOperation);
    }

    _handleAuthResponse = async (response) => {
        const loginRequest = {
            scopes: /*["User.Read"] - "User.ReadWrite"*/
                    ["openid", "profile", "User.Read", "email"]

        };
        try {
            if (response?.account) {
                // Store account ID from successful auth response
                this.accountId = response.account.homeAccountId;
                this.responseAccount = response.account;
            } else {
                const currentAccounts = this.msalInstance.getAllAccounts();

                if (currentAccounts.length === 0) {
                    // No accounts found - redirect user to login page

                    await this.msalInstance.loginRedirect(loginRequest);
                } else if (currentAccounts.length > 1) {
                    // Multiple accounts - We need user selection.
                    /*
                        When the query for userIdentity returns more than one object, the authentication managent components
                        will get us a selection.

                        That selection will become the session's userIdentity.
                        Then a subsequent fetch should trigger a fetch for an OAuthAccessToken
                        
                    */
                    // TODO: Add choose account code here
                    console.warn("Multiple accounts detected");
                } else {
                    // Single account - Store account ID
                    this.accountId = currentAccounts[0].homeAccountId;
                }
            }

            // this.msalInstance.acquireTokenSilent(loginRequest).then(tokenResponse => {
            //         // Do something with the tokenResponse
            //         console.warn("tokenResponse response is ", tokenResponse);

            // }).catch(error => {
            //     if (error instanceof InteractionRequiredAuthError) {
            //         // fallback to interaction when silent call fails
            //         return msalInstance.acquireTokenRedirect(request)
            //     }

            //     // handle other errors
            // });

        } catch (error) {
            console.error("Error handling response:", error);
            throw error;
        }
    };

}
