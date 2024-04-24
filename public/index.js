let json;
let discount;
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const cardContainer = document.getElementById("cardContainer");
const contadorCarrito = document.getElementById("contadorCarrito");
const menuCarrito = document.getElementById("menuCarrito");
const carritoContenedor = document.getElementById("carritoContenedor");


window.onload = async () => {
  const response = await fetch("https://fakestoreapi.com/products");
  const discountResponse = await fetch("http://localhost:3000/discounts");
  renderCarrito();

  document.addEventListener("DOMContentLoaded", () => {
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  })

  json = await response.json();
  discount = await discountResponse.json();

  await translateProducts(json)
  .then((translatedProducts) => {
    json = translatedProducts;
  })
  .catch((error) => {
    console.error("Error al traducir los productos:", error);
  });
  renderProducts();
  sincronizarStorage();
};

// carrito
async function translateProducts(json){
  try{
    const translatedProducts = [];
    for(const product of json){
      const translatedProduct = {
        ...product,
        title: await translateText(product.title),
        description: await translateText(product.description),
      };
      translatedProducts.push(translatedProduct);
    };
    return translatedProducts;
  }catch(error){
    throw new Error("Error al traducir los productos" + error.message);
  }
}
async function translateText(text) {
  try {
    const response = await fetch('http://localhost:3000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    const data = await response.json();
    if (data && data.result) {
      return data.result.translation;
    } else {
      throw new Error('Error de traducción');
    }
  } catch (error) {
    throw new Error('Error de traducción: ' + error.message);
  }
}

function agregarAlCarrito(index) {
  const product = json[index]
  let productInCart = carrito.find(item => item.id === product.id);

  if (productInCart) {
    productInCart.quantity += 1;
  } else {
    product.quantity = 1;
    carrito.push(product);
  }
  sincronizarStorage();
  renderCarrito();
  return;
}
function sincronizarStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  contadorCarrito.textContent = carrito.length? carrito.length : "0";
}

function vaciarCarrito() {
  carrito = [];
  sincronizarStorage();
  renderCarrito();
}

let oferta = false;

// cardContainer

function renderProducts() {
  cardContainer.innerHTML = "";
  json.map((product) => {
    let oferta;
    let precioAntiguo = product.price;
    let descuento;
    let montoDescontado;
    let precioFinal;
    discount.map((discount) => {
      if (product.id === discount.id) {
        oferta = true;
        descuento = discount.discount;
        montoDescontado = (product.price * (descuento / 100)).toFixed(2);
        precioFinal = (product.price - montoDescontado).toFixed(2);
        product.price = precioFinal;
      }
    })

    cardContainer.innerHTML += `
    <div class=" flex flex-col mt-5 mb-5 rounded-lg shadow-lg ring-4 ring-black ring-opacity-40 w-64 h-[400px]">
      <div class="relative flex items-center justify-center min-w-[256px] h-[200px] overflow-hidden">
        <img src="${product.image}" class="w-[256px] h-[200px] object-contain" alt="imagen-producto" />

        ${oferta?`<div class="absolute bottom-15 w-full bg-red-500 h-6  ">
        <p class="text-center text-white font-bold">OFERTA</p>
        </div>`: ''}
      </div>
      <div class="p-4 flex flex-col justify-between flex-1">
          <h5 class="text-sm font-medium mb-2">${product.title}</h5>
          <div data-tip="${product.description}"
          class="
          relative 
          before:content-[attr(data-tip)] 
          before:absolute
          before:px-3 before:py-2 
          before:left-1/2 before:-top-3 
          before:w-max before:max-w-xs 
          before:-translate-x-1/2 before:-translate-y-full 
          before:bg-gray-700 before:text-white
          before: rounded-md before:opacity-0
          before:transition-all
          
          after:absolute
          after:left-1/2 after:-top-3
          after:h-0 after:w-0
          after:translate-x-1/2 after:border-8
          after:border-t-gray-700
          after:border-l-transparent
          after:border-b-transparent
          after:border-r-transparent
          after:opacity-0
          after:transition-all 

          hover:before:opacity-100 hover:after:opacity-100
          ">
            <p class="text-gray-600 text-sm mb-4">${product.description.length > 30 ? product.description.slice(0, 30) + "..." : product.description}</p>
          </div>
          <div class="flex items-center justify-between">
          ${oferta?
            `
          <div class="flex flex-col" id="descuentos">
          <span class="font-bold text-xs line-through">$${precioAntiguo}</span>
            <div>
              <span class="font-bold text-xs text-red-500">- ${descuento}% =</span>
              <span class="font-bold text-xs text-red-500">$${montoDescontado}</span>
            </div>
            <span class="font-bold text-lg">$${precioFinal}</span>
          </div>
          <div class="flex flex-col justify-end h-full">
          <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded btnComprar" 
          onclick="agregarAlCarrito(${json.indexOf(product)})">Comprar</button>
          </div>
          `:`
          <span class="font-bold text-lg">$${product.price}</span>
          <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded btnComprar" 
          onclick="agregarAlCarrito(${json.indexOf(product)})">Comprar</button>
          `}              
          </div>
      </div>
    </div> `;

  })

}

function renderCarrito(){
  menuCarrito.innerHTML = "";
  carrito.map((product) => {
    
    menuCarrito.innerHTML += `
      <div class="flex items-center justify-between my-3 ring-2 ring-black ring-opacity-40">
        <img src="${product.image}" class="w-[64px] h-[64px] object-contain" alt="imagen-producto" />
        <span>${product.title.slice(0, 10) + "..."}</span>
        <div class="flex flex-col align-middle justify-center">
          <span> Cantidad </span>
          <div class="flex gap-2 justify-center align-middle" >
            <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
            onclick="restarCantidad(${carrito.indexOf(product)})"
            >-</button>
            <span>${product.quantity}</span>
            <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
            onclick="sumarCantidad(${carrito.indexOf(product)})"
            >+</button>
          </div>
        </div>
        <span class="overflow-hidden">$${(product.price*product.quantity).toFixed(1)}</span>
      </div>
    `
  })
}

function restarCantidad(index){
  if(carrito[index].quantity > 1){
    carrito[index].quantity -= 1;  
  }else{
    carrito.splice(index, 1);
  }
  sincronizarStorage();
  renderCarrito();
}

function sumarCantidad(index){
  carrito[index].quantity += 1;
  sincronizarStorage();
  renderCarrito();
}

function mostrarCarrito(boolean){
  if(boolean){
    carritoContenedor.classList.remove("hidden");
  }else{
    carritoContenedor.classList.add("hidden");
  }
}

async function guardarCompra(){
  const datosLocalStorage = JSON.parse(localStorage.getItem('carrito'));
  console.log('datosLocalStorage', datosLocalStorage);
  if (datosLocalStorage) {
      await fetch('http://localhost:3000/comprar', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: datosLocalStorage })
      })
      .then(response => {
          if (response.ok) {
              console.log('Datos guardados correctamente.');
              alert('Gracias por su compra!');
              vaciarCarrito();
          } else {
              console.error('Error al guardar los datos:', response.statusText);
          }
      })
      .catch(error => {
          console.error('Error al enviar la solicitud:', error);
      });
  } else {
      console.error('No hay datos en el localStorage para guardar.');
  }

}