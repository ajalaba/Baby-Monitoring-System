describe('Protractor Baby Monitoring System register App testing',function(){
    it(' test all the error messages in regitseration page', function(){
        browser.manage().window().maximize();
        browser.get('http://localhost:3000/registration');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        var confirm=element(by.model('confirm'));
        var email=element(by.model('email'));
        username.sendKeys('sam');
        password.sendKeys('1234');
        confirm.sendKeys('123');
        email.sendKeys('123');
        var passerror=element(by.id('passerror'));
        var match=element(by.id('match'));
        var grade=element(by.id('grade'));
        expect(passerror.getText()).toEqual('Password must be greater than 8 characters.');
        expect(match.getText()).toEqual("Password's do not match.");
        expect(grade.getText()).toEqual('weak');
        var registerbutton=element(by.id('register'));
        browser.sleep(2000);
        expect(registerbutton.isEnabled()).toBe(false);
        browser.sleep(2000);
        expect(registerbutton.isEnabled()).toBe(false);      
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/registration');
    });
    it(' test all the register button diabled features when username is empty, password is empty, confirm is empty or password!=confirm or password is less than 8 characters.', function(){
        browser.get('http://localhost:3000/registration');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        var confirm=element(by.model('confirm'));
        var email=element(by.model('email'));
        var registerbutton=element(by.id('register'));
        expect(registerbutton.isEnabled()).toBe(false);
        username.sendKeys('sam');
        expect(registerbutton.isEnabled()).toBe(false);
        password.sendKeys('1234');
        expect(registerbutton.isEnabled()).toBe(false);
        confirm.sendKeys('123');
        expect(registerbutton.isEnabled()).toBe(false);
        password.sendKeys('567');
        confirm.sendKeys('4567');
        expect(registerbutton.isEnabled()).toBe(false);
        password.sendKeys('8');
        confirm.sendKeys('8');
        email.sendKeys('123');
        expect(registerbutton.isEnabled()).toBe(true);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/registration');
    });
    // it('Register a new user to the application and check registration successfull message', function(){
    //     browser.get('http://localhost:3000/registration');
    //     var username=element(by.model('username'));
    //     var password=element(by.model('password'));
    //     var confirm=element(by.model('confirm'));
    //     var email=element(by.model('email'));
    //     username.sendKeys('sam1234');
    //     password.sendKeys('12345678');
    //     confirm.sendKeys('12345678');
    //     email.sendKeys('ace.adv.2001@gmail.com');
    //     var registerbutton=element(by.id('register'));
    //     registerbutton.click();
    //     var message=element(by.id('message'));
    //     browser.sleep(2000);
    //     expect(message.getText()).toEqual('Registration Successfull');
    //     browser.sleep(10000);
    //     //var regsuccess=element(by.id('regsuccess'));
    //     //expect(regsuccess.getText()).toEqual('Registration Successfull');
    //     expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/login');
    // });
    it('Trying to Register an existing user to the application', function(){
        browser.get('http://localhost:3000/registration');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        var confirm=element(by.model('confirm'));
        var email=element(by.model('email'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        confirm.sendKeys('12345678');
        email.sendKeys('ace.adv.2001@gmail.com');
        var registerbutton=element(by.id('register'));
        registerbutton.click();
        browser.sleep(1000);
        var message=element(by.id('message'));
        expect(message.getText()).toEqual('Error!!! User already exists');
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/registration');
    });
  });
describe('Protractor Baby Monitoring System login App testing',function(){
    it('should have a title', function(){
        browser.manage().window().maximize();
        browser.get('http://localhost:3000/');
        browser.sleep(2000);
        expect(browser.getTitle()).toEqual('BabyMonitor');
    });
    it('should redirect any page to login ', function(){
        // var logoutbutton=element(by.id('logout'));
        // logoutbutton.click();
        browser.get('http://localhost:3000/notifications');
        browser.sleep(8000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/login');
    });
    it('Login button should be disabled if username and Password field are empty ', function(){
        browser.get('http://localhost:3000/login');
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        var loginbutton=element(by.id('login'));
        expect(loginbutton.isEnabled()).toBe(false);
        username.sendKeys('sam');
        expect(loginbutton.isEnabled()).toBe(false);
        password.sendKeys('123');
        expect(loginbutton.isEnabled()).toBe(true);
        
    });
    it(' Not Login to application and also will check error message', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('sam');
        password.sendKeys('123');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        loginbutton.click();
        var error=element(by.id('error'));
        expect(error.getText()).toEqual('Error: User is not Registered');
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/login');
    });
    it('Login to application', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/');
    });
    it('Username display feature', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(1000);
        var name=element(by.id('usernamedisplay'));
        expect(name.getText()).toEqual('Username : test4');
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/');
    });
    it('Testing Logout', function(){
        browser.get('http://localhost:3000/login');
        
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/');
        var logoutbutton=element(by.id('logout'));
        logoutbutton.click();
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/login');
    });
  });
  describe('Protractor Baby Monitoring System register device App testing',function(){
    it('redirect to register-device page error free ', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/register-device');
        browser.get('http://localhost:3000/register-device');
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/register-device');
    });
    it(' Save button should not work untill device name and user name is filled and it should work after', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/register-device');
        browser.get('http://localhost:3000/register-device');
        var username=element(by.model('username'));
        var babyname=element(by.model('babyname'));
        var name=element(by.model('name'));
        var savebutton=element(by.id('save'));
        browser.sleep(1000);
        expect(savebutton.isEnabled()).toBe(false);
        username.sendKeys('test4');
        expect(savebutton.isEnabled()).toBe(false);
        babyname.sendKeys('123');
        expect(savebutton.isEnabled()).toBe(false);
        name.sendKeys('123312312');
        expect(savebutton.isEnabled()).toBe(true);
        savebutton.click();
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/');
    });
  });
  describe('Protractor Baby Monitoring System send command page testing',function(){
    it('redirect to send-command page error free ', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/send-command');
        browser.get('http://localhost:3000/send-command');
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/send-command');
    });
    it(' Send Command button should not work untill device name and command is filled and should ouput Command Sent message after successfully save button click', function(){
        browser.manage().window().maximize();
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/send-command');
        browser.get('http://localhost:3000/send-command');
        var name=element(by.model('deviceId'));
        var command=element(by.model('command'));
        var sendbutton=element(by.id('send-command'));
        browser.sleep(1000);
        expect(sendbutton.isEnabled()).toBe(false);
        name.sendKeys('dev');
        expect(sendbutton.isEnabled()).toBe(false);
        command.sendKeys('Sound On');
        expect(sendbutton.isEnabled()).toBe(true);
        sendbutton.click();
        browser.sleep(1000);
        var message=element(by.id('message'));
        expect(message.getText()).toEqual('Command Sent');
        
    });
  });
  describe('Protractor Baby Monitoring System Notification page testing',function(){
    it('redirect to notification page error free ', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/notifications');
        browser.get('http://localhost:3000/notifications');
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/notifications');
    });
    it(' Testing notification close button', async function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/send-command');
        browser.get('http://localhost:3000/send-command');
        var name=element(by.model('deviceId'));
        var command=element(by.model('command'));
        var sendbutton=element(by.id('send-command'));
        name.sendKeys('123');
        command.sendKeys('Sound On');
        //sendbutton.click();
        browser.get('http://localhost:3000/notifications');
        var initial= 0;
        await element.all(by.repeater('x in notlist')).count().then(function (size) {
            initial=size;
            //console.log("initial1:" +initial);
          });
        var close=element.all(by.repeater('x in notlist')).first().element(by.id('close'));
        browser.sleep(1000);
        close.click();
        browser.sleep(1000);
        browser.refresh();
        browser.sleep(2000);
        var history1=element.all(by.repeater('x in notlist'));
        expect(history1.count()).toEqual(initial-1);
        
    });
  });

