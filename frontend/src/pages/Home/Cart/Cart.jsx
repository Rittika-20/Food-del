import React, { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../../context/StoreContext'
import { useNavigate } from 'react-router-dom';
import axios from "axios"

const Cart = () => {
    const{cartItems,food_list,removeFromCart, getTotalCartAmount,url,discount,setDiscount} = useContext(StoreContext);

    const [promoCode, setPromoCode] = useState("");
    const [promoMessage, setPromoMessage] = useState("");

    const navigate= useNavigate();

    const applyPromoCode = async () => {
        if (!promoCode.trim()) return;
        const response = await axios.post(url + "/api/promo/apply", { code: promoCode });
        if (response.data.success) {
            setDiscount(response.data.discount);
            setPromoMessage(response.data.message);
        } else {
            setDiscount(0);
            setPromoMessage(response.data.message);
        }
    };

    const discountedAmount = getTotalCartAmount() - (getTotalCartAmount() * discount / 100);

  return (
    <div className='cart'>
      <div className='cart-items'>
        <div className='cart-items-title'>
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
      <br />
      <hr />
      {food_list.map((item,index)=>{
          if(cartItems[item._id]>0)
          {
            return(
              <div key={index}>
              <div className='cart-items-title cart-items-item'>
                <img src={url+"/images/"+item.image} alt='' />
                <p>{item.name}</p>
                <p>₹{item.price}</p>
                <p>{cartItems[item._id]}</p>
                <p>₹{item.price*cartItems[item._id]}</p>
                <p onClick={()=>removeFromCart(item._id)} className='cross'>x</p>
                </div>
                <hr/>
                </div>
            )
          }
      })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr/>
            {discount > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Discount ({discount}%)</p>
                  <p>-₹{(getTotalCartAmount() * discount / 100).toFixed()}</p>
                </div>
                <hr/>
              </>
            )}
            <div className="cart-total-details">
                <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount()===0?0:20}</p>
            </div>
            <hr/>
            <div className="cart-total-details">
                <p>Platform Fee</p>
              <p>₹{getTotalCartAmount()===0?0:10}</p>
            </div>
            <hr/>
            <div className="cart-total-details">
                <b>Total</b>
                <b>₹{getTotalCartAmount()===0?0:(discountedAmount+20+10).toFixed()}</b>
            </div>
          </div>
          <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
              <p>If you have a promo code,Enter it here</p>
              <div className="cart-promocode-input">
                <input
                  type='text'
                  placeholder='promo-code'
                  value={promoCode}
                  onChange={(e)=>setPromoCode(e.target.value)}
                />
                <button type="button" onClick={applyPromoCode}>Submit</button>
              </div>
              {promoMessage && <p className={discount>0 ? "promo-success" : "promo-error"}>{promoMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart