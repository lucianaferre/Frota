// Utility functions for the application

function sortTable(column) {
  const table = document.getElementById('ordensTable');
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  const columnIndex = Array.from(table.querySelectorAll('th')).findIndex(th => 
    th.textContent.toLowerCase().includes(column.toLowerCase())
  );
  
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent;
    const bValue = b.cells[columnIndex].textContent;
    
    if (!isNaN(aValue) && !isNaN(bValue)) {
      return parseFloat(aValue) - parseFloat(bValue);
    }
    
    return aValue.localeCompare(bValue);
  });
  
  rows.forEach(row => tbody.appendChild(row));
}

// Export to CSV
function exportToCSV(data, filename) {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

// Print functionality
function printTable() {
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<pre>' + document.querySelector('table').outerHTML + '</pre>');
  printWindow.document.close();
  printWindow.print();
}

// Confirm delete with modal
function confirmDelete(message = 'Tem certeza que deseja deletar este item?') {
  return confirm(message);
}

// Format phone number
function formatPhone(phone) {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Get query parameter from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Local storage helpers
const localStorageHelper = {
  set: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

// Session storage helpers
const sessionStorageHelper = {
  set: (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get: (key) => {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key) => {
    sessionStorage.removeItem(key);
  },
  clear: () => {
    sessionStorage.clear();
  }
};

// Generate unique ID
function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Clone object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Array utilities
const arrayUtils = {
  unique: (arr) => [...new Set(arr)],
  remove: (arr, item) => arr.filter(i => i !== item),
  findIndex: (arr, predicate) => arr.findIndex(predicate),
  groupBy: (arr, key) => {
    return arr.reduce((acc, obj) => {
      const group = obj[key];
      if (!acc[group]) acc[group] = [];
      acc[group].push(obj);
      return acc;
    }, {});
  }
};

// String utilities
const stringUtils = {
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
  truncate: (str, length) => str.length > length ? str.substring(0, length) + '...' : str,
  slugify: (str) => str.toLowerCase().replace(/\s+/g, '-'),
  camelCase: (str) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
    index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '')
};

// Number utilities
const numberUtils = {
  clamp: (num, min, max) => Math.min(Math.max(num, min), max),
  random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  round: (num, decimals) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
};

// Date utilities
const dateUtils = {
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  daysAgo: (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },
  formatShort: (date) => new Date(date).toLocaleDateString('pt-BR')
};

// Notification utilities
const notificationUtils = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  warning: (message) => showToast(message, 'warning'),
  info: (message) => showToast(message, 'info')
};