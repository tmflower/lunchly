/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    // console.log(results.rows.map(c => new Customer(c)));
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  

  /** The mess I was making before giving up and looking at the solution: */

  // async fullName(id) {
  //   const results = await db.query(
  //     `SELECT id, 
  //        first_name AS "firstName",  
  //        last_name AS "lastName" 
  //       FROM customers WHERE id=$1`, [id]
  //   );
  //     const firstName = results.rows[0].firstName;
  //     const lastName = results.rows[0].lastName;
  //     const customerName = `${firstName} ${lastName}`;
  //     return customerName;
  // }

  /** The above code actually worked for an individual, but then I had the problem of accessing fullName for the entire list, and never found a way to make that work */

  //   static async fullName() {
  //   const results = await db.query(
  //     `SELECT id, 
  //        first_name AS "firstName",  
  //        last_name AS "lastName" 
  //       FROM customers`
  //   );
  //     const customers = results.rows;
  //     customers.forEach(customer => {
  //       const firstName = customer.firstName;
  //       const lastName = customer.lastName;
  //       const customerName = `${firstName} ${lastName}`;
  //       console.log(customerName);
  //       return customerName;
  //     });
  // }


}

module.exports = Customer;
