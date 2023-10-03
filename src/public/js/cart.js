const tableProdCartID = document.getElementById('tableProdCartID');
const cierreCompraDiv = document.getElementById('cierreCompra');

let products = [];

function loadCartAndUpdate() {
  fetch('/api/sessions/current')
  .then((response) => response.json())
  .then((data) => {
    const cartID = data.cart;
    fetch(`/api/carts/${cartID}`)
    .then((response) => response.json())
    .then((data) => {
      data.result.products.forEach((updatedProduct) => {
        const existingProduct = products.find(p => p._id === updatedProduct._id);
        if (existingProduct) {
          updatedProduct.quantity = existingProduct.quantity;
        }
      });
      products = data.result.products;
      updateTable();
      updateTotalPrice(products);
      if (products.length === 0) {
        handleEmptyCart();
      }
    });
  });
}

function updateTable() {
  tableProdCartID.innerHTML = '';
  products.forEach((product) => {
    const {
      title,
      stock,
      thumbnail,
      price
    } = product.product;
    const quantity = product.quantity;
    const idProd = product._id;
    const subtotal = price * quantity;
    const productRow = `
      <tr>
        <td>${title}</td>
        <td><img src="${thumbnail[0]}" alt="${title}" class="Imgs"></td>
        <td>${stock}</td>
        <td>
          <input type="number" class="input-quantity" data-product-id="${idProd}" value="${quantity}" min="1" max="${stock}">
        </td>
        <td>$${price}</td>
        <td class="subtotal">$${subtotal}</td>
        <td><h2 class="boton" data-product-id="${idProd}">Eliminar</h2></td>
      </tr>`;
    tableProdCartID.insertAdjacentHTML('beforeend', productRow);
  });
}

function handleEmptyCart() {
  cierreCompraDiv.innerHTML = '<h2 style="margin: 6em;">El carrito está vacío.</h2>';
}

loadCartAndUpdate();

function pollForChanges() {
  const pollingInterval = 10000;
  setInterval(() => {
    if (products.length > 0) {
      loadCartAndUpdate();
    }
  }, pollingInterval);
}

pollForChanges();

tableProdCartID.addEventListener('input', (event) => {
  if (event.target.classList.contains('input-quantity')) {
    const productID = event.target.getAttribute('data-product-id');
    const quantity = parseInt(event.target.value, 10);
    const product = products.find(p => p._id === productID);
    if (product) {
      product.quantity = quantity;
      const subtotalCell = event.target.parentElement.parentElement.querySelector('.subtotal');
      const unitPrice = parseFloat(product.product.price);
      const subtotal = unitPrice * quantity;
      subtotalCell.textContent = `$${subtotal.toFixed(2)}`;
      updateTotalPrice(products);
    }
  }
});

tableProdCartID.addEventListener('click', (event) => {
  if (event.target.classList.contains('boton')) {
    const productID = event.target.getAttribute('data-product-id');
    deleteToCart(products, productID);
  }
});

function calculateTotalPrice(products) {
  let totalPrice = 0;
  products.forEach((product) => {
    const unitPrice = parseFloat(product.product.price);
    const quantity = product.quantity;
    const subtotal = unitPrice * quantity;
    totalPrice += subtotal;
  });
  return totalPrice;
}

function updateTotalPrice(products) {
  const totalPrice = calculateTotalPrice(products);
  const totalPriceSpan = document.getElementById('totalPrice');
  totalPriceSpan.textContent = ` $ ${totalPrice}`;
  const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');
  finalizarCompraBtn.addEventListener('click', async () => {
    const confirmationResult = await Swal.fire({
      title: 'Confirmar compra',
      text: '¿Estás seguro de que deseas finalizar la compra?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    });
    if (confirmationResult.isConfirmed) {
      processPurchase(products);
      const processingAlert = await Swal.fire({
        title: 'Compra finalizada',
        text: 'En breve podrás acceder a la boleta de tu compra en la sección de tickets del carrito. ',
        icon: 'success',
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        allowOutsideClick: false
      });
    }
  });
}

function deleteToCart(products, productID) {
  fetch('/api/sessions/current')
  .then(response => response.json())
  .then(data => {
    const cartID = data.cart;
    fetch(`/api/carts/${cartID}/products/${productID}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        loadCartAndUpdate();
      })
      .catch(error => {
        console.error('Error al eliminar producto:', error);
      });
  })
  .catch(error => {
    console.error('Error al obtener el ID del carrito:', error);
  });
}

function processPurchase(products) {
  fetch('/api/sessions/current')
  .then(response => response.json())
  .then(data => {
    const cartID = data.cart;
    const userEmailAddress = data.email;
    const productsToSend = products.map(product => {
      return {
        cartProductID: product._id,
        databaseProductID: product.product._id,
        quantity: product.quantity,
        title: product.product.title,
        price: product.product.price,
      };
    });
    const purchaseData = {
      cartID: cartID,
      products: productsToSend,
      totalPrice: totalPrice,
      userEmailAddress
    };
    console.log('Datos de compra a enviar:', purchaseData);
    fetch(`/api/carts/${cartID}/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(purchaseData)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error al procesar la compra:', error);
    });
  })
  .catch(error => {
    console.error('Error al obtener el ID del carrito:', error);
  });
}