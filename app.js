/* Creating a private function using closures and IIFE */

// BUDGET CONTROLLER
var budgetController = (function () {
	// Expense function constructor
	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	// Adding prototype functions to calculate percentage and returning percentage
	Expense.prototype.calcPercentage = function (totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	// Income function constructor
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

	// Private function to calculate the total expenses and incomes
	var claculateTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach(function (curr) {
			sum += curr.value;
		});
		data.totals[type] = sum;
	};

	// Public functions start
	return {
		// Function to first create a unique ID, then creating a new object from the constructor and then adding that object to the data structure
		addItem              : function (type, des, val) {
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

		// Function to delete the income or expense object from the data structure according to the id passed
		deleteItem           : function (type, id) {
			var ids, index;

			// Creating a copy of the array from the data structure

			ids = data.allItems[type].map(function (current) {
				return current.id;
			});

			// Getting the index of the required id

			index = ids.indexOf(id);

			// Deleting that id from the array

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		// Function to calculate the total expeses and income, budget(income-expenses) and also putting the percentage into the data structure
		calculateBudget      : function () {
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

		// Function to calculate the percentage for each expense in the data structure by calling the prototype function calcPercentage
		calculatePercentages : function () {
			data.allItems.exp.forEach(function (cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		// Function to return the percentage for each expense in the data structure by calling the prototype function getPercentage
		getPercentage        : function () {
			var allPerc = data.allItems.exp.map(function (cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},

		// Function to return budget information as an object to use in other controllers
		getBudget            : function () {
			return {
				budget     : data.budget,
				totalInc   : data.totals.inc,
				totalExp   : data.totals.exp,
				percentage : data.percentage
			};
		}
		// Testing function
		/* testing              : function () {
			console.log(data);
		} */
	};
})();

// UI CONTROLLER
var UIController = (function () {
	// Object to store all the HTML classes
	var DOMstrings = {
		inputType         : '.add__type',
		inputDescription  : '.add__description',
		inputValue        : '.add__value',
		inputBtn          : '.add__btn',
		incomeContainer   : '.income__list',
		expenseContainer  : '.expenses__list',
		budgetLabel       : '.budget__value',
		incomeLabel       : '.budget__income--value',
		expensesLabel     : '.budget__expenses--value',
		percentageLabel   : '.budget__expenses--percentage',
		container         : '.container',
		expensesPercLabel : '.item__percentage',
		dateLabel         : '.budget__title--month'
	};

	// Function to format the number displayed on screen
	var formatNumber = function (num, type) {
		var numSplit, int, dec;

		// Getting the absolute value of num

		num = Math.abs(num);

		// Rounding it to 2 decimal places. toFixed() return a string

		num = num.toFixed(2);

		// Splitting the number into int and decimal parts

		numSplit = num.split('.');

		int = numSplit[0];
		dec = numSplit[1];

		// Setting the comma in the int string

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		// Returning as +/- (int).(dec)

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	// Function defination for itterating over each element in the node list and calling the callback function each time
	var nodeListForEach = function (list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};
	// Public functions start
	return {
		// Function to return the data of type, description and value fields
		getInput           : function () {
			return {
				type        : document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
				description : document.querySelector(DOMstrings.inputDescription).value,
				value       : parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		// Function to add the new income/expenses object to the HTML to display it
		addListItem        : function (obj, type) {
			// Create HTML string with placeholder text
			var html, newHtml, element;
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expenseContainer;
				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			// Replace the placeholder text with the data

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the HTML into the DOM

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		// Function to delete the inc/exp object form the HTML document
		deleteListItem     : function (selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		// Function to clear the value in Description box and input box after taking an input
		clearFields        : function () {
			var fields, fieldsArray;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			// Converting the fields list to an array

			fieldsArray = Array.prototype.slice.call(fields);

			// Changing the Description and value to empty of each element in fieldsArray

			fieldsArray.forEach(function (current, index, array) {
				current.value = '';
			});

			// Getting the focus back to the Description box

			fieldsArray[0].focus();
		},

		// Function to display all the budget related numbers on in the UI
		displayBudget      : function (obj) {
			var type;
			obj.budget > 0 ? (type = 'inc') : (type = 'exp');

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		// Function to display the percentage of each expenses object in the UI
		displayPercentages : function (percentages) {
			// Selecting the class="item__percentage"
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			// Calling the nodeListForEach function with list = fields and callback = function(current, index). When the callback function is called from the function defination, list[i] = current and i = index
			nodeListForEach(fields, function (current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		// Function to display the current month and year
		displayMonth       : function () {
			var now, year, month, monthList;
			monthList = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'Octuber',
				'November',
				'December'
			];
			now = new Date();
			// Other way to use Date(): var christmas = new Date(2020,11,25);

			// Storing the month

			month = now.getMonth();

			// Storing the year

			year = now.getFullYear();

			document.querySelector(DOMstrings.dateLabel).textContent = monthList[month] + ' ' + year;
		},

		// Function to change the color of input, description and value fields according the type selected (exp[Red]/inc[Blue])
		changedType        : function () {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
			);
			nodeListForEach(fields, function (cur) {
				cur.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstrings      : function () {
			return DOMstrings;
		}
	};
})();

// APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
	// Setting up all the event listners
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

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	// Function to call the calculate and display budget function from other controllers
	var updateBudget = function () {
		// Calculate the budget

		budgetCtrl.calculateBudget();

		// Return the budget

		var budget = budgetCtrl.getBudget();

		// Update the UI

		UICtrl.displayBudget(budget);
	};

	// Function to call the calculate and display percentages function from other controllers
	var updatePercentages = function () {
		// Calculate the percentages
		budgetCtrl.calculatePercentages();
		// Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentage();
		// Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	// Function to call the getInput, add items to the budget data structure and update the UI functions from other controllers
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

			// Calculate and update the percentages

			updatePercentages();
		}
	};

	// Function to call function from other controllers to delete the HTML added to the document when the new object was added
	var ctrlDeleteItem = function (event) {
		var itemID, splitID, type, id;

		// Gets the id form <div class="item clearfix" id="exp-0"> html element

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		// If the ID exists(ID only exists if the clicked on the delete icon)

		if (itemID) {
			// itemID == inc-1 or exp-1. Using split to break it into 2 parts

			splitID = itemID.split('-');

			// Setting the type to [0]th and ID to [1]st index

			type = splitID[0];
			id = parseInt(splitID[1]); // Converting the string into int

			// Delet the item from the data structure

			budgetCtrl.deleteItem(type, id);

			// Delete the item form the UI

			UIController.deleteListItem(itemID);

			// Update and show the new budget

			updateBudget();

			// Calculate and update the percentages

			updatePercentages();
		}
	};

	// Returning the initialiser function so that it can be called at the start of the webpage
	return {
		init : function () {
			UICtrl.displayMonth();
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
