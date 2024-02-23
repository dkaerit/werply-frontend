// @ts-ignore
import { Commit, Dispatch } from 'vuex'
import axios from 'axios'
import { uri } from '../index';
import { PostData } from './posts.interface'

interface Triggers { commit: Commit, dispatch: Dispatch }

interface PostsState {
   posts: PostData[];
}

interface FiltersInterface {
   globalAuthorType?: string;
   authors?: [];
   loadSide?: string;
   referenceDate?: string;
}

export default {
   namespaced: true,
   state: (): PostsState => ({
      posts: [] as PostData[],
   }),

   mutations: {
      /**
       * Añadir un nuevo post al estado.
       * #param {PostsState} state - Estado Vuex de los posts.
       * #param {PostData} post - Nuevo post a añadir.
       * #param {string} side - Lado en el que añadir el post, 'top' o 'bottom'.
       */
      addPost(state: PostsState, payload: { side:string, post:PostData}) {
         (payload.side === 'top') ?
            state.posts.unshift(payload.post) :  // Añadir el nuevo post al principio del array
            state.posts.push(payload.post); // Añadir el nuevo post al final del array
      },

      /**
       * Añadir nuevos posts al estado.
       * #param {PostsState} state - Estado Vuex de los posts.
       * #param {PostData[]} newPosts - Nuevos posts a añadir.
       * #param {string} side - Lado en el que añadir los posts, 'top' o 'bottom'.
       */
      addPosts(state: PostsState, payload: { side:string, newPosts:PostData[]}) {
         state.posts = (payload.side === 'top') ?
            payload.newPosts.concat(state.posts) : // Añadir al principio
            state.posts.concat(payload.newPosts); // Añadir al final (puedes ajustarlo según tu lógica)
      },

      /**
       * Reemplazar los posts actuales con una nueva lista de posts.
       * #param {PostsState} state - Estado Vuex de los posts.
       * #param {PostData[]} posts - Lista de nuevos posts.
       */
      fetchPosts(state: PostsState, posts: PostData[]) {
         state.posts = posts;
      },

      /**
       * Eliminar un post del estado.
       * #param {PostsState} state - Estado Vuex de los posts.
       * #param {string} postId - ID del post a eliminar.
       */
      removePost(state: PostsState, postId: string) {
         state.posts = state.posts.filter(post => post._id !== postId);
      },
   },
   actions: {

      /**
       * Acción para crear un nuevo post en el servidor y actualizar el estado con el resultado.
       * #param {Triggers} context - Contexto de la tienda Vuex.
       * #param {PostData} postData - Datos del nuevo post a crear.
       */

      async CREATE_POST({ commit }: Triggers, postData: PostData) {
         try {
            const response = await axios.post(`${uri}/posts/create`, postData);
            await commit("addPost", {"side":"top", "post":response.data});
            return response.data
         } catch (error) {
            console.error('Error creating post:', error);
         }
      },

      /**
       * Acción para recuperar posts del servidor y actualizar el estado con los resultados durante la carga inicial.
       * #param {Triggers} context - Contexto de la tienda Vuex.
       * #param {Object} payload - Parámetros de la solicitud, incluyendo la página, el tamaño de la página y los filtros.
       * #throws {Error} Si ocurre un error durante la solicitud.
       * #returns {Array} La lista de posts recuperados.
       */

      async FETCH_INITIAL_POSTS({ commit }: Triggers, { page, pageSize, filters }: { tab: string, page?: number, pageSize?: number, filters: FiltersInterface }) {
         try {
           let url = `${uri}/posts/read`;
       
           // Si se proporciona un tamaño de página y un número de página, usamos paginación
           if (pageSize !== undefined && page !== undefined) {
             url += `?pageSize=${pageSize}&page=${page}`;
           }
           
           const response = await axios.post(url, filters);
           const newPosts = response.data;
           await commit('fetchPosts', newPosts);
           return newPosts;
         } catch (error) {
           console.error('Error fetching initial posts:', error);
           throw error;
         }
       },
       


      /**
       * Acción para recuperar posts del servidor y actualizar el estado con los resultados.
       * #param {Object} context - El contexto de la tienda Vuex.
       * #param {Object} payload - Los parámetros de la solicitud, incluyendo la página, el tamaño de la página y los filtros.
       * #param {string} payload.tab - La pestaña o categoría de posts a recuperar.
       * #param {number} payload.page - El número de página que se va a recuperar.
       * #param {number} payload.pageSize - El tamaño de la página, es decir, la cantidad de posts por página.
       * #param {Object} payload.filters - Los filtros para la consulta, como definido por la interfaz filtersInterface.
       *    globalAuthorType (string) - Tipo global de autor para filtrar posts.
       *    authors (AuthorDto[]) - Lista de autores para filtrar posts.
       *    loadType (string) Indica el tipo de carga, si mas nuevos a la fecha dada (top), o mas viejos a la fecha dada (bottom).
       *    referenceDate (Date) - la fecha de referencia o fecha dada
       * #throws {Error} Si ocurre un error durante la solicitud.
       * #returns {Array} La lista de posts recuperados.
       */
      async FETCH_ADDITIONAL_POSTS({ commit }: Triggers, { page, pageSize, filters }: { tab: string, page?: number, pageSize?: number, filters: FiltersInterface }) {
         try {

            let url = `${uri}/posts/read`;

            // Si se proporciona un tamaño de página y un número de página, usamos paginación
            if (pageSize !== undefined && page !== undefined) {
              url += `?pageSize=${pageSize}&page=${page}`;
            }

            const response = await axios.post(url, filters);
            const newPosts = response.data;
            const side = filters?.loadSide;
            
            await commit('addPosts', { side, newPosts });
            return newPosts;
         } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
         }
      },

      /**
       * Acción para eliminar un post del servidor y actualizar el estado con el resultado.
       * #param {Triggers} context - Contexto de la tienda Vuex.
       * #param {string} postId - ID del post a eliminar.
       */

      async DELETE_POST({ commit }: Triggers, postId: string) {
         try {
            await axios.delete(`${uri}/posts/delete/id:${postId}`);
            commit("removePost", postId);
         } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
         }
      },

   }
};