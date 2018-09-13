import { Component, OnInit } from '@angular/core';
import { CookieService } from '../../core/services/cookie.service';
import { ItemsService } from '../../core/services/items.service';
import { Item } from '../../core/interfaces/item';
import { FormGroup, FormControl } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { OrderReq } from '../../core/interfaces/req/order-req';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  // implement later
  // create model Cart and
  // 3 components: order-step-1, ..., order-step-3
  // switch the variables below to switch step
  step1: boolean;
  step2: boolean;
  step3: boolean;


  items: Array<{product: Item, amount: number}> = [];
  totalPrice: number;
  
  orderForm: FormGroup = new FormGroup({
    name: new FormControl(),
    address: new FormControl(),
    phone: new FormControl()
  });
  orderId: number;

  private _url_get_all = "/api/catalog/oil-and-grease";
  private _url_get_all_by_ids = "/api/catalog/oil-and-grease/specific";

  constructor(
    private cookieS: CookieService,
    private itemsS: ItemsService,
    private orderS: OrderService
  ) { }

  ngOnInit() {
    // $('[data-toggle="tooltip"]').tooltip will not work
    // 'cause items are added to page dynamically
    // and there is a delay of getting items info from the server
    // $("body").tooltip({
    //   selector: '[data-toggle="tooltip"]'
    // });

    this.getItems();
  }

  getItems() {
    let items: Array<{id: number, amount: number}>;
    let cartCookie = this.cookieS.getCookie("cart");

    if (cartCookie) {
      items = JSON.parse(cartCookie);
    }
    
    if (!Array.isArray(items) || !items.length) {
      console.log("Cart info of wrong formate");
      return;
    }
    
    let itemsIds = items.map(item => item.id);
    this.itemsS.findAllById(this._url_get_all_by_ids, itemsIds).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.items[i] = { product: data[i], amount: null };
      }

      for (let item of this.items) {
        // amount of item is in cookie
        let itemCookie = items.find(itemCookie => itemCookie.id == item.product.id);
        if (itemCookie)
          item.amount = itemCookie.amount;
      }
    }, null, () => {
      this.countTotalPrice();
    });
  }

  plusItem(event) {
    let itemBlock = event.target.closest(".item");
    let itemPrice = itemBlock.dataset.itemPrice;
    let itemId = itemBlock.dataset.itemId;

    // update amount of item in cookie (when user reload the page amount will be read from cookie)
    this.changeAmountInCookie(event, null, {increment: true});
    
    // update amount in view 
    let item = this.items.find(item => item.product.id == itemId);
    if (item)
      item.amount = ++item.amount;

    this.countTotalPrice();
  }

  minusItem(event) {
    let amountInput = event.target.closest(".item").getElementsByClassName("count")[0];
    let amount = amountInput.value;

    if (amount == 1) {
      // alert("Amount can't be less than 1. Use trash button to remove item from cart");
      return;
    }
    
    let itemBlock = event.target.closest(".item");
    let itemPrice = itemBlock.dataset.itemPrice;
    let itemId = itemBlock.dataset.itemId;

    // update amount of item in cookie (when user reload the page amount will be read from cookie)
    this.changeAmountInCookie(event, null, {decrement: true});
    
    // update amount in view 
    let item = this.items.find(item => item.product.id == itemId);
    if (item)
      item.amount -= 1;

    this.countTotalPrice();
  }

  changeAmount(event) {
    
    let amount = event.target.value;
    
    // if "Backspace" was pressed
    if (event.keyCode == 8) {
      console.log("Backspace was pressed!");
      console.log(amount);
      amount = amount.substr(0,amount.length-1);
      console.log(amount);
      this.changeAmountInCookie(event, amount);
      this.updatePrice(event, amount);
      this.countTotalPrice();
      return false;
    }

    if (event.keyCode >= 48 && event.keyCode <= 57) {
      console.log("You pressed key of type number");
      amount = amount + event.key;
      this.changeAmountInCookie(event, amount);
      this.updatePrice(event, amount);
      this.countTotalPrice();
      return false;
    }

    return false;
  }

  changeAmountInCookie(event, amount?, flags?: {increment?: boolean, decrement?: boolean}) {
    let itemBlock = event.target.closest(".item");
    let itemId = itemBlock.dataset.itemId;
    let inputedAmount: number;

    inputedAmount = amount ? amount : event.target.value;

    // update amount of item in cookie (when user reload the page amount will be read from cookie)
    let items: Array<{id: number, amount: number}> = JSON.parse(this.cookieS.getCookie("cart"));
    let item = items.find(item => item.id == itemId);
    if (item) {
      if (flags && flags.increment) item.amount = ++item.amount;
      if (flags && flags.decrement) item.amount = --item.amount;
      
      if (!flags) item.amount = inputedAmount;
    }
    this.cookieS.setCookie("cart", JSON.stringify(items));
  }

  updatePrice(event, amount?) {
    let itemBlock = event.target.closest(".item");
    let itemId = itemBlock.dataset.itemId;
    let inputedAmount;

    inputedAmount = amount ? amount : event.target.value;

    // update amount in view
    let item = this.items.find(item => item.product.id == itemId);
    if (item)
      item.amount = inputedAmount;
  }

  countTotalPrice() {
    this.totalPrice = this.items.reduce(function (total, item) {
      let totalItemPrice = item.amount * item.product.price;
      return total + totalItemPrice;
    }, 0);
  }

  removeItem(event) {
    let itemElem = event.target.closest(".item");
    let itemId = itemElem.dataset.itemId;

    let itemsCookie: Array<{id: number, amount: number}> = JSON.parse(this.cookieS.getCookie("cart"));
    let itemCookie = itemsCookie.find(item => item.id == itemId);
    if (itemCookie) {
      let index = itemsCookie.indexOf(itemCookie);
      if (index > -1) itemsCookie.splice(index, 1);
    }
    this.cookieS.setCookie("cart", JSON.stringify(itemsCookie));

    let item = this.items.find(item => item.product.id == itemId);
    if (item) {
      let index = this.items.indexOf(item);
      if (index > -1) this.items.splice(index, 1);
    }
    this.countTotalPrice();
  }

  toggleAddress(event) {
    let input: HTMLInputElement = <HTMLInputElement> document.getElementById('address');
    console.log(document.getElementById('address'));
    if (input.hasAttribute("disabled")) {
      input.removeAttribute("disabled");
    } else {
      input.setAttribute("disabled","");
      input.value = "В пункт самовывоза";
    }
  }

  toStep2() {
    (<HTMLElement>document.querySelector('#cart-container')).style.display = "none";
    (<HTMLElement>document.querySelector('.order-container')).style.display = "grid";
    (<HTMLElement>document.querySelector('#nav-back')).style.display = "grid";
  }

  toStep1() {
    (<HTMLElement>document.querySelector('#cart-container')).style.display = "grid";
    (<HTMLElement>document.querySelector('.order-container')).style.display = "none";
    (<HTMLElement>document.querySelector('#nav-back')).style.display = "none";
  }

  showInfoMsg() {
    (<HTMLElement>document.querySelector('#cart-container')).style.display = "none";
    (<HTMLElement>document.querySelector('.order-container')).style.display = "none";
    (<HTMLElement>document.querySelector('#nav-back')).style.display = "none";
    (<HTMLElement>document.querySelector('#order-info')).style.display = "grid";
  }

  saveOrder() {
    let orderInfo: OrderReq = {
      name: this.orderForm.get('name').value,
      address: this.orderForm.get('address').value,
      phone: this.orderForm.get('phone').value,
      products: this.items.map(x => {
        return { productId: x.product.id, amount: x.amount };
      })
    };

    this.orderS.add(orderInfo).subscribe(data => {
      this.orderId = <number>data;
      this.items = [];
      this.cookieS.eraseCookie('cart');
    }, null, () => this.showInfoMsg());
  }
}
