const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests',
  testMatch:'browser.spec.cjs',
  forbidOnly:!!process.env.CI,
  retries:0,
  workers:1,
  reporter:'list',
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'webkit-mobile',use:{...devices['iPhone 13'],browserName:'webkit'}}
  ],
  webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:30000}
});
