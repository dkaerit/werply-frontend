// @ts-ignore
import { Commit, Dispatch } from 'vuex'
import axios from 'axios'
import { uri, store } from '../index';
interface Triggers { commit: Commit, dispatch: Dispatch }
import { MutualData, MutualState } from "./mutuals.interface.ts"

export default {
   namespaced: true,
   state: () => ({
      mutuals: [],
   }),
   mutations: {
      setMutuals(state: MutualState, mutuals: MutualData[]) {
         state.mutuals = mutuals;
      },
      addMutual(state: MutualState, mutual: MutualData) {
         state.mutuals.push(mutual);
      },
      removeMutual(state: MutualState, mutualId: string) {
         state.mutuals = state.mutuals.filter(mutual => mutual._id !== mutualId);
      },
   },
   actions: {

      /**
       * Crea un nuevo mutual.
       * #param {Object} mutualData - Datos del mutual a crear.
       * #returns {Promise<Object>} - Promesa que se resuelve con los datos del mutual creado.
       */
      async CREATE_MUTUAL({ dispatch }: Triggers, mutualData: MutualData) {
         try {
            const response = await axios.post(`${uri}/mutuals/create`, mutualData);
            const id = mutualData.relationshipType === 'pj'?
            await store.state["CHARACTERS"].currentCharacter._id:
            await store.state["USERS"].user._id;
            dispatch('FETCH_MUTUALS', id);
            return response.data;
         } catch (error) {
            console.error('Error al crear el mutual:', error);
            throw error;
         }
      },

      /**
       * Elimina un mutual existente.
       * #param {Object} mutualId - ID del mutual a eliminar.
       * #returns {Promise<Object>} - Promesa que se resuelve con los datos del mutual eliminado.
       */
      async DELETE_MUTUAL({ dispatch }: Triggers, payload: string | { userId1: string; userId2: string }) {
         try {
            let response;

            response = (typeof payload === 'string') ?
               await axios.delete(`${uri}/mutuals/delete/id:${payload}`) :
               await axios.delete(`${uri}/mutuals/delete/pair`, {params: payload});

            dispatch('FETCH_MUTUALS');
            return response.data;
         } catch (error) {
            console.error('Error al eliminar el mutual:', error);
            throw error;
         }
      },

      /**
       * Obtiene la lista de mutuals.
       * #returns {Promise<Array>} - Promesa que se resuelve con la lista de mutuals.
       */
      async FETCH_MUTUALS({ commit }: Triggers, id: string) {
         try {
            const response = await axios.get(`${uri}/mutuals/id:${id}`);
            commit('setMutuals', response.data);
            return response.data;
         } catch (error) {
            console.error('Error al obtener la lista de mutuals:', error);
            throw error;
         }
      }
   }
}