describe('Protractor Baby Monitoring System device-list page testing',function(){
    it('redirect to device-list page error free ', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test4');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        //browser.waitForAngularEnabled(false);
        browser.get('http://localhost:3000/device-list');
        browser.get('http://localhost:3000/device-list');
        browser.sleep(1000);
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/device-list');
    });
    it(' Testing sound button', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/device-list');
        browser.get('http://localhost:3000/device-list');
        browser.sleep(1000);
        // var initial= 0;
        // var history= element.all(by.id('body'));
        //console.log("Count: "+await history.count());
        // var history= element.all(by.id('body'));
        // var button1=history.first().element(by.id('sound'));;
        // button1.click();
        var button=element.all(by.id('body')).first().element(by.id('sound'));
        button.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/sound');
    });
    it(' Testing temp button', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/device-list');
        browser.get('http://localhost:3000/device-list');
        browser.sleep(1000);
        var button=element.all(by.id('body')).first().element(by.id('temp'));
        button.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/temp');
    });
    it(' Testing infrared button', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/device-list');
        browser.get('http://localhost:3000/device-list');
        browser.sleep(1000);
        var button=element.all(by.id('body')).first().element(by.id('infrared'));
        button.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/infrared');
    });
    it(' Testing accelerometer button', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/device-list');
        browser.get('http://localhost:3000/device-list');
        browser.sleep(1000);
        var button=element.all(by.id('body')).first().element(by.id('accelerometer'));
        button.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/accelerometer');
    });
    it(' Testing humid button', function(){
        browser.get('http://localhost:3000/login');
        var username=element(by.model('username'));
        var password=element(by.model('password'));
        username.sendKeys('test');
        password.sendKeys('12345678');
        var loginbutton=element(by.id('login'));
        loginbutton.click();
        browser.sleep(2000);
        browser.get('http://localhost:3000/device-list');
        browser.get('http://localhost:3000/device-list');
        browser.sleep(1000);
        var button=element.all(by.id('body')).first().element(by.id('humid'));
        button.click();
        expect(browser.getCurrentUrl()).toEqual('http://localhost:3000/humid');
    });
  });