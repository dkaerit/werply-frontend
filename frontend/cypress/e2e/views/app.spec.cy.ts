describe('App.vue', () => {
   beforeEach(() => {
     cy.visit('/');
   });
 
   it('should display the dashboard when logged in', () => {
     cy.window().then((win) => { // Simulate login by setting a token in localStorage
       win.localStorage.setItem('TokenSession', 'something');
     });

     cy.get('.flex.justify-center').should('exist'); // Ensure the dashboard is visible after login
   });
 
   it('should redirect to login when not logged in', () => {
     cy.url().should('include', '/login'); // Ensure user is redirected to login when not logged in
   });
 });