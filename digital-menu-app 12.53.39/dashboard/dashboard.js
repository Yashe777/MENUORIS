const socket = io();
const orderList = document.getElementById('orders');

socket.on('newOrder', (order) => {
  const li = document.createElement('li');
  li.className = 'bg-white p-4 rounded shadow';
  li.innerHTML = `
    <h2 class="font-bold mb-2">New Order:</h2>
    ${order.map(item => `<p>${item.quantity} × ${item.name} - $${item.price}</p>`).join('')}
  `;
  orderList.prepend(li);
});