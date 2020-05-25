//BUDGET CONTROLLER
const budgetController = () => {

    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        };

        calcPercentage = (totalIncome) => {
            if(totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        }

        getPercentage = () => {
            return this.percentage;
        };

 
    };

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this .value = value;
        };
    };

    let data = {
        allItems: {
            Exp: [],
            Inc: []
        },

        totals : {
            Exp: 0,
            Inc: 0
        },

        budget: 0,
        percentage: -1
    };

    const calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach(cur => {
            sum += cur.value;  
        });

        data.totals[type] = sum;
    }

    return {
        addItems: (type, des, val) => {
            let ID, newItem;

            //Create an ID 
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create objects based on the type
            if(type === 'Exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'Inc') {
                newItem = new Income(ID, des, val);
            }

           
            //Push the object into the data structure
            data.allItems[type].push(newItem);

            //return the object
            return newItem;
        },

        deleteItems : (type, id) => {
            let ids, index;
            ids = data.allItems[type].map(cur => {
                return cur.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        //Calculate the Budget
        calculateBudget: () => {

            //Calculate the budget
            calculateTotal('Exp');
            calculateTotal('Inc');

            //Calculate the budget - income - expense
            data.budget = data.totals.Inc - data.totals.Exp;
            console.log(data.budget);

            //Calculate the percentage of income
            if(data.totals.Inc > 0) {
                data.percentage = Math.round((data.totals.Exp / data.totals.Inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentage: () => {
            data.allItems.Exp.forEach(cur => {
                cur.calcPercentage(data.totals.Inc);
            });
                
        },

        getPercentages: () => {
           let allPerc = data.allItems.Exp.map(cur => {
                return cur.getPercentage();
           });
           return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.Inc,
                totalExp: data.totals.Exp,
                percentage: data.percentage
            };
        },

        testing: () => {
            console.log(data);
        }
    };
   
}

//UI CONTROLLER
const UIController = () => {

    const DOMStrings = {
        inputType: '.add_type',
        inputDesription: '.add_description',
        inputValue: '.add_value', 
        inputBtn: '.add__btn',
        budgetLabel: '.budget-value',
        incomeLabel: '.income-value',
        expensesLabel: '.expenses-value',
        incomeContainer: '.income__list',
        percentageLabel: '.expenses-percent',
        expenseContainer: '.expenses__list',
        expensePercLabel: '.item_percentage',
        container: '.container',
        dataLabel: '.month-text'
    };

   const formatNumber = (num, type) => {
        let  int, dec, numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`;     //2310 -> 2,310
        }

        dec = numSplit[1];

        return `${(type === 'Exp' ? '-' : '+')} ${int}.${dec}`;

    }

    const nodeListForEach = (list, callback) => {
        for(let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getDOMStrings: () => {
            return DOMStrings;
        },

        getInput: () => {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDesription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: (obj, type) => {
            let newHtml, element, html;

            if(type === 'Inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="Inc-%id%">
                <div class="item_description">%description%</div>
                <div class="right clearfix">
                    <div class="item_value">%value%</div>
                    <div class="delete-item">
                        <button class="item__delete--btn">
                            <i class="ion-ios-close-outline"></i>
                        </button>
                      </div>
                    </div>
                 </div>`;
            } else if(type === 'Exp') {
                element = DOMStrings.expenseContainer;

                html = `<div class="item clearfix" id="Exp-%id%">
                <div class="item_description">%description%</div>
                <div class="right clearfix">
                    <div class="item_value">%value%</div>
                    <div class="item_percentage">20%</div>
                    <div class="delete-item">
                        <button class="item__delete--btn">
                            <i class="ion-ios-close-outline"></i>
                        </button>
                       </div>
                   </div>
                 </div>`;
            }

            //Replace the placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
  
        },

        deleteListItems: (selectorID) => {
            let el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: () => {
            let fields, fieldsArr;

            fields = document.querySelectorAll(`${DOMStrings.inputDesription}, ${DOMStrings.inputValue}`);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current) => {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: (obj) => {
            let type;

            obj.budget > 0 ? type = 'Inc' : type = 'Exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'Inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'Exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = `${obj.percentage}%`;
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = `---`;
            }
        },

        displayPercentage: (percentage) => {
            let field = document.querySelectorAll(DOMStrings.expensePercLabel);

            nodeListForEach(field, (cur, index) => {
                if(percentage[index] > 0) {
                    cur.textContent = `${percentage[index]}%`;
                } else {
                    cur.textContent = `---`;
                }
            });

        },

        displayMonths: () => {
            let now, year, month, months;

            now = new Date();   //(2020, 05, 24)

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth(); 

            year = now.getFullYear();

            document.querySelector(DOMStrings.dataLabel).textContent = `${months[month]}, ${year}`

        },

        changedType: () => {
            let fields;

            fields = document.querySelectorAll(`${DOMStrings.inputType}, ${DOMStrings.inputDesription}, ${DOMStrings.inputValue}`);

            nodeListForEach(fields, cur => {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    };
     
   
}


//GLOBAL APP CONTROLLER
const controller = ((bdgtCtrl, UIctrl)=> {

    const updateBudget = () => {
        //1.Calculate the budget
        bdgtCtrl.calculateBudget();

        //2. Return the budget
        const budget = bdgtCtrl.getBudget();

        //3. Display the budget on UI
        UIctrl.displayBudget(budget);

    }

    const updatePercentage = () => {
        //1. Calculate the percentage
        bdgtCtrl.calculatePercentage();

        //2. Get the calculated percentage
        const percentages = bdgtCtrl.getPercentages();

        //3. Update the Percentages UI
        UIctrl.displayPercentage(percentages);



    }

    const ctrlAddItem = () => {
        let input, newItem;
        //1. Get input
        input = UIctrl.getInput();
       // console.log(input);
        if(input.description != "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the input to the Budget Controller
            newItem = bdgtCtrl.addItems(input.type, input.description, input.value);
            
            //3. Add the item to UI
            UIctrl.addListItem(newItem, input.type);

            //4. Clear the input field
            UIctrl.clearFields();

            //5. Update the budget
            updateBudget();

            //6. Calculate the percentage
            updatePercentage();

            bdgtCtrl.testing();

        }

     };

     const ctrlDeleteItem = (event) => {
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from budget controller
            bdgtCtrl.deleteItems(type, ID);

            //2. Delete the item from UI
            UIctrl.deleteListItems(itemID);

            //3. Update the budget
            updateBudget();

            //4. Update the percentage
            updatePercentage();

           console.log(bdgtCtrl.getBudget()); 

           // bdgtCtrl.testing();
        }

     };

        const setUpEventListeners = () => {
            const DOM = UIctrl.getDOMStrings();
            document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
            document.addEventListener('keypress', (event) => {
                if(event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem();
                }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);

      };

      const init = () => {
          console.log('Application is started');
          UIctrl.displayMonths();
          UIctrl.displayBudget ({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
          });

          setUpEventListeners();
      }

      init();
  
});
controller(budgetController(), UIController());