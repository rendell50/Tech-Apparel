//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
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
           <button class="btn addToCart-btn" data-id=${product.id}>Add To Cart</button>
       </div>
           
           `;
       });
       productsDOM.innerHTML = result;
    }

    getCartButtons(){
        const buttons = [...document.querySelectorAll(".addToCart-btn")];
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
            this.addCartItem(cartItem);
              // show the cart
              this.showCart();
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
       
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add("cart-item");
        div.innerHTML = `  
        <img src="${item.image}" alt="">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fa fa-chevron-up" aria-hidden="true" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fa fa-chevron-down" aria-hidden="true" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div);

    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');

    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));

    }

    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        //clear cart button
        clearCartBtn.addEventListener('click', () =>{
            this.clearCart();
        });
        //cart fuctionality
        cartContent.addEventListener('click',event=>{
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item=> item.id ===id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;

            } else if(event.target.classList.contains('fa-chevron-down')){
                let subtractAmount = event.target;
                let id = subtractAmount.dataset.id;
                let tempItem = cart.find(item=> item.id ===id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    subtractAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(subtractAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
            }


        })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        

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

    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }

}

document.addEventListener("DOMContentLoaded", ()=>{
    const ui = new UI();
    const products = new Products();
    //setup app
    ui.setupAPP();

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(()=>{
        ui.getCartButtons();
        ui.cartLogic();
    });
});