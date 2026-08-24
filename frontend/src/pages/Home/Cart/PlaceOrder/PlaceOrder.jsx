import React, { useContext } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../../../context/StoreContext'
import { useState } from 'react'
import axios from "axios"
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

  const{getTotalCartAmount,token,food_list,cartItems,url,discount}= useContext(StoreContext)
  const [data,setData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"",
    phone:""
  })

  const [payment,setPayment] = useState("cod")

    const onChangeHandler = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setData(data=>({...data,[name]:value}))
    }

    const subtotal = getTotalCartAmount();

const discountedAmount =
  subtotal - (subtotal * discount / 100);

const deliveryFee = subtotal === 0 ? 0 : 20;
const platformFee = subtotal === 0 ? 0 : 10;

const finalTotal =
  subtotal === 0
    ? 0
    : discountedAmount + deliveryFee + platformFee;

            const placeOrder = async (event) => {
  event.preventDefault();
  let orderItems = [];
  food_list.map((item) => {
    if (cartItems[item._id] > 0) {
      let itemInfo = item;
      itemInfo["quantity"] = cartItems[item._id];
      orderItems.push(itemInfo);
    }
  })
  let orderData = {
    address: data,
    items: orderItems,
    amount: finalTotal,
    paymentMethod: payment === "cod" ? "COD" : "Razorpay"
  }
  let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } })

  if (response.data.success) {

    if (payment === "cod") {
      toast.success("Order placed successfully! Pay on delivery.");
      navigate("/myorders");
      return;
    }

    const { order, key_id, orderId, success_url, cancel_url } = response.data;

    const options = {
      key: key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      handler: function (paymentResponse) {
        window.location.replace(success_url);
      },
      modal: {
        ondismiss: function () {
          window.location.replace(cancel_url);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }
  else {
    toast.error("Something went wrong. Please try again.");
  }
}

  const navigate = useNavigate();

  useEffect(()=>{
    if(!token){
      navigate('/cart')
    }
    else if(getTotalCartAmount()===0)
    {
      navigate('/cart')
    }
  },[token])


  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className='place-order-left'>
        <p className='title'>Delivery Information</p>
      <div className="multi-fields">
        <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name'/>
        <input required  name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name'/>
      </div>
      <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address'/>
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street'/>
        <div className="multi-fields">
        <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City'/>
        <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State'/>
      </div>
      <div className="multi-fields">
        <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code'/>
        <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country'/>
      </div>
      <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
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
                <b>₹{finalTotal.toFixed()}</b>
            </div>
          </div>

          <h2>Payment Method</h2>
          <div className="payment">
          <div onClick={()=>setPayment("cod")} className={`payment-option ${payment==="cod" ? "selected" : ""}`}>
          <div className="payment-radio"></div>
          <p>COD ( Cash on delivery )</p>
          </div>
          <div onClick={()=>setPayment("razorpay")} className={`payment-option ${payment==="razorpay" ? "selected" : ""}`}>
          <div className="payment-radio"></div>
          <p>Razorpay ( Credit / Debit )</p>
          </div>
          </div>

          <button type='submit'>{payment==="cod" ? "PLACE ORDER" : "PROCEED TO PAYMENT"}</button>
        </div>
      </div>
      
    </form>
  )
}

export default PlaceOrder