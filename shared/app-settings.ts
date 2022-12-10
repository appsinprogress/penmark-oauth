// source: https://github.com/utterance/utterances-oauth/blob/master/src/app-settings.ts

export const settings = {
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    state_password: process.env.STATE_PASSWORD!,
    // bot_token: process.env.BOT_TOKEN!,
    // origins: process.env.ORIGINS!.split(",").map(x => x.trim()),
    // webhook_secret: process.env.WEBHOOK_SECRET!
};