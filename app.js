var budgetController = (function() {
    //konstruktori za kreiranje troskova i doprinosa
    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    //objekti za cuvanje podataka za importovanje u html


    Expenses.prototype.calcPercentage = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round(this.value / totalInc * 100)
        } else {
            this.percentage = -1;
        }
    }

    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    }


    var calculateTotal = function(type) {
        var sum = 0;
        data.arrs[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.total[type] = sum;

    }

    var data = {
        total: {
            inc: 0,
            exp: 0
        },
        arrs: {
            inc: [],
            exp: []
        },
        totalBudeget: 0,
        procentage: -1
    }
    return {
        //metoda za setovanje podataka
        setData: function(type, des, val) {
            var ID, input;
            if (data.arrs[type].length > 0) {
                ID = data.arrs[type][data.arrs[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'inc') {
                input = new Income(ID, des, val);
            } else if (type === 'exp') {
                input = new Expenses(ID, des, val);
            }
            data.arrs[type].push(input);
            return input;
        },

        calculateBudget: function(type) {
            calculateTotal('inc');
            calculateTotal('exp');
            data.totalBudeget = data.total.inc - data.total.exp;
            if (data.total.inc > 0) {
                data.procentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.procentage = -1;
            }
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.arrs[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (ids !== -1) {
                data.arrs[type].splice(index, 1);
            }
        },


        calcPercentage: function() {
            data.arrs.exp.forEach(function(cur) {
                cur.calcPercentage(data.total.inc)
            })
        },

        getPercentage: function() {
            var perce = data.arrs.exp.map(function(cur) {
                return cur.getPercentage();
            })
            return perce;
        },

        getBudget: function() {
            return {
                budget: data.totalBudeget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                proc: data.procentage
            }
        },

        testing: function() {
            console.log(data);
        }

    }

})();

var UIcontroller = (function() {
    //objekat za primenu klasa
    var DOMstrings = {
        addType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        addBtn: '.add__btn',
        inc: '.income__list',
        exp: '.expenses__list',
        budgetValue: '.budget__value',
        totalInc: '.budget__income--value',
        totalExp: '.budget__expenses--value',
        procentage: '.budget__expenses--percentage',
        container: '.container',
        expLab: '.item__percentage',
        date: '.budget__title--month'
    }
var nodeList = function(list, callback) {

                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i)
                }
            }
    
    var formatNumber = function(num, type) {
        var numSplit, dec, int;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length)
        }
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    }

    return {
        //metoda za uzimanje unosa iz html-a
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.addType).value,
                description: document.querySelector(DOMstrings.addDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.addValue).value)
            }
        },

        //metoda za prenos klasa u IFIE controller
        doms: function() {
            return DOMstrings;
        },
        //metoda za importovanje html-a za listu torskova i doprinosa
        setHTML: function(type, obj) {
            var html, newHTML, itemList;
            if (type === 'inc') {
                itemList = DOMstrings.inc;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                itemList = DOMstrings.exp;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            document.querySelector(itemList).insertAdjacentHTML('beforeend', newHTML);
        },
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.addDescription + ', ' + DOMstrings.addValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        updateBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.totalInc).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.totalExp).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.proc > 0) {
                document.querySelector(DOMstrings.procentage).textContent = obj.proc + '%';
            } else {
                document.querySelector(DOMstrings.procentage).textContent = '---';
            }
        },
        displayPercentages: function(percentage) {
          nodeList(fields, function(current, index) {
        if (percentage[index] > 0) {
            current.textContent = percentage[index] + '%';
        } else {
            current.textContent = '---';
        }
    })

            var fields = document.querySelectorAll(DOMstrings.expLab)
            
        },
        changeType: function() {
            var fields = document.querySelectorAll(DOMstrings.addDescription + ','+
                DOMstrings.addValue + ','+
                DOMstrings.addType);

            nodeList(fields, function(cur){
            cur.classList.toggle('red-focus')});
              document.querySelector(DOMstrings.addBtn).classList.toggle('red')
            
        },

        displayDate: function() {
            var now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear()
            document.querySelector(DOMstrings.date).textContent = months[month] + ' ' + year

        },

        deleteListItem: function(selectedID) {
            var el = document.getElementById(selectedID);
            el.parentNode.removeChild(el);
        }
    }




})();

var controller = (function(bgtCtrl, uiCtrl) {
    var DOMstrings = uiCtrl.doms();

    var updateBudget = function() {
        bgtCtrl.calculateBudget();

        var budget = bgtCtrl.getBudget();

        uiCtrl.updateBudget(budget);
    }

    var updateProcentages = function() {
        budgetController.calcPercentage();
        var perc = budgetController.getPercentage();
        console.log(perc)
        uiCtrl.displayPercentages(perc)
    }

    //funkcija koja poziva metode iz drugih kontrolera i setuje u html
    var addInput = function() {
        var getInput = uiCtrl.getInput();
        if (getInput.description !== '' && !isNaN(getInput.value) && getInput.value > 0) {
            var setData = bgtCtrl.setData(getInput.type, getInput.description, getInput.value);
            uiCtrl.setHTML(getInput.type, setData);
            uiCtrl.clearFields();
            updateBudget();
            updateProcentages();
        }
    }

    //funkcija za brisanje inputa
    var deleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            bgtCtrl.deleteItem(type, ID);
            uiCtrl.deleteListItem(itemID);
            updateBudget();
            updateProcentages();
        }

    }


    //dodavanje funkcionalnosti buttonu i enteru
    var eventListeners = function() {
        document.querySelector(DOMstrings.addBtn).addEventListener('click', addInput);

        document.querySelector(DOMstrings.container).addEventListener('click', deleteItem);
        document.querySelector(DOMstrings.addType).addEventListener('change', UIcontroller.changeType)
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                addInput();
            }
        });
    }
    return {
        //metoda koja omogucava pokretanje eventListener funkciju

        init: function() {
            UIcontroller.displayDate()
            eventListeners();
            uiCtrl.updateBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                proc: -1
            });
        }
    }
})(budgetController, UIcontroller);

controller.init();