// @ts-ignore
import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'
import { io } from 'socket.io-client';

// modulos
import AUTH from './auth/auth.module';
import MENU from './menu/menu.module';
import USERS from './users/users.module';
import CHARACTERS from './characters/characters.module';
import MUTUALS from './mutuals/mutuals.module';
import POSTS from './posts/posts.module';


const backendHost = import.meta.env.BACKEND_HOST || "localhost";
const backendPort = import.meta.env.BACKEND_PORT || 3000;
export const uri: string = `http://${backendHost}:${backendPort}`;

const vuexLocal = new VuexPersistence()

export const store = createStore({
  state: () => ({}),
  mutations: {
  },
  modules: { AUTH, MENU, USERS, CHARACTERS, MUTUALS, POSTS },
  plugins: [vuexLocal.plugin]
})

// conexión al socket
const socket = io(uri, {
  query: store.getters["USERS/getTracker"],
}); 

export { socket };