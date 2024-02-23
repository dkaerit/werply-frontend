// @ts-ignore
import { Commit, Dispatch } from 'vuex'
import axios from 'axios'

import { uri, store } from '../index';
import { UserState, RootState } from "./users.interfaces"
import { Character } from "../characters/characters.interfaces"
interface Triggers { commit: Commit, dispatch: Dispatch }



export default {
   namespaced: true,

   /////////////////////////////////////////////////////////////////////////////////////////////////
   //                                                                                             //
   //                                           STATE                                             //
   //                                                                                             //
   /////////////////////////////////////////////////////////////////////////////////////////////////

   state: () => ({
      user: {
         avatar: '',
         nickname: '',
         username: '',
      } as UserState,
   }),

   /////////////////////////////////////////////////////////////////////////////////////////////////
   //                                                                                             //
   //                                         MUTATIONS                                           //
   //                                                                                             //
   /////////////////////////////////////////////////////////////////////////////////////////////////

   mutations: {

      /**
       * Mutation to set the user information in the state.
       * #param state - Vuex module state
       * #param user - User information to set
       */

      setUser(state: RootState, user: UserState) {
         state.user = user;
      },

   },

   /////////////////////////////////////////////////////////////////////////////////////////////////
   //                                                                                             //
   //                                         ACTIONS                                             //
   //                                                                                             //
   /////////////////////////////////////////////////////////////////////////////////////////////////

   actions: {

      /**
       * Action to fetch user information from the backend.
       * #param triggers - Vuex action triggers (commit, dispatch)
       * #param username - Username of the user to fetch
       * #throws Error if there's an issue fetching user information
       */

      async FETCH_USER({ commit, dispatch }: Triggers, identifier: string) {
         try {
            console.log("fetch-user(identifier)", identifier);
            // Hacer una solicitud al backend para obtener la información del usuario
            const response = await axios.get(`${uri}/users/read:${identifier}`);
            console.log("fetch-user(data)", response.data);
            await commit('setUser', response.data);
            dispatch('CHARACTERS/FETCH_CHARACTERS_BY_USER_ID', response.data._id, { root: true });
         } catch (error) {
            // Manejar errores (por ejemplo, usuario no autenticado)
            throw new Error('Error al obtener información del usuario:');
         }
      },

      /**
       * Action to fetch user information from the backend.
       * #param triggers - Vuex action triggers (commit, dispatch)
       * #param username - Username of the user to fetch
       * #throws Error if there's an issue fetching user information
       */

      async GET_USER(_: Triggers, identifier: string): Promise<UserState> {
         try {
            // Hacer una solicitud al backend para obtener la información del usuario
            const response = await axios.get(`${uri}/users/read:${identifier}`);
            return response.data;
         } catch (error) {
            // Manejar errores (por ejemplo, usuario no autenticado)
            throw new Error('Error al obtener información del usuario:');
         }
      },

      /**
       * Action to fetch user information from the backend.
       * #param triggers - Vuex action triggers (commit, dispatch)
       * #param username - Username of the user to fetch
       * #throws Error if there's an issue fetching user information
       */

      async GET_USER_BY_ID(_: Triggers, identifier: string): Promise<UserState> {
         try {
            // Hacer una solicitud al backend para obtener la información del usuario
            const response = await axios.get(`${uri}/users/id:${identifier}`);
            return response.data;
         } catch (error) {
            // Manejar errores (por ejemplo, usuario no autenticado)
            throw new Error('Error al obtener información del usuario:');
         }
      },


      async UPDATE_USER({ commit }: Triggers, { userId, update }: { userId: string, update: UserState }): Promise<void> {
         try {
            const token = localStorage.getItem("TokenSession");
            // Hacer una solicitud al backend para obtener la información del usuario
            const response = await axios.put(`${uri}/users/update:${userId}`, update, {
               headers: { authorization: `Bearer ${token}`} // Añadir el token JWT al encabezado de autorización
            });
            await commit('setUser', response.data);
            return response.data;
         } catch (error) {
            // Manejar errores (por ejemplo, usuario no autenticado)
            throw new Error('Error al obtener información del usuario:');
         }
      },
   },

   /////////////////////////////////////////////////////////////////////////////////////////////////
   //                                                                                             //
   //                                         GETTERS                                             //
   //                                                                                             //
   /////////////////////////////////////////////////////////////////////////////////////////////////

   getters: {
      getCurrentUserId: (state: RootState) => {
         return state.user ? state.user._id : null;
      },

      getSelected(state: RootState): UserState | Character | null {
         try {
            return (store.state["CHARACTERS"].currentCharacter !== null)? 
            store.state["CHARACTERS"].currentCharacter:
            state.user
         } catch (error) {
            throw new Error('Error fetching user or character:');
         }
      },

      getTypeSelected: (): string => {
         return (store.state["CHARACTERS"].currentCharacter !== null)? "pj": "user"
      },

      getAlias: (state: RootState): string => {
         return (store.state["CHARACTERS"].currentCharacter !== null)? 
         store.state["CHARACTERS"].currentCharacter.nickname:
         state.user.username
      },

      getTracker: () => ({
         "id": store.getters["USERS/getSelected"]._id,
         "owner": store.state["USERS"].user._id,
         "alias": store.getters["USERS/getAlias"],
         "type": store.getters["USERS/getTypeSelected"]
      })
   }
}