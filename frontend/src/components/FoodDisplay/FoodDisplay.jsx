import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({ category }) => {

    const { food_list, searchQuery } = useContext(StoreContext)

    // Filter food based on category + search
    const filteredFood = food_list.filter((item) => {

        const matchesCategory =
            category === "All" || category === item.category;

        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <div className='food-display' id='food-display'>

            <h2>
                {searchQuery
                    ? `Search results for "${searchQuery}"`
                    : "Top dishes near you"
                }
            </h2>

            <div className="food-display-list">

                {filteredFood.length > 0 ? (

                    filteredFood.map((item, index) => (
                        <FoodItem
                            key={index}
                            id={item._id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                        />
                    ))

                ) : (

                    <p>No food found for "{searchQuery}"</p>

                )}

            </div>

        </div>
    )
}

export default FoodDisplay