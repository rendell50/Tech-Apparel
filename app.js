//variables
const clearCartBtn = document.querySelector('.clear-cart');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');


// cart
let cart = [];

//buttons
let buttonsDOM = [];

// getting the products
class Products{
    async getProducts(){
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item =>{
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }
}

// Display Products
class UI {
    displayProducts(products){
       let result = '';
       products.forEach(product => {
           result += `
           <div class="col-4">
           <img src="${product.image}" alt="product">
           
           <h4>${product.title}</h4>
           <div class="rating">
               <i class="fa fa-star" aria-hidden="true"></i>
               <i class="fa fa-star" aria-hidden="true"></i>
               <i class="fa fa-star" aria-hidden="true"></i>
               <i class="fa fa-star" aria-hidden="true"></i>
               <i class="fa fa-star-o" aria-hidden="true"></i>
           </div>
           <p>$${product.price}</p>
           <button class="btn cart-btn" data-id=${product.id}>Add To Cart</button>
       </div>
           
           `;
       });
       productsDOM.innerHTML = result;
    }

    getCartButtons(){
        const buttons = [...document.querySelectorAll(".cart-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;

            button.addEventListener("click", event =>{
              // get product from products
                let cartItem = {...Storage.getProduct(id), amount: 1};

              // add product to the cart
              cart = [...cart, cartItem];

              // save cart in local storage
              Storage.saveCart(cart);
              // set cart values
              this.setCartValues(cart);
              // display cart item
              // show the cart
            });
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;
        console.log(cartTotal, cartItems);

    }
}

// Local Storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }

}

document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(()=>{
        ui.getCartButtons()
    });
});