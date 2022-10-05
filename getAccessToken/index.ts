import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { settings } from '../shared/app-settings';
import { tryDecodeState } from "../shared/state";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const { searchParams: search } = new URL(req.url);

    const session = search.get('session');

    context.res = await getAccessTokenFromSession(session);
};

async function getAccessTokenFromSession(session: string){
    const { state_password } = settings;

    const token = await tryDecodeState(session, state_password);
    if (token instanceof Error) {
      return badRequest(token.message);
    }
    return {
      body: {
        token: token
      },
    };
}

function badRequest(message: string) {
    return {
      status: 400,
      body: { message }
    };
}

export default httpTrigger;