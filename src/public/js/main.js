const socket = io();

fetch("/api/sessions/current")
  .then((response) => response.json())
  .then((data) => {
    let user = data;
    Swal.fire({
      icon: "success",
      title: "¡Bienvenido!",
      text: `Hola ${user.name}, has iniciado sesión con éxito.`,
    });
  })
  .catch((error) => {
    console.error("Error al obtener los datos del usuario:", error);
  });

const tableProd = document.getElementById("tableProd");

function allProducts() {
  console.log("Primera carga - General");
  socket.on("products", (products) => {
    let productos = products;
    let htmlProductos = "";
    htmlProductos += `
    <thead>
      <tr>
          <th>Modelo</th>
          <th>Descripción</th>
          <th>Img</th>
          <th>Stock</th>
          <th>Precio</th>
          <th>Unids. a comprar</th>
          <th>+ Cart</th>
      </tr>
    </thead>`;
    productos.docs.forEach((product) => {
      htmlProductos += `
          <tr>
            <td id="${product.title}">${product.title}</td>
            <td class="description">${product.description}</td>
            <td><img src="${product.thumbnail}" alt="${product.title}" class="Img"></td>
            <td>${product.stock} Und.</td>
            <td>$${product.price}</td>
            <td><input type="number" id="cantidadInput${product._id}" min="1" max="${product.stock}" value="1"></td>
            <td>
              <img id="agr${product._id}" src="https://i.ibb.co/rbtzRGS/A-adir-cart.png" alt="Agregar al carrito" class="cart-icon">
            </td>
          </tr>`;
    });
    tableProd.innerHTML = htmlProductos;
    products.docs.forEach((product) => {
      const botonAgregar = document.getElementById(`agr${product._id}`);
      const titleElement = document.getElementById(`${product.title}`);
      const title = titleElement.textContent;
      botonAgregar.addEventListener("click", () => {
        const cantidadInput = document.getElementById(
          `cantidadInput${product._id}`
        );
        const quantity = cantidadInput.value;
        addToCart(product._id, title, quantity);
      });
    });
    
    async function addToCart(productID, title, quantity) {
      const response = await fetch('/api/sessions/current', {
        method: 'GET',
      })
      const res = await response.json();
      let user = res;
      const cartID = user.cart;
      const productIDValue = productID;
      if (user && cartID && productIDValue) {
      const response = await fetch(`/api/carts/${cartID}/products/${productIDValue}/quantity/${quantity}`, {
        method: 'POST',
      })
      const res = await response.json();
      const statusCodeRes = res.statusCode;
      const messageRes = res.message;
      const customError = res.cause;
      console.log(res)
        if (statusCodeRes === 200) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            title: `${quantity} Unds. de ${title} se ha agregado a tu carrito`,
            icon: 'success'
          });
        }
      }
    }
  });
}


allProducts();

const tableFil = document.getElementById("tableFil");
const limit = document.getElementById("limit");
const page = document.getElementById("page");
const sort = document.getElementById("sort");
const filtro = document.getElementById("filtro");
const filtroVal = document.getElementById("filtroVal");
const limpiarFiltros = document.getElementById("limpiarFiltros");

function filtrarProducts() {
  const busquedaProducts = {
    limit: limit.value || 10,
    page: page.value || 1,
    sort: sort.value || 1,
    filtro: filtro.value || null,
    filtroVal: filtroVal.value || null,
  };
  socket.emit("busquedaFiltrada", busquedaProducts);
  return busquedaProducts;
}

limit.addEventListener("input", () => {
  filtrarProducts();
});

page.addEventListener("input", () => {
  filtrarProducts();
});

sort.addEventListener("change", () => {
  filtrarProducts();
});

filtroVal.addEventListener("change", () => {
  filtrarProducts();
});

const Pags = document.getElementById("Pags");

socket.on("products", (products) => {
  const currentPage = products.page;
  const hasNextPage = products.hasNextPage;
  let htmlPag = "";
  htmlPag += `<h2 class="pag" id="Prev">Prev </h2>
    <h2 class="pag pagNumber" id="numberPag">${currentPage}</h2>
    <h2 class="pag" id="Next">Next</h2>`;
  Pags.innerHTML = htmlPag;
  const prevButton = document.getElementById("Prev");
  const nextButton = document.getElementById("Next");
  function cambiarPagina(currentPage, newPage, hasNextPage) {
    if (newPage === -1) {
      if (currentPage < 1) {
        currentPage = 1;
      } else {
        currentPage = currentPage - 1;
      }
    }
    if (newPage === 1) {
      if (hasNextPage === false) {
        currentPage;
      } else {
        currentPage = currentPage + 1;
      }
    }
    if (currentPage) {
      const busquedaProducts = {
        limit: limit.value || 10,
        page: Number(currentPage),
        sort: sort.value || 1,
        filtro: filtro.value || null,
        filtroVal: filtroVal.value || null,
      };
      socket.emit("busquedaFiltrada", busquedaProducts);
      const pageInput = document.getElementById("page");
      pageInput.value = currentPage.toString();
    }
  }
  prevButton.addEventListener("click", (e) => {
    e.preventDefault();
    cambiarPagina(currentPage, -1, hasNextPage);
  });
  nextButton.addEventListener("click", (e) => {
    e.preventDefault();
    cambiarPagina(currentPage, +1, hasNextPage);
  });
});
