const ModClientOAuthDataService = require("mod/data/service/client-o-auth-data-service.mod/client-o-auth-data-service").ClientOAuthDataService,
    Montage = require('mod/core/core').Montage;
const { PublicClientApplication, InteractionRequiredAuthError } = require("@azure/msal-browser");

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
            },
            __msalInstancePromise: {
                value:undefined
            },
            _msalInstance: {
                value:undefined
            }
        });
    }

    get _msalInstancePromise() {
        if(!this.__msalInstancePromise) {
            let msalInstance = new PublicClientApplication(this.connectionDescriptor);
            this._msalInstance = msalInstance;
            this.__msalInstancePromise = msalInstance.initialize()
            .then((resolvedInitialization) => {
                return msalInstance.handleRedirectPromise()
                .then(this._handleAuthResponse)
                .then((_handleAuthResponseResolved) => {
                    return msalInstance;
                });

            })
        }
        return this.__msalInstancePromise;
    }

    handleUserIdentityReadOperation(readOperation) {
        let readOperationCompletionPromise;

        /*
            This gives a chance to the delegate to do something async by returning a Promise from rawDataServiceWillHandleReadOperation(readOperation).
            When that promise resolves, then we check if readOperation.defaultPrevented, if yes, the we don't handle it, otherwise we proceed.

            Wonky, WIP: needs to work without a delegate actually implementing it.
            And a RawDataService shouldn't know about all that boilerplate

            Note: If there was a default delegate shared that would implement rawDataServiceWillHandleReadOperation by returning Promise.resolve(readOperation)
            it might be simpler, but probably a bit less efficient

        */
        readOperationCompletionPromise = this.callDelegateMethod("rawDataServiceWillHandleReadOperation", this, readOperation);
        if(readOperationCompletionPromise) {
            readOperationCompletionPromise = readOperationCompletionPromise.then((readOperation) => {
                if(!readOperation.defaultPrevented) {
                    this._handleUserIdentityReadOperation(readOperation);
                }
            });
        } else {
            this._handleUserIdentityReadOperation(readOperation);
        }

        //If we've been asked to return a promise for the read Completion Operation, we do so. Again, this is fragile. IT HAS TO MOVE UP TO RAW DATA SERVICE
        //WE CAN'T RELY ON INDIVIDUAL DATA SERVICE IMPLEMENTORS TO KNOW ABOUT THAT...
        if(this.promisesReadCompletionOperation) {
            return readOperationCompletionPromise;
        }

    }


    _handleUserIdentityReadOperation(readOperation) {
        // this.msalInstance = new PublicClientApplication(this.connectionDescriptor);

        let userAccount, readOperationError;
        try {
            // await this.msalInstance.initialize();
            // await this.msalInstance.handleRedirectPromise().then(this._handleAuthResponse);

            this._msalInstancePromise.then((msalInstance) => {

                /*
                    userAccount.idTokenClaims is described here:
                        https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference

                        
                */

                userAccount = this._msalInstance.getAllAccounts()[0];
                if (!userAccount) {
                    readOperationError = new Error("No user account found");
                }
            })
            .catch((error) => {
                console.error("Sign in failed:", error.message || error);
                readOperationError = error;
            })
            .finally(() => {
                let responseOperation = this.responseOperationForReadOperation(readOperation.referrer ? readOperation.referrer : readOperation, readOperationError ? readOperationError : null, readOperationError ? null : userAccount);
                responseOperation.target.dispatchEvent(responseOperation);
            })

            // userAccount = this.msalInstance.getAllAccounts()[0];

            // if (!userAccount) {
            //     readOperationError =  new Error("No user account found");
            // }

            
        } catch (error) {
            console.error("Sign in failed:", error.message || error);
            readOperationError = error;
        }

        //super.handleReadOperation(readOperation);

        // let responseOperation = this.responseOperationForReadOperation(readOperation.referrer ? readOperation.referrer : readOperation, readOperationError ? readOperationError : null, readOperationError ? null : userAccount);
        // responseOperation.target.dispatchEvent(responseOperation);
    }

    _handleAuthResponse = async (response) => {
        const loginRequest = {
            scopes: /*["User.Read"] - "User.ReadWrite"*/
                    ["openid", "profile", "User.Read.All", "email"]

        };
        try {
            if (response?.account) {
                // Store account ID from successful auth response
                this.accountId = response.account.homeAccountId;
                this.responseAccount = response.account;
            } else {
                const currentAccounts = this._msalInstance.getAllAccounts();

                if (currentAccounts.length === 0) {
                    // No accounts found - redirect user to login page

                    await this._msalInstance.loginRedirect(loginRequest);
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

            // this._msalInstance.acquireTokenSilent(loginRequest).then(tokenResponse => {
            //         // Do something with the tokenResponse
            //         console.warn("tokenResponse response is ", tokenResponse);

            // }).catch(error => {
            //     if (error instanceof InteractionRequiredAuthError) {
            //         // fallback to interaction when silent call fails
            //         return this._msalInstance.acquireTokenRedirect(request)
            //     }

            //     // handle other errors
            // });

        } catch (error) {
            console.error("Error handling response:", error);
            throw error;
        }
    };


    handleOAuthAccessTokenReadOperation(readOperation) {
        let readOperationCompletionPromise;

        /*
            This gives a chance to the delegate to do something async by returning a Promise from rawDataServiceWillHandleReadOperation(readOperation).
            When that promise resolves, then we check if readOperation.defaultPrevented, if yes, the we don't handle it, otherwise we proceed.

            Wonky, WIP: needs to work without a delegate actually implementing it.
            And a RawDataService shouldn't know about all that boilerplate

            Note: If there was a default delegate shared that would implement rawDataServiceWillHandleReadOperation by returning Promise.resolve(readOperation)
            it might be simpler, but probably a bit less efficient

        */
        readOperationCompletionPromise = this.callDelegateMethod("rawDataServiceWillHandleReadOperation", this, readOperation);
        if(readOperationCompletionPromise) {
            readOperationCompletionPromise = readOperationCompletionPromise.then((readOperation) => {
                if(!readOperation.defaultPrevented) {
                    this._handleOAuthAccessTokenReadOperation(readOperation);
                }
            });
        } else {
            this._handleOAuthAccessTokenReadOperation(readOperation);
        }

        //If we've been asked to return a promise for the read Completion Operation, we do so. Again, this is fragile. IT HAS TO MOVE UP TO RAW DATA SERVICE
        //WE CAN'T RELY ON INDIVIDUAL DATA SERVICE IMPLEMENTORS TO KNOW ABOUT THAT...
        if(this.promisesReadCompletionOperation) {
            return readOperationCompletionPromise;
        }

    }

    _handleOAuthAccessTokenReadOperation(readOperation) {

        //TODO: The scopes should be part of the readOperation's criteria

        let accessTokenRawData, readOperationError, accessTokenRequest;
        this._msalInstancePromise.then((msalInstance) => {
            accessTokenRequest = {
                scopes: /*["User.Read"] - "User.ReadWrite"*/
                        ["openid", "profile", "User.Read.All", "email"],
                account: this._msalInstance.getAllAccounts()[0],
                redirectUri: this.connectionDescriptor.auth.redirectURI
            };

            return this._msalInstance.acquireTokenSilent(accessTokenRequest)
        })
        .then(tokenResponse => {
                // Do something with the tokenResponse
                accessTokenRawData = tokenResponse;
                console.warn("tokenResponse response is ", tokenResponse);
                return accessTokenRawData;
        })
        .catch(error => {
            readOperationError = error;
            if (error instanceof InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return this._msalInstance.acquireTokenRedirect(accessTokenRequest)
                .then(tokenResponse => {
                    // Do something with the tokenResponse
                    accessTokenRawData = tokenResponse;
                    console.warn("tokenResponse response is ", tokenResponse);
                    return accessTokenRawData;
                })

            }

            // handle other errors
        })
        .finally(() => {
            let responseOperation = this.responseOperationForReadOperation(readOperation.referrer ? readOperation.referrer : readOperation, readOperationError ? readOperationError : null, readOperationError ? null : accessTokenRawData);
            responseOperation.target.dispatchEvent(responseOperation);
        });
    }

}
