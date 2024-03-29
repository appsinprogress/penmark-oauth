// source: https://github.com/utterance/utterances-oauth/blob/master/src/aes.ts

import { encrypt, decrypt } from "./aes";

const defaultValidityPeriod = 5 * 60 * 1000; // 5 minutes

interface State {
  value: string;
  expires: number;
}

export function encodeState(value: string, password: string, expires = Date.now() + defaultValidityPeriod ) {
  const state: State = { value, expires };
  return encrypt(JSON.stringify(state), password);
}

const invalidError = new Error('state is invalid');
const expiredError = new Error('state is expired');

export async function tryDecodeState(encryptedState: string, password: string): Promise<string | Error> {
  let state: State;
  try {
    state = JSON.parse(await decrypt(encryptedState, password));
  } catch (err) {
    return invalidError;
  }
  if (Date.now() > state.expires) {
    return expiredError;
  }
  return state.value;
}