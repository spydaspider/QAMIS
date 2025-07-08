import styles from './instructorMetricsView.module.css';
import chart from '../assets/icons/chart.png';
import reviewsPic from '../assets/icons/reviews.png';
import rightArrow from '../assets/icons/arrow-right.png';
import totalRestaurants from '../assets/icons/totalRestaurants.png';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';
const  InstructorControlPanel = () =>{

    const data = [
        { name: "Monday", uv: 4000, pv: 2400, amt: 2400 },
        { name: "Tuesday", uv: 3000, pv: 1398, amt: 2210 },
        { name: "Wednesday", uv: 2000, pv: 9300, amt: 2290 },
        { name: "Thursday", uv: 2780, pv: 3908, amt: 2000 },
        { name: "Friday", uv: 1890, pv: 4800, amt: 2181 },
        { name: "Saturday", uv: 2390, pv: 3800, amt: 2500 },
        { name: "Sunday", uv: 3490, pv: 4300, amt: 2100 },
      ];
/* 
useEffect(() => {
const pendingRestaurants =  restaurants.filter(restaurant => restaurant.restaurantStatus === 'pending')
setPendingRestaurants(pendingRestaurants)
const pendingReview =  reviews.filter(review => review.reviewStatus === 'pending')
setPendingReview(pendingReview)

}, [restaurants]) */


    return(
        <div className={styles.right}>
      {/*   <div className={styles.topReadings}>
         <div className={styles.restaurantRequest}>
            <div className={styles.rrTop}>
                <div className={styles.imgContainer}>
            <img src ={chart} alt="chart"/>
            </div>
            <div className={styles.desc}>
                <span className={styles.rr}>
                    Restaurant Request
                </span>
                <span className={styles.noOfRequest}>
                    {pendingRestaurants.length}
                </span>
            </div>
            </div>
            <div className={styles.line}>

            </div>
            <div className={styles.seeDetails}>
                <p className={styles.see}>See Details</p>
                <div className={styles.arrowContainer}>
                <img src={rightArrow} alt="right arrow"/>
                </div>
            </div>
         </div>
         <div className={styles.restaurantRequest}>
            <div className={styles.rrTop}>
                <div className={styles.imgContainer}>
            <img src ={reviewsPic} alt="Reviews"/>
            </div>
            <div className={styles.desc}>
                <span className={styles.rr}>
                    Reviews Request
                </span>
                <span className={styles.noOfRequest}>
                  {pendingReview.length}
                </span>
            </div>
            </div>
            <div className={styles.line}>

            </div>
            <div className={styles.seeDetails}>
                <p className={styles.see}>See Details</p>
                <div className={styles.arrowContainer}>
                <img src={rightArrow} alt="Right arrow"/>
                </div>
            </div>
         </div>
         <div className={styles.restaurantRequest}>
            <div className={styles.rrTop}>
                <div className={styles.imgContainer}>
            <img src ={totalRestaurants} alt="totalRestaurants"/>
            </div>
            <div className={styles.desc}>
                <span className={styles.rr}>
                    Total Restaurants
                </span>
                <span className={styles.noOfRequest}>
                    {restaurants.length}
                </span>
            </div>
            </div>
            <div className={styles.line}>

            </div>
            <div className={styles.seeDetails}>
                <p className={styles.see}>See Details</p>
                <div className={styles.arrowContainer}>
                <img src={rightArrow} alt="Right Arrow"/>
                </div>
            </div>
         </div>
         <div className={styles.restaurantRequest}>
            <div className={styles.totalContainer}>
            <div className={styles.rrTop}>
                <div className={styles.imgContainer}>
            <img alt="icon"/>
            </div>
            <div className={styles.descTotal}>
                <span className={styles.rrTotal}>
                    Total Users
                </span>
                <span className={styles.totalNoOfRequest}>
                    {users.length}
                </span>
            </div>
            </div>
            <div className={styles.line}>

            </div>
            <div className={styles.seeDetails}>
                <p className={styles.see}>See Details</p>
                <div className={styles.arrowContainer}>
                <img alt="white right arrow"/>
                </div>
            </div>
            </div>
         </div>
        
        
        </div> */}
        <div className={styles.dailySignups}>
        <h2 className={styles.title}>Daily User Sign Ups</h2>

            <div className={styles.chartContainer}>
        <BarChart width={700} height={300} data={data} className={styles.chart}>

<CartesianGrid strokeDasharray="3 3" />
<XAxis  tick={{ fontSize: 14 }} dataKey="name" />
<YAxis  tick={{ fontSize: 14 }} />
<Tooltip />
<Legend />
<Bar dataKey="pv" fill="#2A5298" radius={[50, 50, 0, 0]} />

</BarChart>
</div>
        </div>
        <div className={styles.restaurantsAndReviews}>
          <div className={styles.leftLatest}>
              <h5 className={styles.latestRestaurant}>Latest Restaurants</h5>
              <div className={styles.latestContainer}>
              <h6 className={styles.restaurantName}>
                Afro Restaurant

              </h6>
              <small className={styles.location}>
                Crewe
              </small>
              </div>
            
             
          </div>
         {/*  <div className={styles.rightLatest}>
          <h5 className={styles.latestReview}>Latest Reviews</h5>
            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>REVIEW</th>
                        <th>DATE</th>
                    </tr>
                </thead>
                <tbody>
                  {
                    reviews.length > 0 ? reviews.map((review, index) =>   <tr key={review._id}>
                    <td>{index + 1}.</td>
                    <td>
                        <div className={styles.roundShape}>
                            </div>{review?.userId?.fullName}</td>
                    <td>Miscellaneous</td>
                    <td>{dateFormater(review.createdAt)}</td>
                </tr>) : <p>No review found</p>
                  }
                </tbody>
            </table>
          </div> */}
        </div>
      </div>
    )
}
export default InstructorControlPanel;