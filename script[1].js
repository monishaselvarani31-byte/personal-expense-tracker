const API = 'api/expenses';
const $ = (id) => document.getElementById(id);
const tbody = $('tbody');

$('date').value = new Date().toISOString().slice(0, 10);

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

async function loadExpenses() {
  const params = new URLSearchParams();
  if ($('fCategory').value) params.append('category', $('fCategory').value);
  if ($('fFrom').value) params.append('from', $('fFrom').value);
  if ($('fTo').value) params.append('to', $('fTo').value);

  try {
    const res = await fetch(API + '?' + params.toString());
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty">No expenses found</td></tr>';
      $('total').textContent = '₹0.00';
      return;
    }

    let total = 0;
    tbody.innerHTML = data.map((e) => {
      total += e.amount;
      return `<tr>
        <td>${esc(e.date)}</td>
        <td>${esc(e.title)}</td>
        <td>${esc(e.category)}</td>
        <td>₹${e.amount.toFixed(2)}</td>
        <td><button class="del" onclick="deleteExpense(${e.id})">Delete</button></td>
      </tr>`;
    }).join('');
    $('total').textContent = '₹' + total.toFixed(2);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5" class="empty">Something went wrong</td></tr>';
  }
}

async function addExpense() {
  const body = {
    title: $('title').value,
    amount: $('amount').value,
    category: $('category').value,
    date: $('date').value,
  };
  const msg = $('msg');
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      $('title').value = '';
      $('amount').value = '';
      msg.textContent = 'Expense added!';
      msg.style.color = 'green';
      loadExpenses();
    } else {
      const err = await res.json();
      msg.textContent = err.error || 'Failed to add';
      msg.style.color = 'red';
    }
  } catch (e) {
    msg.textContent = 'Cannot reach server';
    msg.style.color = 'red';
  }
}

async function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  await fetch(API + '/' + id, { method: 'DELETE' });
  loadExpenses();
}

$('addBtn').addEventListener('click', addExpense);
['fCategory', 'fFrom', 'fTo'].forEach((id) => $(id).addEventListener('change', loadExpenses));
$('clearBtn').addEventListener('click', () => {
  $('fCategory').value = '';
  $('fFrom').value = '';
  $('fTo').value = '';
  loadExpenses();
});

loadExpenses();