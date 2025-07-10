import PocketBase from 'pocketbase'

const API_BASE = location.origin;

const pb = new PocketBase(API_BASE);

export default pb;