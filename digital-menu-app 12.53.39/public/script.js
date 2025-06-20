const menu = [
  { name: 'Tacos', price: 5 },
  { name: 'Sandwich', price: 4 },
  { name: 'Panini', price: 6 },
  { name: 'Pizza', price: 8 }
];

const menuContainer = document.getElementById('menu');
const order = [];

menu.forEach(item => {
  const div = document.createElement('div');
  div.className = 'flex justify-between bg-white p-3 rounded shadow';
  div.innerHTML = `
    <span>${item.name} - $${item.price}</span>
    <input type="number" min="0" value="0" class="w-16 quantity border rounded px-2" data-name="${item.name}" data-price="${item.price}" />
  `;
  menuContainer.appendChild(div);
});

document.getElementById('submitOrder').addEventListener('click', async () => {
  const quantities = document.querySelectorAll('.quantity');
  const orderData = [];
  quantities.forEach(input => {
    const quantity = parseInt(input.value);
    if (quantity > 0) {
      orderData.push({
        name: input.dataset.name,
        price: input.dataset.price,
        quantity
      });
    }
  });

  if (orderData.length > 0) {
    await fetch('/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    alert('Order sent!');
  } else {
    alert('Select at least one item.');
  }
});