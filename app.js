//console.log("Hey rg....!");

//Budget controller
var budgetController = (function(){
  
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){

    if(totalIncome > 0)
    {
     this.percentage = Math.round((this.value / totalIncome)*100);
    }else{
      this.percentage = -1;
    }

  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };


  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(cur){
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems : {
      exp: [],
      inc: []
    },
    totals : {
      exp: 0,
      inc: 0
    },
    budget : 0,
    percentage : -1
  };

  return {
    addItem: function(type, des, val){
      var newItem;

      //create new id
      if(data.allItems[type].length>0)
      {
        ID = data.allItems[type][data.allItems[type].length-1].id + 1;
      }
      else
      {
        ID = 0;
      }
      
      //create new item based on inc or exp
      if(type === 'exp'){
        newItem = new Expense(ID, des, val);
      }
      else if(type === 'inc'){
        newItem = new Income(ID, des, val);
      }
      
      //push it into data structure      
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem: function(type, id){
      
      var ids, index;

      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      
      index = ids.indexOf(id);

      if(index !== -1)
      {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function()
    {
      var sum=0;

      //calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      //calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income that we spent
      if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
      }
      else{
        data.percentage = -1;
      }
    },

    calculatePercentages: function(){
      
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages : function(){
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function(){
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function(){
      console.log(data);
    }
  };

})();


//UI controller
var UIController = (function(){

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage', 
    dateLabel: '.budget__title--month'
  };

  
  var formatNumber = function(num, type){
      
    var numsplit, int, dec, sign;
    // 1. + or - before number
    // 2. exactly two decimal points
    // 3. comma separating the thousands

    num = Math.abs(num);
    num = num.toFixed(2);
    numsplit = num.split('.');
    int = numsplit[0];
    if(int.length > 3){
      int = int.substr(0, int.length-3)+','+int.substr(int.length-3, 3);
    }
    
    dec = numsplit[1];

    type === 'exp' ? sign = '-' : sign = '+';

    return sign + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback){
    for(var i=0; i<list.length; i++){
      callback(list[i], i);
    }
  };


  return{

    getInput: function(){
      return {
        type : document.querySelector(DOMstrings.inputType).value,
         //inc or exp
        description : document.querySelector(DOMstrings.inputDescription).value,
        value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type){
    var html, newHtml, element;

      // create an HTML string with placeholder text

      if(type === 'inc'){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      }
      else if(type === 'exp'){
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      
      // replace the placeholder text with some data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

      // insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectorID){

      var el =  document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },

    clearFields: function(){
      var feilds, feildsArr;

      feilds = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      feildsArr = Array.prototype.slice.call(feilds);

      feildsArr.forEach(function(current, index, array){
        current.value =  "";
      });

      feildsArr[0].focus();
    },

    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, type);
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, type);
      

      if(obj.percentage > 0)
      {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%';
      }
      else
      {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },
    
    displayPercentages : function(percentages){
      var fields;

      fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index){
        if(percentages[index]>0){
          current.textContent = percentages[index] + "%";
        }else{
          current.textContent = "---";
        }
      })
    },

    displayMonth: function(){
      var now, month, year;

      var months = ['January', 'Febraury', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octomber', 'November', 'December'];

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;

    },

    changedType: function(){
      
      var feilds;
      feilds = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);

        nodeListForEach(feilds, function(cur){
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

    },

    getDOMStrings: function(){
      return DOMstrings;
    }
    
  };

})();


// Global app controller
var controller = (function(budgetCtrl,UICtrl){

  var setupEventListeners = function()
  {
    var DOM = UIController.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event){
    
      if(event.keyCode === 13 || event.which === 13)
      {
        ctrlAddItem();
     }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function(){
    var budget;
    
    // 1. calculate the budget
      budgetController.calculateBudget();

     // 2. return the budget
     budget = budgetController.getBudget();
     //console.log(budget);

     // 3. display the budget in UI
     UICtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    
    var percentages;

    // 1. Calculate Percentages
    budgetCtrl.calculatePercentages();

    // 2. Read Percentages from Budget controller
    percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with new percentages
    //console.log(percentages);
    UICtrl.displayPercentages(percentages);
  }

  var ctrlAddItem = function(){
    var input, newItem;    

    // 1. get the field input data
    input = UIController.getInput();
    //console.log(input);

    if(input.description !== "" && !isNaN(input.value) && input.value>0){
      // 2. add the item to the budget controller
      newItem = budgetController.addItem(input.type, input.description, input.value);

      // 3. add the new item to the user interface
      UIController.addListItem(newItem, input.type);

      // 4. clear the feilds
     UIController.clearFields();

      // 5. calculate and update budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event){

    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID)
    {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete item from data structure
      budgetController.deleteItem(type, ID);

      // 2. Delete item from UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculte and update percentages
      updatePercentages();
    }

  };

  return{
    init: function(){
      //console.log("application has started ");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget:0,
        totalInc:0,
        totalExp:0,
        percentage:-1
      });
      setupEventListeners();
    }

  }

})(budgetController,UIController);

controller.init();