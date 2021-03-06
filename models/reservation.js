/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         customer_id AS "customerId",  
         num_guests AS "numGuests", 
         notes as "notes"
        FROM reservations WHERE id = $1`,
      [id]
    );

    const reservation = results.rows[0];

    if (reservation === undefined) {
      const err = new Error(`No such reservation: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Reservation(reservation);
  }

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  /** add new reservation or update existing reservation */

  async save() {
    if (this.id === undefined) {
      const results = await db.query(`INSERT INTO reservations (customer_id, num_guests, start_at, notes) VALUES ($1, $2, $3, $4) RETURNING id`, [this.customerId, this.numGuests, this.startAt, this.notes]);
      this.id = results.rows[0].id;
    }
    else {
      const results = await db.query(`UPDATE reservations SET num_guests=$1, start_at=$2, notes=$3 WHERE id=$4 RETURNING id`, [this.numGuests, this.startAt, this.notes, this.id]);
      this.id = results.rows[0];
    }
  }
}


module.exports = Reservation;
