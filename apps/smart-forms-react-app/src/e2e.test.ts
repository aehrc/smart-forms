import puppeteer, { Browser, Page } from 'puppeteer';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Redirection to Auth page from Launch page', () => {
  let browser: Browser;
  let page: Page;

  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  const launchUrl = appUrl + '/launch';
  const authUrl = appUrl + '/';

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  test('redirects to the Auth page', async () => {
    await page.goto(launchUrl);
    await page.waitForNavigation();
    expect(page.url()).toBe(authUrl);
  });

  test('display "SMART Forms" on the nav bar', async () => {
    await page.goto(launchUrl);
    await page.waitForNavigation();
    await page.waitForSelector('.MuiToolbar-root');
    const navBarText = await page.$eval('.MuiToolbar-root', (e) => e.textContent);
    expect(navBarText).toContain('SMART Forms');
  });

  test('display "Refresh Questionnaire" button on the questionnaire picker sideBar operation list', async () => {
    await page.goto(launchUrl);
    await page.waitForNavigation();
    await page.waitForSelector('.MuiPaper-root');
    const sideBarOperationListText = await page.$eval('.MuiPaper-root', (e) => e.textContent);
    expect(sideBarOperationListText).toContain('Refresh Questionnaires');
  });

  test('display "Questionnaires" heading on the questionnaire picker card', async () => {
    await page.goto(launchUrl);
    await page.waitForNavigation();
    await page.waitForSelector('.MuiPaper-root');
    const questionnairePickerText = await page.$$eval('.MuiPaper-root', (e) => e[1].textContent);
    expect(questionnairePickerText).toContain('Questionnaires');
  });

  test('display "Responses" heading on the questionnaire response picker card', async () => {
    await page.goto(launchUrl);
    await page.waitForNavigation();
    await page.waitForSelector('.MuiPaper-root');
    const questionnaireResponsePickerText = await page.$$eval(
      '.MuiPaper-root',
      (e) => e[2].textContent
    );
    expect(questionnaireResponsePickerText).toContain('Responses');
  });

  afterAll(() => browser.close());
});

describe('select questionnaire and create new response in Renderer', () => {
  let browser: Browser;
  let page: Page;

  const launchUrl = 'http://localhost:3000/launch';

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  test('questionnaire title displayed is the same as the questionnaire selected in picker', async () => {
    await page.goto(launchUrl);
    await page.waitForNavigation();
    await page.waitForSelector('.MuiList-root');

    const questionnaireName = await page.$$eval(
      '.MuiList-root div[role="button"]',
      (e) => e[1].textContent
    );
    await page.$$eval('.MuiList-root div[role="button"]', (e) => e[1].click());
    await page.$$eval('button[type="button"]', (e) => e[1].click());

    await page.waitForSelector('.MuiPaper-root');
    const headingName = await page.$eval('.MuiGrid-root .MuiBox-root h1', (e) => e.textContent);

    expect(headingName).toEqual(questionnaireName);
  });

  test('display "Change Questionnaire" button on the renderer sideBar operation list', async () => {
    await page.goto(launchUrl);
    await page.waitForNavigation();
    await page.waitForSelector('.MuiList-root');

    await page.$$eval('.MuiList-root div[role="button"]', (e) => e[1].click());
    await page.$$eval('button[type="button"]', (e) => e[1].click());

    await page.waitForSelector('.MuiPaper-root');
    const sideBarOperationListText = await page.$eval('.MuiPaper-root', (e) => e.textContent);
    expect(sideBarOperationListText).toContain('Change Questionnaire');
  });

  afterAll(() => browser.close());
});
