import PocketBase from 'pocketbase'

const isLocal = window.location.hostname === 'localhost';
const API_BASE = isLocal
  ? 'http://127.0.0.1:8090'
  : 'https://videopuzzle-production.up.railway.app';

const pb = new PocketBase(API_BASE);

export default pb;