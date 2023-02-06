describe('shell', () => {
  beforeEach(() => cy.visit('/'));

  it('should print the text Debugging Route', () => {
    cy.get('h1').should('contain', 'Debugging Route');

    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    // getGreeting().contains('Hello World!');
  });
});
