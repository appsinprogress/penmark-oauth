// this function gets executed after the website logs in using github
// the website fetches this function upon clicking "Login", and this function returns a 302 to redirect to 
// github to login

import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { encodeState, tryDecodeState } from "../shared/state";
import { settings } from '../shared/app-settings';

const authorizeUrl = 'https://github.com/login/oauth/authorize';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const { origin, pathname, searchParams: search } = new URL(req.url);
    
    const response = await authorizeRequestHandler(origin, search)

    context.res = response;
};

// source: https://github.com/utterance/utterances-oauth/blob/ec7e88a28a5cec7f079980c98bb4923347f5e75b/src/routes.ts#L88
async function authorizeRequestHandler(origin: string, search: URLSearchParams): Promise<object> {
    const { client_id, state_password } = settings;
  
    const appReturnUrl = search.get('redirect_uri');
    
    if (!appReturnUrl) {
      return badRequest(`"redirect_uri" is required.`);
    }
  
    const state = await encodeState(appReturnUrl, state_password);
    const redirect_uri = origin + '/api/authorizedRequestHandler';

    return {
      status: 302,
      statusText: 'found',
      headers: {
        Location: `${authorizeUrl}?${new URLSearchParams({ client_id, redirect_uri, state })}`
      }
    };
}

function badRequest(message: string) {
    return {
      status: 400,
      body: { message }
    };
}

export default httpTrigger;