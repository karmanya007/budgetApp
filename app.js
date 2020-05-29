/* Creating a private function using closures and IIFE */

// BUDGET CONTROLLER
var budgetController = (function () {
	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	// Data structure
	var data = {
		allItems   : {
			exp : [],
			inc : []
		},
		totals     : {
			exp : 0,
			inc : 0
		},
		budget     : 0,
		percentage : -1
	};

	var claculateTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach(function (curr) {
			sum += curr.value;
		});
		data.totals[type] = sum;
	};

	return {
		addItem         : function (type, des, val) {
			var newItem, ID;
			// Create new ID

			if (data.allItems[type].length <= 0) {
				ID = 0;
			} else {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}

			// Create new item based on 'inc' or 'exp'

			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// Push it into the data structure

			data.allItems[type].push(newItem);

			// Return the new element

			return newItem;
		},

		calculateBudget : function () {
			// Calculate total income and expenses

			claculateTotal('exp');
			claculateTotal('inc');

			// Calculate the budget : income - expenses

			data.budget = data.totals.inc - data.totals.exp;

			// Calculate the percentage of the income we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
			} else {
				data.percentage = -1;
			}
		},

		getBudget       : function () {
			return {
				budget     : data.budget,
				totalInc   : data.totals.inc,
				totalExp   : data.totals.exp,
				percentage : data.percentage
			};
		},

		testing         : function () {
			console.log(data);
		}
	};
})();

// UI CONTROLLER
var UIController = (function () {
	var DOMstrings = {
		inputType        : '.add__type',
		inputDescription : '.add__description',
		inputValue       : '.add__value',
		inputBtn         : '.add__btn',
		incomeContainer  : '.income__list',
		expenseContainer : '.expenses__list',
		budgetLabel      : '.budget__value',
		incomeLabel      : '.budget__income--value',
		expensesLabel    : '.budget__expenses--value',
		percentageLabel  : '.budget__expenses--percentage'
	};

	return {
		getInput      : function () {
			return {
				type        : document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
				description : document.querySelector(DOMstrings.inputDescription).value,
				value       : parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem   : function (obj, type) {
			// Create HTML string with placeholder text
			var html, newHtml, element;
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expenseContainer;
				html =
					'<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			// Replace the placeholder text with the data

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', obj.value);

			// Insert the HTML into the DOM

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		clearFields   : function () {
			var fields, fieldsArray;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			// Converting the fields list to an array

			fieldsArray = Array.prototype.slice.call(fields);

			// Changing the Description and value to empty of exh element in fieldsArray

			fieldsArray.forEach(function (current, index, array) {
				current.value = '';
			});

			// Getting the focus back to the Description box

			fieldsArray[0].focus();
		},

		displayBudget : function (obj) {
			document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
			document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
			document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		getDOMstrings : function () {
			return DOMstrings;
		}
	};
})();

// APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
	var setupEventListners = function () {
		var DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function (event) {
			// event variable hold the key pressed
			if (event.keyCode === 13 || event.which === 13) {
				//event.which for older browsers
				ctrlAddItem();
			}
		});
	};

	var updateBudget = function () {
		// Calculate the budget

		budgetCtrl.calculateBudget();

		// Return the budget

		var budget = budgetCtrl.getBudget();

		// Update the UI

		UICtrl.displayBudget(budget);
	};

	var ctrlAddItem = function () {
		var input, newItem;
		// Get the field input data
		input = UICtrl.getInput();

		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// Add the item to the budget controller

			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// Add the item to UI

			UICtrl.addListItem(newItem, input.type);

			// Clear the fields

			UICtrl.clearFields();

			// Calculate and update budget

			updateBudget();
		}
	};

	return {
		init : function () {
			console.log('Application has started.');
			UICtrl.displayBudget({
				budget     : 0,
				totalInc   : 0,
				totalExp   : 0,
				percentage : -1
			});
			setupEventListners();
		}
	};
})(budgetController, UIController);

// Initialiser function
controller.init();
