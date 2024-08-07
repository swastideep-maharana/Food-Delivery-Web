import { createContext, useEffect, useState } from "react";
import axios from "axios";
// import { food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const url = "https://food-delivery-backend-bycx.onrender.com";
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [food_list, setFoodList] = useState([]);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev };
      if (updatedCart[itemId] > 1) {
        updatedCart[itemId] -= 1;
      } else {
        delete updatedCart[itemId];
      }
      return updatedCart;
    });
    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const getTotalCartAmount = () => {
    return Object.keys(cartItems).reduce((total, item) => {
      const itemInfo = food_list.find((product) => product._id === item);
      return itemInfo ? total + itemInfo.price * cartItems[item] : total;
    }, 0);
  };

  const fetchFoodList = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(url + "/api/food/list");
      setFoodList(response.data.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadCardData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCardData(localStorage.getItem("token"));
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    error,
    //adding use effect
    // : (newToken) => {
    //   localStorage.setItem("token", newToken);
    //   setToken(newToken);
    // },
  };

  return (
    <StoreContext.Provider value={contextValue} loading={loading}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
