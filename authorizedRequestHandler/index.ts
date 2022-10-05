// this function gets executed after the website logs in using github

import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { encodeState, tryDecodeState } from "../shared/state";
import { settings } from '../shared/app-settings';
require('isomorphic-fetch');

const accessTokenUrl = 'https://github.com/login/oauth/access_token';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const { origin, pathname, searchParams: search } = new URL(req.url);

    context.res = await authorizedRequestHandler(search);
};

// source: https://github.com/utterance/utterances-oauth/blob/ec7e88a28a5cec7f079980c98bb4923347f5e75b/src/routes.ts#L88
async function authorizedRequestHandler(search: URLSearchParams) {
    const code = search.get('code');
    const state = search.get('state');
    
    if (!code) {
      return badRequest('"code" is required.');
    }
  
    if (!state) {
      return badRequest('"state" is required.');
    }
  
    const { client_id, client_secret, state_password } = settings;
  
    const returnUrl = await tryDecodeState(state, state_password);
    if (returnUrl instanceof Error) {
      return badRequest(returnUrl.message);
    }
  
    //fetch github for access token
    const init = {
      method: 'POST',
      body: (new URLSearchParams({ client_id, client_secret, code, state })).toString(),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'edit-blog-content-from-site'
      }
    };
  
    let accessToken: string;
    try {
      const response = await fetch(accessTokenUrl, init);
      if (response.ok) {
        const data = await response.json();
        // @ts-ignore
        accessToken = data.access_token;
      } else {
        throw new Error(`Access token response had status ${response.status}.`);
      }
    } catch (_) {
      return new Response('Unable to load token from GitHub.');
    }
  
    //return to blog the access token encoded within state
    //returned as url search param
    const url = new URL(returnUrl);
    const session = await encodeState(accessToken, state_password, Date.now() + 1000 * 60 * 60 * 24 * 365);
    url.searchParams.set('edit-blog-content-from-site', session);
  
    return {
      status: 302,
      statusText: 'found',
      headers: {
        'Location': url.href
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