import { makeRedirectUri } from 'expo-auth-session';
import { generateRandom } from 'expo-auth-session/build/PKCE';

export const CLIENT_ID = process.env.CLIENT_ID as string;

export const REDIRECT_URI = makeRedirectUri({ useProxy: true });

export const RESPONSE_TYPE = 'token';

export const SCOPE = encodeURI('openid user:read:email user:read:follows');

export const FORCE_VERIFY = true;

export const STATE = generateRandom(30);

export const AUTH_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&force_verify=${FORCE_VERIFY}&state=${STATE}`;
