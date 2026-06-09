const { JSDOM } = require("jsdom");

JSDOM.fromURL("https://skillparty.github.io/proyecto_HSK/index.html?v=clear", {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
}).then(dom => {
  setTimeout(() => {
    const document = dom.window.document;
    console.log("HOME display:", document.getElementById("home").style.display);
    console.log("HOME classes:", document.getElementById("home").className);
    
    // Click Cultura
    const cultureBtn = document.querySelector('.nav-group-trigger'); // Wait, there are multiple nav-group-triggers
    const cultureGroup = document.querySelector('.nav-group[data-group="culture"] .nav-group-trigger');
    if (cultureGroup) {
      cultureGroup.click();
      console.log("Clicked culture group trigger");
    }
    
    setTimeout(() => {
      // Click character evolution
      const charBtn = document.querySelector('.nav-dropdown-item[data-tab="culture-characters"]');
      if (charBtn) {
        charBtn.click();
        console.log("Clicked char evolution btn");
      }
      
      setTimeout(() => {
        console.log("HOME display:", document.getElementById("home").style.display);
        console.log("HOME classes:", document.getElementById("home").className);
        console.log("CULTURE CHARACTERS display:", document.getElementById("culture-characters").style.display);
        console.log("CULTURE CHARACTERS classes:", document.getElementById("culture-characters").className);
        console.log("CULTURE CHARACTERS HTML:", document.getElementById("culture-characters").outerHTML);
        process.exit(0);
      }, 2000);
    }, 500);
  }, 2000);
});
