/** Routes for Lunchly */

const express = require("express");
const { search } = require("./app");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function(req, res, next) {
  try {
    const customers = await Customer.all();
    return res.render("customer_list.html", { customers });
  } catch (err) {
    return next(err);
  }
});

/** Form to add a new customer. */

router.get("/add/", async function(req, res, next) {
  try {
    return res.render("customer_new_form.html");
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new customer. */

router.post("/add/", async function(req, res, next) {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const notes = req.body.notes;

    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Show results of search */

router.get("/search/", async function (req, res, next) {
  try {
    let cust;   
    const searchCust = req.query.customerSearch;
    const searchCustLower = searchCust.toLowerCase();
    const matches = [];
    const customers = await Customer.all();
    for (let customer of customers) {
      cust = customer;
      const custLower = cust.fullName.toLowerCase();
        if (custLower.includes(searchCustLower)) {
          const foundCust = cust;
          matches.push(foundCust);
        }        
    } return res.render('search_results.html', {searchCust: req.query.customerSearch, matches});
  }
  catch (err) {
    return next (err);
  }
});


/** Show a customer, given their ID. */

router.get("/:id/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    const reservations = await customer.getReservations();

    return res.render("customer_detail.html", { customer, reservations });
  } catch (err) {
    return next(err);
  }
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);  

    res.render("customer_edit_form.html", { customer });
  } catch (err) {
    return next(err);
  }
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.phone = req.body.phone;
    customer.notes = req.body.notes;
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function(req, res, next) {
  try {
    const customerId = req.params.id;
    const startAt = new Date(req.body.startAt);
    const numGuests = req.body.numGuests;
    const notes = req.body.notes;

    const reservation = new Reservation({
      customerId,
      startAt,
      numGuests,
      notes
    });
    await reservation.save();

    return res.redirect(`/${customerId}/`);
  } catch (err) {
    return next(err);
  }
});

/** Handle editing a reservation */

router.get("/:id/edit-reservation/:reservationId", async function(req, res, next) {
  try {
    
    const reservation = await Reservation.get(req.params.reservationId);
    const customer = await Customer.get(req.params.id);

    res.render("reservation_edit_form.html", { reservation, customer });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/edit-reservation/:reservationId", async function(req, res, next) {
  try {

    const customer = await Customer.get(req.params.id)
    const reservation = await Reservation.get(req.params.reservationId);
    const reservations = await customer.getReservations();

    reservation.customerId = req.params.id;
    reservation.startAt = new Date(req.body.startAt);
    reservation.numGuests = req.body.numGuests;
    reservation.notes = req.body.notes;

    await reservation.save();

    return res.redirect(`/${customer.id}`)
    // return res.render("customer_detail.html", { customer, reservations });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
