import { DonorsPage } from './app.po';

describe('donors App', () => {
  let page: DonorsPage;

  beforeEach(() => {
    page = new DonorsPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
