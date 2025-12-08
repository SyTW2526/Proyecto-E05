const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

describe('anadirsaldo', function() {
  this.timeout(60000);
  let driver;
  let vars;

  beforeEach(async function() {
    const options = new firefox.Options();    
    if (process.env.CI) {
        options.addArguments('--headless');
        options.addArguments('--width=1920'); 
        options.addArguments('--height=1080');
    }
    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build();
    vars = {};
  });

  afterEach(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  it('anadirsaldo', async function() {
    await driver.get("http://localhost:5175/");
    await driver.manage().window().setRect({ width: 1936, height: 1048 });
    let btnLogin = await driver.wait(until.elementLocated(By.css(".ghost")), 5000);
    await btnLogin.click()
    let emailInput = await driver.wait(until.elementLocated(By.css("label:nth-child(1) > input")), 5000);
    await emailInput.click();
    await emailInput.clear();
    await emailInput.sendKeys("pedrito@gmail.com")
    let passInput = await driver.findElement(By.css("label:nth-child(2) > input"));
    await passInput.click();
    await passInput.clear();
    await passInput.sendKeys("Pedrito");
    await passInput.sendKeys(Key.ENTER);
    await driver.wait(until.urlContains("dashboard"), 10000);
    await driver.get("http://localhost:5175/cuenta");
    let btnSaldo = await driver.wait(until.elementLocated(By.css(".primary-glow")), 10000);
    await driver.sleep(1000); 
    await btnSaldo.click();
    let inputCantidad = await driver.wait(until.elementLocated(By.id("cantidad")), 5000);
    await inputCantidad.click();
    await inputCantidad.sendKeys("10");
    let btnPagar = await driver.findElement(By.css(".primary"));
    await btnPagar.click();
    await driver.sleep(2000);
  });
});